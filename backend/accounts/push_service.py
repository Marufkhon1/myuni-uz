import json
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def web_push_enabled():
    public_key = getattr(settings, "WEB_PUSH_VAPID_PUBLIC_KEY", "")
    private_key = getattr(settings, "WEB_PUSH_VAPID_PRIVATE_KEY", "")
    return bool(public_key and private_key)


def get_vapid_public_key():
    return getattr(settings, "WEB_PUSH_VAPID_PUBLIC_KEY", "")


def _subscription_info(subscription):
    return {
        "endpoint": subscription.endpoint,
        "keys": {
            "p256dh": subscription.p256dh,
            "auth": subscription.auth,
        },
    }


def send_web_push(subscription, payload):
    if not web_push_enabled():
        return False

    try:
        from pywebpush import WebPushException, webpush
    except ImportError:
        logger.debug("pywebpush not installed; skipping web push")
        return False

    vapid_claims = getattr(
        settings,
        "WEB_PUSH_VAPID_CLAIMS",
        {"sub": "mailto:hello@myuni.uz"},
    )

    try:
        webpush(
            subscription_info=_subscription_info(subscription),
            data=json.dumps(payload, ensure_ascii=False),
            vapid_private_key=settings.WEB_PUSH_VAPID_PRIVATE_KEY,
            vapid_claims=vapid_claims,
        )
        return True
    except WebPushException as exc:
        status = getattr(getattr(exc, "response", None), "status_code", None)
        if status in (404, 410):
            subscription.is_active = False
            subscription.save(update_fields=["is_active", "updated_at"])
        logger.warning("Web push failed for subscription %s: %s", subscription.id, exc)
        return False
    except Exception as exc:
        logger.warning("Web push error for subscription %s: %s", subscription.id, exc)
        return False


def send_web_push_to_user(user, payload):
    from .models import PushSubscription

    if not web_push_enabled():
        return 0

    sent = 0
    subscriptions = PushSubscription.objects.filter(user=user, is_active=True)
    for subscription in subscriptions:
        if send_web_push(subscription, payload):
            sent += 1
    return sent
