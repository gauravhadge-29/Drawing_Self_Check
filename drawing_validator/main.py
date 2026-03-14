from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from config import DEFAULT_CONFIG
from detection.callout_detector import detect_callouts_all_pages
from parsing.bom_parser import parse_bom_table
from pdf_reader.table_extractor import extract_first_page_tables
from validation.validator import ValidationEngine, ValidationResult


@dataclass(frozen=True)
class PipelineOutput:
    report: str
    results: list[ValidationResult]
    bom: dict[int, dict[str, str | int]]
    detected_callouts: dict[int, int]       # aggregated across all pages
    per_page_callouts: dict[int, dict[int, int]]  # breakdown per page


def _build_page_breakdown(per_page: dict[int, dict[int, int]]) -> str:
    """Render a compact per-page callout breakdown string."""
    if not per_page:
        return ""
    sep = "--------------------------------"
    lines = [sep, "Callout Detection — Page Breakdown", sep]
    for page_idx in sorted(per_page):
        counts = per_page[page_idx]
        items_str = "  ".join(
            f"[{k}]×{v}" for k, v in sorted(counts.items())
        )
        lines.append(f"  Page {page_idx + 1}: {items_str}")
    return "\n".join(lines)


def run_pipeline_detailed(pdf_path: str | Path) -> PipelineOutput:
    config = DEFAULT_CONFIG

    # Step 1: Extract BOM table from the first page.
    tables = extract_first_page_tables(pdf_path, config.table)
    bom = parse_bom_table(tables)

    # Step 2: Scan every page for callout bubbles and aggregate counts.
    detected_callouts, per_page_callouts = detect_callouts_all_pages(pdf_path, config)

    # Step 3: Compare BOM quantities against detected callout counts.
    engine = ValidationEngine()
    results = engine.validate_callouts(bom, detected_callouts)
    report_sections = []

    page_breakdown = _build_page_breakdown(per_page_callouts)
    if page_breakdown:
        report_sections.append(page_breakdown)
        report_sections.append("")

    report_sections.append(engine.format_report(results))
    report = "\n".join(report_sections)

    return PipelineOutput(
        report=report,
        results=results,
        bom=bom,
        detected_callouts=detected_callouts,
        per_page_callouts=per_page_callouts,
    )


def run_pipeline(pdf_path: str | Path) -> str:
    return run_pipeline_detailed(pdf_path).report


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate PDF engineering drawings against the drawing BOM.",
    )
    parser.add_argument(
        "pdf_path",
        type=Path,
        help="Path to the drawing PDF to validate.",
    )
    return parser


def main() -> None:
    parser = build_argument_parser()
    args = parser.parse_args()
    report = run_pipeline(args.pdf_path)
    print(report)


if __name__ == "__main__":
    main()