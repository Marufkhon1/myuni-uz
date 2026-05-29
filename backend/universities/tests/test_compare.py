from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from universities.models import ChatMembership, Review, ReviewLike, University

User = get_user_model()


class UniversityCompareTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="compare@uni.test",
            email="compare@uni.test",
            password="test-pass-123",
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.uni_a = University.objects.create(
            name="Compare University A",
            short_name="CUA",
            location="Toshkent",
            founded_year=1990,
        )
        self.uni_b = University.objects.create(
            name="Compare University B",
            short_name="CUB",
            location="Samarqand",
            founded_year=2000,
        )
        Review.objects.create(university=self.uni_a, user=self.user, rating=5, text="A joy")
        Review.objects.create(university=self.uni_a, user=self.user, rating=4, text="A yana")
        self.review_b = Review.objects.create(
            university=self.uni_b, user=self.user, rating=3, text="B bir"
        )
        self.top_review_a = Review.objects.filter(university=self.uni_a, text="A joy").first()
        ReviewLike.objects.create(user=self.user, review=self.top_review_a)
        ChatMembership.objects.create(user=self.user, university=self.uni_a)

    def test_compare_returns_two_universities_with_highlights(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(
            "/api/universities/compare/",
            {"ids": f"{self.uni_a.id},{self.uni_b.id}"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload["universities"]), 2)
        self.assertEqual(payload["universities"][0]["review_count"], 2)
        self.assertEqual(payload["universities"][1]["review_count"], 1)
        self.assertTrue(payload["universities"][0]["is_joined"])
        self.assertEqual(payload["highlights"]["reviews"]["university_id"], self.uni_a.id)
        self.assertEqual(payload["highlights"]["reviews"]["value"], 2)
        self.assertEqual(payload["highlights"]["rating"]["value"], 4.5)
        self.assertEqual(payload["universities"][0]["sample_review"]["text"], "A joy")
        self.assertEqual(payload["universities"][0]["sample_review"]["like_count"], 1)

    def test_compare_requires_exactly_two_ids(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(
            "/api/universities/compare/",
            {"ids": str(self.uni_a.id)},
        )
        self.assertEqual(response.status_code, 400)
