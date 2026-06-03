from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from universities.models import Review, University

User = get_user_model()


class PopularReviewListTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="popular@uni.test",
            email="popular@uni.test",
            password="test-pass-123",
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.uni = University.objects.create(
            name="Popular Test University",
            short_name="PTU",
            location="Toshkent",
        )
        Review.objects.create(
            university=self.uni,
            user=self.user,
            rating=5,
            text="Test popular review",
        )

    def test_popular_reviews_list_returns_200(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get("/api/universities/reviews/popular/")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
