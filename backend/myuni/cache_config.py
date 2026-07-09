"""Shared Redis / cache / channels configuration for MyUni."""

from __future__ import annotations

from django.core.exceptions import ImproperlyConfigured


def configure_caches_and_channels(
    *,
    debug: bool,
    redis_url: str,
    enable_channels: bool,
    ignore_exceptions: bool | None = None,
    shared_hosting: bool = False,
):
    """
    Returns (caches_dict, channel_layers_dict_or_None).

    Production (debug=False): REDIS_URL is mandatory unless shared_hosting=True
    (Turon Master / single-process Python handler without Redis).
    Development: LocMem + InMemory when REDIS_URL is empty.
    """
    normalized = (redis_url or "").strip()

    if not debug and not normalized and not shared_hosting:
        raise ImproperlyConfigured(
            "REDIS_URL must be set when DJANGO_DEBUG=False. "
            "Shared cache is required for rate limits, SSE tokens, auth exchange, "
            "public API response caching, and Channels across gunicorn/ASGI workers. "
            "On Turon Master without Redis, set SHARED_HOSTING=True in .env."
        )

    if ignore_exceptions is None:
        ignore_exceptions = bool(debug)

    if normalized:
        caches = {
            "default": {
                "BACKEND": "django_redis.cache.RedisCache",
                "LOCATION": normalized,
                "OPTIONS": {
                    "CLIENT_CLASS": "django_redis.client.DefaultClient",
                    "SOCKET_CONNECT_TIMEOUT": 5,
                    "SOCKET_TIMEOUT": 5,
                    "IGNORE_EXCEPTIONS": ignore_exceptions,
                    "LOG_IGNORED_EXCEPTIONS": True,
                },
                "KEY_PREFIX": "myuni",
            }
        }
        channel_layers = None
        if enable_channels:
            channel_layers = {
                "default": {
                    "BACKEND": "channels_redis.core.RedisChannelLayer",
                    "CONFIG": {"hosts": [normalized]},
                }
            }
        return caches, channel_layers

    caches = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "myuni-cache",
        }
    }
    channel_layers = None
    if enable_channels:
        channel_layers = {
            "default": {
                "BACKEND": "channels.layers.InMemoryChannelLayer",
            }
        }
    return caches, channel_layers


def verify_redis_connectivity(redis_url: str, *, timeout: float = 3.0) -> None:
    """Ping Redis at boot in production. Raises ImproperlyConfigured on failure."""
    try:
        import redis
    except ImportError as exc:
        raise ImproperlyConfigured(
            "redis package is required when REDIS_URL is set. pip install redis"
        ) from exc

    try:
        client = redis.from_url(redis_url, socket_connect_timeout=timeout, socket_timeout=timeout)
        client.ping()
    except Exception as exc:  # noqa: BLE001 — surface any connection error at boot
        raise ImproperlyConfigured(
            f"REDIS_URL is set but Redis is unreachable ({exc}). "
            "Fix Redis or unset production DEBUG."
        ) from exc
