"""
Step 8 — Toxicity / ML gate (faqat noaniq / ambiguous holatlar).

Exact lexicon hit → ML chaqirilMAYDI.
Fuzzy hit → shu modul tasdiqlaydi yoki rad etadi.

Backendlar:
  - none: score=None (fuzzy faqat high confidence da block)
  - heuristic: engil signal (ML o'rniga offline / default)
  - callable path (ixtiyoriy): settings.PROFANITY_TOXICITY_CALLABLE
"""

from __future__ import annotations

import logging
import re
from importlib import import_module
from typing import Callable

from django.conf import settings

logger = logging.getLogger(__name__)

_LEET_HINT_RE = re.compile(r"[0-9@!$]")
_SEP_HINT_RE = re.compile(r"[.\-_*]{2,}|\s{2,}")


def toxicity_enabled() -> bool:
    return bool(getattr(settings, "PROFANITY_TOXICITY_ENABLED", True))


def toxicity_backend() -> str:
    return str(getattr(settings, "PROFANITY_TOXICITY_BACKEND", "heuristic") or "heuristic").strip().lower()


def toxicity_threshold() -> float:
    try:
        return float(getattr(settings, "PROFANITY_TOXICITY_THRESHOLD", 0.72))
    except (TypeError, ValueError):
        return 0.72


def heuristic_toxicity_score(text: str | None) -> float:
    """
    Engil heuristic (ML emas) — ambiguous fuzzy uchun qo'shimcha signal.
    0.0 … 1.0. Xom matn logga yozilmaydi.
    """
    raw = (text or "").strip()
    if not raw:
        return 0.0
    score = 0.18
    if _LEET_HINT_RE.search(raw):
        score += 0.22
    if _SEP_HINT_RE.search(raw):
        score += 0.18
    # Ko'p undosh ketma-ketligi / qisqa agressiv tokenlar
    tokens = re.findall(r"\S+", raw)
    if any(len(t) >= 4 and sum(ch.isalpha() for ch in t) <= len(t) // 2 for t in tokens):
        score += 0.15
    if len(tokens) == 1 and len(raw) <= 12:
        score += 0.12
    return max(0.0, min(1.0, score))


def _load_callable() -> Callable[[str], float] | None:
    path = (getattr(settings, "PROFANITY_TOXICITY_CALLABLE", "") or "").strip()
    if not path:
        return None
    module_name, _, attr = path.rpartition(".")
    if not module_name or not attr:
        logger.warning("PROFANITY_TOXICITY_CALLABLE yaroqsiz: %s", path)
        return None
    try:
        mod = import_module(module_name)
        fn = getattr(mod, attr)
    except Exception:
        logger.exception("Toxicity callable yuklanmadi: %s", path)
        return None
    if not callable(fn):
        logger.warning("Toxicity callable callable emas: %s", path)
        return None
    return fn


def score_toxicity(text: str | None) -> float | None:
    """
    Toxicity score yoki None (backend yo'q / o'chirilgan).
    Exact hit yo'lida chaqirilmasligi kerak.
    """
    if not toxicity_enabled():
        return None
    backend = toxicity_backend()
    if backend in {"", "none", "off", "disabled"}:
        return None
    if backend == "heuristic":
        return heuristic_toxicity_score(text)
    if backend in {"callable", "custom", "ml"}:
        fn = _load_callable()
        if fn is None:
            return None
        try:
            value = float(fn(text or ""))
        except Exception:
            logger.exception("Toxicity callable xato")
            return None
        return max(0.0, min(1.0, value))
    # Noma'lum backend — xavfsiz: score yo'q
    logger.warning("Noma'lum toxicity backend: %s", backend)
    return None


def confirm_ambiguous_block(
    *,
    text: str | None,
    matched: str,
    confidence: str,
) -> bool:
    """
    Noaniq (fuzzy) hit ni block qilish kerakmi?

    Barcha fuzzy — ambiguous (exact emas).
    - high (stem≥8, substitution): toxicity yo'q/none → block; score juda past (<0.25) → soft-clear
    - medium/low: faqat toxicity score >= threshold → block
    """
    score = score_toxicity(text)
    if confidence == "high":
        if score is None:
            return True
        # Aniq toza kontekst (past score) — FP soft-clear
        return score >= float(getattr(settings, "PROFANITY_FUZZY_HIGH_MIN_SCORE", 0.25))
    if score is None:
        return False
    return score >= toxicity_threshold()
