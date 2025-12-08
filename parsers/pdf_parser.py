from __future__ import annotations

from typing import List

import fitz  # PyMuPDF


def extract_text_from_pdf(path: str, max_pages: int | None = None) -> List[str]:
    """Extract plain text per page from a PDF file.

    Returns a list of strings, one per page. max_pages limits extraction.
    """
    texts: list[str] = []
    with fitz.open(path) as doc:
        total = len(doc)
        limit = min(total, max_pages) if max_pages else total
        for page_index in range(limit):
            page = doc.load_page(page_index)
            texts.append(page.get_text("text"))
    return texts
