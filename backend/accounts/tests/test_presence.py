from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile
from accounts.presence import is_user_online, touch_user_last_seen
from universities.models import ChatMembership, ChatMessage, University

User = get_user_model()


class UserPresenceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Presence University",
            short_name="PU",
            location="Toshkent",
        )
        self.user = User.objects.create_user(
            username="presence@test.com",
            email="presence@test.com",
            password="test-pass-123",
        )
        self.profile = Profile.objects.create(
            user=self.user,
            full_name="Presence Tester",
            role=Profile.Role.STUDENT,
        )
        self.other = User.objects.create_user(
            username="other@test.com",
            email="other@test.com",
            password="test-pass-123",
        )
        self.other_profile = Profile.objects.create(
            user=self.other,
            full_name="Other User",
            role=Profile.Role.APPLICANT,
        )
        ChatMembership.objects.create(user=self.user, university=self.university)
        ChatMembership.objects.create(user=self.other, university=self.university)
        ChatMessage.objects.create(
            university=self.university,
            user=self.other,
            text="Salom",
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)

    def test_touch_user_last_seen_updates_profile(self):
        touch_user_last_seen(self.user, force=True)
        self.profile.refresh_from_db()
        self.assertIsNotNone(self.profile.last_seen_at)

    def test_touch_user_last_seen_is_throttled(self):
        first_seen = timezone.now() - timedelta(seconds=30)
        Profile.objects.filter(pk=self.profile.pk).update(last_seen_at=first_seen)
        self.user.profile.refresh_from_db()

        touch_user_last_seen(self.user)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.last_seen_at, first_seen)

    def test_is_user_online_within_threshold(self):
        seen = timezone.now() - timedelta(minutes=2)
        self.assertTrue(is_user_online(seen))

    def test_is_user_online_outside_threshold(self):
        seen = timezone.now() - timedelta(minutes=10)
        self.assertFalse(is_user_online(seen))

    def test_public_user_includes_presence_fields(self):
        seen = timezone.now() - timedelta(minutes=1)
        Profile.objects.filter(pk=self.other_profile.pk).update(last_seen_at=seen)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(
            f"/api/auth/users/{self.other.id}/",
            {"university_id": self.university.id},
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_online"])
        self.assertIsNotNone(response.data["last_seen_at"])

    def test_authenticated_request_updates_last_seen(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 200)
        self.profile.refresh_from_db()
        self.assertIsNotNone(self.profile.last_seen_at)
