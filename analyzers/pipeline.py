from __future__ import annotations

from typing import Optional

from analyzers.aggregator import aggregate_clauses
from analyzers.clause_extractor import extract_clauses_from_pages
from analyzers.llm_analyzer import summarize_clauses
from analyzers.rule_engine import apply_rules
from models.schemas import DocumentAnalysis
from parsers.pdf_parser import extract_text_from_pdf
from utils.config import settings

def analyze_document(path: str, max_pages: Optional[int] = None) -> DocumentAnalysis:
    """Main pipeline for document analysis."""
    # Extract text from PDF
    pages = extract_text_from_pdf(path, max_pages=max_pages or settings.max_pages)
    
    # Extract clauses
    clauses = extract_clauses_from_pages(pages)
    
    # Aggregate clauses (flatten and deduplicate)
    aggregated = aggregate_clauses([clauses])
    
    # Generate summary
    summary = summarize_clauses(aggregated)
    
    # Apply rule engine
    rules = apply_rules(aggregated)
    
    return DocumentAnalysis(
        filename=path,
        page_count=len(pages),
        clauses=aggregated,
        summary=summary,
        rules=rules  # Added missing rules field
    )