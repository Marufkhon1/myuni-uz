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


def get_user_submit_count(user_id):
    return int(cache.get(f"review_submit:count:{user_id}", 0) or 0)


def check_review_submit_allowed(request, user_id):
    """
    Returns (allowed, error_detail, retry_after_seconds).

    Qoida (parol tiklashga o'xshash):
    - Birinchi N ta sharh: tez-tez yozish mumkin (minimal interval bilan).
    - Keyin: oxirgi sharhdan keyin cooldown.
    - Soatiga user / IP / session limit.
    """
    now = time.time()
    window = getattr(settings, "REVIEW_SUBMIT_WINDOW_SECONDS", 3600)
    free_attempts = getattr(settings, "REVIEW_SUBMIT_FREE_ATTEMPTS", 3)
    cooldown = getattr(settings, "REVIEW_SUBMIT_COOLDOWN", 300)
    min_interval = getattr(settings, "REVIEW_SUBMIT_MIN_INTERVAL", 45)
    max_per_user = getattr(settings, "REVIEW_SUBMIT_MAX_PER_USER_HOUR", 8)
    max_per_ip = getattr(settings, "REVIEW_SUBMIT_MAX_PER_IP_HOUR", 15)
    max_per_session = getattr(settings, "REVIEW_SUBMIT_MAX_PER_SESSION_HOUR", 6)

    last_key = f"review_submit:last:{user_id}"
    last_at = cache.get(last_key)
    if last_at is not None and now - last_at < min_interval:
        retry_after = int(min_interval - (now - last_at)) + 1
        return (
            False,
            f"Juda tez yuboryapsiz. Keyingi sharh uchun {retry_after} soniya kuting.",
            retry_after,
        )

    submit_count = get_user_submit_count(user_id)
    if submit_count >= free_attempts:
        if last_at is not None and now - last_at < cooldown:
            retry_after = int(cooldown - (now - last_at)) + 1
            wait_minutes = max(1, (retry_after + 59) // 60)
            return (
                False,
                (
                    f"Ko'p sharh yubordingiz. Keyingi sharh uchun "
                    f"{wait_minutes} daqiqa kuting."
                ),
                retry_after,
            )

    if submit_count >= max_per_user:
        return (
            False,
            "Soatiga sharh limiti tugadi. Biroz kutib, qayta urinib ko'ring.",
            window,
        )

    ip = get_client_ip(request)
    ip_count = int(cache.get(f"review_submit:count:ip:{ip}", 0) or 0)
    if ip_count >= max_per_ip:
        return (
            False,
            "Juda ko'p so'rov. Biroz kutib, qayta urinib ko'ring.",
            window,
        )

    if hasattr(request, "session"):
        session_key = getattr(settings, "REVIEW_SUBMIT_SESSION_KEY", "review_submit_attempts")
        session_log = _prune_timestamps(request.session.get(session_key, []), window)
        request.session[session_key] = session_log
        if len(session_log) >= max_per_session:
            request.session.modified = True
            return (
                False,
                "Bu brauzerdan juda ko'p sharh yuborildi. Keyinroq qayta urinib ko'ring.",
                window,
            )

    return True, None, None


def record_review_submit(request, user_id):
    window = getattr(settings, "REVIEW_SUBMIT_WINDOW_SECONDS", 3600)
    now = time.time()

    cache.set(f"review_submit:last:{user_id}", now, timeout=window)

    count_key = f"review_submit:count:{user_id}"
    cache.set(count_key, get_user_submit_count(user_id) + 1, timeout=window)

    ip = get_client_ip(request)
    ip_key = f"review_submit:count:ip:{ip}"
    cache.set(ip_key, int(cache.get(ip_key, 0) or 0) + 1, timeout=window)

    if hasattr(request, "session"):
        session_key = getattr(settings, "REVIEW_SUBMIT_SESSION_KEY", "review_submit_attempts")
        session_log = _prune_timestamps(request.session.get(session_key, []), window)
        session_log.append(now)
        request.session[session_key] = session_log
        request.session.modified = True
