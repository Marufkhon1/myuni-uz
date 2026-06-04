"""Detect and normalize study-direction language from university websites."""
from __future__ import annotations

import re
from collections import Counter
from urllib.parse import urlparse

# Rasmiy saytlari yo'nalishlarni ingliz tilida e'lon qiladigan OTMlar.
ENGLISH_DIRECTION_UNIVERSITIES: frozenset[str] = frozenset(
    {
        "Toshkent xalqaro Vestminster universiteti",
        "Vebster universitetining ta'lim dasturlari markazi Toshkent",
        "Toshkent shahridagi Inha universiteti",
        "Toshkent shahridagi Amiti universiteti",
        "Singapur menejmentni rivojlantirish instituti (MDIS) Toshkent",
        "O'zbekistondagi Sharda universiteti",
        "Toshkent shahridagi Puchon universiteti",
        "Toshkent shahridagi Yeodju texnika instituti",
        "Koreya xalqaro universiteti",
        "Turin politexnika universiteti Toshkent",
    }
)

UZBEK_HINTS = (
    "bo'yicha",
    "boʻyicha",
    "boʼyicha",
    "mutaxassisligi",
    "texnologiyalari",
    "boshqaruvi",
    "boshqarish",
    "iqtisodiyot",
    "pedagogika",
    "tibbiyot",
    "yurisprudensiya",
    "filologiya",
    "muhandisligi",
    "arxiv",
    "o'qitish",
    "o‘qitish",
    "sohasi",
    "turlari",
    "geodeziya",
    "geomatika",
    "dizayn",
    "qurilish",
    "inshoot",
    "bino",
    "biznesni",
)

ENGLISH_HINTS = (
    "management",
    "business",
    "engineering",
    "science",
    "administration",
    "economics",
    "computer",
    "information",
    "international",
    "psychology",
    "journalism",
    "finance",
    "law",
    "design",
    "architecture",
    "medicine",
    "nursing",
    "biology",
    "chemistry",
    "media",
    "marketing",
    "logistics",
    "hospitality",
    "tourism",
)

INVALID_DIRECTION_PHRASES = (
    "this page either",
    "for more information",
    "step 1:",
    "submit online",
    "visit our",
    "doesn't exist",
    "moved somewhere",
    "read more about",
    "sports at wiut",
    "scientific seminar",
    "school of law, technology",
    "school of business and economics",
)

ENGLISH_DOMAIN_HINTS = ("wiut.", "webster.", "inha.", "amity.", "mdis.", "sharda.", "polito.")


def classify_name_language(name: str) -> str:
    if not name:
        return "unknown"
    if any("\u0400" <= ch <= "\u04ff" for ch in name):
        return "ru"
    lowered = name.lower()
    uz_score = sum(1 for hint in UZBEK_HINTS if hint in lowered)
    if any(ch in name for ch in ("ʻ", "ʼ", "o'", "g'", "o‘", "g‘")):
        uz_score += 2
    en_score = sum(1 for hint in ENGLISH_HINTS if hint in lowered)
    if re.search(r"\b(BA|BSc|BS|LLB|MBA|MA|PhD|BSN|GCRT|LLM)\b", name):
        en_score += 3
    if re.search(r"\b(Hons|Honours|Administration|Pathways)\b", name, re.I):
        en_score += 2
    if uz_score >= 2:
        return "uz"
    if uz_score > en_score:
        return "uz"
    if en_score > uz_score:
        return "en"
    if uz_score >= 1 and en_score >= 1:
        return "uz"
    if name.isascii():
        return "en"
    return "uz"


def detect_page_language(html: str, url: str = "") -> str:
    lowered_url = (url or "").lower()
    if re.search(r"/uz(?:/|$|-)", lowered_url):
        return "uz"
    if re.search(r"/(?:en|eng)(?:/|$|-)", lowered_url):
        return "en"
    if re.search(r"/ru(?:/|$|-)", lowered_url):
        return "ru"

    lang_match = re.search(r'<html[^>]+lang=["\']([^"\']+)', html or "", re.I)
    if lang_match:
        code = lang_match.group(1).lower()[:2]
        if code in {"uz", "en", "ru"}:
            return code

    sample = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", html or "")
    sample = re.sub(r"(?is)<[^>]+>", " ", sample).lower()
    uz_hits = sum(sample.count(word) for word in ("o'quv", "yo'nalish", "mutaxassis", "qabul", "fakultet"))
    en_hits = sum(sample.count(word) for word in ("program", "undergraduate", "graduate", "admission", "degree"))
    ru_hits = sum(sample.count(word) for word in ("направлен", "обучен", "факультет", "магист"))
    scores = {"uz": uz_hits, "en": en_hits, "ru": ru_hits}
    best = max(scores, key=scores.get)
    return best if scores[best] else "unknown"


