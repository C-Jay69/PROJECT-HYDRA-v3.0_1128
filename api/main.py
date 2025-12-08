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


class AnalyzeResponse(BaseModel):
    filename: Optional[str] = None
    pages_processed: int
    summary: str


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

    return AnalyzeResponse(
        filename=file.filename,
        pages_processed=pages_processed,
        summary="Analysis pipeline not yet implemented. Placeholder response.",
    )


# ASGI entrypoint for uvicorn: uvicorn api.main:app --reload
