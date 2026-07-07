import re

from rest_framework import serializers

USERNAME_PATTERN = re.compile(r"^[a-z0-9][a-z0-9._-]{2,29}$")


def normalize_username(value: str) -> str:
    return str(value or "").strip().lower()


def validate_username_format(value: str) -> None:
    if not USERNAME_PATTERN.match(value):
        raise serializers.ValidationError(
            "Login 3–30 belgidan iborat bo'lishi kerak (harf, raqam, nuqta, tire yoki pastki chiziq)."
        )
