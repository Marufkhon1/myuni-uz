from decimal import Decimal

from django.db.models import Case, Count, F, FloatField, Q, Value, When

from .models import Review

# Bayesian prior tuned for sparse UZ review data (Niche-style confidence weighting).
BAYESIAN_PRIOR_MEAN = 3.8
BAYESIAN_PRIOR_WEIGHT = 10


def bayesian_rating(average, review_count, *, prior_mean=BAYESIAN_PRIOR_MEAN, prior_weight=BAYESIAN_PRIOR_WEIGHT):
    if review_count is None or review_count <= 0 or average is None:
        return None
    weighted = (review_count * float(average) + prior_weight * prior_mean) / (review_count + prior_weight)
    return round(weighted, 2)


def rating_confidence_label(review_count):
    if not review_count:
        return "no_reviews"
    if review_count < 3:
        return "low"
    if review_count < 10:
        return "medium"
    return "high"


def annotate_bayesian_rating(queryset):
    """Annotate queryset that already has review_count and average_rating."""
    prior_mean = Value(float(BAYESIAN_PRIOR_MEAN), output_field=FloatField())
    prior_weight = Value(float(BAYESIAN_PRIOR_WEIGHT), output_field=FloatField())
    count_f = F("review_count")
    avg_f = F("average_rating")

    weighted_sum = Case(
        When(review_count__gt=0, then=count_f * avg_f + prior_weight * prior_mean),
        default=Value(None),
        output_field=FloatField(),
    )
    weighted_count = Case(
        When(review_count__gt=0, then=count_f + prior_weight),
        default=Value(None),
        output_field=FloatField(),
    )

    return queryset.annotate(
        bayesian_rating=Case(
            When(review_count__gt=0, then=weighted_sum / weighted_count),
            default=Value(None),
            output_field=FloatField(),
        )
    )
