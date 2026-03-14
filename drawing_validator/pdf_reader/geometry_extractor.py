from __future__ import annotations

from pathlib import Path

import pdfplumber


def extract_page_curves(pdf_path: str | Path, page_number: int = 0) -> list[dict]:
    """Extract vector curve objects from a PDF page."""
    with pdfplumber.open(str(pdf_path)) as pdf:
        page = pdf.pages[page_number]
        return list(page.curves)