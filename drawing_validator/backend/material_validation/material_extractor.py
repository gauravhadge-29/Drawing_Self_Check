from __future__ import annotations

import re
from pathlib import Path

import pdfplumber


def _normalize_text(value: str) -> str:
    """Normalize extracted text to uppercase with compact whitespace."""
    return re.sub(r"\s+", " ", value).strip().upper()


def _extract_with_patterns(text: str, patterns: list[str]) -> str | None:
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            raw = match.group("value")
            normalized = _normalize_text(raw)
            # Trim trailing separators that often appear in title blocks.
            normalized = re.sub(r"[;|,.]+$", "", normalized).strip()
            if normalized:
                return normalized
    return None


def extract_material_and_finish(pdf_path: str | Path) -> dict[str, str | None]:
    """
    Extract MATERIAL and SURFACE FINISH metadata from drawing text.

    Supports label styles such as:
      MATERIAL: EN8
      MATERIAL - EN8
      MATL: EN8
      SURFACE FINISH: BLACKODISING
      FINISH: BLACKODISING
    """
    lines: list[str] = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text:
                lines.append(page_text)

    full_text = "\n".join(lines)

    material_patterns = [
        r"\bMATERIAL\s*[:\-]\s*(?P<value>[^\n\r]+)",
        r"\bMATL\s*[:\-]\s*(?P<value>[^\n\r]+)",
        r"\bMAT\.?\s*[:\-]\s*(?P<value>[^\n\r]+)",
    ]
    finish_patterns = [
        r"\bSURFACE\s*FINISH\s*[:\-]\s*(?P<value>[^\n\r]+)",
        r"\bFINISH\s*[:\-]\s*(?P<value>[^\n\r]+)",
        r"\bS\.F\.\s*[:\-]\s*(?P<value>[^\n\r]+)",
    ]

    material = _extract_with_patterns(full_text, material_patterns)
    surface_finish = _extract_with_patterns(full_text, finish_patterns)

    return {
        "material": material,
        "surface_finish": surface_finish,
    }
