from django.db.models import Avg, Count

from .models import ChatMembership, Review, University, UniversityFavorite


def rating_distribution(university_id):
    counts = {str(star): 0 for star in range(1, 6)}
    for row in (
        Review.objects.filter(university_id=university_id)
        .values("rating")
        .annotate(total=Count("id"))
    ):
        counts[str(row["rating"])] = row["total"]
    return counts


def build_compare_row(university, joined_ids, favorite_ids):
    stats = Review.objects.filter(university=university).aggregate(
        average_rating=Avg("rating"),
        review_count=Count("id"),
    )
    average = stats["average_rating"]
    member_count = ChatMembership.objects.filter(university=university).count()
    latest_review = (
        Review.objects.filter(university=university)
        .select_related("user", "user__profile")
        .order_by("-created_at")
        .first()
    )
    sample_review = None
    if latest_review:
        text = (latest_review.text or "").strip()
        if len(text) > 160:
            text = f"{text[:157]}..."
        profile = getattr(latest_review.user, "profile", None)
        author = (
            getattr(profile, "full_name", None)
            or latest_review.user.get_full_name()
            or latest_review.user.email
        )
        sample_review = {
            "author": author,
            "rating": latest_review.rating,
            "text": text,
        }

    return {
        **{
            field: getattr(university, field)
            for field in (
                "id",
                "name",
                "short_name",
                "location",
                "description",
                "founded_year",
                "institution_type",
                "summary",
                "image_url",
            )
        },
        "average_rating": round(average, 1) if average is not None else None,
        "review_count": stats["review_count"] or 0,
        "member_count": member_count,
        "rating_distribution": rating_distribution(university.id),
        "sample_review": sample_review,
        "is_joined": university.id in joined_ids,
        "is_favorited": university.id in favorite_ids,
    }


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
