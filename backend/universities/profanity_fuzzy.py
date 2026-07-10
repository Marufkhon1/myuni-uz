"""
Step 8 — Fuzzy matcher (1 harf xato), ehtiyotkor threshold.

Faqat aniq strategiyalar o'tkazib yuborgan so'zlar uchun.
Distance=1; qisqa stemlar (default <5) fuzzy qilinMAYDI.
"""

from __future__ import annotations

from dataclasses import dataclass

from .profanity_policy import FUZZY_HIGH_STEM_LEN, FUZZY_MAX_DISTANCE, FUZZY_MIN_STEM_LEN, FUZZY_STRATEGY


@dataclass(frozen=True)
class FuzzyCandidate:
    matched: str
    distance: int
    confidence: str  # high | medium | low
    strategy: str = FUZZY_STRATEGY


def levenshtein_at_most(a: str, b: str, *, limit: int = FUZZY_MAX_DISTANCE) -> int | None:
    """
    Levenshtein masofa; limit dan oshsa None (erta chiqish).
    """
    if a == b:
        return 0
    la, lb = len(a), len(b)
    if abs(la - lb) > limit:
        return None
    if la == 0:
        return lb if lb <= limit else None
    if lb == 0:
        return la if la <= limit else None

    # Ikki qatorli DP
    prev = list(range(lb + 1))
    for i, ca in enumerate(a, start=1):
        curr = [i] + [0] * lb
        row_min = curr[0]
        for j, cb in enumerate(b, start=1):
            cost = 0 if ca == cb else 1
            curr[j] = min(
                prev[j] + 1,  # delete
                curr[j - 1] + 1,  # insert
                prev[j - 1] + cost,  # substitute
            )
            if curr[j] < row_min:
                row_min = curr[j]
        if row_min > limit:
            return None
        prev = curr
    dist = prev[lb]
    return dist if dist <= limit else None


def _confidence(*, stem: str, word: str, distance: int) -> str:
    if distance != 1:
        return "low"
    stem_len = len(stem)
    # Faqat substitution (bir xil uzunlik) + uzun stem → high
    if stem_len >= FUZZY_HIGH_STEM_LEN and len(word) == stem_len:
        return "high"
    if stem_len >= FUZZY_MIN_STEM_LEN and len(word) == stem_len:
        return "medium"
    # insert/delete — pastroq ishonch (FP xavfi)
    if stem_len >= FUZZY_HIGH_STEM_LEN:
        return "medium"
    return "low"


def find_fuzzy_candidate(
    word: str,
    banned_ordered: tuple[str, ...],
    *,
    whitelist: frozenset[str],
    min_stem_len: int = FUZZY_MIN_STEM_LEN,
    max_distance: int = FUZZY_MAX_DISTANCE,
) -> FuzzyCandidate | None:
    """
    Bitta normalizatsiya qilingan so'z uchun eng yaxshi fuzzy hit.
    Exact match bu yerda qaytarilMAYDI (distance=0).
    """
    if not word or word in whitelist:
        return None
    if len(word) < min_stem_len - max_distance:
        return None

    best: FuzzyCandidate | None = None
    for stem in banned_ordered:
        if len(stem) < min_stem_len:
            continue
        if abs(len(word) - len(stem)) > max_distance:
            continue
        if word == stem:
            continue
        dist = levenshtein_at_most(word, stem, limit=max_distance)
        if dist is None or dist == 0 or dist > max_distance:
            continue
        # Nisbiy threshold: 1 xato / stem_len <= 0.2 (len>=5)
        if dist / len(stem) > 0.2 + 1e-9:
            continue
        conf = _confidence(stem=stem, word=word, distance=dist)
        cand = FuzzyCandidate(matched=stem, distance=dist, confidence=conf)
        if best is None:
            best = cand
            continue
        # Prefer higher confidence, then longer stem (kamroq FP)
        rank = {"high": 3, "medium": 2, "low": 1}
        if rank[cand.confidence] > rank[best.confidence]:
            best = cand
        elif rank[cand.confidence] == rank[best.confidence] and len(cand.matched) > len(best.matched):
            best = cand
    return best
