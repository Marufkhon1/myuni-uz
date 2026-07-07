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
    def test_student_register_logs_in_immediately(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Yangi Talaba",
                "username": "new_student",
                "email": "new.student@uni.test",
                "password": "SecurePass123!",
                "role": "student",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("access", response.data)
        self.assertIn("user", response.data)
        self.assertNotIn("requires_email_verification", response.data)
        user = User.objects.get(username="new_student")
        self.assertEqual(user.profile.role, Profile.Role.STUDENT)
        self.assertEqual(user.email, "new.student@uni.test")
        self.assertIsNotNone(user.profile.email_verified_at)

        login_response = self.client.post(
            "/api/auth/login/",
            {"username": "new_student", "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(login_response.status_code, 200)

    @override_settings(DEBUG=True, EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_sitecheck_username_register_logs_in_immediately(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "E2E Talaba",
                "username": "e2e_student",
                "email": "e2e_student@sitecheck.test",
                "password": "SecurePass123!",
                "role": "student",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("access", response.data)
        self.assertIn("user", response.data)
        user = User.objects.get(username="e2e_student")
        self.assertEqual(user.email, "e2e_student@sitecheck.test")
        self.assertIsNotNone(user.profile.email_verified_at)

    def test_register_requires_email(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Email Yo'q",
                "username": "no_email_user",
                "password": "SecurePass123!",
                "role": "applicant",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_register_rejects_duplicate_username(self):
        User.objects.create_user(
            username="dup_user",
            email="dup@uni.test",
            password="SecurePass123!",
        )
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Ikkinchi",
                "username": "dup_user",
                "email": "other@uni.test",
                "password": "SecurePass123!",
                "role": "applicant",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(
            username="first_user",
            email="shared@uni.test",
            password="SecurePass123!",
        )
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Ikkinchi",
                "username": "second_user",
                "email": "shared@uni.test",
                "password": "SecurePass123!",
                "role": "applicant",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_profile_can_update_email(self):
        register = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Email User",
                "username": "email_user",
                "email": "old.user@uni.test",
                "password": "SecurePass123!",
                "role": "applicant",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(register.status_code, 201)
        access = register.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        patch = self.client.patch(
            "/api/auth/me/",
            {"email": "reset.user@uni.test"},
            format="json",
        )
        self.assertEqual(patch.status_code, 200)
        user = User.objects.get(username="email_user")
        self.assertEqual(user.email, "reset.user@uni.test")


class EmailVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="verify@uni.test",
            email="verify@uni.test",
            password="SecurePass123!",
        )
        Profile.objects.create(user=self.user, full_name="Verify User", role=Profile.Role.APPLICANT)

    def test_login_succeeds_without_email_verification(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "verify@uni.test", "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

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
