"""Scrape official study directions from university websites."""
from __future__ import annotations

import json
import re
import time
from html import unescape
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests

from direction_language_utils import (
    detect_page_language,
    is_invalid_scraped_direction,
    normalize_university_directions,
    resolve_preferred_language,
)
from official_websites import OFFICIAL_WEBSITES

DATA_DIR = Path(__file__).resolve().parent
CACHE_DIR = DATA_DIR / "_website_cache"
OUT_PATH = DATA_DIR / "_website_directions.json"

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (compatible; MyUniBot/1.0; +https://myuni.uz)",
        "Accept-Language": "uz-UZ,uz;q=0.9,ru;q=0.8,en;q=0.7",
    }
)

DIRECTION_PATHS = [
    "/academics/undergraduate/index.php",
    "/academics/graduate/index.php",
    "/uz/education/programs",
    "/education/programs",
    "/yonalishlar",
    "/uz/yonalishlar",
    "/yonalish",
    "/uz/yonalish",
    "/qabul/yonalishlar",
    "/qabul",
    "/uz/qabul",
    "/education/directions",
    "/directions",
    "/programs",
    "/uz/programs",
    "/bakalavriat",
    "/uz/bakalavriat",
    "/ta-lim-yo-nalishlari",
    "/ta'lim-yonalishlari",
    "/specialties",
    "/faculties",
    "/uz/faculties",
    "/fakultetlar",
    "/uz/fakultetlar",
]

KEYWORD_LINK = re.compile(
    r"yonalish|yo'nalish|mutaxassis|program|qabul|bakalavr|specialt|direction|facultet|fakultet",
    re.I,
)

DIRID_RE = re.compile(r"\b(60\d{6,9})\b")
NOISE = re.compile(
    r"^(bosh sahifa|home|contact|aloqa|yangilik|menu|login|kirish|more|batafsil|"
    r"read more|o'qish|qabul|download|pdf|telegram|instagram|facebook|youtube)$",
    re.I,
)


def clean_html(html: str) -> str:
    html = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", html)
    html = re.sub(r"(?is)<!--.*?-->", " ", html)
    return html


def extract_text_chunks(html: str) -> list[str]:
    html = clean_html(html)
    chunks: list[str] = []
    for pattern in (
        r"(?is)<h[1-6][^>]*>(.*?)</h[1-6]>",
        r"(?is)<li[^>]*>(.*?)</li>",
        r"(?is)<td[^>]*>(.*?)</td>",
        r"(?is)<p[^>]*>(.*?)</p>",
        r"(?is)<span[^>]*>(.*?)</span>",
    ):
        for match in re.finditer(pattern, html):
            text = unescape(re.sub(r"(?is)<[^>]+>", " ", match.group(1)))
            text = re.sub(r"\s+", " ", text).strip()
            if 4 <= len(text) <= 120:
                chunks.append(text)
    return chunks


def looks_like_direction(text: str) -> bool:
    if NOISE.match(text):
        return False
    if re.search(r"\d{4,}", text):
        return False
    if len(text.split()) > 14:
        return False
    lowered = text.lower()
    if any(bad in lowered for bad in ('cookie', 'copyright', '©', 'tel:', 'mailto:', 'http', "so'm", 'sum', 'million', 'tel ', 'manzil', 'telefon', 'ariza qoldirish', 'ta\'lim yo\'nalishlari uchun')):
        return False
    if any(bad in text for bad in ('\\"', '{"', 'hasNextPage', 'docs":')):
        return False
    if re.search(r"(fakultet|kafedra|institut|universitet|rektor|dekan)", lowered) and len(text.split()) <= 3:
        return False
    return bool(
        re.search(
            r"(iqtisod|tibbiyot|pedagog|huquq|moliya|buxgalter|menejment|marketing|"
            r"axborot|dasturiy|tillar|filolog|muhandis|tibbiy|san'at|turizm|logistika|"
            r"psixolog|jurnalist|biolog|kimyo|fizika|matemat|qurilish|arxitekt|servis|"
            r"biznes|bank|soliq|audit|it |it-|it\b|dizayn|sport|agro|veterinar|"
            r"stomatolog|farmatsevt|gumanitar|siyosat|xalqaro|energet|telekom|kiber|"
            r"data|raqamli|innovats|english|ingliz|rus tili|o'zbek tili|adabiyot|"
            r"engineering|management|economics|medicine|law|finance|accounting|computer|"
            r"nursing|pharmacy|tourism|marketing|logistics|cyber|software|information)",
            lowered,
        )
    )


def extract_direction_names(html: str) -> list[str]:
    names: list[str] = []
    seen: set[str] = set()

    for dirid, raw in re.findall(r"(60\d{6,9})\s*[-–—:]?\s*([^<\n]{4,100})", html):
        candidate = re.sub(r"\s+", " ", unescape(raw)).strip(" .,-")
        if looks_like_direction(candidate):
            key = candidate.lower()
            if key not in seen:
                seen.add(key)
                names.append(candidate)

    for chunk in extract_text_chunks(html):
        if looks_like_direction(chunk):
            key = chunk.lower()
            if key not in seen:
                seen.add(key)
                names.append(chunk)

    return names


def extract_dirid_map(html: str) -> dict[str, str]:
    mapping: dict[str, str] = {}
    for dirid in DIRID_RE.findall(html):
        mapping.setdefault(dirid, "")
    return mapping


