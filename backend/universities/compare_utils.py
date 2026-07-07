from django.db.models import Avg, Count, Sum

from .models import (
    AdmissionCycle,
    ChatMembership,
    ChatMessage,
    Review,
    ReviewLike,
    StudyDirection,
    University,
    UniversityFavorite,
)

from .review_trust_utils import aspect_averages_for_university


def approved_reviews_queryset(university):
    return Review.objects.filter(university=university, status=Review.Status.APPROVED)


def rating_distribution(university_id):
    counts = {str(star): 0 for star in range(1, 6)}
    for row in (
        Review.objects.filter(university_id=university_id, status=Review.Status.APPROVED)
        .values("rating")
        .annotate(total=Count("id"))
    ):
        counts[str(row["rating"])] = row["total"]
    return counts


def build_compare_row(university, joined_ids, favorite_ids):
    reviews = approved_reviews_queryset(university)
    stats = reviews.aggregate(
        average_rating=Avg("rating"),
        review_count=Count("id"),
    )
    average = stats["average_rating"]
    member_count = ChatMembership.objects.filter(university=university).count()
    top_review = (
        reviews.select_related("user", "user__profile")
        .annotate(like_count=Count("likes", distinct=True))
        .order_by("-like_count", "-created_at")
        .first()
    )
    sample_review = None
    if top_review:
        text = (top_review.text or "").strip()
        if len(text) > 160:
            text = f"{text[:157]}..."
        profile = getattr(top_review.user, "profile", None)
        author = (
            getattr(profile, "full_name", None)
            or top_review.user.get_full_name()
            or top_review.user.email
        )
        sample_review = {
            "author": author,
            "rating": top_review.rating,
            "text": text,
            "like_count": top_review.like_count,
        }

    faculty_count = university.faculties.count()
    direction_count = StudyDirection.objects.filter(faculty__university=university).count()
    total_likes = ReviewLike.objects.filter(
        review__university=university,
        review__status=Review.Status.APPROVED,
    ).count()

    latest_cycle = (
        university.admission_cycles.filter(status=AdmissionCycle.Status.PUBLISHED)
        .order_by("-academic_year")
        .first()
    )
    grant_quota_total = None
    contract_quota_total = None
    min_admission_score = None
    if latest_cycle:
        quota_agg = latest_cycle.quotas.aggregate(
            grant_total=Sum("grant_quota"),
            contract_total=Sum("contract_quota"),
        )
        grant_quota_total = quota_agg["grant_total"] or 0
        contract_quota_total = quota_agg["contract_total"] or 0
        min_scores = [
            quota.min_score
            for quota in latest_cycle.quotas.all()
            if quota.min_score is not None
        ]
        if min_scores:
            min_admission_score = float(min(min_scores))

    ownership_label = (
        university.get_ownership_type_display()
        if university.ownership_type
        else (university.institution_type or "")
    )
    institution_label = university.institution_type or ownership_label or ""

    message_count = ChatMessage.objects.filter(
        university=university,
        is_deleted=False,
    ).count()
    favorites_count = UniversityFavorite.objects.filter(university=university).count()

    admission_year = latest_cycle.academic_year if latest_cycle else None
    max_admission_score = None
    if latest_cycle:
        max_scores = [
            float(quota.min_score)
            for quota in latest_cycle.quotas.all()
            if quota.min_score is not None
        ]
        if max_scores:
            max_admission_score = max(max_scores)

    distribution = rating_distribution(university.id)
    review_total = stats["review_count"] or 0
    high_ratings = distribution.get("4", 0) + distribution.get("5", 0)
    positive_review_percent = (
        round(100 * high_ratings / review_total) if review_total else None
    )

    aspects = aspect_averages_for_university(university.id)
    aspect_values = [value for value in aspects.values() if value is not None]
    composite_aspect_score = (
        round(sum(aspect_values) / len(aspect_values), 1) if aspect_values else None
    )

    website_label = ""
    if university.website:
        website_label = (
            university.website.replace("https://", "")
            .replace("http://", "")
            .replace("www.", "")
            .strip("/")
        )

    return {
        **{
            field: getattr(university, field)
            for field in (
                "id",
                "name",
                "short_name",
                "slug",
                "location",
                "city",
                "description",
                "founded_year",
                "institution_type",
                "ownership_type",
                "summary",
                "image_url",
            )
        },
        "average_rating": round(average, 1) if average is not None else None,
        "review_count": stats["review_count"] or 0,
        "member_count": member_count,
        "rating_distribution": rating_distribution(university.id),
        "aspect_averages": aspect_averages_for_university(university.id),
        "sample_review": sample_review,
        "faculty_count": faculty_count,
        "direction_count": direction_count,
        "total_likes": total_likes,
        "grant_quota_total": grant_quota_total,
        "contract_quota_total": contract_quota_total,
        "min_admission_score": min_admission_score,
        "ownership_label": ownership_label,
        "institution_label": institution_label,
        "message_count": message_count,
        "favorites_count": favorites_count,
        "admission_year": admission_year,
        "max_admission_score": max_admission_score,
        "positive_review_percent": positive_review_percent,
        "composite_aspect_score": composite_aspect_score,
        "website_label": website_label,
        "has_website": bool(university.website),
        "is_joined": university.id in joined_ids,
        "is_favorited": university.id in favorite_ids,
    }


