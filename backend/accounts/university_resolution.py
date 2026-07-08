"""Resolve Profile university text ↔ University FK (exact match only for writes)."""

from __future__ import annotations

from universities.models import University


def normalize_university_text(value: str | None) -> str:
    return " ".join(str(value or "").strip().split())


def resolve_university_by_id(university_id) -> University | None:
    if university_id in (None, "", 0, "0"):
        return None
    try:
        parsed = int(university_id)
    except (TypeError, ValueError):
        return None
    return University.objects.filter(pk=parsed).first()


def resolve_university_by_text(value: str | None) -> University | None:
    """
    Exact name / short_name match (case-insensitive).
    Fuzzy includes() is intentionally NOT used for writes — too many false positives.
    """
    text = normalize_university_text(value)
    if not text:
        return None

    by_name = University.objects.filter(name__iexact=text).first()
    if by_name:
        return by_name
    return University.objects.filter(short_name__iexact=text).first()


def apply_university_to_profile(profile, *, university_id=None, university_text=None):
    """
    Dual-write helper: prefer university_id, else resolve from text.
    Always syncs CharField `university` display name from the FK when matched.
    Returns (matched_university_or_None, errors_list).
    """
    errors: list[str] = []
    matched = None

    if university_id not in (None, ""):
        matched = resolve_university_by_id(university_id)
        if matched is None:
            errors.append("university_id noto'g'ri yoki topilmadi.")
            return None, errors
    elif university_text is not None:
        text = normalize_university_text(university_text)
        if not text:
            profile.university = ""
            profile.university_ref = None
            return None, errors
        matched = resolve_university_by_text(text)
        if matched is None:
            # Keep legacy free-text until backfill / catalog growth; FK stays null.
            profile.university = text
            profile.university_ref = None
            return None, errors

    if matched is not None:
        profile.university_ref = matched
        profile.university = matched.name
    return matched, errors
