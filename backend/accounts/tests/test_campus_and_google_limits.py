from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch

from accounts.models import Profile
from universities.models import ChatMembership, Review, University
from universities.review_trust_utils import (
    CAMPUS_AFFILIATION_LABEL,
    is_campus_affiliated_user,
    is_verified_student_user,
)

User = get_user_model()


class CampusAffiliationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Campus Affil University",
            short_name="CAU",
            location="Toshkent",
            founded_year=2000,
            slug="campus-affil-university",
        )
        self.student = User.objects.create_user(
            username="campus@uni.test",
            email="campus@uni.test",
            password="SecurePass123!",
        )
        Profile.objects.create(
            user=self.student,
            full_name="Campus Student",
            role=Profile.Role.STUDENT,
            university_ref=self.university,
            university=self.university.name,
        )
        ChatMembership.objects.create(user=self.student, university=self.university)
        self.review = Review.objects.create(
            university=self.university,
            user=self.student,
            rating=5,
            text="Kampus aloqasi bilan yozilgan ishonchli sharh matni.",
            status=Review.Status.APPROVED,
        )
        self.token = str(RefreshToken.for_user(self.student).access_token)

    def test_helpers_agree_on_campus_affiliation(self):
        self.assertTrue(is_campus_affiliated_user(self.student, self.university.id))
        self.assertTrue(is_verified_student_user(self.student, self.university.id))

    def test_public_review_exposes_campus_affiliated_and_alias(self):
        response = self.client.get(
            f"/api/public/universities/{self.university.slug}/"
        )
        self.assertEqual(response.status_code, 200)
        review = response.data["reviews"][0]
        self.assertTrue(review["campus_affiliated"])
        self.assertTrue(review["is_verified_student"])
        self.assertEqual(review["campus_affiliation_label"], CAMPUS_AFFILIATION_LABEL)
        self.assertEqual(review["campus_affiliated"], review["is_verified_student"])

    def test_popular_reviews_exposes_campus_affiliated(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get("/api/universities/reviews/popular/")
        self.assertEqual(response.status_code, 200)
        payload = response.data
        if isinstance(payload, dict):
            reviews = payload.get("results") or payload.get("reviews") or []
        else:
            reviews = payload
        self.assertGreaterEqual(len(reviews), 1)
        item = next(r for r in reviews if r["id"] == self.review.id)
        self.assertIn("campus_affiliated", item)
        self.assertEqual(item["campus_affiliated"], item["is_verified_student"])


@override_settings(AUTH_GOOGLE_START_MAX_PER_IP_HOUR=2, AUTH_GOOGLE_CALLBACK_MAX_PER_IP_HOUR=2)
class GoogleOAuthRateLimitTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

    @patch.dict(
        "os.environ",
        {
            "GOOGLE_CLIENT_ID": "test-google-client-id",
            "GOOGLE_REDIRECT_URI": "http://localhost:8000/api/auth/google/callback/",
        },
        clear=False,
    )
    def test_google_start_rate_limits_by_ip(self):
        for _ in range(2):
            response = self.client.get("/api/auth/google/start/", {"flow": "login"})
            self.assertEqual(response.status_code, 200)
            self.assertIn("authorization_url", response.data)

        blocked = self.client.get("/api/auth/google/start/", {"flow": "login"})
        self.assertEqual(blocked.status_code, 429)
        self.assertEqual(blocked.data["code"], "google_oauth_rate_limited")

    def test_google_callback_rate_limits_before_google_http(self):
        for _ in range(2):
            response = self.client.get(
                "/api/auth/google/callback/",
                {"code": "fake-code", "state": "irrelevant"},
            )
            # Without valid Google tokens, expect redirect away from rate-limit
            self.assertIn(response.status_code, (302, 301))

        blocked = self.client.get(
            "/api/auth/google/callback/",
            {"code": "fake-code-3", "state": "irrelevant"},
        )
        self.assertIn(blocked.status_code, (302, 301))
        self.assertIn("google_oauth_rate_limited", blocked.url)
