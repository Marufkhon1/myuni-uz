from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.profile_access import can_view_chat_profile
from universities.models import ChatMembership, ChatMessage, DirectThread, University

User = get_user_model()


class ProfileAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Profile Access University",
            short_name="PAU",
            location="Toshkent",
        )
        self.viewer = User.objects.create_user(
            username="viewer@profile.test",
            email="viewer@profile.test",
            password="test-pass-123",
        )
        self.author = User.objects.create_user(
            username="author@profile.test",
            email="author@profile.test",
            password="test-pass-123",
        )
        self.lurker = User.objects.create_user(
            username="lurker@profile.test",
            email="lurker@profile.test",
            password="test-pass-123",
        )
        self.outsider = User.objects.create_user(
            username="outsider@profile.test",
            email="outsider@profile.test",
            password="test-pass-123",
        )
        ChatMembership.objects.create(user=self.viewer, university=self.university)
        ChatMembership.objects.create(user=self.author, university=self.university)
        ChatMembership.objects.create(user=self.lurker, university=self.university)
        ChatMessage.objects.create(
            university=self.university,
            user=self.author,
            text="Salom chat",
        )
        self.token = str(RefreshToken.for_user(self.viewer).access_token)
        self.outsider_token = str(RefreshToken.for_user(self.outsider).access_token)

    def test_author_profile_allowed_after_chat_message(self):
        self.assertTrue(
            can_view_chat_profile(self.viewer, self.author, university_id=self.university.id)
        )

    def test_lurker_profile_allowed_as_chat_member(self):
        self.assertTrue(
            can_view_chat_profile(self.viewer, self.lurker, university_id=self.university.id)
        )

    def test_outsider_can_view_author_profile(self):
        self.assertTrue(
            can_view_chat_profile(self.outsider, self.author, university_id=self.university.id)
        )

    def test_outsider_can_view_chat_member_profile(self):
        self.assertTrue(
            can_view_chat_profile(self.outsider, self.lurker, university_id=self.university.id)
        )

    def test_direct_thread_allows_profile_without_university(self):
        first_id, second_id = sorted([self.viewer.id, self.outsider.id])
        DirectThread.objects.create(user_one_id=first_id, user_two_id=second_id)
        self.assertTrue(can_view_chat_profile(self.viewer, self.outsider))

    def test_public_user_api_returns_200_for_lurker_member(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(
            f"/api/auth/users/{self.lurker.id}/",
            {"university_id": self.university.id},
        )
        self.assertEqual(response.status_code, 200)

    def test_public_user_api_returns_200_for_author(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(
            f"/api/auth/users/{self.author.id}/",
            {"university_id": self.university.id},
        )
        self.assertEqual(response.status_code, 200)

    def test_public_user_api_returns_200_for_outsider_viewing_author(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.outsider_token}")
        response = self.client.get(
            f"/api/auth/users/{self.author.id}/",
            {"university_id": self.university.id},
        )
        self.assertEqual(response.status_code, 200)

    def test_public_user_uses_last_login_when_last_seen_missing(self):
        login_time = timezone.now() - timedelta(days=2)
        User.objects.filter(pk=self.lurker.id).update(last_login=login_time)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(
            f"/api/auth/users/{self.lurker.id}/",
            {"university_id": self.university.id},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(response.data["last_seen_at"])
        self.assertFalse(response.data["is_online"])
