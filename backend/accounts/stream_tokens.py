import secrets

from django.conf import settings
from django.core.cache import cache


def issue_stream_token(user_id):
    token = secrets.token_urlsafe(32)
    ttl = getattr(settings, "STREAM_TOKEN_TTL_SECONDS", 300)
    cache.set(f"stream_token:{token}", int(user_id), timeout=ttl)
    return token, ttl


def resolve_stream_token(token):
    if not token:
        return None
    return cache.get(f"stream_token:{token.strip()}")
