"""Universitet rasmlari — har bir OTM uchun alohida fayl (public/images/universities/{slug}.jpg)."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
UNIVERSITY_IMAGES_DIR = REPO_ROOT / "frontend" / "public" / "images" / "universities"
DEFAULT_UNIVERSITY_IMAGE = "/images/universities/_default.jpg"

LEGACY_CAMPUS_PREFIX = "/images/campuses/"


def university_image_path(slug: str) -> str:
    if not slug:
        return DEFAULT_UNIVERSITY_IMAGE
    return f"/images/universities/{slug}.jpg"


def university_image_file_exists(slug: str) -> bool:
    if not slug:
        return False
    path = UNIVERSITY_IMAGES_DIR / f"{slug}.jpg"
    return path.is_file() and path.stat().st_size > 8_000


def build_university_image_url(university) -> str:
    stored = (getattr(university, "image_url", None) or "").strip()
    if stored and not is_legacy_placeholder_url(stored):
        return stored

    slug = getattr(university, "slug", None) or ""
    if slug and university_image_file_exists(slug):
        return university_image_path(slug)

    return ""


def build_gallery_urls(university) -> list[str]:
    gallery = getattr(university, "gallery_urls", None) or []
    cleaned = [url for url in gallery if url and not is_legacy_placeholder_url(url)]
    if cleaned:
        return cleaned

    primary = build_university_image_url(university)
    return [primary] if primary else []


def is_legacy_placeholder_url(url: str) -> bool:
    if not url:
        return True
    lowered = url.lower()
    return (
        "picsum.photos" in lowered
        or "dicebear.com" in lowered
        or "unsplash.com" in lowered
        or "images.unsplash" in lowered
        or lowered.startswith(LEGACY_CAMPUS_PREFIX)
    )


def is_random_placeholder_url(url: str) -> bool:
    return is_legacy_placeholder_url(url)
