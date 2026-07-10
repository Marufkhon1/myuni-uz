from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile
from universities.models import Review, University
from universities.profanity_policy import PROFANITY_CLEAR_NOTE, PROFANITY_REJECTION_MESSAGE
from universities.review_moderation import auto_approve_review_fields, set_review_status

User = get_user_model()


@override_settings(
    REVIEW_MODERATION_ENABLED=True,
    REVIEW_MODERATOR_EMAILS="mod@myuni.test",
    REVIEW_SUBMIT_FREE_ATTEMPTS=10,
    REVIEW_SUBMIT_COOLDOWN=0,
    REVIEW_SUBMIT_MIN_INTERVAL=0,
    PROFANITY_FILTER_ENABLED=True,
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

    def _auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_new_review_is_approved_when_clean(self):
        self._auth()
        response = self.client.post(
            "/api/universities/reviews/",
            {
                "university_id": self.university.id,
                "rating": 5,
                "rating_teachers": 5,
                "rating_dormitory": 4,
                "rating_infrastructure": 4,
                "text": "Yangi sharh toza matn — o'qish sharoiti yaxshi va zamonaviy.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "approved")
        # User API da auto: note yashiriladi.
        self.assertEqual(response.data.get("moderation_note") or "", "")

        review = Review.objects.get(id=response.data["id"])
        self.assertEqual(review.status, Review.Status.APPROVED)
        self.assertEqual(review.moderation_note, PROFANITY_CLEAR_NOTE)
        self.assertIsNotNone(review.moderated_at)

    def test_profanity_review_is_rejected_at_submit(self):
        self._auth()
        before = Review.objects.count()
        response = self.client.post(
            "/api/universities/reviews/",
            {
                "university_id": self.university.id,
                "rating": 2,
                "rating_teachers": 2,
                "rating_dormitory": 2,
                "rating_infrastructure": 2,
                "text": "Bu universitetda ahmoqlar ko'p, o'qish sharoiti juda yomon.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("moderatsiyadan o'tmadi", str(response.data).lower())
        self.assertIn(PROFANITY_REJECTION_MESSAGE, str(response.data))
        self.assertNotIn("ahmoq", str(response.data).lower())
        self.assertEqual(Review.objects.count(), before)

    def test_update_clean_text_stays_approved_with_clear_note(self):
        self._auth()
        create = self.client.post(
            "/api/universities/reviews/",
            {
                "university_id": self.university.id,
                "rating": 4,
                "rating_teachers": 4,
                "rating_dormitory": 4,
                "rating_infrastructure": 4,
                "text": "Birinchi toza sharh — o'qish muhiti yaxshi va qulay.",
            },
            format="json",
        )
        self.assertEqual(create.status_code, 201)
        review_id = create.data["id"]

        update = self.client.patch(
            f"/api/universities/reviews/{review_id}/",
            {
                "text": "Yangilangan toza sharh — kutubxona va laboratoriya juda qulay.",
                "rating": 5,
                "rating_teachers": 5,
                "rating_dormitory": 4,
                "rating_infrastructure": 5,
            },
            format="json",
        )
        self.assertEqual(update.status_code, 200)
        self.assertEqual(update.data["status"], "approved")

        review = Review.objects.get(id=review_id)
        self.assertEqual(review.status, Review.Status.APPROVED)
        self.assertEqual(review.moderation_note, PROFANITY_CLEAR_NOTE)
        self.assertIsNotNone(review.moderated_at)

    def test_update_with_profanity_returns_400(self):
        self._auth()
        create = self.client.post(
            "/api/universities/reviews/",
            {
                "university_id": self.university.id,
                "rating": 4,
                "rating_teachers": 4,
                "rating_dormitory": 4,
                "rating_infrastructure": 4,
                "text": "Birinchi toza sharh — o'qish muhiti yaxshi va qulay.",
            },
            format="json",
        )
        review_id = create.data["id"]
        original_text = Review.objects.get(id=review_id).text

        update = self.client.patch(
            f"/api/universities/reviews/{review_id}/",
            {"text": "Bu yerda ahmoq ustozlar ko'p, sharoit yomon va tartibsiz."},
            format="json",
        )
        self.assertEqual(update.status_code, 400)
        self.assertIn("moderatsiyadan o'tmadi", str(update.data).lower())
        self.assertIn("text", update.data)
        review = Review.objects.get(id=review_id)
        self.assertEqual(review.text, original_text)

    def test_partial_patch_without_text_keeps_approved(self):
        self._auth()
        create = self.client.post(
            "/api/universities/reviews/",
            {
                "university_id": self.university.id,
                "rating": 4,
                "rating_teachers": 4,
                "rating_dormitory": 4,
                "rating_infrastructure": 4,
                "text": "Birinchi toza sharh — o'qish muhiti yaxshi va qulay.",
            },
            format="json",
        )
        review_id = create.data["id"]
        update = self.client.patch(
            f"/api/universities/reviews/{review_id}/",
            {"rating": 5},
            format="json",
        )
        self.assertEqual(update.status_code, 200)
        self.assertEqual(update.data["status"], "approved")
        review = Review.objects.get(id=review_id)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.moderation_note, PROFANITY_CLEAR_NOTE)

    def test_profanity_error_is_on_text_field(self):
        self._auth()
        response = self.client.post(
            "/api/universities/reviews/",
            {
                "university_id": self.university.id,
                "rating": 2,
                "rating_teachers": 2,
                "rating_dormitory": 2,
                "rating_infrastructure": 2,
                "text": "Bu universitetda ahmoqlar ko'p, o'qish sharoiti juda yomon.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("text", response.data)
        self.assertIn("moderatsiyadan o'tmadi", str(response.data["text"]).lower())

    def test_auto_approve_fields_helper(self):
        fields = auto_approve_review_fields()
        self.assertEqual(fields["status"], Review.Status.APPROVED)
        self.assertEqual(fields["moderation_note"], PROFANITY_CLEAR_NOTE)
        self.assertIn("moderated_at", fields)

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
