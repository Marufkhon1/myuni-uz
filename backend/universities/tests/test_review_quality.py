from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile
from universities.models import ChatMembership, Faculty, Review, StudyDirection, University
from universities.review_trust_utils import generate_review_insight_summary, is_verified_student_user

User = get_user_model()

SAMPLE_REVIEW = {
    "rating": 5,
    "rating_teachers": 5,
    "rating_dormitory": 4,
    "rating_infrastructure": 4,
    "text": "Bu universitetda o'qish tajribam juda yaxshi. Ustozlar yordam beradi va yotoqxona ham qulay.",
}


@override_settings(
    REVIEW_SUBMIT_FREE_ATTEMPTS=10,
    REVIEW_SUBMIT_COOLDOWN=0,
    REVIEW_SUBMIT_MIN_INTERVAL=0,
)
class ReviewQualityTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.university = University.objects.create(
            name="Quality Test University",
            short_name="QTU",
            location="Toshkent",
            city="Toshkent",
            founded_year=2010,
        )
        self.other_university = University.objects.create(
            name="Other University",
            short_name="OTH",
            location="Samarqand",
            city="Samarqand",
            founded_year=2005,
        )
        self.student = User.objects.create_user(
            username="quality-student@uni.test",
            email="quality-student@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=self.student,
            role=Profile.Role.STUDENT,
            full_name="Quality Talaba",
            university=self.university.name,
        )
        ChatMembership.objects.create(user=self.student, university=self.university)
        self.token = str(RefreshToken.for_user(self.student).access_token)
        self.faculty = Faculty.objects.create(
            university=self.university,
            name="IT fakulteti",
            slug="it",
        )
        self.direction = StudyDirection.objects.create(
            faculty=self.faculty,
            name="Dasturiy injiniring",
            slug="software",
        )

    def _post_review(self, university_id=None, **extra):
        payload = {
            **SAMPLE_REVIEW,
            "university_id": university_id or self.university.id,
            **extra,
        }
        return self.client.post("/api/universities/reviews/", payload, format="json")

    def test_aspect_ratings_required(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post(
            "/api/universities/reviews/",
            {
                "university_id": self.university.id,
                "rating": 5,
                "text": SAMPLE_REVIEW["text"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_one_review_per_university(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        first = self._post_review()
        second = self._post_review()
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 400)

    def test_verified_student_badge(self):
        self.assertTrue(is_verified_student_user(self.student, self.university.id))

    def test_public_recent_reviews_filter_by_city(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        self._post_review()
        review = Review.objects.get(user=self.student, university=self.university)
        review.status = Review.Status.APPROVED
        review.save(update_fields=["status"])

        response = self.client.get("/api/public/reviews/recent/", {"city": "Toshkent"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_review_insight_summary_after_three_reviews(self):
        for index in range(3):
            user = User.objects.create_user(
                username=f"insight-{index}@uni.test",
                email=f"insight-{index}@uni.test",
                password="test-pass-123",
            )
            Profile.objects.create(user=user, role=Profile.Role.STUDENT, full_name=f"Talaba {index}")
            Review.objects.create(
                user=user,
                university=self.university,
                rating=5,
                rating_teachers=5,
                rating_dormitory=3,
                rating_infrastructure=4,
                text=SAMPLE_REVIEW["text"],
                status=Review.Status.APPROVED,
            )
        summary = generate_review_insight_summary(self.university.id)
        self.assertIsNotNone(summary)
        self.assertIn("o'qituvchi", summary.lower())

    def test_review_report_endpoint(self):
        author = User.objects.create_user(
            username="author@uni.test",
            email="author@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(user=author, role=Profile.Role.STUDENT, full_name="Author")
        review = Review.objects.create(
            user=author,
            university=self.university,
            rating=4,
            rating_teachers=4,
            rating_dormitory=4,
            rating_infrastructure=4,
            text=SAMPLE_REVIEW["text"],
            status=Review.Status.APPROVED,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post(
            f"/api/universities/reviews/{review.id}/report/",
            {"reason": "spam"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
