from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from main import run_pipeline_detailed


class ValidationSummary(BaseModel):
    pass_: int = Field(alias="pass")
    fail: int

    model_config = ConfigDict(populate_by_name=True)


class ValidationItem(BaseModel):
    item: int
    description: str
    expected_qty: int
    callout_found: bool
    status: str


class ValidationResponse(BaseModel):
    summary: ValidationSummary
    items: list[ValidationItem]


app = FastAPI(
    title="Drawing Validator API",
    version="1.0.0",
    description="Validate engineering drawing PDFs against BOM callouts.",
)

# Allow local frontend development and local API docs usage.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
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


@app.post("/validate-drawing", response_model=ValidationResponse)
async def validate_drawing(file: UploadFile = File(...)) -> ValidationResponse:
    """Validate an uploaded engineering drawing PDF."""
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

        pipeline_output = run_pipeline_detailed(temp_path)

        items = [
            ValidationItem(
                item=result.item_number,
                description=result.description,
                expected_qty=result.bom_qty,
                callout_found=result.callout_found,
                status=result.status,
            )
            for result in pipeline_output.results
        ]

        passed_count = sum(1 for row in items if row.status == "PASS")
        failed_count = sum(1 for row in items if row.status == "FAIL")

        return ValidationResponse(
            summary=ValidationSummary(pass_=passed_count, fail=failed_count),
            items=items,
        )
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected validation error: {exc}",
        ) from exc
    finally:
        await file.close()
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)
