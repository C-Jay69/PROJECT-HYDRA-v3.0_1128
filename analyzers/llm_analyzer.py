from __future__ import annotations

from typing import List

from models.schemas import Clause
from utils.config import settings

def summarize_clauses(clauses: List[Clause]) -> str:
    """Placeholder summarizer that avoids external API calls if no keys.
    
    If an API key is configured we could later plug in OpenAI/Anthropic calls.
    For now, return a short deterministic summary that keeps the pipeline alive.
    """
    if not clauses:
        return "No clauses identified."
    
    distinct = len({c.title for c in clauses})
    pages = sorted({c.page for c in clauses if c.page is not None})
    
    if pages:
        span = f"pages {pages[0]}-{pages[-1]}" if len(pages) > 1 else f"page {pages[0]}"
    else:
        span = "unknown pages"
    
    return f"Identified {len(clauses)} clauses across {distinct} sections over {span}."