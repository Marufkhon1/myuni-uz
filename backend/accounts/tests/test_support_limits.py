from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

User = get_user_model()


@override_settings(
    SUPPORT_MAX_PER_IP_HOUR=2,
    SUPPORT_MAX_PER_SESSION_HOUR=2,
    SUPPORT_WINDOW_SECONDS=3600,
)
class SupportRateLimitTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def test_support_rate_limit_by_ip(self):
        payload = {"message": "Yordam kerak", "email": "help@test.com"}
        for _ in range(2):
            response = self.client.post("/api/auth/support/message/", payload, format="json")
            self.assertEqual(response.status_code, 202)
        response = self.client.post("/api/auth/support/message/", payload, format="json")
        self.assertEqual(response.status_code, 429)
