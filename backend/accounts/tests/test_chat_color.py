from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.chat_colors import default_chat_color_key, resolve_chat_color_key
from accounts.models import Profile
from universities.models import ChatMembership, ChatMessage, University

User = get_user_model()


class ChatColorTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="color@test.com",
            email="color@test.com",
            password="test-pass-123",
        )
        self.profile = Profile.objects.create(
            user=self.user,
            full_name="Rang Test",
            role=Profile.Role.STUDENT,
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.university = University.objects.create(
            name="Color University",
            short_name="CU",
            location="Toshkent",
        )
        ChatMembership.objects.create(user=self.user, university=self.university)

    def test_patch_chat_color(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.patch(
            "/api/auth/me/",
            {"chat_color": "cyan"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.chat_color, "cyan")
        self.assertEqual(response.json()["profile"]["chat_color_resolved"], "cyan")

    def test_message_includes_author_color(self):
        self.profile.chat_color = "purple"
        self.profile.save(update_fields=["chat_color"])
        ChatMessage.objects.create(
            university=self.university,
            user=self.user,
            text="Rangli xabar",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(f"/api/universities/{self.university.id}/messages/")
        message = response.json()["messages"][0]
        self.assertEqual(message["author_color"], "purple")

    def test_empty_color_uses_default(self):
        self.assertEqual(
            resolve_chat_color_key(self.profile),
            default_chat_color_key(self.user.id),
        )
