from decimal import Decimal

from django.db.models import Avg, Count, F, Q

from .compare_utils import rating_distribution
from .models import (
    AdmissionCycle,
    Faculty,
    Review,
    StudyDirection,
    University,
)
from .serializers import UniversitySerializer

CITY_COORDINATES = {
    "Toshkent": (Decimal("41.299500"), Decimal("69.240100")),
    "Samarqand": (Decimal("39.654200"), Decimal("66.959700")),
    "Buxoro": (Decimal("39.774700"), Decimal("64.428600")),
    "Andijon": (Decimal("40.782100"), Decimal("72.344200")),
    "Namangan": (Decimal("40.998300"), Decimal("71.672600")),
    "Farg'ona": (Decimal("40.384200"), Decimal("71.784300")),
    "Nukus": (Decimal("42.461100"), Decimal("59.600300")),
    "Qarshi": (Decimal("38.860600"), Decimal("65.789100")),
    "Urganch": (Decimal("41.550000"), Decimal("60.633300")),
    "Jizzax": (Decimal("40.115800"), Decimal("67.842200")),
    "Termiz": (Decimal("37.224200"), Decimal("67.278300")),
}

OWNERSHIP_FROM_INSTITUTION = {
    "Davlat universiteti": University.OwnershipType.STATE,
    "Institut": University.OwnershipType.STATE,
    "Filial": University.OwnershipType.STATE,
    "Xususiy universitet": University.OwnershipType.PRIVATE,
    "Xalqaro universitet": University.OwnershipType.INTERNATIONAL,
}

MIN_COMPARE = 3
MAX_COMPARE = 3

SORT_ORDERS = {
    "name": ("name",),
    "rating": (F("average_rating").desc(nulls_last=True), "name"),
    "reviews": (F("review_count").desc(nulls_last=True), "name"),
    "reviews_asc": ("review_count", "short_name"),
}


def extract_city_from_location(location):
    if not location:
        return ""
    return location.split(",")[0].strip()


def ownership_type_from_institution(institution_type):
    if not institution_type:
        return University.OwnershipType.STATE
    mapped = OWNERSHIP_FROM_INSTITUTION.get(institution_type)
    if mapped:
        return mapped
    lowered = institution_type.lower()
    if "xususiy" in lowered:
        return University.OwnershipType.PRIVATE
    if "xalqaro" in lowered:
        return University.OwnershipType.INTERNATIONAL
    return University.OwnershipType.STATE


def coordinates_for_university(city, university_id):
    base = CITY_COORDINATES.get(city)
    if not base:
        return None, None
    offset = Decimal((university_id or 0) % 20 - 10) * Decimal("0.002")
    return base[0] + offset, base[1] + offset * Decimal("0.7")


from .university_images import build_gallery_urls as _build_gallery_urls


def build_gallery_urls(university):
    return _build_gallery_urls(university)


def annotated_universities_queryset():
    return University.objects.annotate(
        review_count=Count(
            "reviews",
            filter=Q(reviews__status=Review.Status.APPROVED),
            distinct=True,
        ),
        average_rating=Avg(
            "reviews__rating",
            filter=Q(reviews__status=Review.Status.APPROVED),
        ),
    )


def parse_compare_ids(ids_param):
    if not ids_param:
        return None, f"Taqqoslash uchun kamida {MIN_COMPARE} ta universitet tanlang."
    try:
        university_ids = [int(value) for value in ids_param.split(",") if value.strip()]
    except ValueError:
        return None, "Universities id lari noto'g'ri."

    if len(university_ids) != MAX_COMPARE:
        return None, f"Taqqoslash uchun aynan {MAX_COMPARE} ta universitet tanlang."

    if len(set(university_ids)) != len(university_ids):
        return None, "Bir xil universitetni ikki marta tanlab bo'lmaydi."

    return university_ids, None


def apply_catalog_filters(queryset, params):
    search = (params.get("q") or params.get("search") or "").strip()
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(short_name__icontains=search)
            | Q(location__icontains=search)
            | Q(city__icontains=search)
        )

    city = (params.get("city") or "").strip()
    if city:
        queryset = queryset.filter(Q(city__iexact=city) | Q(location__icontains=city))

    ownership = (params.get("ownership") or params.get("ownership_type") or "").strip()
    if ownership:
        queryset = queryset.filter(ownership_type=ownership)

    min_rating = params.get("min_rating")
    if min_rating not in (None, ""):
        try:
            queryset = queryset.filter(average_rating__gte=float(min_rating))
        except (TypeError, ValueError):
            pass

    min_reviews = params.get("min_reviews")
    if min_reviews not in (None, ""):
        try:
            queryset = queryset.filter(review_count__gte=int(min_reviews))
        except (TypeError, ValueError):
            pass

    sort = (params.get("sort") or "name").strip()
    order = SORT_ORDERS.get(sort, SORT_ORDERS["name"])
    return queryset.order_by(*order)


