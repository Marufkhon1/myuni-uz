"""Fetch real university photos from official websites (og:image / hero images)."""
from __future__ import annotations

import json
import re
import time
from html import unescape
from io import BytesIO
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from PIL import Image

from universities.infoedu_images import load_infoedu_image_index, resolve_infoedu_image

DATA_DIR = Path(__file__).resolve().parent / "data"
WEBSITE_CACHE_DIR = DATA_DIR / "_website_cache" / "html"
MANIFEST_PATH = DATA_DIR / "university_images_manifest.json"

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (compatible; MyUniBot/1.0; +https://myuni.uz)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/*,*/*;q=0.8",
        "Accept-Language": "uz-UZ,uz;q=0.9,ru;q=0.8,en;q=0.7",
    }
)

META_IMAGE_PATTERNS = (
    re.compile(r'property=["\']og:image(?::secure_url|:url)?["\'][^>]*content=["\']([^"\']+)["\']', re.I),
    re.compile(r'content=["\']([^"\']+)["\'][^>]*property=["\']og:image(?::secure_url|:url)?["\']', re.I),
    re.compile(r'name=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']', re.I),
    re.compile(r'content=["\']([^"\']+)["\'][^>]*name=["\']twitter:image(?::src)?["\']', re.I),
    re.compile(r'name=["\']twitter:image(?::src)?["\'][^>]*content=["\']([^"\']+)["\']', re.I),
    re.compile(r'rel=["\']image_src["\'][^>]*href=["\']([^"\']+)["\']', re.I),
    re.compile(r'href=["\']([^"\']+)["\'][^>]*rel=["\']image_src["\']', re.I),
)

IMG_SRC_PATTERN = re.compile(r'<img[^>]+(?:src|data-src|data-lazy-src|data-original)=["\']([^"\']+)["\']', re.I)

EXTRA_PAGE_PATHS = ("", "/uz", "/about", "/uz/about", "/kampus", "/gallery", "/university")

BAD_URL_PARTS = (
    "logo",
    "favicon",
    "icon-",
    "/icon.",
    "sprite",
    "avatar",
    "1x1",
    "pixel",
    "placeholder",
    "spacer",
    "blank.",
    "emoji",
    "badge",
    "qr-",
    "telegram",
    "whatsapp",
    "facebook",
    "instagram",
    "youtube",
    "google-play",
    "app-store",
    "dummy",
    "placeholder",
    "staff-photo",
    "staff-photos",
    "portrait",
    "avatar",
    "gerb",
    "flag",
    "card__photo",
    "kafedra_",
    "picsum.photos",
    "yandex.ru",
    "mc.yandex",
    "default-og",
    "og-default",
    "/resize/20x/",
    "united-states.png",
    "watch/",
)

GOOD_URL_PARTS = (
    "campus",
    "building",
    "univers",
    "banner",
    "hero",
    "main",
    "slide",
    "gallery",
    "about",
    "facade",
    "binosi",
    "kampus",
    "cover",
    "slider",
    "faculty",
)


def _domain_from_url(url: str) -> str:
    host = urlparse(url).netloc.lower()
    return host[4:] if host.startswith("www.") else host


def _resolve_url(base_url: str, candidate: str) -> str:
    candidate = unescape((candidate or "").strip())
    if not candidate or candidate.startswith("data:"):
        return ""
    return urljoin(base_url, candidate)


def _is_bad_image_url(url: str) -> bool:
    if not url:
        return True
    lower = url.lower().split("?", 1)[0]
    if lower.endswith((".svg", ".gif")):
        return True
    if lower.endswith("/") or lower.count("/") <= 3 and not any(
        ext in lower for ext in (".jpg", ".jpeg", ".png", ".webp", ".avif")
    ):
        return True
    return any(part in url.lower() for part in BAD_URL_PARTS)


def _score_image_url(url: str, base_score: int = 0) -> int:
    score = base_score
    lower = url.lower()
    if any(part in lower for part in GOOD_URL_PARTS):
        score += 25
    if lower.endswith((".jpg", ".jpeg", ".webp", ".png")):
        score += 5
    if "upload" in lower or "media" in lower or "storage" in lower:
        score += 8
    return score


def _load_cached_homepage(website: str) -> tuple[str, str] | None:
    domain = _domain_from_url(website)
    cache_dir = WEBSITE_CACHE_DIR / domain
    if not cache_dir.is_dir():
        return None
    html_files = sorted(cache_dir.glob("*.html"))
    if not html_files:
        return None
    try:
        return html_files[0].read_text(encoding="utf-8", errors="ignore"), website
    except OSError:
        return None


def _fetch_homepage(website: str) -> tuple[str, str] | None:
    try:
        response = SESSION.get(website, timeout=20, allow_redirects=True)
        response.raise_for_status()
        if "text/html" not in response.headers.get("Content-Type", "text/html"):
            return None
        return response.text, response.url
    except requests.RequestException:
        cached = _load_cached_homepage(website)
        return cached


