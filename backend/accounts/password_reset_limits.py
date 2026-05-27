import time

from django.conf import settings
from django.core.cache import cache


def get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "unknown")


def _prune_timestamps(timestamps, window_seconds):
    now = time.time()
    return [value for value in timestamps if now - value < window_seconds]


def get_email_send_count(email):
    email = email.lower().strip()
    return int(cache.get(f"pwd_reset:sent_count:{email}", 0) or 0)


def check_password_reset_allowed(request, email):
    """
    Returns (allowed, error_detail, retry_after_seconds).

    Qoida:
    - 1–2 marta: bemalol (kutmasdan) havola yuboriladi.
    - 3-marta va keyin: oxirgi yuborilgandan 30 daqiqa kutish.
    """
    email = email.lower().strip()
    now = time.time()

    free_attempts = getattr(settings, "PASSWORD_RESET_FREE_ATTEMPTS", 2)
    cooldown = getattr(settings, "PASSWORD_RESET_EMAIL_COOLDOWN", 1800)
    max_per_ip = getattr(settings, "PASSWORD_RESET_MAX_PER_IP_HOUR", 15)
    max_per_session = getattr(settings, "PASSWORD_RESET_MAX_PER_SESSION_HOUR", 8)
    window = getattr(settings, "PASSWORD_RESET_WINDOW_SECONDS", 3600)

    sent_count = get_email_send_count(email)
    if sent_count >= free_attempts:
        last_sent = cache.get(f"pwd_reset:last:{email}")
        if last_sent is not None and now - last_sent < cooldown:
            retry_after = int(cooldown - (now - last_sent)) + 1
            wait_minutes = max(1, (retry_after + 59) // 60)
            return (
                False,
                (
                    f"Bu emailga 2 marta havola yuborilgan. "
                    f"Keyingi urinish uchun {wait_minutes} daqiqa kuting."
                ),
                retry_after,
            )

    ip = get_client_ip(request)
    ip_count = cache.get(f"pwd_reset:count:ip:{ip}", 0)
    if ip_count >= max_per_ip:
        return (
            False,
            "Juda ko'p so'rov yuborildi. Biroz kutib, qayta urinib ko'ring.",
            window,
        )

    if hasattr(request, "session"):
        session_key = getattr(settings, "PASSWORD_RESET_SESSION_KEY", "password_reset_attempts")
        session_log = _prune_timestamps(request.session.get(session_key, []), window)
        request.session[session_key] = session_log
        if len(session_log) >= max_per_session:
            request.session.modified = True
            return (
                False,
                "Bu brauzerdan juda ko'p so'rov yuborildi. Keyinroq qayta urinib ko'ring.",
                window,
            )

    return True, None, None


def record_password_reset_request(request):
    """Count every reset attempt (even if email is unknown)."""
    window = getattr(settings, "PASSWORD_RESET_WINDOW_SECONDS", 3600)
    ip = get_client_ip(request)
    ip_key = f"pwd_reset:count:ip:{ip}"
    cache.set(ip_key, cache.get(ip_key, 0) + 1, timeout=window)

    if hasattr(request, "session"):
        session_key = getattr(settings, "PASSWORD_RESET_SESSION_KEY", "password_reset_attempts")
        session_log = _prune_timestamps(request.session.get(session_key, []), window)
        session_log.append(time.time())
        request.session[session_key] = session_log
        request.session.modified = True


def record_password_reset_sent(email):
    """Called only when an email was actually sent."""
    email = email.lower().strip()
    window = getattr(settings, "PASSWORD_RESET_WINDOW_SECONDS", 3600)
    now = time.time()

    cache.set(f"pwd_reset:last:{email}", now, timeout=window)

    sent_key = f"pwd_reset:sent_count:{email}"
    cache.set(sent_key, get_email_send_count(email) + 1, timeout=window)
