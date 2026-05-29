from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.bio_validation import BIO_MAX_LENGTH, BIO_MIN_LENGTH
from accounts.models import Profile

User = get_user_model()


class ProfileBioTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="bio@test.com",
            email="bio@test.com",
            password="test-pass-123",
        )
        self.profile = Profile.objects.create(
            user=self.user,
            full_name="Bio Tester",
            role=Profile.Role.STUDENT,
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)

    def test_patch_bio_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.patch("/api/auth/me/", {"bio": "TDIU talabasi"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["profile"]["bio"], "TDIU talabasi")

    def test_patch_bio_rejects_too_short(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.patch("/api/auth/me/", {"bio": "ab"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn(str(BIO_MIN_LENGTH), response.data["detail"])

    def test_patch_bio_rejects_too_long(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.patch("/api/auth/me/", {"bio": "x" * (BIO_MAX_LENGTH + 1)}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn(str(BIO_MAX_LENGTH), response.data["detail"])

    def test_patch_bio_can_be_cleared(self):
        self.profile.bio = "Old bio text"
        self.profile.save(update_fields=["bio"])

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.patch("/api/auth/me/", {"bio": ""}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["profile"]["bio"], "")

    def test_public_user_includes_bio(self):
        self.profile.bio = "Hammaga ko'rinadigan bio"
        self.profile.save(update_fields=["bio"])

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.get(f"/api/auth/users/{self.user.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["bio"], "Hammaga ko'rinadigan bio")
