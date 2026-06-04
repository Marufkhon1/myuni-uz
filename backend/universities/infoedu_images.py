"""Resolve university featured images from infoedu.uz (DTM portal)."""
from __future__ import annotations

import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

from universities.data.infoedu_aliases import INFOEDU_TITLE_ALIASES

DATA_DIR = Path(__file__).resolve().parent / "data"
CACHE_PATH = DATA_DIR / "_infoedu_cache" / "featured_images.json"
UA = {"User-Agent": "Mozilla/5.0 (compatible; MyUniBot/1.0; +https://myuni.uz)"}


def _fetch_page_props(url: str) -> dict:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as resp:
        html = resp.read().decode("utf-8", "replace")
    match = re.search(
        r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
        html,
        re.S,
    )
    if not match:
        raise ValueError(f"No __NEXT_DATA__ at {url}")
    return json.loads(match.group(1))["props"]["pageProps"]


def normalize_name(value: str) -> str:
    text = unicodedata.normalize("NFKC", value or "")
    text = text.replace("ʻ", "'").replace("'", "'").replace("`", "'")
    text = text.replace("O‘", "O'").replace("G‘", "G'").replace("o‘", "o'").replace("g‘", "g'")
    text = re.sub(r"[^\w\s'-]", " ", text.lower())
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _token_set(value: str) -> set[str]:
    stop = {"va", "ham", "uchun", "bilan", "the", "of", "in", "university", "institut", "filial"}
    return {t for t in normalize_name(value).split() if len(t) > 2 and t not in stop}


def _match_score(a: str, b: str) -> float:
    ta, tb = _token_set(a), _token_set(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / max(len(ta), len(tb))


def _extract_image_url(node: dict) -> str:
    featured = node.get("featuredImage") or {}
    if not isinstance(featured, dict):
        return ""
    media = featured.get("node") or {}
    if not isinstance(media, dict):
        return ""
    return (media.get("sourceUrl") or "").strip()


def _load_unique_slugs() -> list[dict]:
    slugs_path = DATA_DIR / "_infoedu_samples" / "all_oliygoh_slugs.json"
    rows = json.loads(slugs_path.read_text(encoding="utf-8"))
    seen: set[str] = set()
    unique: list[dict] = []
    for row in rows:
        slug = row["slug"]
        if slug in seen:
            continue
        seen.add(slug)
        unique.append(row)
    return unique


def _match_slug_for_name(name: str, slug_rows: list[dict]) -> str | None:
    alias = INFOEDU_TITLE_ALIASES.get(name, name)
    best_slug = None
    best_score = 0.0
    for row in slug_rows:
        score = _match_score(alias, row["title"])
        if score > best_score:
            best_score = score
            best_slug = row["slug"]
    return best_slug if best_score >= 0.55 else None


def _fetch_featured_for_slug(slug: str) -> tuple[str, str]:
    encoded = urllib.parse.quote(slug, safe="-")
    url = f"https://infoedu.uz/oliygoh/{encoded}"
    props = _fetch_page_props(url)
    node = props.get("data", {}).get("nodeByUri") or props.get("data", {}).get("oliygohBy") or {}
    title = (node.get("title") or "").strip()
    image_url = _extract_image_url(node)
    if not image_url:
        seo = (node.get("seo") or {}).get("openGraph") or {}
        image = seo.get("image") or {}
        image_url = (image.get("url") or image.get("secureUrl") or "").strip()
    return title, image_url


def refresh_infoedu_image_index(delay_seconds: float = 0.25) -> dict[str, str]:
    """Fetch all infoedu oliygoh featured images from paginated list."""
    index: dict[str, str] = {}
    for page in range(1, 25):
        url = f"https://infoedu.uz/oliygoh?page={page}" if page > 1 else "https://infoedu.uz/oliygoh"
        props = _fetch_page_props(url)
        nodes = props.get("data", {}).get("contentNodesWithOliygoh", {}).get("nodes") or []
        if not nodes:
            break
        for node in nodes:
            title = (node.get("title") or "").strip()
            image_url = _extract_image_url(node)
            if title and image_url:
                index[title] = image_url
        time.sleep(delay_seconds)

    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    return index


def refresh_infoedu_images_for_heis(hei_names: list[str], delay_seconds: float = 0.2) -> dict[str, str]:
    """Fetch featured images for our HEI list via matched infoedu slugs."""
    slug_rows = _load_unique_slugs()
    index: dict[str, str] = {}
    slug_cache: dict[str, tuple[str, str]] = {}

    for name in hei_names:
        slug = _match_slug_for_name(name, slug_rows)
        if not slug:
            continue
        if slug not in slug_cache:
            try:
                slug_cache[slug] = _fetch_featured_for_slug(slug)
            except (OSError, ValueError, urllib.error.URLError, json.JSONDecodeError):
                slug_cache[slug] = ("", "")
            time.sleep(delay_seconds)

        title, image_url = slug_cache[slug]
        if not image_url:
            continue
        index[name] = image_url
        if title:
            index[title] = image_url

    hei_cache = CACHE_PATH.parent / "featured_images_hei.json"
    hei_cache.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    return index


def load_infoedu_image_index(refresh: bool = False) -> dict[str, str]:
    if refresh:
        return refresh_infoedu_image_index()

    index: dict[str, str] = {}
    hei_cache = CACHE_PATH.parent / "featured_images_hei.json"
    for path in (hei_cache, CACHE_PATH):
        if not path.is_file():
            continue
        try:
            index.update(json.loads(path.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError):
            continue

    if index:
        return index
    return refresh_infoedu_image_index()


def resolve_infoedu_image(university_name: str, index: dict[str, str] | None = None) -> str | None:
    if not university_name:
        return None

    index = index or load_infoedu_image_index()
    alias = INFOEDU_TITLE_ALIASES.get(university_name, university_name)

    if alias in index:
        return index[alias]
    if university_name in index:
        return index[university_name]

    best_title = None
    best_score = 0.0
    for title in index:
        score = _match_score(alias, title)
        if score > best_score:
            best_score = score
            best_title = title

    if best_title and best_score >= 0.72:
        return index[best_title]
    return None
