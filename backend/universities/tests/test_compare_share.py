from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from universities.models import CompareShareLink, University

User = get_user_model()


class CompareShareLinkTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="share@uni.test",
            email="share@uni.test",
            password="test-pass-123",
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.uni_a = University.objects.create(
            name="Share University A",
            short_name="SUA",
            location="Toshkent",
        )
        self.uni_b = University.objects.create(
            name="Share University B",
            short_name="SUB",
            location="Samarqand",
        )
        self.uni_c = University.objects.create(
            name="Share University C",
            short_name="SUC",
            location="Buxoro",
        )

    def test_create_share_link_returns_token_and_public_payload(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post(
            "/api/universities/compare/share/",
            {"ids": f"{self.uni_a.id},{self.uni_b.id},{self.uni_c.id}"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertTrue(payload["token"])
        self.assertEqual(len(payload["university_ids"]), 3)

        public = self.client.get(f"/api/public/compare/{payload['token']}/")
        self.assertEqual(public.status_code, 200)
        public_payload = public.json()
        self.assertEqual(len(public_payload["universities"]), 3)
        self.assertFalse(public_payload["universities"][0]["is_joined"])
        self.assertIn("expires_at", public_payload)

    def test_create_share_link_accepts_two_ids(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post(
            "/api/universities/compare/share/",
            {"ids": f"{self.uni_a.id},{self.uni_b.id}"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertEqual(len(payload["university_ids"]), 2)

        public = self.client.get(f"/api/public/compare/{payload['token']}/")
        self.assertEqual(public.status_code, 200)
        self.assertEqual(len(public.json()["universities"]), 2)

    def test_expired_share_link_returns_410(self):
        share = CompareShareLink.objects.create(
            token="expiredtoken1234",
            created_by=self.user,
            snapshot={"universities": [], "highlights": {}},
            expires_at=timezone.now() - timedelta(hours=1),
        )
        response = self.client.get(f"/api/public/compare/{share.token}/")
        self.assertEqual(response.status_code, 410)
        self.assertEqual(response.json()["code"], "expired")
