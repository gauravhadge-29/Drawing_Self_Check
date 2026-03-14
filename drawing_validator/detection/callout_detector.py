from __future__ import annotations

import re
from math import dist
from pathlib import Path

import pdfplumber

from config import AppConfig

# ---------------------------------------------------------------------------
# Optional image-based fallback (Tesseract + PyMuPDF + OpenCV).
# Not required when the PDF is vector-based (which all engineering drawings
# should be).  Only used when _detect_callouts_vector returns nothing.
# ---------------------------------------------------------------------------
try:
    import fitz          # PyMuPDF
    import cv2
    import numpy as np
    from PIL import Image
    import pytesseract
    IMAGE_OCR_AVAILABLE = True
except ImportError:
    IMAGE_OCR_AVAILABLE = False


# ---------------------------------------------------------------------------
# Primary path: vector extraction via pdfplumber
# ---------------------------------------------------------------------------

def _is_circle_like(curve: dict, config: AppConfig) -> bool:
    """Return True if a curve's bounding box looks like a callout-sized circle."""
    x0 = float(curve.get("x0", 0))
    x1 = float(curve.get("x1", 0))
    top = float(curve.get("top", 0))
    bottom = float(curve.get("bottom", 0))

    width = abs(x1 - x0)
    height = abs(bottom - top)
    diameter = (width + height) / 2.0

    if abs(width - height) > config.callout.circularity_tolerance_pt:
        return False
    if diameter < config.callout.min_callout_diameter_pt:
        return False
    if diameter > config.callout.max_callout_diameter_pt:
        return False
    return True


def _detect_callouts_vector(
    pdf_path: str | Path,
    config: AppConfig,
    page_number: int = 0,
) -> dict[int, int]:
    """
    Detect callout bubbles using pdfplumber vector data.

    For each circular curve in the callout size range, look for a text word
    whose centre falls inside it.  If the word is a digit string it is treated
    as the BOM item number for that bubble.

    Works on any vector PDF without external binary dependencies.
    """
    with pdfplumber.open(str(pdf_path)) as pdf:
        page = pdf.pages[page_number]
        curves = page.curves
        words = page.extract_words()

    callout_counts: dict[int, int] = {}

    for curve in curves:
        if not _is_circle_like(curve, config):
            continue

        x0 = float(curve["x0"])
        x1 = float(curve["x1"])
        top = float(curve["top"])
        bottom = float(curve["bottom"])
        center = ((x0 + x1) / 2.0, (top + bottom) / 2.0)
        radius = ((abs(x1 - x0) + abs(bottom - top)) / 2.0) / 2.0

        for word in words:
            word_cx = (float(word["x0"]) + float(word["x1"])) / 2.0
            word_cy = (float(word["top"]) + float(word["bottom"])) / 2.0
            if dist((word_cx, word_cy), center) <= radius:
                text = word["text"].strip()
                # Accept only pure-integer tokens — callout item numbers.
                if re.fullmatch(r"\d{1,3}", text):
                    number = int(text)
                    callout_counts[number] = callout_counts.get(number, 0) + 1
                    break  # at most one item number per bubble

    return callout_counts


# ---------------------------------------------------------------------------
# Fallback path: image rendering + HoughCircles + Tesseract OCR
# ---------------------------------------------------------------------------

