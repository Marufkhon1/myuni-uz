from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from universities.models import ChatMembership, ChatMessage, DirectMessage, DirectThread, University

User = get_user_model()


class PinAndReportTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Pin University",
            short_name="PU",
            location="Toshkent",
        )
        self.member = User.objects.create_user(
            username="pin-member@test.com",
            email="pin-member@test.com",
            password="test-pass-123",
        )
        self.other = User.objects.create_user(
            username="pin-other@test.com",
            email="pin-other@test.com",
            password="test-pass-123",
        )
        ChatMembership.objects.create(user=self.member, university=self.university)
        ChatMembership.objects.create(user=self.other, university=self.university)
        self.member_token = str(RefreshToken.for_user(self.member).access_token)
        self.other_token = str(RefreshToken.for_user(self.other).access_token)
        self.message = ChatMessage.objects.create(
            university=self.university,
            user=self.other,
            text="Sinov xabari",
        )

    def test_pin_university_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.post(
            f"/api/universities/{self.university.id}/messages/{self.message.id}/pin/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["pinned"]["id"], self.message.id)

        list_response = self.client.get(
            f"/api/universities/{self.university.id}/messages/"
        )
        self.assertEqual(list_response.json()["pinned"]["id"], self.message.id)

    def test_report_requires_details_for_other(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.post(
            f"/api/universities/messages/{self.message.id}/report/",
            {"reason": "other", "details": "ok"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("details", response.json())

    def test_report_insult(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.post(
            f"/api/universities/messages/{self.message.id}/report/",
            {"reason": "insult"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)

    def test_pin_direct_message(self):
        thread = DirectThread.objects.create(user_one=self.member, user_two=self.other)
        dm = DirectMessage.objects.create(
            thread=thread,
            sender=self.other,
            text="Shaxsiy sinov",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.post(
            f"/api/universities/directs/{thread.id}/messages/{dm.id}/pin/"
        )
        self.assertEqual(response.status_code, 200)
        list_response = self.client.get(f"/api/universities/directs/{thread.id}/messages/")
        self.assertEqual(list_response.json()["pinned"]["id"], dm.id)
