import re

from django.db.models import Case, IntegerField, Q, Value, When

# Common Uzbek / Russian transliteration pairs for fuzzy catalog search.
_CHAR_MAP = {
    "o'": "ў",
    "g'": "ғ",
    "sh": "ш",
    "ch": "ч",
    "yo": "ё",
    "yu": "ю",
    "ya": "я",
    "ts": "ц",
    "kh": "х",
}

_LATIN_TO_CYRILLIC = {
    "o'": "ў",
    "g'": "ғ",
    "sh": "ш",
    "ch": "ч",
}


def _unique_nonempty(values):
    seen = set()
    ordered = []
    for value in values:
        normalized = (value or "").strip()
        if not normalized or normalized.lower() in seen:
            continue
        seen.add(normalized.lower())
        ordered.append(normalized)
    return ordered


def expand_search_variants(query: str) -> list[str]:
    base = (query or "").strip()
    if not base:
        return []

    variants = [base]
    lowered = base.lower()

    apostrophe_variants = {
        base,
        base.replace("'", "'"),
        base.replace("'", "'"),
        base.replace("o'", "o'"),
        base.replace("g'", "g'"),
        base.replace("O'", "O'"),
        base.replace("G'", "G'"),
    }
    variants.extend(apostrophe_variants)

    # Simple latin → cyrillic heuristic for common Uzbek digraphs.
    cyrillic = lowered
    for latin, cyr in _LATIN_TO_CYRILLIC.items():
        cyrillic = cyrillic.replace(latin, cyr)
    if cyrillic != lowered:
        variants.append(cyrillic)
        variants.append(cyrillic.title())

    # Strip punctuation for broader icontains matches.
    stripped = re.sub(r"[^\w\s\u0400-\u04FF'-]", " ", base)
    stripped = re.sub(r"\s+", " ", stripped).strip()
    if stripped and stripped != base:
        variants.append(stripped)

    return _unique_nonempty(variants)


def build_search_filter(search: str) -> Q:
    condition = Q()
    for variant in expand_search_variants(search):
        condition |= (
            Q(name__icontains=variant)
            | Q(short_name__icontains=variant)
            | Q(location__icontains=variant)
            | Q(city__icontains=variant)
            | Q(slug__icontains=variant.replace(" ", "-"))
        )
    return condition


def apply_search_relevance_order(queryset, search: str):
    """Exact and prefix matches rank above generic substring matches."""
    if not search:
        return queryset

    normalized = search.strip()
    if not normalized:
        return queryset

    return queryset.annotate(
        search_rank=Case(
            When(name__iexact=normalized, then=Value(0)),
            When(short_name__iexact=normalized, then=Value(1)),
            When(name__istartswith=normalized, then=Value(2)),
            When(short_name__istartswith=normalized, then=Value(3)),
            When(city__iexact=normalized, then=Value(4)),
            default=Value(10),
            output_field=IntegerField(),
        )
    ).order_by("search_rank")


def apply_university_search(queryset, search: str):
    search = (search or "").strip()
    if not search:
        return queryset, False

    filtered = queryset.filter(build_search_filter(search))
    return apply_search_relevance_order(filtered, search), True
