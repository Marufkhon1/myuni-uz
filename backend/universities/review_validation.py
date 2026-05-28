import re

from rest_framework import serializers

REVIEW_TEXT_MIN_LENGTH = 30
REVIEW_TEXT_MAX_LENGTH = 1200


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

    if re.search(r"(.)\1{14,}", compact, flags=re.IGNORECASE):
        raise serializers.ValidationError("Matnda juda ko'p takrorlanuvchi belgilar bor.")

    if len(compact) >= 40:
        unique_ratio = len(set(compact.lower())) / len(compact)
        if unique_ratio < 0.12:
            raise serializers.ValidationError("Sharh mazmunli bo'lishi kerak — faqat takrorlanmasin.")

    return text
