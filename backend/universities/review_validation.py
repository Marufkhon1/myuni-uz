"""
Sharh matni validatsiyasi + Step 5 so'kinish filtri.

Hit → ValidationError (API 400), userga umumiy xabar.
Clean → matn qaytariladi; view avto-approve qiladi.
"""

import re

from rest_framework import serializers

from .profanity_filter import check_text_for_scope, log_moderation_hit
from .profanity_policy import PROFANITY_REJECTION_MESSAGE, PROFANITY_SCOPE_REVIEWS

REVIEW_TEXT_MIN_LENGTH = 30
REVIEW_TEXT_MAX_LENGTH = 1200


def validate_aspect_rating(value, label):
    if value is None:
        raise serializers.ValidationError(f"{label} bahosi tanlanishi kerak.")
    if value < 1 or value > 5:
        raise serializers.ValidationError(f"{label} bahosi 1–5 oralig'ida bo'lishi kerak.")
    return value


def validate_review_text(value):
    text = (value or "").strip()
    if not text:
        raise serializers.ValidationError("Sharh matni bo'sh bo'lmasligi kerak.")

    if len(text) < REVIEW_TEXT_MIN_LENGTH:
        raise serializers.ValidationError(
            f"Sharh kamida {REVIEW_TEXT_MIN_LENGTH} belgidan iborat bo'lishi kerak."
        )

    if len(text) > REVIEW_TEXT_MAX_LENGTH:
        raise serializers.ValidationError(
            f"Sharh {REVIEW_TEXT_MAX_LENGTH} belgidan oshmasligi kerak."
        )

    compact = re.sub(r"\s+", "", text)
    if len(compact) < REVIEW_TEXT_MIN_LENGTH:
        raise serializers.ValidationError("Sharhda yetarli mazmun yo'q.")

    # Step 5: create/update validation ichida filter.
    match = check_text_for_scope(text, PROFANITY_SCOPE_REVIEWS)
    if match:
        log_moderation_hit(match, scope=PROFANITY_SCOPE_REVIEWS)
        public = match.to_public_dict()
        raise serializers.ValidationError(public.get("detail") or PROFANITY_REJECTION_MESSAGE)

    return text


def ensure_review_text_allowed(text: str) -> str:
    """
    Yakuniy matnni qayta tekshirish (partial PATCH: text yuborilmasa ham).
    Xato har doim text maydoniga bog'lanadi.
    """
    try:
        return validate_review_text(text)
    except serializers.ValidationError as exc:
        detail = exc.detail
        if isinstance(detail, list) and len(detail) == 1:
            raise serializers.ValidationError({"text": detail}) from exc
        if isinstance(detail, str):
            raise serializers.ValidationError({"text": [detail]}) from exc
        if isinstance(detail, dict) and "text" in detail:
            raise
        raise serializers.ValidationError({"text": detail}) from exc
