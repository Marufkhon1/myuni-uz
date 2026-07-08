"""Curated published_catalog tuition overlay for flagship HEIs."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

CATALOG_PATH = Path(__file__).resolve().parent / "data" / "published_tuition_catalog.json"

OVERLAY_KEYS = (
    "academic_year",
    "currency",
    "note",
    "source_url",
    "published_at",
    "catalog_reference",
    "field_clusters",
)


@lru_cache(maxsize=1)
def load_published_tuition_catalog() -> dict[str, Any]:
    if not CATALOG_PATH.is_file():
        return {"entries": {}}
    with CATALOG_PATH.open(encoding="utf-8") as handle:
        payload = json.load(handle)
    return payload if isinstance(payload, dict) else {"entries": {}}


def curated_short_names() -> list[str]:
    entries = load_published_tuition_catalog().get("entries") or {}
    return sorted(entries.keys())


def lookup_curated_entry(*, slug: str = "", short_name: str = "") -> dict[str, Any] | None:
    entries = load_published_tuition_catalog().get("entries") or {}
    if short_name and short_name in entries:
        return dict(entries[short_name])
    slug_norm = (slug or "").strip().lower()
    if slug_norm:
        for entry in entries.values():
            if (entry.get("slug") or "").strip().lower() == slug_norm:
                return dict(entry)
    return None


def effective_contract_pricing(university) -> dict[str, Any]:
    """
    Merge curated published_catalog metadata onto University.contract_pricing.

    Amounts inherit from the stored contract_pricing unless the catalog entry
    supplies explicit forms (e.g. future per-program curation).
    """
    base = getattr(university, "contract_pricing", None)
    if not isinstance(base, dict):
        base = {}

    curated = lookup_curated_entry(
        slug=getattr(university, "slug", "") or "",
        short_name=getattr(university, "short_name", "") or "",
    )
    if not curated:
        return dict(base)

    merged = dict(base)
    merged["source"] = "published_catalog"
    for key in OVERLAY_KEYS:
        value = curated.get(key)
        if value not in (None, ""):
            merged[key] = value

    catalog_year = load_published_tuition_catalog().get("academic_year")
    if catalog_year and not merged.get("academic_year"):
        merged["academic_year"] = catalog_year

    curated_forms = curated.get("forms")
    if isinstance(curated_forms, list) and curated_forms:
        merged["forms"] = curated_forms

    return merged


def tuition_honesty_for_university(university) -> dict[str, Any]:
    from .tuition_honesty import build_tuition_honesty

    return build_tuition_honesty(effective_contract_pricing(university))
