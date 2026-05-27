import logging
import os

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

logger = logging.getLogger(__name__)

RESET_MINUTES = 30


def build_reset_link(user, token):
    frontend_url = os.getenv("FRONTEND_URL", "http://127.0.0.1:5173").rstrip("/")
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    return f"{frontend_url}/reset-password?uid={uid}&token={token}"


def send_password_reset_email(user, token):
    """
    Xat foydalanuvchining emailiga (masalan alisher88@gmail.com) boradi.
    Yuboruvchi: DEFAULT_FROM_EMAIL (masalan marufkhonmaxsudovich@gmail.com SMTP).
    """
    recipient = user.email.lower().strip()
    reset_link = build_reset_link(user, token)
    sender = settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL
    subject = "MyUni.uz — parolni tiklash"
    text_body = (
        f"Salom, {user.get_full_name() or recipient}!\n\n"
        "MyUni.uz hisobingiz uchun parolni tiklash so'rovi qabul qilindi.\n"
        f"Havola {RESET_MINUTES} daqiqa amal qiladi — shu vaqt ichida yangi parol kiriting.\n\n"
        f"{reset_link}\n\n"
        "Yangi parol eski parolingiz bilan bir xil bo'lmasligi kerak.\n"
        f"Agar siz bu so'rovni yubormagan bo'lsangiz, xatni e'tiborsiz qoldiring.\n\n"
        f"Yuboruvchi: {sender}\n"
        "MyUni.uz"
    )
    html_body = f"""
    <p>Salom!</p>
    <p>MyUni.uz hisobingiz uchun parolni tiklash havolasi (<strong>{RESET_MINUTES} daqiqa</strong> amal qiladi):</p>
    <p><a href="{reset_link}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Parolni tiklash</a></p>
    <p>Yoki havolani nusxalang:<br><a href="{reset_link}">{reset_link}</a></p>
    <p>Yangi parol eski parol bilan bir xil bo'lmasin.</p>
    <p style="font-size:12px;color:#666;">Xat {recipient} manziliga yuborildi. Yuboruvchi: {sender}</p>
    """

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=sender,
        to=[recipient],
    )
    message.encoding = "utf-8"
    message.attach_alternative(html_body, "text/html")
    message.send(fail_silently=False)
    logger.info("Password reset email: from=%s to=%s", sender, recipient)
