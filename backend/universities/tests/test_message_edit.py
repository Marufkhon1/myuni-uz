from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile
from universities.models import ChatMembership, ChatMessage, DirectMessage, DirectThread, University

User = get_user_model()


class MessageEditTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="editor@uni.test",
            email="editor@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=self.user,
            role=Profile.Role.STUDENT,
            full_name="Editor",
            university="Edit Uni",
        )
        self.other = User.objects.create_user(
            username="other@uni.test",
            email="other@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=self.other,
            role=Profile.Role.STUDENT,
            full_name="Other",
            university="Edit Uni",
        )
        self.outsider = User.objects.create_user(
            username="outsider@uni.test",
            email="outsider@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=self.outsider,
            role=Profile.Role.STUDENT,
            full_name="Outsider",
            university="Other Uni",
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.other_token = str(RefreshToken.for_user(self.other).access_token)
        self.outsider_token = str(RefreshToken.for_user(self.outsider).access_token)
        self.university = University.objects.create(
            name="Edit Message University",
            short_name="EMU",
            location="Toshkent",
            founded_year=2010,
        )
        ChatMembership.objects.create(user=self.user, university=self.university)
        self.group_message = ChatMessage.objects.create(
            university=self.university,
            user=self.user,
            text="Dastlabki guruh xabari matni bu yerda joylashgan.",
        )
        self.thread = DirectThread.objects.create(user_one=self.user, user_two=self.other)
        self.direct_message = DirectMessage.objects.create(
            thread=self.thread,
            sender=self.user,
            text="Dastlabki shaxsiy xabar matni bu yerda joylashgan.",
        )

    def test_edit_group_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.patch(
            f"/api/universities/messages/{self.group_message.id}/edit/",
            {"text": "Tahrirlangan guruh xabari — yangi matn bilan almashtirildi."},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_edited"])
        self.group_message.refresh_from_db()
        self.assertIn("Tahrirlangan", self.group_message.text)

    def test_edit_direct_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.patch(
            f"/api/universities/directs/messages/{self.direct_message.id}/edit/",
            {"text": "Tahrirlangan shaxsiy xabar — yangi matn bilan almashtirildi."},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_edited"])

    def test_other_user_cannot_edit_group_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.other_token}")
        response = self.client.patch(
            f"/api/universities/messages/{self.group_message.id}/edit/",
            {"text": "Buzilgan matn"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_non_member_cannot_edit_group_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.outsider_token}")
        response = self.client.patch(
            f"/api/universities/messages/{self.group_message.id}/edit/",
            {"text": "Buzilgan matn"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_cannot_edit_deleted_group_message(self):
        self.group_message.is_deleted = True
        self.group_message.updated_at = timezone.now()
        self.group_message.save(update_fields=["is_deleted", "updated_at"])
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.patch(
            f"/api/universities/messages/{self.group_message.id}/edit/",
            {"text": "Yana tahrirlash"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_other_user_cannot_edit_direct_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.other_token}")
        response = self.client.patch(
            f"/api/universities/directs/messages/{self.direct_message.id}/edit/",
            {"text": "Buzilgan"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
