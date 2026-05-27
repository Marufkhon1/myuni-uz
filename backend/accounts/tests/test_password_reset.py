from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

User = get_user_model()


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    PASSWORD_RESET_EMAIL_COOLDOWN=120,
    PASSWORD_RESET_MAX_PER_EMAIL_HOUR=3,
)
class PasswordResetTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="reset@test.com",
            email="reset@test.com",
            password="old-pass-12345",
        )

    def test_sends_email_for_existing_user(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": "reset@test.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("reset-password", mail.outbox[0].body)
        self.assertEqual(mail.outbox[0].to, ["reset@test.com"])

    def test_first_two_sends_are_free_third_is_blocked(self):
        self.client.post("/api/auth/password-reset/", {"email": "reset@test.com"}, format="json")
        self.client.post("/api/auth/password-reset/", {"email": "reset@test.com"}, format="json")
        self.assertEqual(len(mail.outbox), 2)

        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": "reset@test.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 429)
        self.assertIn("retry_after_seconds", response.data)
        self.assertEqual(len(mail.outbox), 2)

    def test_session_expired_after_clear(self):
        from django.core.cache import cache

        self.client.post("/api/auth/password-reset/", {"email": "reset@test.com"}, format="json")
        token = cache.get(f"pwd_reset:session:{self.user.pk}")
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        uid_b64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        cache.delete(f"pwd_reset:session:{self.user.pk}")
        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            {
                "uid": uid_b64,
                "token": token,
                "password": "brand-new-pass-99",
                "password_confirm": "brand-new-pass-99",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data.get("code"), "session_expired")

    def test_rejects_same_password(self):
        self.client.post("/api/auth/password-reset/", {"email": "reset@test.com"}, format="json")
        from django.core.cache import cache
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        uid_b64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = cache.get(f"pwd_reset:session:{self.user.pk}")
        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            {
                "uid": uid_b64,
                "token": token,
                "password": "old-pass-12345",
                "password_confirm": "old-pass-12345",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data.get("code"), "same_as_old")

    def test_unknown_email_returns_ok_without_mail(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": "nobody@test.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)
