from __future__ import annotations

import argparse
import tempfile
from dataclasses import dataclass
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from backend.material_validation.material_extractor import extract_material_and_finish
from backend.material_validation.material_validator import validate_material_and_finish
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
    material_validation: dict[str, object]


@dataclass(frozen=True)
class PipelineApiOutput:
    summary: dict[str, int]
    callout_validation: list[dict[str, object]]
    material_validation: dict[str, object]


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

    # Step 4: Extract and validate material/finish compliance.
    extracted_material = extract_material_and_finish(pdf_path)
    material_validation = validate_material_and_finish(extracted_material)

    report_sections = []

    page_breakdown = _build_page_breakdown(per_page_callouts)
    if page_breakdown:
        report_sections.append(page_breakdown)
        report_sections.append("")

    report_sections.append(engine.format_report(results))

    report_sections.append("")
    report_sections.append("--------------------------------")
    report_sections.append("Material Compliance")
    report_sections.append("--------------------------------")
    report_sections.append(
        f"Material: {material_validation.get('material') or 'NOT FOUND'}"
    )
    report_sections.append(
        "Surface Finish: "
        f"{material_validation.get('surface_finish') or 'NOT FOUND'}"
    )
    report_sections.append(f"Status: {material_validation.get('status', 'UNKNOWN')}")
    allowed = material_validation.get("allowed_finishes") or []
    if allowed:
        report_sections.append("Allowed Finishes: " + ", ".join(allowed))

    report = "\n".join(report_sections)

    return PipelineOutput(
        report=report,
        results=results,
        bom=bom,
        detected_callouts=detected_callouts,
        per_page_callouts=per_page_callouts,
        material_validation=material_validation,
    )


def build_pipeline_api_output(pdf_path: str | Path) -> PipelineApiOutput:
    output = run_pipeline_detailed(pdf_path)

    callout_validation = [
        {
            "item": row.item_number,
            "description": row.description,
            "expected_qty": row.bom_qty,
            "callout_found": row.callout_found,
            "status": row.status,
        }
        for row in output.results
    ]

    summary = {
        "pass": sum(1 for row in callout_validation if row["status"] == "PASS"),
        "fail": sum(1 for row in callout_validation if row["status"] == "FAIL"),
    }

    return PipelineApiOutput(
        summary=summary,
        callout_validation=callout_validation,
        material_validation=output.material_validation,
    )


def run_pipeline(pdf_path: str | Path) -> str:
    return run_pipeline_detailed(pdf_path).report


class ValidationSummaryModel(BaseModel):
    pass_: int = Field(alias="pass")
    fail: int

    model_config = ConfigDict(populate_by_name=True)


class ValidationItemModel(BaseModel):
    item: int
    description: str
    expected_qty: int
    callout_found: bool
    status: str


class MaterialValidationModel(BaseModel):
    material: str | None
    surface_finish: str | None
    status: str
    allowed_finishes: list[str]
    base_material: str | None = None
    message: str | None = None


class ValidationResponseModel(BaseModel):
    summary: ValidationSummaryModel
    callout_validation: list[ValidationItemModel]
    items: list[ValidationItemModel] | None = None
    material_validation: MaterialValidationModel


app = FastAPI(
    title="Drawing Validator API",
    version="1.1.0",
    description="Validate engineering drawing PDFs for callouts and material compliance.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/validate-drawing", response_model=ValidationResponseModel)
async def validate_drawing(file: UploadFile = File(...)) -> ValidationResponseModel:
    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    suffix = Path(filename).suffix or ".pdf"
    temp_path: Path | None = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            if not content:
                raise HTTPException(status_code=400, detail="Uploaded file is empty.")
            tmp.write(content)
            temp_path = Path(tmp.name)

        api_payload = build_pipeline_api_output(temp_path)
        return ValidationResponseModel(
            summary=ValidationSummaryModel(pass_=api_payload.summary["pass"], fail=api_payload.summary["fail"]),
            callout_validation=[ValidationItemModel(**row) for row in api_payload.callout_validation],
            items=[ValidationItemModel(**row) for row in api_payload.callout_validation],
            material_validation=MaterialValidationModel(**api_payload.material_validation),
        )
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected validation error: {exc}") from exc
    finally:
        await file.close()
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)


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