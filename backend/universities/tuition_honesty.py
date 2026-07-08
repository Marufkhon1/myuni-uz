"""Normalize University.contract_pricing into an honest public tuition view."""

from __future__ import annotations

from typing import Any

SOURCE_META = {
    "national_base_2025_2026": {
        "disclaimer_kind": "national_estimate",
        "source_label": "Davlat bazaviy tarif asosida hisoblangan",
        "badge_label": "Taxmin (davlat bazasi)",
    },
    "estimated_private": {
        "disclaimer_kind": "estimate",
        "source_label": "Nodavlat OTM — taxminiy koeffitsient",
        "badge_label": "Taxminiy",
    },
    "estimated_international": {
        "disclaimer_kind": "estimate",
        "source_label": "Xorijiy filial — taxminiy diapazon",
        "badge_label": "Taxminiy",
    },
    "published_catalog": {
        "disclaimer_kind": "published_catalog",
        "source_label": "Muassasa / ochiq katalogdan e'lon qilingan",
        "badge_label": "Katalog",
    },
}

UNAVAILABLE = {
    "available": False,
    "academic_year": None,
    "currency": "UZS",
    "disclaimer_kind": "unavailable",
    "source": None,
    "source_label": "Kontrakt narxi hali mavjud emas",
    "badge_label": "Mavjud emas",
    "note": (
        "MyUni.uz bu OTM uchun ochiq kontrakt summasini hali ko'rsatmaydi. "
        "Aniq narxni muassasa sayti yoki kontrakt.edu.uz dan tekshiring."
    ),
    "primary": None,
    "forms": [],
}


def _pick_primary(forms: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not forms:
        return None
    by_code = {str(item.get("code") or ""): item for item in forms}
    for preferred in ("kunduzgi", "kechki", "sirtqi", "masofaviy"):
        if preferred in by_code:
            item = by_code[preferred]
            return {
                "code": item.get("code"),
                "label": item.get("label") or preferred.title(),
                "average_uzs": item.get("average_uzs"),
                "min_uzs": item.get("min_uzs"),
                "max_uzs": item.get("max_uzs"),
            }
    first = forms[0]
    return {
        "code": first.get("code"),
        "label": first.get("label") or "Kontrakt",
        "average_uzs": first.get("average_uzs"),
        "min_uzs": first.get("min_uzs"),
        "max_uzs": first.get("max_uzs"),
    }


def build_tuition_honesty(contract_pricing: dict | None) -> dict[str, Any]:
    """
    Public-facing tuition honesty payload.

    disclaimer_kind:
      - national_estimate: derived from national base tariffs (NOT a published uni fee list)
      - estimate: private/international coefficient estimate
      - published_catalog: curated official published price (future)
      - unavailable: no usable forms
    """
    raw = contract_pricing if isinstance(contract_pricing, dict) else {}
    forms_raw = raw.get("forms") or []
    forms = [item for item in forms_raw if isinstance(item, dict) and item.get("average_uzs")]
    source = (raw.get("source") or "").strip()

    if not forms:
        return dict(UNAVAILABLE)

    meta = SOURCE_META.get(
        source,
        {
            "disclaimer_kind": "estimate",
            "source_label": "Taxminiy kontrakt summasi",
            "badge_label": "Taxminiy",
        },
    )
    note = (raw.get("note") or "").strip() or (
        "Bu summalar MyUni.uz hisob-kitobi; rasmiy universitet narx-nomasi emas."
    )

    normalized_forms = [
        {
            "code": item.get("code"),
            "label": item.get("label"),
            "average_uzs": item.get("average_uzs"),
            "min_uzs": item.get("min_uzs"),
            "max_uzs": item.get("max_uzs"),
        }
        for item in forms
    ]

    payload = {
        "available": True,
        "academic_year": raw.get("academic_year") or "2025/2026",
        "currency": raw.get("currency") or "UZS",
        "disclaimer_kind": meta["disclaimer_kind"],
        "source": source or None,
        "source_label": meta["source_label"],
        "badge_label": meta["badge_label"],
        "note": note,
        "primary": _pick_primary(normalized_forms),
        "forms": normalized_forms,
    }
    source_url = (raw.get("source_url") or "").strip()
    if source_url:
        payload["source_url"] = source_url
    published_at = (raw.get("published_at") or "").strip()
    if published_at:
        payload["published_at"] = published_at
    catalog_reference = (raw.get("catalog_reference") or "").strip()
    if catalog_reference:
        payload["catalog_reference"] = catalog_reference
    return payload


def tuition_compare_fields(contract_pricing: dict | None) -> dict[str, Any]:
    """Slim fields for compare rows."""
    honesty = build_tuition_honesty(contract_pricing)
    primary = honesty.get("primary") or {}
    return {
        "tuition_available": bool(honesty.get("available")),
        "tuition_disclaimer_kind": honesty.get("disclaimer_kind"),
        "tuition_badge_label": honesty.get("badge_label"),
        "tuition_academic_year": honesty.get("academic_year"),
        "tuition_primary_label": primary.get("label"),
        "tuition_primary_average_uzs": primary.get("average_uzs"),
        "tuition_primary_min_uzs": primary.get("min_uzs"),
        "tuition_primary_max_uzs": primary.get("max_uzs"),
        "tuition_note": honesty.get("note"),
    }
