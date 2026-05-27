from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.profile_access import can_view_chat_profile
from universities.models import ChatMembership, ChatMessage, University

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
        ChatMembership.objects.create(user=self.viewer, university=self.university)
        ChatMembership.objects.create(user=self.author, university=self.university)
        ChatMembership.objects.create(user=self.lurker, university=self.university)
        ChatMessage.objects.create(
            university=self.university,
            user=self.author,
            text="Salom chat",
        )
        self.token = str(RefreshToken.for_user(self.viewer).access_token)

    def test_author_profile_allowed_after_chat_message(self):
        self.assertTrue(
            can_view_chat_profile(self.viewer, self.author, university_id=self.university.id)
        )

    def test_lurker_profile_denied_without_message(self):
        self.assertFalse(
            can_view_chat_profile(self.viewer, self.lurker, university_id=self.university.id)
        )

    def test_public_user_api_returns_403_for_lurker(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(
            f"/api/auth/users/{self.lurker.id}/",
            {"university_id": self.university.id},
        )
        self.assertEqual(response.status_code, 403)

    def test_public_user_api_returns_200_for_author(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(
            f"/api/auth/users/{self.author.id}/",
            {"university_id": self.university.id},
        )
        self.assertEqual(response.status_code, 200)
