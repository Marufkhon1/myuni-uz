import time

from django.conf import settings
from django.core.cache import cache

from .cache_counters import cache_bump
from .password_reset_limits import get_client_ip


def _window() -> int:
    return int(getattr(settings, "AUTH_LOGIN_WINDOW_SECONDS", 3600))


def _login_max_ip() -> int:
    return int(getattr(settings, "AUTH_LOGIN_MAX_PER_IP_HOUR", 40))


def _login_max_key() -> int:
    return int(getattr(settings, "AUTH_LOGIN_MAX_PER_KEY_HOUR", 12))


def _register_max_ip() -> int:
    return int(getattr(settings, "AUTH_REGISTER_MAX_PER_IP_HOUR", 15))


def _failure_cooldown_after() -> int:
    return int(getattr(settings, "AUTH_LOGIN_FAILURE_THRESHOLD", 5))


def _failure_cooldown_seconds() -> int:
    return int(getattr(settings, "AUTH_LOGIN_FAILURE_COOLDOWN", 120))


def check_login_allowed(request, login_key: str):
    """
    Returns (allowed, detail, retry_after_seconds).
    Limits by IP and by username/email key. Progressive cooldown after failures.
    """
    ip = get_client_ip(request)
    window = _window()
    normalized = (login_key or "").strip().lower() or "unknown"

    ip_key = f"auth_login:ip:{ip}"
    ip_count = int(cache.get(ip_key, 0) or 0)
    if ip_count >= _login_max_ip():
        return (
            False,
            "Juda ko'p kirish urinishi. Biroz kutib qayta urinib ko'ring.",
            window,
        )

    key_bucket = f"auth_login:key:{normalized}"
    key_count = int(cache.get(key_bucket, 0) or 0)
    if key_count >= _login_max_key():
        return (
            False,
            "Bu hisob uchun juda ko'p urinish. Keyinroq qayta urinib ko'ring.",
            window,
        )

    fail_key = f"auth_login:fail:{ip}:{normalized}"
    fail_meta = cache.get(fail_key)
    if isinstance(fail_meta, dict):
        failures = int(fail_meta.get("count", 0) or 0)
        locked_until = float(fail_meta.get("locked_until", 0) or 0)
        now = time.time()
        if failures >= _failure_cooldown_after() and locked_until > now:
            retry_after = int(locked_until - now) + 1
            return (
                False,
                "Parol noto'g'ri kiritildi. Qisqa muddatga kutib, qayta urinib ko'ring.",
                retry_after,
            )

    return True, None, None


def record_login_attempt(request, login_key: str, *, success: bool):
    ip = get_client_ip(request)
    window = _window()
    normalized = (login_key or "").strip().lower() or "unknown"

    ip_key = f"auth_login:ip:{ip}"
    key_bucket = f"auth_login:key:{normalized}"
    cache_bump(ip_key, timeout=window)
    cache_bump(key_bucket, timeout=window)

    fail_key = f"auth_login:fail:{ip}:{normalized}"
    if success:
        cache.delete(fail_key)
        return

    meta = cache.get(fail_key) or {"count": 0, "locked_until": 0}
    count = int(meta.get("count", 0) or 0) + 1
    locked_until = float(meta.get("locked_until", 0) or 0)
    if count >= _failure_cooldown_after():
        locked_until = time.time() + _failure_cooldown_seconds()
    cache.set(
        fail_key,
        {"count": count, "locked_until": locked_until},
        timeout=max(window, _failure_cooldown_seconds() + 30),
    )


def check_register_allowed(request):
    ip = get_client_ip(request)
    window = _window()
    ip_key = f"auth_register:ip:{ip}"
    ip_count = int(cache.get(ip_key, 0) or 0)
    if ip_count >= _register_max_ip():
        return (
            False,
            "Juda ko'p ro'yxatdan o'tish urinishi. Keyinroq qayta urinib ko'ring.",
            window,
        )
    return True, None, None


def record_register_attempt(request):
    ip = get_client_ip(request)
    window = _window()
    ip_key = f"auth_register:ip:{ip}"
    cache_bump(ip_key, timeout=window)


def _google_start_max_ip() -> int:
    return int(getattr(settings, "AUTH_GOOGLE_START_MAX_PER_IP_HOUR", 30))


def _google_callback_max_ip() -> int:
    return int(getattr(settings, "AUTH_GOOGLE_CALLBACK_MAX_PER_IP_HOUR", 20))


def check_google_oauth_start_allowed(request):
    """Returns (allowed, detail, retry_after_seconds) for GET /auth/google/start/."""
    ip = get_client_ip(request)
    window = _window()
    ip_key = f"auth_google:start:ip:{ip}"
    ip_count = int(cache.get(ip_key, 0) or 0)
    if ip_count >= _google_start_max_ip():
        return (
            False,
            "Google orqali kirish uchun juda ko'p urinish. Keyinroq qayta urinib ko'ring.",
            window,
        )
    return True, None, None


def record_google_oauth_start(request):
    ip = get_client_ip(request)
    window = _window()
    cache_bump(f"auth_google:start:ip:{ip}", timeout=window)


def check_google_oauth_callback_allowed(request):
    """Returns (allowed, detail, retry_after_seconds) for GET /auth/google/callback/."""
    ip = get_client_ip(request)
    window = _window()
    ip_key = f"auth_google:callback:ip:{ip}"
    ip_count = int(cache.get(ip_key, 0) or 0)
    if ip_count >= _google_callback_max_ip():
        return (
            False,
            "Google orqali kirish uchun juda ko'p urinish. Keyinroq qayta urinib ko'ring.",
            window,
        )
    return True, None, None


def record_google_oauth_callback(request):
    ip = get_client_ip(request)
    window = _window()
    cache_bump(f"auth_google:callback:ip:{ip}", timeout=window)
