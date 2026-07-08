from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.auth_cookies import ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME
from accounts.models import Profile

User = get_user_model()


class CookieJwtCsrfTests(TestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)
        self.user = User.objects.create_user(
            username="csrf@test.com",
            email="csrf@test.com",
            password="SecurePass123!",
        )
        Profile.objects.create(
            user=self.user,
            full_name="CSRF User",
            role=Profile.Role.APPLICANT,
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.access = str(self.refresh.access_token)

    def _seed_auth_cookies(self, client=None):
        client = client or self.client
        client.cookies[ACCESS_COOKIE_NAME] = self.access
        client.cookies[REFRESH_COOKIE_NAME] = str(self.refresh)

    def _csrf_headers(self):
        csrf_resp = self.client.get("/api/auth/csrf/")
        self.assertEqual(csrf_resp.status_code, 200)
        cookie_token = csrf_resp.cookies[settings.CSRF_COOKIE_NAME].value
        return {"HTTP_X_CSRFTOKEN": cookie_token}

    def test_csrf_endpoint_sets_readable_cookie(self):
        response = self.client.get("/api/auth/csrf/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(settings.CSRF_COOKIE_NAME, response.cookies)
        cookie = response.cookies[settings.CSRF_COOKIE_NAME]
        self.assertFalse(bool(cookie.get("httponly")))

    def test_login_sets_csrf_cookie_alongside_auth(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "csrf@test.com", "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn(ACCESS_COOKIE_NAME, response.cookies)
        self.assertIn(settings.CSRF_COOKIE_NAME, response.cookies)

    def test_cookie_patch_me_without_csrf_is_403(self):
        self._seed_auth_cookies()
        response = self.client.patch(
            "/api/auth/me/",
            {"bio": "CSRF blocked bio text"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("CSRF", str(response.data.get("detail", "")))

    def test_cookie_patch_me_with_csrf_succeeds(self):
        self._seed_auth_cookies()
        headers = self._csrf_headers()
        response = self.client.patch(
            "/api/auth/me/",
            {"bio": "CSRF allowed bio text"},
            format="json",
            **headers,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["profile"]["bio"], "CSRF allowed bio text")

    def test_bearer_patch_me_without_csrf_succeeds(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        response = self.client.patch(
            "/api/auth/me/",
            {"bio": "Bearer path bio text"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["profile"]["bio"], "Bearer path bio text")

    def test_cookie_refresh_without_csrf_is_403(self):
        self.client.cookies[REFRESH_COOKIE_NAME] = str(self.refresh)
        response = self.client.post("/api/auth/token/refresh/", {}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_cookie_refresh_with_csrf_succeeds(self):
        self.client.cookies[REFRESH_COOKIE_NAME] = str(self.refresh)
        headers = self._csrf_headers()
        response = self.client.post("/api/auth/token/refresh/", {}, format="json", **headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn(ACCESS_COOKIE_NAME, response.cookies)

    def test_body_refresh_without_csrf_succeeds(self):
        response = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": str(self.refresh)},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

    def test_logout_with_cookies_requires_csrf(self):
        self._seed_auth_cookies()
        denied = self.client.post("/api/auth/logout/", {}, format="json")
        self.assertEqual(denied.status_code, 403)

        headers = self._csrf_headers()
        allowed = self.client.post("/api/auth/logout/", {}, format="json", **headers)
        self.assertEqual(allowed.status_code, 200)