def discover_image_url(website: str) -> str | None:
    if not website:
        return None

    base = website.rstrip("/")
    candidates: list[tuple[int, str]] = []

    for suffix in EXTRA_PAGE_PATHS:
        page_url = base if not suffix else f"{base}{suffix}"
        page = _fetch_homepage(page_url)
        if not page:
            continue
        html, resolved_url = page
        candidates.extend(_collect_candidates(html, resolved_url, meta_score=100, img_score=10))

    if not candidates:
        return None

    candidates.sort(key=lambda item: item[0], reverse=True)
    seen: set[str] = set()
    for _, url in candidates:
        if url in seen:
            continue
        seen.add(url)
        return url
    return None


def _collect_candidates(html: str, page_url: str, meta_score: int, img_score: int) -> list[tuple[int, str]]:
    candidates: list[tuple[int, str]] = []

    for pattern in META_IMAGE_PATTERNS:
        for match in pattern.finditer(html):
            url = _resolve_url(page_url, match.group(1))
            if url and not _is_bad_image_url(url):
                candidates.append((_score_image_url(url, meta_score), url))

    for match in IMG_SRC_PATTERN.finditer(html[:160_000]):
        url = _resolve_url(page_url, match.group(1))
        if url and not _is_bad_image_url(url):
            candidates.append((_score_image_url(url, img_score), url))

    for match in re.finditer(r'url\(["\']?([^"\')]+)["\']?\)', html[:120_000], re.I):
        url = _resolve_url(page_url, match.group(1))
        if url and not _is_bad_image_url(url) and any(
            ext in url.lower() for ext in (".jpg", ".jpeg", ".png", ".webp")
        ):
            candidates.append((_score_image_url(url, img_score - 2), url))

    return candidates


def _discover_image_url_single_page(website: str) -> str | None:
    page = _fetch_homepage(website)
    if not page:
        return None
    html, page_url = page
    candidates = _collect_candidates(html, page_url, meta_score=100, img_score=10)
    if not candidates:
        return None
    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1]


def download_image(url: str, dest_path: Path, min_width: int = 200, min_height: int = 140) -> bool:
    try:
        response = SESSION.get(url, timeout=25, stream=True)
        response.raise_for_status()
        content_type = response.headers.get("Content-Type", "").lower()
        if content_type and "image" not in content_type and "octet-stream" not in content_type:
            return False

        raw = BytesIO(response.content)
        with Image.open(raw) as image:
            if image.width < min_width or image.height < min_height:
                return False

            converted = image.convert("RGB") if image.mode in ("RGBA", "P", "LA") else image.copy()
            max_width = 1280
            if converted.width > max_width:
                ratio = max_width / converted.width
                converted = converted.resize(
                    (max_width, max(1, int(converted.height * ratio))),
                    Image.Resampling.LANCZOS,
                )

            dest_path.parent.mkdir(parents=True, exist_ok=True)
            converted.save(dest_path, format="JPEG", quality=86, optimize=True)
            return True
    except (requests.RequestException, OSError, ValueError, Image.UnidentifiedImageError):
        return False


def public_image_path(slug: str) -> str:
    return f"/images/universities/{slug}.jpg"


def load_manifest() -> dict:
    if not MANIFEST_PATH.is_file():
        return {"items": {}}
    try:
        return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"items": {}}


def save_manifest(manifest: dict) -> None:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def fetch_for_university(university, output_dir: Path, delay_seconds: float = 0.35, prefer_infoedu: bool = False) -> dict:
    slug = university.slug
    website = (university.website or "").strip()
    dest = output_dir / f"{slug}.jpg"
    result = {
        "slug": slug,
        "name": university.name,
        "website": website,
        "status": "skipped",
        "image_url": "",
        "source_url": "",
        "error": "",
    }

    if dest.is_file() and dest.stat().st_size > 8_000:
        result.update({"status": "cached", "image_url": public_image_path(slug)})
        return result

    infoedu_index = load_infoedu_image_index()

    if prefer_infoedu:
        image_url = resolve_infoedu_image(university.name, infoedu_index)
        source = "infoedu"
        if not image_url and website:
            image_url = discover_image_url(website)
            source = "official"
    elif not website:
        image_url = resolve_infoedu_image(university.name, infoedu_index)
        source = "infoedu"
        if image_url and download_image(image_url, dest):
            result.update(
                {
                    "status": "ok",
                    "image_url": public_image_path(slug),
                    "source_url": image_url,
                    "source": "infoedu",
                }
            )
        else:
            result.update({"status": "missing_website", "error": "website yo'q"})
        time.sleep(delay_seconds)
        return result
    else:
        image_url = discover_image_url(website)
        source = "official"
        if not image_url:
            image_url = resolve_infoedu_image(university.name, infoedu_index)
            source = "infoedu"

    if not image_url:
        result.update({"status": "not_found", "error": "rasm topilmadi"})
        time.sleep(delay_seconds)
        return result

    if download_image(image_url, dest):
        result.update(
            {
                "status": "ok",
                "image_url": public_image_path(slug),
                "source_url": image_url,
                "source": source,
            }
        )
    else:
        result.update({"status": "download_failed", "source_url": image_url, "error": "yuklab bo'lmadi"})

    time.sleep(delay_seconds)
    return result