def resolve_preferred_language(
    university_name: str,
    *,
    website: str | None = None,
    source: str | None = None,
    page_languages: list[str] | None = None,
    direction_names: list[str] | None = None,
) -> str:
    if university_name in ENGLISH_DIRECTION_UNIVERSITIES:
        return "en"
    if source == "infoedu_dtm":
        return "uz"
    if page_languages:
        counts = Counter(lang for lang in page_languages if lang != "unknown")
        if counts:
            return counts.most_common(1)[0][0]
    if direction_names:
        counts = Counter(
            classify_name_language(name)
            for name in direction_names
            if name and classify_name_language(name) != "unknown"
        )
        if counts:
            return counts.most_common(1)[0][0]
    if website:
        domain = urlparse(website).netloc.lower()
        if any(hint in domain for hint in ENGLISH_DOMAIN_HINTS):
            return "en"
    return "uz"


def pick_name_by_language(names: list[str], preferred: str) -> str:
    if not names:
        return ""
    if len(names) == 1:
        return names[0]

    ranked = [(name, classify_name_language(name)) for name in names]
    matching = [name for name, lang in ranked if lang == preferred]
    if matching:
        return max(matching, key=len)

    if preferred == "en":
        ascii_names = [name for name in names if name.isascii()]
        if ascii_names:
            return max(ascii_names, key=len)
    if preferred == "uz":
        fallback = [name for name, lang in ranked if lang in {"uz", "unknown"}]
        if fallback:
            return max(fallback, key=len)
    return max(names, key=len)


def is_invalid_scraped_direction(name: str) -> bool:
    if not name:
        return True
    lowered = name.lower()
    if any(phrase in lowered for phrase in INVALID_DIRECTION_PHRASES):
        return True
    if name.count("BA (Hons)") + name.count("BSc (Hons)") >= 2:
        return True
    if len(re.findall(r"\((Hons|Honours)\)", name, re.I)) >= 2:
        return True
    if lowered.startswith("school of ") and len(name.split()) <= 8:
        return True
    return False


def filter_directions_by_language(rows: list[dict], preferred: str) -> list[dict]:
    filtered: list[dict] = []
    for row in rows:
        name = (row.get("name") or "").strip()
        if not name or is_invalid_scraped_direction(name):
            continue
        lang = classify_name_language(name)
        if lang == preferred:
            filtered.append(row)
            continue
        if lang == "unknown":
            if preferred == "en" and name.isascii():
                filtered.append(row)
            elif preferred == "uz":
                filtered.append(row)
    return filtered


def dedupe_with_language(rows: list[dict], preferred: str) -> list[dict]:
    by_dirid: dict[str, list[str]] = {}
    no_dirid: list[dict] = []
    for row in rows:
        dirid = (row.get("dirid") or "").strip()
        name = row["name"]
        if dirid:
            by_dirid.setdefault(dirid, []).append(name)
        else:
            no_dirid.append(row)

    result: list[dict] = []
    seen_names: set[str] = set()
    for dirid, names in by_dirid.items():
        name = pick_name_by_language(names, preferred)
        key = name.lower()
        if key in seen_names:
            continue
        seen_names.add(key)
        template = next(row for row in rows if row.get("dirid") == dirid)
        result.append({**template, "name": name, "dirid": dirid})

    for row in no_dirid:
        key = row["name"].lower()
        if key in seen_names:
            continue
        seen_names.add(key)
        result.append(row)

    result.sort(key=lambda item: (item["name"], item.get("dirid") or ""))
    return result


def normalize_university_directions(
    university_name: str,
    rows: list[dict],
    *,
    website: str | None = None,
    source: str | None = None,
    primary_lang: str | None = None,
) -> list[dict]:
    if not rows:
        return []
    preferred = primary_lang or resolve_preferred_language(
        university_name,
        website=website,
        source=source,
        direction_names=[row.get("name", "") for row in rows],
    )
    filtered = filter_directions_by_language(rows, preferred)
    return dedupe_with_language(filtered, preferred)
