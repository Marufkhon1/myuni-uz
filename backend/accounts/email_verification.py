import logging
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()
logger = logging.getLogger(__name__)


def is_email_verified(user) -> bool:
    profile = getattr(user, "profile", None)
    return bool(profile and profile.email_verified_at)


def maybe_auto_verify_e2e_email(user) -> bool:
    """DEBUG rejimida @sitecheck.test emailni avtomatik tasdiqlash (E2E testlar uchun)."""
    if not settings.DEBUG:
        return False
    email = str(getattr(user, "email", "")).lower().strip()
    if not email.endswith("@sitecheck.test"):
        return False
    mark_email_verified(user)
    return True


def mark_email_verified(user):
    from .models import Profile

    profile, _ = Profile.objects.get_or_create(
        user=user,
        defaults={"full_name": user.first_name or user.email or ""},
    )
    if not profile.email_verified_at:
        profile.email_verified_at = timezone.now()
        profile.save(update_fields=["email_verified_at", "updated_at"])


def build_verification_url(user):
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{frontend_url}/verify-email?uid={uid}&token={token}"


def send_verification_email(user):
    verify_url = build_verification_url(user)
    subject = "MyUni.uz — email manzilingizni tasdiqlang"
    message = (
        f"Salom, {user.first_name or user.email}!\n\n"
        f"MyUni.uz da ro'yxatdan o'tganingiz uchun rahmat. "
        f"Hisobingizni faollashtirish uchun quyidagi havolani bosing:\n\n"
        f"{verify_url}\n\n"
        f"Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.\n"
    )
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None) or "hello@myuni.uz"
    try:
        send_mail(subject, message, from_email, [user.email], fail_silently=False)
        return True
    except Exception:
        logger.exception("Email verification send failed for user %s", user.pk)
        return False


def verify_email_token(uid, token):
    from django.utils.http import urlsafe_base64_decode

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return None, "Tasdiqlash havolasi noto'g'ri yoki muddati tugagan."

    if not default_token_generator.check_token(user, token):
        return None, "Tasdiqlash havolasi noto'g'ri yoki muddati tugagan."

    mark_email_verified(user)
    return user, None


def verification_resend_cooldown_remaining(user_id):
    from django.core.cache import cache

    key = f"email_verify:last:{user_id}"
    last_sent = cache.get(key)
    if not last_sent:
        return 0
    cooldown = getattr(settings, "EMAIL_VERIFY_RESEND_COOLDOWN", 120)
    elapsed = timezone.now().timestamp() - float(last_sent)
    remaining = int(cooldown - elapsed)
    return max(0, remaining)


def record_verification_sent(user_id):
    from django.core.cache import cache

    cache.set(
        f"email_verify:last:{user_id}",
        timezone.now().timestamp(),
        timeout=getattr(settings, "EMAIL_VERIFY_RESEND_COOLDOWN", 120) + 30,
    )
