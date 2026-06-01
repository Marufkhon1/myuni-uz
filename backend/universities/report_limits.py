import time

from django.conf import settings
from django.core.cache import cache

from accounts.password_reset_limits import get_client_ip


def check_report_submit_allowed(request, user_id):
    window = getattr(settings, "REPORT_SUBMIT_WINDOW_SECONDS", 3600)
    max_per_user = getattr(settings, "REPORT_SUBMIT_MAX_PER_USER_HOUR", 12)
    max_per_ip = getattr(settings, "REPORT_SUBMIT_MAX_PER_IP_HOUR", 20)

    user_key = f"report_submit:count:user:{user_id}"
    user_count = int(cache.get(user_key, 0) or 0)
    if user_count >= max_per_user:
        return (
            False,
            "Juda ko'p shikoyat yuborildi. Biroz kutib, qayta urinib ko'ring.",
            window,
        )

    ip = get_client_ip(request)
    ip_key = f"report_submit:count:ip:{ip}"
    ip_count = int(cache.get(ip_key, 0) or 0)
    if ip_count >= max_per_ip:
        return (
            False,
            "Juda ko'p so'rov yuborildi. Biroz kutib, qayta urinib ko'ring.",
            window,
        )

    return True, None, None


def record_report_submit(request, user_id):
    window = getattr(settings, "REPORT_SUBMIT_WINDOW_SECONDS", 3600)
    cache.set(
        f"report_submit:count:user:{user_id}",
        int(cache.get(f"report_submit:count:user:{user_id}", 0) or 0) + 1,
        timeout=window,
    )
    ip = get_client_ip(request)
    cache.set(
        f"report_submit:count:ip:{ip}",
        int(cache.get(f"report_submit:count:ip:{ip}", 0) or 0) + 1,
        timeout=window,
    )
