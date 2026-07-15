from django.test import TestCase
from rest_framework.test import APIClient


class SupportMessageTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_empty_message_rejected(self):
        response = self.client.post("/api/auth/support/message/", {"message": "   "}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_message_accepted_without_telegram(self):
        response = self.client.post(
            "/api/auth/support/message/",
            {"message": "Salom, yordam kerak"},
            format="json",
        )
        self.assertEqual(response.status_code, 202)
        self.assertTrue(response.data["accepted"])
        self.assertFalse(response.data["operator_notified"])
