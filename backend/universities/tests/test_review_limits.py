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
        self.university_two = University.objects.create(
            name="Limit Test University Two",
            short_name="LT2",
            location="Samarqand",
            founded_year=2001,
        )
        self.university_three = University.objects.create(
            name="Limit Test University Three",
            short_name="LT3",
            location="Buxoro",
            founded_year=2002,
        )

    def _post_review(self, university_id=None, text="Bu universitetda o'qish tajribam juda yaxshi va foydali bo'ldi."):
        return self.client.post(
            "/api/universities/reviews/",
            {
                "university_id": university_id or self.university.id,
                "rating": 5,
                "rating_teachers": 5,
                "rating_dormitory": 4,
                "rating_infrastructure": 4,
                "text": text,
            },
            format="json",
        )

    def test_first_reviews_allowed_then_cooldown(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        first = self._post_review(self.university.id, "Birinchi sharh — o'qish muhiti yaxshi, ustozlar yordam beradi.")
        second = self._post_review(
            self.university_two.id,
            "Ikkinchi sharh — yotoqxona va kutubxona ham qulay edi.",
        )
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 201)

        third = self._post_review(
            self.university_three.id,
            "Uchinchi sharh — sport va to'garaklar ham rivojlangan.",
        )
        self.assertEqual(third.status_code, 429)
        self.assertIn("retry_after_seconds", third.data)
        self.assertIn("detail", third.data)
