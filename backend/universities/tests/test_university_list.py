from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from universities.models import Review, University

User = get_user_model()


class UniversityListApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="student@test.com",
            email="student@test.com",
            password="test-pass-123",
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.first = University.objects.create(
            name="First University",
            short_name="FU",
            location="Toshkent",
        )
        self.second = University.objects.create(
            name="Second University",
            short_name="SU",
            location="Samarqand",
        )
        Review.objects.create(
            university=self.second,
            user=self.user,
            rating=5,
            text="Ajoyib tajriba",
            status=Review.Status.APPROVED,
        )

    def test_university_list_includes_rating_summary_fields(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get("/api/universities/")
        self.assertEqual(response.status_code, 200)

        payload = response.json()
        self.assertGreaterEqual(len(payload), 2)

        second = next(item for item in payload if item["id"] == self.second.id)
        first = next(item for item in payload if item["id"] == self.first.id)

        self.assertEqual(second["review_count"], 1)
        self.assertEqual(second["average_rating"], 5.0)
        self.assertEqual(first["review_count"], 0)
        self.assertIsNone(first["average_rating"])
