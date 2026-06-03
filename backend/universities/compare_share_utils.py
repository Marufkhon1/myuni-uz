import secrets
from datetime import timedelta

from django.utils import timezone


def generate_compare_share_token():
    return secrets.token_urlsafe(12).replace("-", "").replace("_", "")[:16]


def compare_share_expires_at():
    return timezone.now() + timedelta(days=2)
