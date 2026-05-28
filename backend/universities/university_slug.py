import re

from django.utils.text import slugify


def slugify_university_short_name(short_name: str) -> str:
    base = slugify(short_name or "", allow_unicode=False) or "universitet"
    base = re.sub(r"[^a-z0-9-]", "", base.lower())
    return base[:80] or "universitet"


def unique_slug_for_university(short_name: str, existing_slugs: set[str], university_id=None) -> str:
    base = slugify_university_short_name(short_name)
    candidate = base
    counter = 2
    while candidate in existing_slugs:
        candidate = f"{base}-{counter}"
        counter += 1
    return candidate
