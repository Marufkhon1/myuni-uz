from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile
from universities.models import University

User = get_user_model()


@override_settings(
    REVIEW_SUBMIT_FREE_ATTEMPTS=2,
    REVIEW_SUBMIT_COOLDOWN=120,
    REVIEW_SUBMIT_MIN_INTERVAL=0,
    REVIEW_SUBMIT_MAX_PER_USER_HOUR=10,
)
class ReviewSubmitLimitTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="reviewer@uni.test",
            email="reviewer@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=self.user,
            role=Profile.Role.STUDENT,
            full_name="Test Talaba",
            university="Test Uni",
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.university = University.objects.create(
            name="Limit Test University",
            short_name="LTU",
            location="Toshkent",
            founded_year=2000,
        )

    def _post_review(self, text="Bu universitetda o'qish tajribam juda yaxshi va foydali bo'ldi."):
        return self.client.post(
            "/api/universities/reviews/",
            {
                "university_id": self.university.id,
                "rating": 5,
                "text": text,
            },
            format="json",
        )

    def test_first_reviews_allowed_then_cooldown(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        first = self._post_review("Birinchi sharh — o'qish muhiti yaxshi, ustozlar yordam beradi.")
        second = self._post_review("Ikkinchi sharh — yotoqxona va kutubxona ham qulay edi.")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 201)

        third = self._post_review("Uchinchi sharh — sport va to'garaklar ham rivojlangan.")
        self.assertEqual(third.status_code, 429)
        self.assertIn("retry_after_seconds", third.data)
        self.assertIn("detail", third.data)
