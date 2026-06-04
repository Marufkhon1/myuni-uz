"""Shared helpers for magistratura/doktorantura direction parsing."""
from __future__ import annotations

import re
from html import unescape

MAGISTR_DIRID_RE = re.compile(r"\b(70\d{6,8})\b")
DOCTORATE_DIRID_RE = re.compile(r"\b(5\d{6,8}|8\d{6,8})\b")

MAGISTR_LINE_RE = re.compile(
    r"\b(70\d{6,8})\s*[-–—:]?\s*([^\n|<]{4,160})",
    re.I,
)

MAGISTR_TD_RE = re.compile(
    r"(?is)<t[dh][^>]*>\s*(?:&nbsp;|\xa0|\s)*(\d{8})\s*[-–—:]?\s*([^<]{4,160})",
)

NOISE = re.compile(
    r"^(bosh sahifa|home|contact|aloqa|yangilik|menu|login|kirish|more|batafsil|"
    r"read more|download|pdf|telegram|instagram|facebook|youtube|t/r|№|#)$",
    re.I,
)


def normalize_label(text: str) -> str:
    text = unescape(text or "")
    text = re.sub(r"\(\d+\)\s*", "", text)
    text = re.sub(r"\s+", " ", text).strip(" .,-|")
    return text


def valid_magistr_dirid(dirid: str) -> bool:
    return bool(re.fullmatch(r"70\d{6}", dirid))


def looks_like_specialty_name(text: str) -> bool:
    if not text or NOISE.match(text):
        return False
    if len(text) < 8 or len(text.split()) > 18:
        return False
    lowered = text.lower()
    if any(
        bad in lowered
        for bad in (
            "cookie",
            "copyright",
            "©",
            "http",
            "mailto",
            "google",
            "embed",
            "null",
            "iframe",
            "telefon",
            "manzil",
            "rektor",
            "fakultet",
            "kafedra",
            "universitet tarixi",
            "psixolog maslahat",
            "yangilik",
            "video",
            "jurnal",
            "bo'limi",
            "departament",
        )
    ):
        return False
    if re.search(r"\d{5,}", text) and "," in text:
        return False
    if text.count(",") >= 2:
        return False
    return True


def parse_magistr_lines(text: str) -> list[dict]:
    rows: list[dict] = []
    seen: set[tuple[str, str]] = set()

    def add_row(dirid: str, raw_name: str) -> None:
        if not valid_magistr_dirid(dirid):
            return
        name = normalize_label(raw_name)
        if not looks_like_specialty_name(name):
            return
        key = (dirid, name.lower())
        if key in seen:
            return
        seen.add(key)
        rows.append(
            {
                "dirid": dirid,
                "name": name,
                "exam_subjects": [],
                "study_forms": [],
                "languages": [],
            }
        )

    for match in MAGISTR_LINE_RE.finditer(text):
        add_row(match.group(1).strip(), match.group(2))

    for match in MAGISTR_TD_RE.finditer(text):
        add_row(match.group(1).strip(), match.group(2))

    return rows


def parse_doctorate_lines(text: str) -> list[dict]:
    rows: list[dict] = []
    seen: set[tuple[str, str]] = set()

    for match in MAGISTR_LINE_RE.finditer(text):
        dirid = match.group(1)
        if not dirid.startswith(("5", "8")):
            continue
        name = normalize_label(match.group(2))
        if not looks_like_specialty_name(name):
            continue
        key = (dirid, name.lower())
        if key in seen:
            continue
        seen.add(key)
        rows.append(
            {
                "dirid": dirid,
                "name": name,
                "exam_subjects": [],
                "study_forms": [],
                "languages": [],
            }
        )

    if not re.search(r"doktorantura|phd|ilmiy daraja|aspirantura", text, re.I):
        return rows

    for match in re.finditer(r"\b(5\d{6,8}|8\d{6,8})\s*[-–—:]\s*([^\n|<]{4,160})", text, re.I):
        dirid = match.group(1)
        name = normalize_label(match.group(2))
        if not looks_like_specialty_name(name):
            continue
        key = (dirid, name.lower())
        if key in seen:
            continue
        seen.add(key)
        rows.append(
            {
                "dirid": dirid,
                "name": name,
                "exam_subjects": [],
                "study_forms": [],
                "languages": [],
            }
        )
    return rows


def extract_text_chunks(html: str) -> list[str]:
    html = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", html)
    chunks: list[str] = []
    for pattern in (
        r"(?is)<h[1-6][^>]*>(.*?)</h[1-6]>",
        r"(?is)<li[^>]*>(.*?)</li>",
        r"(?is)<td[^>]*>(.*?)</td>",
        r"(?is)<p[^>]*>(.*?)</p>",
    ):
        for match in re.finditer(pattern, html):
            text = normalize_label(re.sub(r"(?is)<[^>]+>", " ", match.group(1)))
            if 8 <= len(text) <= 160:
                chunks.append(text)
    return chunks


ENGLISH_HINTS = (
    "architecture",
    "management",
    "engineering",
    "design",
    "urban",
    "business",
    "cartography",
    "geodesy",
    "cadastre",
    "economy",
    "preservation",
    "real estate",
    "structural",
    "seismic",
    "wastewater",
)


def is_english_name(name: str) -> bool:
    lowered = name.lower()
    return name.isascii() and any(word in lowered for word in ENGLISH_HINTS)


def dedupe_directions(rows: list[dict], preferred_lang: str = "uz") -> list[dict]:
    from direction_language_utils import dedupe_with_language, filter_directions_by_language

    filtered = filter_directions_by_language(rows, preferred_lang)
    return dedupe_with_language(filtered, preferred_lang)