def build_public_compare_snapshot(rows, highlights):
    public_rows = []
    for row in rows:
        public_row = {**row}
        public_row["is_joined"] = False
        public_row["is_favorited"] = False
        public_rows.append(public_row)
    return {"universities": public_rows, "highlights": highlights}


def pick_highlight(metric_key, rows, higher_is_better=True):
    valid = [row for row in rows if row.get(metric_key) is not None]
    if len(valid) < 2:
        return None

    if higher_is_better:
        winner = max(valid, key=lambda row: row[metric_key])
        runner = min(valid, key=lambda row: row[metric_key])
    else:
        winner = min(valid, key=lambda row: row[metric_key])
        runner = max(valid, key=lambda row: row[metric_key])

    if winner[metric_key] == runner[metric_key]:
        return None

    return {
        "university_id": winner["id"],
        "short_name": winner["short_name"],
        "value": winner[metric_key],
    }


def build_highlights(rows):
    return {
        "rating": pick_highlight("average_rating", rows, higher_is_better=True),
        "reviews": pick_highlight("review_count", rows, higher_is_better=True),
        "chat_activity": pick_highlight("member_count", rows, higher_is_better=True),
    }


def batch_rating_distributions(university_ids):
    distributions = {
        university_id: {str(star): 0 for star in range(1, 6)} for university_id in university_ids
    }
    if not university_ids:
        return distributions

    for row in (
        Review.objects.filter(university_id__in=university_ids, status=Review.Status.APPROVED)
        .values("university_id", "rating")
        .annotate(total=Count("id"))
    ):
        distributions[row["university_id"]][str(row["rating"])] = row["total"]
    return distributions


def build_compare_rows(universities, joined_ids, favorite_ids):
    """Build compare rows with shared batch queries to avoid N+1."""
    if not universities:
        return []

    university_ids = [university.id for university in universities]
    distributions = batch_rating_distributions(university_ids)

    member_counts = dict(
        ChatMembership.objects.filter(university_id__in=university_ids)
        .values("university_id")
        .annotate(total=Count("id"))
        .values_list("university_id", "total")
    )
    message_counts = dict(
        ChatMessage.objects.filter(university_id__in=university_ids, is_deleted=False)
        .values("university_id")
        .annotate(total=Count("id"))
        .values_list("university_id", "total")
    )
    favorite_counts = dict(
        UniversityFavorite.objects.filter(university_id__in=university_ids)
        .values("university_id")
        .annotate(total=Count("id"))
        .values_list("university_id", "total")
    )

    rows = []
    for university in universities:
        row = build_compare_row(university, joined_ids, favorite_ids)
        row["rating_distribution"] = distributions.get(university.id, row["rating_distribution"])
        row["member_count"] = member_counts.get(university.id, row["member_count"])
        row["message_count"] = message_counts.get(university.id, row["message_count"])
        row["favorites_count"] = favorite_counts.get(university.id, row["favorites_count"])
        rows.append(row)
    return rows