def _detect_callouts_image(
    pdf_path: str | Path,
    config: AppConfig,
    page_number: int = 0,
) -> dict[int, int]:
    """
    Fallback detector for scanned / rasterised PDFs.

    Requires: pymupdf, opencv-python, pillow, pytesseract
    AND the Tesseract OCR binary installed on the system PATH.
      Windows: https://github.com/UB-Mannheim/tesseract/wiki
      Linux  : sudo apt install tesseract-ocr
      macOS  : brew install tesseract
    """
    if not IMAGE_OCR_AVAILABLE:
        raise RuntimeError(
            "Image-based callout detection requires extra packages.\n"
            "Install: pip install pymupdf opencv-python pillow pytesseract\n"
            "Then install the Tesseract binary for your OS."
        )

    # Render page.
    doc = fitz.open(str(pdf_path))
    page = doc[page_number]
    zoom = config.callout.render_dpi / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), colorspace=fitz.csRGB)
    img_rgb = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
        pix.height, pix.width, 3
    ).copy()
    doc.close()

    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    circles = cv2.HoughCircles(
        blurred, cv2.HOUGH_GRADIENT, dp=1,
        minDist=config.callout.min_dist_px,
        param1=config.callout.hough_param1,
        param2=config.callout.hough_param2,
        minRadius=config.callout.min_radius_px,
        maxRadius=config.callout.max_radius_px,
    )
    if circles is None:
        return {}

    callout_counts: dict[int, int] = {}
    for cx, cy, r in np.round(circles[0, :]).astype(int):
        inset = max(2, int(r * 0.15))
        x1, y1 = max(0, cx - r + inset), max(0, cy - r + inset)
        x2, y2 = min(img_rgb.shape[1], cx + r - inset), min(img_rgb.shape[0], cy + r - inset)
        if x2 <= x1 or y2 <= y1:
            continue
        roi = img_rgb[y1:y2, x1:x2]
        scale = 4
        h, w = roi.shape[:2]
        roi_large = cv2.resize(roi, (max(1, w * scale), max(1, h * scale)), interpolation=cv2.INTER_CUBIC)
        gray_roi = cv2.cvtColor(roi_large, cv2.COLOR_RGB2GRAY)
        _, thresh = cv2.threshold(gray_roi, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        text = pytesseract.image_to_string(
            Image.fromarray(thresh),
            config="--psm 10 --oem 3 -c tessedit_char_whitelist=0123456789",
        ).strip()
        digits = re.sub(r"\D", "", text)
        if digits:
            number = int(digits)
            if 1 <= number <= 999:
                callout_counts[number] = callout_counts.get(number, 0) + 1

    return callout_counts


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def _page_count(pdf_path: str | Path) -> int:
    with pdfplumber.open(str(pdf_path)) as pdf:
        return len(pdf.pages)


def detect_callouts(
    pdf_path: str | Path,
    config: AppConfig,
    page_number: int = 0,
) -> dict[int, int]:
    """
    Detect item callout bubbles on a single page and return {item_number: count}.

    Strategy:
      1. Try vector-based extraction (pdfplumber) — works on all vector PDFs,
         requires no external binaries.
      2. If that yields nothing (e.g. scanned PDF), fall back to image OCR
         (requires Tesseract to be installed on the system).

    Tune callout circle size in config.py under CalloutConfig.
    """
    counts = _detect_callouts_vector(pdf_path, config, page_number)
    if counts:
        return counts
    # Fallback: image OCR (will raise if Tesseract is not installed).
    return _detect_callouts_image(pdf_path, config, page_number)


def detect_callouts_all_pages(
    pdf_path: str | Path,
    config: AppConfig,
) -> tuple[dict[int, int], dict[int, dict[int, int]]]:
    """
    Scan every page of the PDF and accumulate callout counts across all pages.

    Uses the vector extractor per-page (no OCR fallback per page) so pages
    that contain only geometry/text but no callout circles are skipped cleanly.
    If the full aggregate is still empty after all pages, the image-OCR fallback
    is tried on the first page only.

    Returns:
      aggregated  — {item_number: total_count}  (used for validation)
      per_page    — {page_index: {item_number: count}}  (for reporting)
    """
    n_pages = _page_count(pdf_path)
    aggregated: dict[int, int] = {}
    per_page: dict[int, dict[int, int]] = {}

    for page_idx in range(n_pages):
        # Use the vector path only per page — pages without callout circles
        # return {} and are silently skipped without falling through to OCR.
        page_counts = _detect_callouts_vector(pdf_path, config, page_idx)
        if page_counts:
            per_page[page_idx] = page_counts
            for item, count in page_counts.items():
                aggregated[item] = aggregated.get(item, 0) + count

    # Global OCR fallback: only tried when the entire document yielded nothing
    # from vector extraction (i.e., the PDF is fully rasterised/scanned).
    if not aggregated:
        try:
            ocr_counts = _detect_callouts_image(pdf_path, config, page_number=0)
            if ocr_counts:
                aggregated = ocr_counts
                per_page[0] = ocr_counts
        except Exception:
            pass  # Tesseract not available — caller will see empty counts.

    return aggregated, per_page

