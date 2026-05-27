import time

from django.conf import settings
from django.core.cache import cache
from django.contrib.auth.tokens import default_token_generator


def reset_session_ttl():
    return getattr(settings, "PASSWORD_RESET_TIMEOUT", 900)


def start_reset_session(user, request=None):
    """
    30 daqiqalik parol tiklash sessiyasi.
    Faqat oxirgi yuborilgan havola/token ishlaydi.
    """
    token = default_token_generator.make_token(user)
    ttl = reset_session_ttl()
    cache.set(f"pwd_reset:session:{user.pk}", token, timeout=ttl)
    cache.set(f"pwd_reset:session_started:{user.pk}", time.time(), timeout=ttl)

    if request is not None:
        request.session["password_reset_user_id"] = user.pk
        request.session["password_reset_expires_at"] = time.time() + ttl
        request.session.modified = True

    return token


def is_reset_session_active(user, token):
    cached_token = cache.get(f"pwd_reset:session:{user.pk}")
    if not cached_token or cached_token != token:
        return False
    if not default_token_generator.check_token(user, token):
        return False
    return True


def clear_reset_session(user, request=None):
    cache.delete(f"pwd_reset:session:{user.pk}")
    cache.delete(f"pwd_reset:session_started:{user.pk}")

    if request is not None:
        request.session.pop("password_reset_user_id", None)
        request.session.pop("password_reset_expires_at", None)
        request.session.modified = True


def get_reset_seconds_remaining(user):
    started = cache.get(f"pwd_reset:session_started:{user.pk}")
    if started is None:
        return 0
    remaining = int(reset_session_ttl() - (time.time() - started))
    return max(0, remaining)
