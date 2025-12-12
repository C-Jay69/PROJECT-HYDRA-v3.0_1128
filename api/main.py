from __future__ import annotations

from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from utils.config import settings

app = FastAPI(title=settings.api_title, version=settings.api_version)

if settings.enable_cors:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=settings.cors_allow_methods,
        allow_headers=settings.cors_allow_headers,
    )


class Flag(BaseModel):
    severity: str
    score: float
    title: str
    description: str
    recommendation: str


class AnalyzeResponse(BaseModel):
    filename: Optional[str] = None
    pages_processed: int
    summary: str
    overall_risk_score: float
    flags: list[Flag]
    extracted_clauses: dict[str, list[str]]


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(file: UploadFile = File(...)):
    """Minimal analyze endpoint stub.

    This stub reads at most settings.max_pages pages worth of bytes and returns a
    dummy summary. It can be replaced later by real pipeline components.
    """
    try:
        content = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to read upload: {exc}") from exc

    if not content:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    # Naive page approximation by form-feed/newlines for placeholder behavior.
    pages_processed = min(settings.max_pages, content.count(b"\f") + max(content.count(b"\n") // 40, 1))

    # Return placeholder data with all required fields
    return AnalyzeResponse(
        filename=file.filename,
        pages_processed=pages_processed,
        summary="Analysis pipeline not yet implemented. Placeholder response.",
        overall_risk_score=35.0,
        flags=[
            Flag(
                severity="HIGH",
                score=75.0,
                title="Broad Indemnification Clause",
                description="The contract contains a broad indemnification clause that may expose you to significant liability.",
                recommendation="Consider negotiating narrower indemnification terms or adding caps on liability."
            ),
            Flag(
                severity="MEDIUM",
                score=50.0,
                title="Unilateral Termination Rights",
                description="The other party has unilateral termination rights that may disadvantage you.",
                recommendation="Propose mutual termination clauses or add notice period requirements."
            )
        ],
        extracted_clauses={
            "limitation_of_liability": ["The maximum liability shall not exceed...", "In no event shall either party be liable..."],
            "confidentiality": ["All confidential information shall be kept strictly confidential..."],
            "term_and_termination": ["This agreement shall commence on...", "Either party may terminate..."]
        }
    )


# ASGI entrypoint for uvicorn: uvicorn api.main:app --reload
