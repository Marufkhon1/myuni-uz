from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.google_user_resolution import resolve_or_create_google_user
from accounts.models import Profile
from accounts.profile_setup import user_needs_profile_setup
from universities.models import University

User = get_user_model()


class CompleteGoogleProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Complete Profile University",
            short_name="CPU",
            location="Toshkent",
            founded_year=2012,
        )

    @override_settings(DEBUG=True)
    def test_complete_profile_sets_role_university_and_username(self):
        user, error, meta = resolve_or_create_google_user(
            email="new.google@example.com",
            full_name="New Google",
            state={"flow": "signup"},
        )
        self.assertIsNone(error)
        self.assertTrue(user_needs_profile_setup(user))

        self.client.force_authenticate(user=user)
        response = self.client.post(
            "/api/auth/me/complete-profile/",
            {
                "role": "student",
                "username": "google_student1",
                "university": self.university.name,
                "university_id": self.university.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.data["username"], "google_student1")
        self.assertFalse(response.data["needs_profile_setup"])
        self.assertEqual(response.data["profile"]["role"], "student")
        self.assertEqual(response.data["profile"]["university"], self.university.name)

        user.refresh_from_db()
        self.assertFalse(user_needs_profile_setup(user))
        self.assertEqual(user.username, "google_student1")
        self.assertEqual(user.profile.role, Profile.Role.STUDENT)

    def test_complete_profile_rejects_email_username(self):
        user, error, _meta = resolve_or_create_google_user(
            email="provisional@example.com",
            full_name="Prov",
            state={"flow": "login"},
        )
        self.assertIsNone(error)
        self.client.force_authenticate(user=user)
        response = self.client.post(
            "/api/auth/me/complete-profile/",
            {
                "role": "applicant",
                "username": "still@email.com",
                "university_id": self.university.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_me_exposes_needs_profile_setup(self):
        user, error, _meta = resolve_or_create_google_user(
            email="flag@example.com",
            full_name="Flag",
            state={"flow": "login"},
        )
        self.assertIsNone(error)
        self.client.force_authenticate(user=user)
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["needs_profile_setup"])
