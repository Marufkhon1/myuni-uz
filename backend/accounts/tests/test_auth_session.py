from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile

User = get_user_model()


class AuthSessionApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="session@test.com",
            email="session@test.com",
            password="SecurePass123!",
        )
        Profile.objects.create(
            user=self.user,
            full_name="Session User",
            role=Profile.Role.APPLICANT,
        )

    def test_session_accepts_refresh_only_and_returns_user(self):
        refresh = RefreshToken.for_user(self.user)
        response = self.client.post(
            "/api/auth/session/",
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "session@test.com")
        self.assertIn("myuni_access", response.cookies)
        self.assertIn("myuni_refresh", response.cookies)

    def test_session_rejects_invalid_refresh(self):
        response = self.client.post(
            "/api/auth/session/",
            {"access": "bad", "refresh": "bad"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)
