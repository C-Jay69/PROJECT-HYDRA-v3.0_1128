from __future__ import annotations

from typing import Iterable, List

from models.schemas import Clause

def aggregate_clauses(clause_groups: Iterable[Iterable[Clause]]) -> List[Clause]:
    """Flatten and deduplicate clauses by (title, page, content) triple.
    
    This provides a deterministic minimal aggregator to keep the pipeline working
    even if richer logic is added later.
    """
    seen: set[tuple[str, int | None, str]] = set()
    result: List[Clause] = []
    
    for group in clause_groups:
        for clause in group:
            key = (clause.title, clause.page, clause.content.strip())
            if key in seen:
                continue
            seen.add(key)
            result.append(clause)
    
    return result