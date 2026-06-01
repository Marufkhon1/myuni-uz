from django.db.models import Avg, Count, Exists, OuterRef, Q

from accounts.models import Profile

from .models import ChatMembership, Review, ReviewLike, StudyDirection

REVIEW_ASPECT_FIELDS = (
    ("teachers", "O'qituvchilar"),
    ("dormitory", "Yotoqxona"),
    ("infrastructure", "Infratuzilma"),
)

MAX_REVIEW_IMAGES = 3
MAX_REVIEW_IMAGE_BYTES = 5 * 1024 * 1024


def annotate_reviews_with_likes(queryset, user):
    liked_filter = ReviewLike.objects.filter(review_id=OuterRef("pk"))
    if user and getattr(user, "is_authenticated", False):
        liked_filter = liked_filter.filter(user_id=user.id)
    else:
        liked_filter = liked_filter.filter(user_id=-1)
    return queryset.annotate(
        like_count=Count("likes", distinct=True),
        liked_by_me=Exists(liked_filter),
    )


def is_verified_student_user(user, university_id) -> bool:
    profile = getattr(user, "profile", None)
    if not profile or profile.role != Profile.Role.STUDENT:
        return False

    if ChatMembership.objects.filter(user=user, university_id=university_id).exists():
        return True

    university_name = (profile.university or "").strip().lower()
    if not university_name:
        return False

    from .models import University

    return University.objects.filter(id=university_id).filter(
        Q(name__iexact=university_name)
        | Q(short_name__iexact=university_name)
        | Q(name__icontains=university_name)
    ).exists()


def aspect_averages_for_university(university_id):
    base = Review.objects.filter(
        university_id=university_id,
        status=Review.Status.APPROVED,
    )
    stats = base.aggregate(
        teachers=Avg("rating_teachers"),
        dormitory=Avg("rating_dormitory"),
        infrastructure=Avg("rating_infrastructure"),
        overall=Avg("rating"),
        review_count=Count("id"),
    )
    payload = {}
    for key in ("teachers", "dormitory", "infrastructure"):
        value = stats.get(key)
        payload[key] = round(float(value), 1) if value is not None else None
    overall = stats.get("overall")
    payload["overall"] = round(float(overall), 1) if overall is not None else None
    payload["review_count"] = stats["review_count"] or 0
    return payload


def generate_review_insight_summary(university_id):
    aspects = aspect_averages_for_university(university_id)
    count = aspects.get("review_count") or 0
    if count < 3:
        return None

    scored = []
    for key, label in REVIEW_ASPECT_FIELDS:
        value = aspects.get(key)
        if value is not None:
            scored.append((value, label))

    if not scored:
        return None

    scored.sort(key=lambda item: item[0], reverse=True)
    top_value, top_label = scored[0]
    bottom_value, bottom_label = scored[-1]

    if top_value >= 4.0 and top_value - bottom_value >= 0.6:
        return (
            f"Talabalar {top_label.lower()}ni eng yuqori baholashadi ({top_value}/5). "
            f"{bottom_label} bo'yicha fikrlar aralash — o'rtacha {bottom_value}/5."
        )

    if aspects.get("overall") and aspects["overall"] >= 4.2:
        return (
            f"Umumiy baho yuqori ({aspects['overall']}/5). "
            f"Ko'pchilik {top_label.lower()} va o'qituvchilar sifatini ijobiy baholaydi."
        )

    if aspects.get("overall") and aspects["overall"] <= 3.0:
        return (
            f"Umumiy baho pastroq ({aspects['overall']}/5). "
            f"Ayniqsa {bottom_label.lower()} bo'yicha yaxshilash kerak deb ko'rsatilgan."
        )

    return (
        f"{count} ta sharh asosida o'rtacha baho {aspects['overall']}/5. "
        f"Eng kuchli tomon — {top_label.lower()} ({top_value}/5)."
    )


def public_review_filter_options():
    approved = Review.objects.filter(status=Review.Status.APPROVED)
    city_values = approved.exclude(university__city="").values_list("university__city", flat=True)
    location_values = approved.exclude(university__location="").values_list(
        "university__location", flat=True
    )
    cities = sorted(
        {
            value.strip()
            for value in list(city_values) + list(location_values)
            if value and str(value).strip()
        }
    )
    directions = (
        StudyDirection.objects.filter(reviews__status=Review.Status.APPROVED)
        .distinct()
        .order_by("name")
        .values("id", "name", "faculty__university_id")
    )
    return {
        "cities": list(cities),
        "directions": list(directions),
        "sort_options": [
            {"id": "newest", "label": "Eng yangi"},
            {"id": "rating", "label": "Eng yuqori baho"},
            {"id": "helpful", "label": "Eng foydali"},
        ],
    }
