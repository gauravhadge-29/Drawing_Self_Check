from __future__ import annotations

from pathlib import Path

import pdfplumber

from config import TableConfig


def extract_first_page_tables(
    pdf_path: str | Path,
    table_config: TableConfig,
) -> list[list[list[str | None]]]:
    """Extract tables from the first page using ruling lines as anchors."""
    table_settings = {
        "vertical_strategy": table_config.vertical_strategy,
        "horizontal_strategy": table_config.horizontal_strategy,
        "snap_tolerance": table_config.snap_tolerance,
        "intersection_tolerance": table_config.intersection_tolerance,
    }
    with pdfplumber.open(str(pdf_path)) as pdf:
        page = pdf.pages[0]
        return page.extract_tables(table_settings=table_settings)