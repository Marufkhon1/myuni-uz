"""
Step 4 — Matcher: normalizatsiya qilingan matnda kanonik so'zlarni qidirish.

Strategiyalar:
  1) word_boundary — bo'shliq so'zi → continuous normalize (a-h-m-o-q, axmoq)
  2) letter_join   — bir harfli ketma-ketlik (a h m o q)
  3) fragment_join — qisqa bo'laklar (ah m o q, ahm oq)

Hit (log):  { "blocked": true,  "matched": "ahmoq" }
Userga:     matched KO'RSATILMAYDI — faqat umumiy xabar
Clean:      { "blocked": false, "matched": null }
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass

from django.conf import settings

from .profanity_dictionary import clear_lexicon_cache, get_lexicon
from .profanity_fuzzy import find_fuzzy_candidate
from .profanity_normalize import normalize_for_moderation
from .profanity_policy import (
    ACTIVE_PROFANITY_SCOPES,
    PROFANITY_REJECTION_MESSAGE,
    PROFANITY_SCOPE_REVIEWS,
)
from .profanity_toxicity import confirm_ambiguous_block

logger = logging.getLogger(__name__)

_WORD_RE = re.compile(r"\S+", re.UNICODE)
_TOKEN_RE = re.compile(r"\w+", re.UNICODE)

STRATEGY_WORD = "word_boundary"
STRATEGY_LETTER_JOIN = "letter_join"
STRATEGY_FRAGMENT_JOIN = "fragment_join"
STRATEGY_FUZZY = "fuzzy_1"

# Fragment-join: har bir bo'lak shu uzunlikdan oshmasin (ah, mo, q).
_FRAGMENT_MAX_LEN = 2
# Kamida shuncha bo'lak bo'lsa obfuscation deb hisoblanadi.
_FRAGMENT_MIN_PARTS = 2

_INFLECTION_SUFFIXES = frozenset(
    {
        "s",
        "es",
        "ed",
        "er",
        "ers",
        "ing",
        "lar",
        "lari",
        "larni",
        "larning",
        "larga",
        "larda",
        "lardan",
        "ning",
        "ni",
        "ga",
        "da",
        "dan",
        "mi",
        "mu",
        "chi",
        "lik",
        "dek",
        "day",
        "roq",
        "cha",
        "boz",
        "a",
        "i",
        "y",
        "e",
        "u",
        "ov",
        "ev",
        "ami",
        "ah",
        "om",
        "oy",
        "aya",
        "iye",
        "iy",
        "ka",
        "ku",
        "ke",
        "ok",
        "ek",
        "ina",
        "ishka",
        # O'zbek shaxs/fe'l qo'shimchalari (ahmoqsan, tentaksiz, …)
        "san",
        "siz",
        "man",
        "miz",
        "sanmi",
        "sizmi",
        "manmi",
        "mizmi",
        "ekan",
        "ekanmi",
        "u",
        "yu",
    }
)


def _user_safe_message() -> str:
    """Userga chiqadigan matn — hech qachon matched stem qo'shilmaydi."""
    return PROFANITY_REJECTION_MESSAGE


@dataclass(frozen=True)
class ModerationMatchResult:
    """
    Matcher natijasi.

    - blocked / matched — log / analitika
    - message — faqat user (matched ni o'z ichiga olmaydi)
    """

    blocked: bool
    matched: str | None = None
    message: str = ""
    strategy: str = ""

    def __post_init__(self) -> None:
        if self.blocked:
            if not self.matched:
                raise ValueError("blocked=True bo'lsa matched majburiy.")
            if self.matched and self.matched in (self.message or ""):
                raise ValueError("matched user message ichida bo'lmasligi kerak.")
        elif self.matched is not None:
            raise ValueError("blocked=False bo'lsa matched=None bo'lishi kerak.")

    @property
    def term(self) -> str | None:
        """Orqaga moslik (eski ProfanityMatch.term)."""
        return self.matched

    def to_log_dict(self) -> dict:
        """
        Spec hit shape (log): { blocked, matched }.
        strategy qo'shimcha diagnostika (ixtiyoriy).
        """
        if not self.blocked:
            return {"blocked": False, "matched": None}
        payload = {"blocked": True, "matched": self.matched}
        if self.strategy:
            payload["strategy"] = self.strategy
        return payload

    def to_public_dict(self) -> dict:
        """API/UI: matched hech qachon chiqmaydi."""
        if not self.blocked:
            return {"blocked": False}
        return {
            "blocked": True,
            "detail": self.message or _user_safe_message(),
        }


