"""One-time OAuth / session exchange codes (never put JWTs in URLs)."""

import secrets

from django.conf import settings
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken


def _ttl() -> int:
    return int(getattr(settings, "AUTH_EXCHANGE_CODE_TTL_SECONDS", 120))


def issue_auth_exchange_code(refresh: RefreshToken) -> str:
    code = secrets.token_urlsafe(32)
    cache.set(
        f"auth_exchange:{code}",
        {"refresh": str(refresh)},
        timeout=_ttl(),
    )
    return code


def consume_auth_exchange_code(code: str):
    """
    Returns RefreshToken string or None. One-time use.
    """
    if not code:
        return None
    key = f"auth_exchange:{code}"
    payload = cache.get(key)
    cache.delete(key)
    if not isinstance(payload, dict):
        return None
    refresh_value = (payload.get("refresh") or "").strip()
    return refresh_value or None
