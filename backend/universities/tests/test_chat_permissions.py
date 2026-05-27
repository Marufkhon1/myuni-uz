from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from universities.models import ChatMembership, DirectThread, University

User = get_user_model()


class ChatPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Test University",
            short_name="TU",
            location="Toshkent",
        )
        self.member = User.objects.create_user(
            username="member@test.com",
            email="member@test.com",
            password="test-pass-123",
        )
        self.outsider = User.objects.create_user(
            username="outsider@test.com",
            email="outsider@test.com",
            password="test-pass-123",
        )
        ChatMembership.objects.create(user=self.member, university=self.university)
        self.member_token = str(RefreshToken.for_user(self.member).access_token)
        self.outsider_token = str(RefreshToken.for_user(self.outsider).access_token)

    def test_non_member_cannot_list_university_messages(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.outsider_token}")
        response = self.client.get(
            f"/api/universities/{self.university.id}/messages/"
        )
        self.assertEqual(response.status_code, 403)

    def test_member_can_list_university_messages(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.member_token}")
        response = self.client.get(
            f"/api/universities/{self.university.id}/messages/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_non_member_cannot_open_university_sse(self):
        response = self.client.get(
            f"/api/universities/{self.university.id}/messages/stream/",
            {"token": self.outsider_token},
        )
        self.assertEqual(response.status_code, 403)

    def test_member_can_open_university_sse(self):
        response = self.client.get(
            f"/api/universities/{self.university.id}/messages/stream/",
            {"token": self.member_token},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/event-stream", response["Content-Type"])

    def test_non_participant_cannot_open_direct_sse(self):
        thread = DirectThread.objects.create(user_one=self.member, user_two=self.outsider)
        stranger = User.objects.create_user(
            username="stranger@test.com",
            email="stranger@test.com",
            password="test-pass-123",
        )
        stranger_token = str(RefreshToken.for_user(stranger).access_token)
        response = self.client.get(
            f"/api/universities/directs/{thread.id}/messages/stream/",
            {"token": stranger_token},
        )
        self.assertEqual(response.status_code, 403)
