from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile
from universities.models import Review, University
from universities.review_moderation import set_review_status

User = get_user_model()


@override_settings(
    REVIEW_MODERATION_ENABLED=True,
    REVIEW_MODERATOR_EMAILS="mod@myuni.test",
    REVIEW_SUBMIT_FREE_ATTEMPTS=10,
    REVIEW_SUBMIT_COOLDOWN=0,
    REVIEW_SUBMIT_MIN_INTERVAL=0,
)
class ReviewModerationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.university = University.objects.create(
            name="Moderation Test University",
            short_name="MTU",
            location="Namangan",
            founded_year=2015,
        )
        self.student = User.objects.create_user(
            username="mod-student@uni.test",
            email="mod-student@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=self.student,
            role=Profile.Role.STUDENT,
            full_name="Mod Talaba",
            university=self.university.name,
        )
        self.token = str(RefreshToken.for_user(self.student).access_token)

    def test_new_review_is_pending(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post(
            "/api/universities/reviews/",
            {
                "university_id": self.university.id,
                "rating": 5,
                "text": "Yangi sharh moderatsiyada — o'qish sharoiti yaxshi va zamonaviy.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "pending")

    def test_public_list_hides_pending_from_others(self):
        review = Review.objects.create(
            university=self.university,
            user=self.student,
            rating=5,
            text="Kutilayotgan sharh — o'qish tajribam ijobiy va tavsiya qilaman.",
            status=Review.Status.PENDING,
        )
        other = User.objects.create_user(
            username="other-mod@uni.test",
            email="other-mod@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=other,
            role=Profile.Role.APPLICANT,
            full_name="Boshqa",
            university="",
        )
        other_token = str(RefreshToken.for_user(other).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_token}")
        response = self.client.get(
            "/api/universities/reviews/",
            {"university_id": self.university.id},
        )
        self.assertEqual(response.status_code, 200)
        ids = [item["id"] for item in response.data]
        self.assertNotIn(review.id, ids)

    def test_admin_approve_makes_public(self):
        review = Review.objects.create(
            university=self.university,
            user=self.student,
            rating=4,
            text="Tasdiqlanadigan sharh — o'qish jarayoni qulay va samarali bo'ldi.",
            status=Review.Status.PENDING,
        )
        set_review_status(review, Review.Status.APPROVED)
        review.refresh_from_db()
        self.assertEqual(review.status, Review.Status.APPROVED)