ProfanityMatch = ModerationMatchResult

_CLEAN = ModerationMatchResult(blocked=False, matched=None, message="", strategy="")


def _hit(matched: str, *, strategy: str) -> ModerationMatchResult:
    return ModerationMatchResult(
        blocked=True,
        matched=matched,
        message=_user_safe_message(),
        strategy=strategy,
    )


def profanity_filter_enabled() -> bool:
    return bool(getattr(settings, "PROFANITY_FILTER_ENABLED", True))


def _rest_is_inflection(rest: str, *, stem: str) -> bool:
    if not rest:
        return True
    if rest in _INFLECTION_SUFFIXES:
        return True
    if stem and len(rest) <= 2 and set(rest) == {stem[-1]}:
        return True
    return False


def _span_covered_by_whitelist(haystack: str, start: int, end: int, whitelist: frozenset[str]) -> bool:
    for safe in whitelist:
        if len(safe) < end - start:
            continue
        idx = 0
        while True:
            found = haystack.find(safe, idx)
            if found < 0:
                break
            if found <= start and end <= found + len(safe):
                return True
            idx = found + 1
    return False


def _term_matches_normalized(value: str, term: str) -> bool:
    if not value or not term or len(value) < len(term):
        return False
    if value == term:
        return True
    if not value.startswith(term):
        return False
    return _rest_is_inflection(value[len(term) :], stem=term)


def _match_normalized_value(
    value: str,
    *,
    banned_ordered: tuple[str, ...],
    whitelist: frozenset[str],
    strategy: str,
) -> ModerationMatchResult | None:
    if not value:
        return None
    if value in whitelist:
        return None
    for term in banned_ordered:
        if not _term_matches_normalized(value, term):
            continue
        if _span_covered_by_whitelist(value, 0, len(term), whitelist):
            continue
        if _span_covered_by_whitelist(value, 0, len(value), whitelist):
            continue
        return _hit(term, strategy=strategy)
    return None


def _match_letter_join_runs(
    norm_tokens: list[str],
    *,
    banned_ordered: tuple[str, ...],
    whitelist: frozenset[str],
    min_len: int,
) -> ModerationMatchResult | None:
    """a h m o q → ahmoq."""
    index = 0
    while index < len(norm_tokens):
        if len(norm_tokens[index]) != 1:
            index += 1
            continue
        combo = norm_tokens[index]
        cursor = index + 1
        while cursor < len(norm_tokens) and len(norm_tokens[cursor]) == 1:
            combo += norm_tokens[cursor]
            cursor += 1
        if len(combo) >= min_len:
            hit = _match_normalized_value(
                combo,
                banned_ordered=banned_ordered,
                whitelist=whitelist,
                strategy=STRATEGY_LETTER_JOIN,
            )
            if hit:
                return hit
        index = cursor
    return None


def _match_fragment_join_runs(
    norm_tokens: list[str],
    *,
    banned_ordered: tuple[str, ...],
    whitelist: frozenset[str],
    min_len: int,
) -> ModerationMatchResult | None:
    """
    Qisqa bo'laklar: ah m o q / ahm oq.
    Oddiy so'zlar (len>2) qatnashmaydi — yaxshi tajriba FP yo'q.
    """
    index = 0
    n = len(norm_tokens)
    while index < n:
        if len(norm_tokens[index]) > _FRAGMENT_MAX_LEN:
            index += 1
            continue
        cursor = index
        parts: list[str] = []
        while cursor < n and len(norm_tokens[cursor]) <= _FRAGMENT_MAX_LEN:
            parts.append(norm_tokens[cursor])
            cursor += 1
        if len(parts) >= _FRAGMENT_MIN_PARTS:
            combo = "".join(parts)
            if len(combo) >= min_len:
                hit = _match_normalized_value(
                    combo,
                    banned_ordered=banned_ordered,
                    whitelist=whitelist,
                    strategy=STRATEGY_FRAGMENT_JOIN,
                )
                if hit:
                    return hit
        index = cursor if cursor > index else index + 1
    return None


