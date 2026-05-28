from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from universities.models import Review, University

User = get_user_model()


class PublicApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Public API University",
            short_name="PAU",
            location="Andijon",
            founded_year=1995,
            slug="public-api-university",
        )
        self.user = User.objects.create_user(
            username="public@uni.test",
            email="public@uni.test",
            password="test-pass-123",
        )
        Review.objects.create(
            university=self.university,
            user=self.user,
            rating=4,
            text="Yaxshi universitet — o'qish sharoiti qulay va zamonaviy.",
        )

    def test_public_university_list(self):
        response = self.client.get("/api/public/universities/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(any(item["slug"] == "public-api-university" for item in response.json()))

    def test_public_university_detail_by_slug(self):
        response = self.client.get("/api/public/universities/public-api-university/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["name"], self.university.name)
        self.assertEqual(payload["review_count"], 1)
        self.assertEqual(len(payload["reviews"]), 1)

    def test_public_sitemap_xml(self):
        response = self.client.get("/api/public/sitemap.xml")
        self.assertEqual(response.status_code, 200)
        self.assertIn("application/xml", response["Content-Type"])
        self.assertIn("public-api-university", response.content.decode())

    def test_public_top_universities(self):
        response = self.client.get("/api/public/universities/top/")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
