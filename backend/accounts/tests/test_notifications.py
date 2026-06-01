from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Notification, Profile
from accounts.notifications_service import notify_review_status_change
from universities.models import Review, University

User = get_user_model()


class NotificationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="student@test.com",
            email="student@test.com",
            password="pass12345",
        )
        Profile.objects.create(
            user=self.user,
            role=Profile.Role.STUDENT,
            full_name="Test Student",
            university="WIUT",
        )
        self.university = University.objects.create(
            name="Notification Test University",
            short_name="NTU",
            location="Tashkent",
        )
        self.review = Review.objects.create(
            user=self.user,
            university=self.university,
            rating=5,
            text="Ajoyib universitet, o'qituvchilar yaxshi va muhit qulay.",
            status=Review.Status.PENDING,
        )
        self.client.force_authenticate(user=self.user)

    def test_review_status_change_creates_notification(self):
        self.review.status = Review.Status.APPROVED
        self.review.save(update_fields=["status"])
        notify_review_status_change(self.review, previous_status=Review.Status.PENDING)

        self.assertEqual(Notification.objects.filter(user=self.user).count(), 1)
        notification = Notification.objects.get(user=self.user)
        self.assertEqual(notification.kind, Notification.Kind.REVIEW_APPROVED)
        self.assertFalse(notification.is_read)

    def test_notification_list_and_mark_read(self):
        Notification.objects.create(
            user=self.user,
            kind=Notification.Kind.REVIEW_PENDING,
            title="Sharhingiz moderatsiyada",
            body="Ko'rib chiqilmoqda",
            link="/student/dashboard?section=reviews",
        )

        list_response = self.client.get("/api/auth/notifications/")
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.data["unread_count"], 1)
        self.assertEqual(len(list_response.data["results"]), 1)

        mark_response = self.client.post("/api/auth/notifications/mark-read/", {}, format="json")
        self.assertEqual(mark_response.status_code, 200)
        self.assertEqual(mark_response.data["updated"], 1)
        self.assertEqual(
            Notification.objects.filter(user=self.user, is_read=False).count(),
            0,
        )
