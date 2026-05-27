"""Universitet kampus rasmlari — faqat lokal yo'llar (frontend public/)."""

CAMPUS_IMAGE_PATHS = [
    "/images/campuses/campus-01.jpg",
    "/images/campuses/campus-02.jpg",
    "/images/campuses/campus-03.jpg",
    "/images/campuses/campus-04.jpg",
    "/images/campuses/campus-05.jpg",
    "/images/campuses/campus-06.jpg",
    "/images/campuses/campus-07.jpg",
    "/images/campuses/campus-08.jpg",
]


def campus_image_index(university):
    key = university.id if university.id else hash(university.short_name or university.name or "uni")
    return int(key) % len(CAMPUS_IMAGE_PATHS)


def build_university_image_url(university):
    return CAMPUS_IMAGE_PATHS[campus_image_index(university)]


def is_random_placeholder_url(url: str) -> bool:
    if not url:
        return True
    lowered = url.lower()
    return (
        "picsum.photos" in lowered
        or "dicebear.com" in lowered
        or "unsplash.com" in lowered
        or "images.unsplash" in lowered
        or not url.startswith("/images/campuses/")
    )
