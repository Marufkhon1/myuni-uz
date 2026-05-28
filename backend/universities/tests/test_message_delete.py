from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile
from universities.models import ChatMembership, ChatMessage, DirectMessage, DirectThread, University

User = get_user_model()


class MessageDeleteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="deleter@uni.test",
            email="deleter@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(user=self.user, role=Profile.Role.STUDENT, full_name="Deleter", university="U")
        self.other = User.objects.create_user(
            username="otherdel@uni.test",
            email="otherdel@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(user=self.other, role=Profile.Role.STUDENT, full_name="Other", university="U")
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.other_token = str(RefreshToken.for_user(self.other).access_token)
        self.university = University.objects.create(
            name="Delete University",
            short_name="DU",
            location="Toshkent",
            founded_year=2010,
        )
        ChatMembership.objects.create(user=self.user, university=self.university)
        self.group_message = ChatMessage.objects.create(
            university=self.university,
            user=self.user,
            text="O'chiriladigan guruh xabari",
        )
        self.thread = DirectThread.objects.create(user_one=self.user, user_two=self.other)
        self.direct_message = DirectMessage.objects.create(
            thread=self.thread,
            sender=self.user,
            text="O'chiriladigan shaxsiy xabar",
        )

    def test_delete_own_group_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.delete(f"/api/universities/messages/{self.group_message.id}/")
        self.assertEqual(response.status_code, 204)
        self.group_message.refresh_from_db()
        self.assertTrue(self.group_message.is_deleted)

    def test_other_user_cannot_delete_group_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.other_token}")
        response = self.client.delete(f"/api/universities/messages/{self.group_message.id}/")
        self.assertEqual(response.status_code, 403)

    def test_delete_own_direct_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.delete(f"/api/universities/directs/messages/{self.direct_message.id}/")
        self.assertEqual(response.status_code, 204)
        self.direct_message.refresh_from_db()
        self.assertTrue(self.direct_message.is_deleted)
