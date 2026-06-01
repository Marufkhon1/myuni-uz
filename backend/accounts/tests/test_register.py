from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from rest_framework.test import APIClient

from accounts.models import Profile
from universities.models import University

User = get_user_model()


class RegisterApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Register Test University",
            short_name="RTU",
            location="Toshkent",
            founded_year=2010,
        )

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_student_register_requires_email_verification(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Yangi Talaba",
                "email": "new.student@uni.test",
                "password": "SecurePass123!",
                "role": "student",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["requires_email_verification"])
        self.assertNotIn("access", response.data)
        user = User.objects.get(email="new.student@uni.test")
        self.assertEqual(user.profile.role, Profile.Role.STUDENT)
        self.assertIsNone(user.profile.email_verified_at)

    @override_settings(DEBUG=True, EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_sitecheck_email_auto_verified_in_debug(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "E2E Talaba",
                "email": "e2e.student@sitecheck.test",
                "password": "SecurePass123!",
                "role": "student",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.data["requires_email_verification"])
        self.assertIn("access", response.data)
        self.assertIn("user", response.data)
        user = User.objects.get(email="e2e.student@sitecheck.test")
        self.assertIsNotNone(user.profile.email_verified_at)

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(
            username="dup@uni.test",
            email="dup@uni.test",
            password="SecurePass123!",
        )
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Ikkinchi",
                "email": "dup@uni.test",
                "password": "SecurePass123!",
                "role": "applicant",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)


class EmailVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="verify@uni.test",
            email="verify@uni.test",
            password="SecurePass123!",
        )
        Profile.objects.create(user=self.user, full_name="Verify User", role=Profile.Role.APPLICANT)

    def test_login_blocks_unverified_email(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": "verify@uni.test", "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["code"], "email_not_verified")

    def test_email_confirm_grants_access(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        response = self.client.post(
            "/api/auth/verify-email/confirm/",
            {"uid": uid, "token": token},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.user.profile.refresh_from_db()
        self.assertIsNotNone(self.user.profile.email_verified_at)