def fuzzy_filter_enabled() -> bool:
    return bool(getattr(settings, "PROFANITY_FUZZY_ENABLED", True))


def match_moderation_text(text: str | None) -> ModerationMatchResult:
    """
    Asosiy matcher API (Step 4 + Step 8 fuzzy/toxicity).

    Butun matnni bitta continuous string qilib substring qidirish YO'Q
    (yaxshi+tajriba → shit false-positive).

    Tartib: exact word → letter_join → fragment_join → fuzzy (ambiguous + toxicity).
    """
    lexicon = get_lexicon()
    banned_ordered = lexicon.banned_by_length
    whitelist = lexicon.whitelist_canonical
    min_len = lexicon.min_term_length
    raw = text or ""

    # 1) So'z chegarasi + continuous (har bir whitespace-so'z)
    for word in _WORD_RE.findall(raw):
        continuous = normalize_for_moderation(word)
        hit = _match_normalized_value(
            continuous,
            banned_ordered=banned_ordered,
            whitelist=whitelist,
            strategy=STRATEGY_WORD,
        )
        if hit:
            return hit

    raw_tokens = _TOKEN_RE.findall(raw)
    norm_tokens = [normalize_for_moderation(token) for token in raw_tokens]
    norm_tokens = [token for token in norm_tokens if token]

    # 2) Bir harfli continuous obfuscation
    hit = _match_letter_join_runs(
        norm_tokens,
        banned_ordered=banned_ordered,
        whitelist=whitelist,
        min_len=min_len,
    )
    if hit:
        return hit

    # 3) Qisqa fragment continuous (ah m o q)
    hit = _match_fragment_join_runs(
        norm_tokens,
        banned_ordered=banned_ordered,
        whitelist=whitelist,
        min_len=min_len,
    )
    if hit:
        return hit

    # 4) Fuzzy 1-edit — faqat so'z darajasida; noaniq → toxicity gate
    if fuzzy_filter_enabled():
        for word in _WORD_RE.findall(raw):
            continuous = normalize_for_moderation(word)
            if not continuous:
                continue
            cand = find_fuzzy_candidate(
                continuous,
                banned_ordered,
                whitelist=whitelist,
                min_stem_len=int(getattr(settings, "PROFANITY_FUZZY_MIN_STEM_LEN", 5)),
            )
            if not cand:
                continue
            if confirm_ambiguous_block(
                text=raw,
                matched=cand.matched,
                confidence=cand.confidence,
            ):
                return _hit(cand.matched, strategy=STRATEGY_FUZZY)

    return _CLEAN


def find_profanity(text: str | None) -> ModerationMatchResult | None:
    """Orqaga moslik: hit bo'lsa result, toza bo'lsa None."""
    result = match_moderation_text(text)
    return result if result.blocked else None


def check_text_for_scope(
    text: str | None,
    scope: str = PROFANITY_SCOPE_REVIEWS,
) -> ModerationMatchResult | None:
    if not profanity_filter_enabled():
        return None
    if scope not in ACTIVE_PROFANITY_SCOPES:
        return None
    return find_profanity(text)


def reload_profanity_lexicon() -> None:
    clear_lexicon_cache()


def log_moderation_hit(result: ModerationMatchResult, *, scope: str = PROFANITY_SCOPE_REVIEWS) -> None:
    """Hit log + kunlik metrika — matched stem bor, xom matn yo'q."""
    if not result.blocked:
        return
    logger.info(
        "profanity_blocked scope=%s matched=%s strategy=%s",
        scope,
        result.matched,
        result.strategy,
    )
    try:
        from .profanity_metrics import record_profanity_block

        record_profanity_block(
            matched=result.matched or "",
            strategy=result.strategy or "",
            scope=scope,
        )
    except Exception as exc:
        # SimpleTestCase DB ni taqiqlaydi — metrika ixtiyoriy, filter ishlashi kerak
        try:
            from django.test.testcases import DatabaseOperationForbidden
        except ImportError:  # pragma: no cover
            DatabaseOperationForbidden = ()  # type: ignore[misc, assignment]
        if DatabaseOperationForbidden and isinstance(exc, DatabaseOperationForbidden):
            return
        logger.exception("profanity block metric yozilmadi")