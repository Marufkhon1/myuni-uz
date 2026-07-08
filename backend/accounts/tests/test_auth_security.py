from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.auth_exchange import consume_auth_exchange_code, issue_auth_exchange_code
from accounts.models import Profile
from universities.models import University

User = get_user_model()


class AuthCookieBodyTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.university = University.objects.create(
            name="Auth Cookie University",
            short_name="ACU",
            location="Toshkent",
            founded_year=2010,
        )

    @override_settings(AUTH_RETURN_TOKENS_IN_BODY=False)
    def test_login_sets_cookies_without_body_tokens(self):
        User.objects.create_user(
            username="cookie_user",
            email="cookie@uni.test",
            password="SecurePass123!",
        )
        Profile.objects.create(
            user=User.objects.get(username="cookie_user"),
            full_name="Cookie User",
            role=Profile.Role.APPLICANT,
            university=self.university.name,
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": "cookie_user", "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertIn("myuni_access", response.cookies)
        self.assertIn("myuni_refresh", response.cookies)

    @override_settings(AUTH_RETURN_TOKENS_IN_BODY=False)
    def test_register_sets_cookies_without_body_tokens(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Cookie Reg",
                "username": "cookie_reg",
                "email": "cookie.reg@uni.test",
                "password": "SecurePass123!",
                "role": "applicant",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertIn("myuni_access", response.cookies)


class AuthRateLimitTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.university = University.objects.create(
            name="Rate Limit University",
            short_name="RLU",
            location="Toshkent",
            founded_year=2011,
        )
        User.objects.create_user(
            username="rate_user",
            email="rate@uni.test",
            password="SecurePass123!",
        )
        Profile.objects.create(
            user=User.objects.get(username="rate_user"),
            full_name="Rate User",
            role=Profile.Role.APPLICANT,
        )

    @override_settings(AUTH_LOGIN_FAILURE_THRESHOLD=3, AUTH_LOGIN_FAILURE_COOLDOWN=60)
    def test_login_rate_limits_after_failed_attempts(self):
        for _ in range(3):
            response = self.client.post(
                "/api/auth/login/",
                {"username": "rate_user", "password": "wrong-password"},
                format="json",
            )
            self.assertEqual(response.status_code, 400)

        blocked = self.client.post(
            "/api/auth/login/",
            {"username": "rate_user", "password": "wrong-password"},
            format="json",
        )
        self.assertEqual(blocked.status_code, 429)
        self.assertEqual(blocked.data["code"], "login_rate_limited")

    @override_settings(AUTH_REGISTER_MAX_PER_IP_HOUR=2)
    def test_register_rate_limits_by_ip(self):
        for index in range(2):
            response = self.client.post(
                "/api/auth/register/",
                {
                    "full_name": f"User {index}",
                    "username": f"rate_reg_{index}",
                    "email": f"rate_reg_{index}@uni.test",
                    "password": "SecurePass123!",
                    "role": "applicant",
                    "university": self.university.name,
                },
                format="json",
            )
            self.assertEqual(response.status_code, 201)

        blocked = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Blocked",
                "username": "rate_reg_blocked",
                "email": "rate_reg_blocked@uni.test",
                "password": "SecurePass123!",
                "role": "applicant",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(blocked.status_code, 429)
        self.assertEqual(blocked.data["code"], "register_rate_limited")


class AuthExchangeTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="exchange@test.com",
            email="exchange@test.com",
            password="SecurePass123!",
        )
        Profile.objects.create(
            user=self.user,
            full_name="Exchange User",
            role=Profile.Role.APPLICANT,
        )

    def test_exchange_code_sets_cookies_and_is_one_time(self):
        refresh = RefreshToken.for_user(self.user)
        code = issue_auth_exchange_code(refresh)
        response = self.client.post("/api/auth/exchange/", {"code": code}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("user", response.data)
        self.assertIn("myuni_access", response.cookies)

        reuse = self.client.post("/api/auth/exchange/", {"code": code}, format="json")
        self.assertEqual(reuse.status_code, 400)
        self.assertIsNone(consume_auth_exchange_code(code))