def fetch_url(url: str, timeout: int = 20) -> str | None:
    try:
        response = SESSION.get(url, timeout=timeout, allow_redirects=True)
        if response.status_code >= 500:
            return None
        response.encoding = response.apparent_encoding or "utf-8"
        return response.text
    except requests.RequestException:
        return None


def normalize_direction_label(text: str) -> str:
    text = unescape(text)
    text = re.sub(r"\(\d+\)\s*", "", text)
    text = re.sub(r"\s+", " ", text).strip(" .,-|")
    if " (2)" in text:
        text = text.split(" (2)", 1)[0].strip()
    return text


def discover_links(base_url: str, html: str) -> list[str]:
    found: list[str] = []
    for href in re.findall(r'href=["\']([^"\']+)["\']', html, re.I):
        if href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:"):
            continue
        absolute = urljoin(base_url, href)
        if KEYWORD_LINK.search(href) or KEYWORD_LINK.search(absolute):
            found.append(absolute)
    return found[:12]


def scrape_website(base_url: str, university_name: str) -> tuple[list[dict], str]:
    cache_html = CACHE_DIR / "html" / re.sub(r"[^a-zA-Z0-9._-]", "_", urlparse(base_url).netloc)
    cache_html.mkdir(parents=True, exist_ok=True)

    candidates = [base_url.rstrip("/") + path for path in DIRECTION_PATHS]
    pages_checked: list[str] = []
    page_languages: list[str] = []
    collected: dict[str, dict] = {}

    homepage = fetch_url(base_url)
    if homepage:
        pages_checked.append(base_url)
        page_languages.append(detect_page_language(homepage, base_url))
        candidates.extend(discover_links(base_url, homepage))

    seen_pages: set[str] = set()
    program_links: list[str] = []
    for url in candidates:
        if url in seen_pages:
            continue
        seen_pages.add(url)
        html = fetch_url(url)
        if not html:
            continue
        pages_checked.append(url)
        page_languages.append(detect_page_language(html, url))
        (cache_html / f"{len(pages_checked)}.html").write_text(html[:500000], encoding="utf-8", errors="ignore")

        for name in extract_direction_names(html):
            cleaned = normalize_direction_label(name)
            if not cleaned or not looks_like_direction(cleaned) or is_invalid_scraped_direction(cleaned):
                continue
            key = cleaned.lower()
            collected.setdefault(
                key,
                {
                    "dirid": "",
                    "name": cleaned,
                    "exam_subjects": [],
                    "study_forms": [],
                    "languages": [],
                },
            )

        for match in re.finditer(
            r'href=["\']([^"\']+/programs/[^"\']+)["\']',
            html,
            re.I,
        ):
            program_links.append(urljoin(url, match.group(1)))

        for match in re.finditer(
            r'href=["\']([^"\']+/academics/(?:undergraduate|graduate)/[^"\']+\.php)["\']',
            html,
            re.I,
        ):
            program_links.append(urljoin(url, match.group(1)))

        for dirid in extract_dirid_map(html):
            collected.setdefault(
                dirid,
                {
                    "dirid": dirid,
                    "name": "",
                    "exam_subjects": [],
                    "study_forms": [],
                    "languages": [],
                },
            )
        time.sleep(0.12)

    for program_url in dict.fromkeys(program_links).keys():
        if len([row for row in collected.values() if row.get("name")]) >= 40:
            break
        if program_url in seen_pages:
            continue
        seen_pages.add(program_url)
        program_html = fetch_url(program_url)
        if not program_html:
            continue
        page_languages.append(detect_page_language(program_html, program_url))
        title_match = re.search(r"(?is)<h1[^>]*>(.*?)</h1>", program_html)
        if title_match:
            title = normalize_direction_label(re.sub(r"(?is)<[^>]+>", " ", title_match.group(1)))
            if title and looks_like_direction(title) and not is_invalid_scraped_direction(title):
                key = title.lower()
                collected.setdefault(
                    key,
                    {
                        "dirid": "",
                        "name": title,
                        "exam_subjects": [],
                        "study_forms": [],
                        "languages": [],
                    },
                )
        time.sleep(0.08)

    directions = [row for row in collected.values() if row.get("name")]
    preferred = resolve_preferred_language(
        university_name,
        website=base_url,
        page_languages=page_languages,
        direction_names=[row["name"] for row in directions],
    )
    directions = normalize_university_directions(
        university_name,
        directions,
        website=base_url,
        primary_lang=preferred,
    )
    note = f"website:{base_url} pages={len(pages_checked)} lang={preferred}"
    return directions, note


def main() -> int:
    CACHE_DIR.mkdir(exist_ok=True)
    results: dict[str, dict] = {}
    ok = fail = 0

    for index, (name, website) in enumerate(OFFICIAL_WEBSITES.items(), start=1):
        print(f"[{index}/{len(OFFICIAL_WEBSITES)}] {name[:50]} -> {website}")
        directions, note = scrape_website(website, name)
        if directions:
            ok += 1
            results[name] = {
                "website": website,
                "direction_count": len(directions),
                "directions": directions,
                "note": note,
            }
            print(f"  OK: {len(directions)} yo'nalish")
        else:
            fail += 1
            print("  FAIL: yo'nalish topilmadi")
        time.sleep(0.2)

    OUT_PATH.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nSaved {OUT_PATH} | success={ok} fail={fail}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
