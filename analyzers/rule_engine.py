from __future__ import annotations

from typing import Iterable, List

from models.schemas import Clause

class RuleResult(Clause):
    rule: str | None = None
    severity: str | None = None

DEFAULT_RULES: List[tuple[str, str]] = [
    ("confidentiality", "warn"),
    ("termination", "info"),
    ("liability", "warn"),
]

def apply_rules(clauses: Iterable[Clause]) -> List[RuleResult]:
    """Very simple keyword-based rules engine to flag clauses.
    
    Returns a list of RuleResult extending Clause with rule and severity fields.
    """
    results: List[RuleResult] = []
    for clause in clauses:
        content_lc = f"{clause.title}\n{clause.content}".lower()
        for keyword, severity in DEFAULT_RULES:
            if keyword in content_lc:
                results.append(
                    RuleResult(
                        title=clause.title,
                        content=clause.content,
                        page=clause.page,
                        rule=keyword,
                        severity=severity,
                    )
                )
    return results