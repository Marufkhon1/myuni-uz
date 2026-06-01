from datetime import timedelta

from django.utils import timezone

from .models import Profile

LAST_SEEN_UPDATE_INTERVAL = timedelta(minutes=1)
ONLINE_THRESHOLD = timedelta(minutes=3)


def resolve_user_last_seen(user):
    if user is None:
        return None

    profile = getattr(user, "profile", None)
    if profile and profile.last_seen_at:
        return profile.last_seen_at

    last_login = getattr(user, "last_login", None)
    if last_login:
        return last_login

    return None


def is_user_online_for_user(user, *, now=None):
    return is_user_online(resolve_user_last_seen(user), now=now)


def touch_user_last_seen(user, *, force=False):
    if user is None or not getattr(user, "is_authenticated", False):
        return

    profile = getattr(user, "profile", None)
    if profile is None:
        return

    now = timezone.now()
    if (
        not force
        and profile.last_seen_at
        and now - profile.last_seen_at < LAST_SEEN_UPDATE_INTERVAL
    ):
        return

    Profile.objects.filter(pk=profile.pk).update(last_seen_at=now)
    profile.last_seen_at = now


def is_user_online(last_seen_at, *, now=None):
    if not last_seen_at:
        return False
    current = now or timezone.now()
    return current - last_seen_at <= ONLINE_THRESHOLD