def serialize_study_direction(direction):
    return {
        "id": direction.id,
        "name": direction.name,
        "slug": direction.slug,
        "dirid": direction.dirid,
        "exam_subjects": direction.exam_subjects or [],
        "study_forms": direction.study_forms or [],
        "degree_level": direction.degree_level,
        "degree_level_label": direction.get_degree_level_display(),
        "duration_years": float(direction.duration_years)
        if direction.duration_years is not None
        else None,
        "description": direction.description,
    }


def serialize_faculty(faculty):
    directions = faculty.directions.all()
    return {
        "id": faculty.id,
        "name": faculty.name,
        "slug": faculty.slug,
        "description": faculty.description,
        "directions": [serialize_study_direction(direction) for direction in directions],
    }


def serialize_admission_quota(quota):
    direction = quota.direction
    return {
        "id": quota.id,
        "direction": serialize_study_direction(direction) if direction else None,
        "grant_quota": quota.grant_quota,
        "contract_quota": quota.contract_quota,
        "min_score": float(quota.min_score) if quota.min_score is not None else None,
        "language": quota.language,
    }


def serialize_admission_cycle(cycle):
    return {
        "id": cycle.id,
        "academic_year": cycle.academic_year,
        "application_deadline": cycle.application_deadline.isoformat()
        if cycle.application_deadline
        else None,
        "exam_date": cycle.exam_date.isoformat() if cycle.exam_date else None,
        "notes": cycle.notes,
        "published_at": cycle.published_at.isoformat() if cycle.published_at else None,
        "quotas": [serialize_admission_quota(quota) for quota in cycle.quotas.all()],
    }


def serialize_university_card(university):
    average = getattr(university, "average_rating", None)
    return {
        **UniversitySerializer(university).data,
        "city": university.city,
        "ownership_type": university.ownership_type,
        "ownership_type_label": university.get_ownership_type_display()
        if university.ownership_type
        else "",
        "latitude": float(university.latitude) if university.latitude is not None else None,
        "longitude": float(university.longitude) if university.longitude is not None else None,
        "average_rating": round(average, 1) if average is not None else None,
        "review_count": getattr(university, "review_count", 0) or 0,
    }


def serialize_university_detail(university, *, include_faculties=False, include_admission=False):
    stats = Review.objects.filter(
        university=university,
        status=Review.Status.APPROVED,
    ).aggregate(
        average_rating=Avg("rating"),
        review_count=Count("id"),
    )
    average = stats["average_rating"]
    payload = {
        **UniversitySerializer(university).data,
        "city": university.city,
        "ownership_type": university.ownership_type,
        "ownership_type_label": university.get_ownership_type_display()
        if university.ownership_type
        else "",
        "gallery_urls": build_gallery_urls(university),
        "address": university.address,
        "phone": university.phone,
        "email": university.email,
        "website": university.website,
        "telegram_url": university.telegram_url,
        "instagram_url": university.instagram_url,
        "latitude": float(university.latitude) if university.latitude is not None else None,
        "longitude": float(university.longitude) if university.longitude is not None else None,
        "average_rating": round(average, 1) if average is not None else None,
        "review_count": stats["review_count"] or 0,
        "rating_distribution": rating_distribution(university.id),
    }

    if include_faculties:
        faculties = (
            Faculty.objects.filter(university=university)
            .prefetch_related("directions")
            .order_by("sort_order", "name")
        )
        payload["faculties"] = [serialize_faculty(faculty) for faculty in faculties]

    if include_admission:
        cycles = (
            AdmissionCycle.objects.filter(
                university=university,
                status=AdmissionCycle.Status.PUBLISHED,
            )
            .prefetch_related("quotas__direction")
            .order_by("-academic_year")
        )
        payload["admission_cycles"] = [serialize_admission_cycle(cycle) for cycle in cycles]

    return payload


def catalog_filter_options():
    cities = (
        University.objects.exclude(city="")
        .values_list("city", flat=True)
        .distinct()
        .order_by("city")
    )
    return {
        "cities": list(cities),
        "ownership_types": [
            {"value": choice.value, "label": choice.label}
            for choice in University.OwnershipType
        ],
        "sort_options": [
            {"value": "name", "label": "Nom bo'yicha"},
            {"value": "rating", "label": "Reyting (yuqoridan)"},
            {"value": "reviews", "label": "Sharh soni (ko'p)"},
            {"value": "reviews_asc", "label": "Sharh soni (kam)"},
        ],
    }


def serialize_map_marker(university):
    if university.latitude is None or university.longitude is None:
        return None
    average = getattr(university, "average_rating", None)
    return {
        "id": university.id,
        "name": university.name,
        "short_name": university.short_name,
        "slug": university.slug,
        "city": university.city,
        "location": university.location,
        "ownership_type": university.ownership_type,
        "latitude": float(university.latitude),
        "longitude": float(university.longitude),
        "average_rating": round(average, 1) if average is not None else None,
        "review_count": getattr(university, "review_count", 0) or 0,
    }
