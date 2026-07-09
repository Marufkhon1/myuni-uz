"""Resolve article cover image paths to bundled frontend static assets."""

from urllib.parse import urlparse

DEFAULT_ARTICLE_COVER = "/images/hero/landing-campus.jpg"

CAMPUS_COVER_ALIASES = {
    "/images/campuses/campus-01.jpg": "/images/hero/landing-campus.jpg",
    "/images/campuses/campus-02.jpg": "/images/universities/tdiu.jpg",
    "/images/campuses/campus-03.jpg": "/images/universities/tdtu.jpg",
    "/images/campuses/campus-04.jpg": "/images/universities/samdu.jpg",
    "/images/campuses/campus-05.jpg": "/images/universities/inha.jpg",
    "/images/campuses/campus-06.jpg": "/images/universities/tatu.jpg",
    "/images/campuses/campus-07.jpg": "/images/universities/ozmu.jpg",
    "/images/campuses/campus-08.jpg": "/images/universities/wiut.jpg",
}

ARTICLE_COVER_BY_SLUG = {
    "universitet-tanlashda-myuni-qanday-yordam-beradi": "/images/hero/landing-campus.jpg",
    "2026-qabul-tdiu-vs-tatu": "/images/universities/tdiu.jpg",
    "2026-qabul-tsu-vs-tdtu": "/images/universities/ozmu.jpg",
    "davlat-va-xususiy-universitet-farqi": "/images/universities/samdu.jpg",
    "myuni-da-birinchi-sharh-yozish-qollanmasi": "/images/universities/inha.jpg",
    "universitet-reytingi-nima-degani": "/images/universities/tatu.jpg",
    "toshkent-universitetlari-2026-qisqa-royxat": "/images/universities/ozmu.jpg",
    "talaba-yotoqxonasida-yashash-maslahatlari": "/images/universities/wiut.jpg",
    "myuni-chatidan-qanday-foydalanish": "/images/hero/landing-campus.jpg",
    "qabul-ballari-va-kvotalar-haqida": "/images/universities/tdiu.jpg",
    "abituriyent-universitet-tanlash-checklisti-2026": "/images/universities/tdtu.jpg",
}


def normalize_cover_path(value):
    raw = (value or "").strip()
    if not raw:
        return ""
    if raw.startswith("/"):
        return raw
    parsed = urlparse(raw)
    if parsed.path.startswith("/images/"):
        return parsed.path
    if raw.startswith("images/"):
        return f"/{raw}"
    return raw


def resolve_article_cover_image(cover_image="", slug=""):
    """Return a site-relative cover path that exists in frontend/public/images."""
    if slug:
        slug_cover = ARTICLE_COVER_BY_SLUG.get(slug)
        if slug_cover:
            return slug_cover

    normalized = normalize_cover_path(cover_image)
    if normalized in CAMPUS_COVER_ALIASES:
        return CAMPUS_COVER_ALIASES[normalized]
    if normalized.startswith("/images/campuses/"):
        return DEFAULT_ARTICLE_COVER
    if normalized:
        return normalized
    return DEFAULT_ARTICLE_COVER
