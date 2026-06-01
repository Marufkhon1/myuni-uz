from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import Profile
from universities.models import Review, ReviewReport, University

User = get_user_model()


class TrustSafetyApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.reporter = User.objects.create_user(
            username="reporter@uni.test",
            email="reporter@uni.test",
            password="SecurePass123!",
        )
        Profile.objects.create(
            user=self.reporter,
            full_name="Reporter",
            role=Profile.Role.STUDENT,
            email_verified_at=timezone.now(),
        )

        self.moderator = User.objects.create_user(
            username="mod@uni.test",
            email="mod@uni.test",
            password="SecurePass123!",
        )
        Profile.objects.create(
            user=self.moderator,
            full_name="Moderator",
            role=Profile.Role.STUDENT,
            is_moderator=True,
            email_verified_at=timezone.now(),
        )

        self.university = University.objects.create(
            name="Trust Test University",
            short_name="TTU",
            location="Toshkent",
            founded_year=2010,
        )
        self.review = Review.objects.create(
            university=self.university,
            user=self.reporter,
            text="Test review",
            rating=4,
            status=Review.Status.APPROVED,
        )
        self.review_report = ReviewReport.objects.create(
            review=self.review,
            reporter=self.reporter,
            reason=ReviewReport.Reason.SPAM,
            status=ReviewReport.Status.PENDING,
        )

    def test_my_reports_lists_user_reports_with_status(self):
        self.client.force_authenticate(user=self.reporter)
        response = self.client.get("/api/auth/my-reports/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["status"], "pending")
        self.assertEqual(response.data["results"][0]["status_label"], "Ko'rib chiqish kutilmoqda")

    def test_moderator_can_list_and_update_reports(self):
        self.client.force_authenticate(user=self.moderator)
        list_response = self.client.get("/api/auth/moderator/reports/")
        self.assertEqual(list_response.status_code, 200)
        self.assertGreaterEqual(list_response.data["count"], 1)

        patch_response = self.client.patch(
            f"/api/auth/moderator/reports/review/{self.review_report.id}/",
            {"status": "in_review"},
            format="json",
        )
        self.assertEqual(patch_response.status_code, 200)
        self.assertEqual(patch_response.data["status"], "in_review")
        self.assertEqual(patch_response.data["status_label"], "Ko'rib chiqilmoqda")

    def test_non_moderator_cannot_access_moderator_panel(self):
        self.client.force_authenticate(user=self.reporter)
        response = self.client.get("/api/auth/moderator/reports/")
        self.assertEqual(response.status_code, 403)
