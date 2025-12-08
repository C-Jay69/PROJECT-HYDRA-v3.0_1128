from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


class Clause(BaseModel):
    title: str
    content: str
    page: Optional[int] = None


class DocumentAnalysis(BaseModel):
    filename: Optional[str] = None
    page_count: int
    clauses: List[Clause] = []
    summary: Optional[str] = None
