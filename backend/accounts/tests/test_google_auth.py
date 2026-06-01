from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from accounts.models import Profile
from accounts.views import resolve_or_create_google_user

User = get_user_model()


class GoogleAuthProvisioningTests(TestCase):
    def test_login_flow_creates_applicant_for_new_email(self):
        user, error = resolve_or_create_google_user(
            email="new.google.user@example.com",
            full_name="Google User",
            state={"flow": "login"},
        )
        self.assertIsNone(error)
        self.assertEqual(user.email, "new.google.user@example.com")
        self.assertEqual(user.profile.role, Profile.Role.APPLICANT)
        self.assertIsNotNone(user.profile.email_verified_at)

    def test_signup_flow_requires_university(self):
        user, error = resolve_or_create_google_user(
            email="signup.only@example.com",
            full_name="Signup User",
            state={"flow": "signup", "role": Profile.Role.STUDENT, "university": ""},
        )
        self.assertIsNone(user)
        self.assertEqual(error[0], "/signup")

    @override_settings(DEBUG=True)
    def test_signup_flow_creates_student_with_university(self):
        user, error = resolve_or_create_google_user(
            email="student.google@example.com",
            full_name="Student Google",
            state={
                "flow": "signup",
                "role": Profile.Role.STUDENT,
                "university": "Test University",
            },
        )
        self.assertIsNone(error)
        self.assertEqual(user.profile.role, Profile.Role.STUDENT)
        self.assertEqual(user.profile.university, "Test University")
