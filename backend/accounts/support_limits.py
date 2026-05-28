import time

from django.conf import settings
from django.core.cache import cache

from .password_reset_limits import get_client_ip


def check_support_message_allowed(request):
    """
    Returns (allowed, error_detail, retry_after_seconds).
    """
    max_per_ip = getattr(settings, "SUPPORT_MAX_PER_IP_HOUR", 10)
    max_per_session = getattr(settings, "SUPPORT_MAX_PER_SESSION_HOUR", 5)
    window = getattr(settings, "SUPPORT_WINDOW_SECONDS", 3600)

    ip = get_client_ip(request)
    ip_key = f"support:count:ip:{ip}"
    ip_count = int(cache.get(ip_key, 0) or 0)
    if ip_count >= max_per_ip:
        return (
            False,
            "Juda ko'p so'rov yuborildi. Biroz kutib, qayta urinib ko'ring.",
            window,
        )

    if hasattr(request, "session"):
        session_key = getattr(settings, "SUPPORT_SESSION_KEY", "support_attempts")
        now = time.time()
        session_log = [value for value in request.session.get(session_key, []) if now - value < window]
        request.session[session_key] = session_log
        if len(session_log) >= max_per_session:
            request.session.modified = True
            return (
                False,
                "Bu brauzerdan juda ko'p so'rov yuborildi. Keyinroq qayta urinib ko'ring.",
                window,
            )

    return True, None, None


def record_support_message_request(request):
    window = getattr(settings, "SUPPORT_WINDOW_SECONDS", 3600)
    ip = get_client_ip(request)
    ip_key = f"support:count:ip:{ip}"
    cache.set(ip_key, int(cache.get(ip_key, 0) or 0) + 1, timeout=window)

    if hasattr(request, "session"):
        session_key = getattr(settings, "SUPPORT_SESSION_KEY", "support_attempts")
        now = time.time()
        session_log = [value for value in request.session.get(session_key, []) if now - value < window]
        session_log.append(now)
        request.session[session_key] = session_log
        request.session.modified = True
