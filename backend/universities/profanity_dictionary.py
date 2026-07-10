"""
Profanity lexicon loader — JSON manba (hardcode emas).

Fayl: universities/data/profanity_lexicon_v1.json
Override: settings.PROFANITY_LEXICON_PATH yoki env PROFANITY_LEXICON_PATH
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from django.conf import settings

from .profanity_normalize import normalize_token

logger = logging.getLogger(__name__)

DEFAULT_LEXICON_PATH = Path(__file__).resolve().parent / "data" / "profanity_lexicon_v1.json"
SUPPORTED_SCHEMA = "myuni.profanity_lexicon.v1"
BANNED_LANG_KEYS = ("uz", "ru", "en")
REQUIRED_CANONICAL_STEM = "ahmoq"


@dataclass(frozen=True)
class ProfanityLexicon:
    version: int
    min_term_length: int
    banned_raw: frozenset[str]
    whitelist_raw: frozenset[str]
    banned_canonical: frozenset[str]
    whitelist_canonical: frozenset[str]
    banned_by_length: tuple[str, ...]
    source_path: str
    lang_term_counts: tuple[tuple[str, int], ...]

    @property
    def banned_count(self) -> int:
        return len(self.banned_canonical)

    @property
    def whitelist_count(self) -> int:
        return len(self.whitelist_canonical)


class ProfanityLexiconError(ValueError):
    """Lexicon fayli yaroqsiz yoki topilmadi."""


def get_lexicon_path() -> Path:
    override = (getattr(settings, "PROFANITY_LEXICON_PATH", None) or "").strip()
    if override:
        return Path(override)
    return DEFAULT_LEXICON_PATH


def _as_str_list(value, *, field: str) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, list):
        raise ProfanityLexiconError(f"Lexicon '{field}' ro'yxat bo'lishi kerak.")
    items: list[str] = []
    seen: set[str] = set()
    for index, item in enumerate(value):
        if not isinstance(item, str):
            raise ProfanityLexiconError(f"Lexicon '{field}[{index}]' matn bo'lishi kerak.")
        cleaned = item.strip()
        if not cleaned:
            continue
        if cleaned in seen:
            logger.debug("Lexicon %s duplicate raw skipped: %s", field, cleaned)
            continue
        seen.add(cleaned)
        items.append(cleaned)
    return items


def _collect_banned(payload: dict) -> tuple[list[str], tuple[tuple[str, int], ...]]:
    banned = payload.get("banned")
    if banned is None:
        raise ProfanityLexiconError("Lexicon 'banned' maydoni majburiy.")
    if isinstance(banned, list):
        items = _as_str_list(banned, field="banned")
        return items, (("all", len(items)),)
    if not isinstance(banned, dict):
        raise ProfanityLexiconError("Lexicon 'banned' object yoki array bo'lishi kerak.")

    collected: list[str] = []
    counts: list[tuple[str, int]] = []
    for lang in BANNED_LANG_KEYS:
        lang_items = _as_str_list(banned.get(lang), field=f"banned.{lang}")
        counts.append((lang, len(lang_items)))
        collected.extend(lang_items)
    for lang, terms in banned.items():
        if lang in BANNED_LANG_KEYS:
            continue
        lang_items = _as_str_list(terms, field=f"banned.{lang}")
        counts.append((str(lang), len(lang_items)))
        collected.extend(lang_items)
    return collected, tuple(counts)


def _build_canonical(
    terms: list[str],
    *,
    min_term_length: int,
    field: str,
) -> frozenset[str]:
    canonical: set[str] = set()
    dropped: list[str] = []
    for raw in terms:
        normalized = normalize_token(raw)
        if len(normalized) >= min_term_length:
            canonical.add(normalized)
        elif normalized or raw:
            dropped.append(f"{raw!r}->{normalized!r}")
    if dropped:
        logger.warning(
            "Profanity lexicon %s: %s ta atama min_term_length=%s dan qisqa, tashlandi: %s",
            field,
            len(dropped),
            min_term_length,
            ", ".join(dropped[:12]) + ("…" if len(dropped) > 12 else ""),
        )
    return frozenset(canonical)


def parse_lexicon_payload(payload: dict, *, source_path: str) -> ProfanityLexicon:
    if not isinstance(payload, dict):
        raise ProfanityLexiconError("Lexicon JSON object bo'lishi kerak.")

    schema = payload.get("schema")
    if schema != SUPPORTED_SCHEMA:
        raise ProfanityLexiconError(
            f"Noma'lum yoki yo'q lexicon schema: {schema!r}. Kutilgan: {SUPPORTED_SCHEMA!r}."
        )

    try:
        version = int(payload.get("version", 1))
    except (TypeError, ValueError) as exc:
        raise ProfanityLexiconError("Lexicon 'version' butun son bo'lishi kerak.") from exc
    if version < 1:
        raise ProfanityLexiconError("Lexicon 'version' kamida 1 bo'lishi kerak.")

    try:
        min_term_length = int(payload.get("min_term_length", 4))
    except (TypeError, ValueError) as exc:
        raise ProfanityLexiconError("Lexicon 'min_term_length' butun son bo'lishi kerak.") from exc

    if min_term_length < 3:
        raise ProfanityLexiconError("Lexicon 'min_term_length' kamida 3 bo'lishi kerak.")

    banned_list, lang_term_counts = _collect_banned(payload)
    banned_raw = frozenset(banned_list)
    whitelist_raw = frozenset(_as_str_list(payload.get("whitelist"), field="whitelist"))

    if not banned_raw:
        raise ProfanityLexiconError("Lexicon 'banned' bo'sh bo'lmasligi kerak.")

    banned_canonical = _build_canonical(
        list(banned_raw),
        min_term_length=min_term_length,
        field="banned",
    )
    whitelist_canonical = _build_canonical(
        list(whitelist_raw),
        min_term_length=1,
        field="whitelist",
    )

    if not banned_canonical:
        raise ProfanityLexiconError(
            "Lexicon 'banned' normalizatsiyadan keyin bo'sh (min_term_length juda katta?)."
        )

    if REQUIRED_CANONICAL_STEM not in banned_canonical:
        raise ProfanityLexiconError(
            f"Lexicon v1 da '{REQUIRED_CANONICAL_STEM}' (yoki uning kanonik shakli) majburiy."
        )

    overlap = banned_canonical & whitelist_canonical
    if overlap:
        raise ProfanityLexiconError(
            "Lexicon whitelist va banned kesishmasin: " + ", ".join(sorted(overlap)[:8])
        )

    banned_by_length = tuple(sorted(banned_canonical, key=len, reverse=True))

    return ProfanityLexicon(
        version=version,
        min_term_length=min_term_length,
        banned_raw=banned_raw,
        whitelist_raw=whitelist_raw,
        banned_canonical=banned_canonical,
        whitelist_canonical=whitelist_canonical,
        banned_by_length=banned_by_length,
        source_path=source_path,
        lang_term_counts=lang_term_counts,
    )


def load_lexicon_from_path(path: Path) -> ProfanityLexicon:
    if not path.is_file():
        raise ProfanityLexiconError(f"Profanity lexicon topilmadi: {path}")

    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ProfanityLexiconError(f"Profanity lexicon JSON xato: {path}: {exc}") from exc
    except OSError as exc:
        raise ProfanityLexiconError(f"Profanity lexicon o'qilmadi: {path}: {exc}") from exc

    lexicon = parse_lexicon_payload(payload, source_path=str(path))
    logger.info(
        "Profanity lexicon loaded version=%s banned=%s whitelist=%s langs=%s path=%s",
        lexicon.version,
        lexicon.banned_count,
        lexicon.whitelist_count,
        dict(lexicon.lang_term_counts),
        lexicon.source_path,
    )
    return lexicon


@lru_cache(maxsize=8)
def _cached_lexicon(path_str: str) -> ProfanityLexicon:
    return load_lexicon_from_path(Path(path_str))


def get_lexicon() -> ProfanityLexicon:
    return _cached_lexicon(str(get_lexicon_path().resolve()))


def clear_lexicon_cache() -> None:
    _cached_lexicon.cache_clear()


def validate_lexicon_roundtrip(lexicon: ProfanityLexicon | None = None) -> list[str]:
    """
    Har bir kanonik banned atama o'zi matn sifatida ushlanishi kerak.
    Qaytadi: xato xabarlari (bo'sh = OK).
    """
    from .profanity_filter import find_profanity

    lex = lexicon or get_lexicon()
    errors: list[str] = []
    for term in sorted(lex.banned_canonical):
        hit = find_profanity(term)
        if hit is None:
            errors.append(f"round-trip miss: {term!r}")
            continue
        if hit.term != term and not term.startswith(hit.term):
            errors.append(f"round-trip unexpected: input={term!r} hit={hit.term!r}")
    for safe in sorted(lex.whitelist_canonical):
        if find_profanity(safe) is not None:
            errors.append(f"whitelist still flagged: {safe!r}")
    return errors


def ensure_lexicon_loaded() -> ProfanityLexicon:
    """Startup / health: yuklash + round-trip."""
    lexicon = get_lexicon()
    errors = validate_lexicon_roundtrip(lexicon)
    if errors:
        raise ProfanityLexiconError(
            "Profanity lexicon integrity xato: " + "; ".join(errors[:5])
        )
    return lexicon


# --- Orqaga moslik (eski importlar) ---

def _legacy_banned() -> frozenset[str]:
    return get_lexicon().banned_raw


def _legacy_whitelist() -> frozenset[str]:
    return get_lexicon().whitelist_raw


def __getattr__(name: str):
    if name == "BANNED_TERMS":
        return _legacy_banned()
    if name == "WHITELIST_TERMS":
        return _legacy_whitelist()
    if name == "MIN_TERM_LENGTH":
        return get_lexicon().min_term_length
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
