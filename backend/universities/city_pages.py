"""Phase 5 — city landing page registry (UZ regional expansion)."""

from __future__ import annotations

# Featured indexable city pages (slug → display name). Keep in sync with
# frontend/src/config/cities.js FEATURED_CITIES.
FEATURED_CITY_PAGES = (
    ("toshkent", "Toshkent"),
    ("samarqand", "Samarqand"),
    ("buxoro", "Buxoro"),
    ("andijon", "Andijon"),
    ("namangan", "Namangan"),
    ("fargona", "Farg'ona"),
    ("nukus", "Nukus"),
    ("qarshi", "Qarshi"),
)

FEATURED_CITY_BY_SLUG = {slug: name for slug, name in FEATURED_CITY_PAGES}
FEATURED_CITY_BY_NAME = {name.lower(): slug for slug, name in FEATURED_CITY_PAGES}


def city_slug_for_name(city: str) -> str | None:
    if not city:
        return None
    return FEATURED_CITY_BY_NAME.get(city.strip().lower())


def resolve_featured_city(slug: str) -> str | None:
    return FEATURED_CITY_BY_SLUG.get((slug or "").strip().lower())
