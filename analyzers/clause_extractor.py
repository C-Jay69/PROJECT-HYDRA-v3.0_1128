from __future__ import annotations

import re
from typing import Iterable, List

from models.schemas import Clause

HEADER_RE = re.compile(r"^\s*(Section|Clause|Article)\s+([\w.\-]+)[:\-]?\s*(.*)", re.IGNORECASE)

def extract_clauses_from_pages(pages: Iterable[str]) -> List[Clause]:
    """Very simple clause extraction: detect headers and capture paragraphs.
    
    This is intentionally naive and deterministic to ensure baseline behavior.
    """
    clauses: List[Clause] = []
    current_title: str | None = None
    buffer: List[str] = []
    current_page = 0
    
    for page_num, page in enumerate(pages, start=1):
        lines = page.splitlines()
        for line in lines:
            m = HEADER_RE.match(line)
            if m:
                # Flush previous clause if exists
                if current_title is not None and buffer:
                    clauses.append(Clause(
                        title=current_title,
                        content="\n".join(buffer).strip(),
                        page=current_page
                    ))
                
                # Start new clause
                current_title = f"{m.group(1)} {m.group(2)}".strip()
                rest = m.group(3).strip()
                buffer = [rest] if rest else []
                current_page = page_num
            else:
                if current_title is not None:  # Only buffer if we're in a clause
                    buffer.append(line)
    
    # Flush the last clause
    if current_title is not None and buffer:
        clauses.append(Clause(
            title=current_title,
            content="\n".join(buffer).strip(),
            page=current_page
        ))
    
    return [c for c in clauses if c.content.strip()]