from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.google_user_resolution import find_user_for_google_email, resolve_or_create_google_user
from accounts.models import Profile
from universities.models import University

User = get_user_model()


class GoogleAuthProvisioningTests(TestCase):
    def setUp(self):
        self.university = University.objects.create(
            name="Google Test University",
            short_name="GTU",
            location="Toshkent",
            founded_year=2010,
        )

    def test_login_flow_creates_applicant_for_new_email(self):
        user, error, meta = resolve_or_create_google_user(
            email="new.google.user@example.com",
            full_name="Google User",
            state={"flow": "login"},
        )
        self.assertIsNone(error)
        self.assertFalse(meta["linked_existing"])
        self.assertEqual(user.email, "new.google.user@example.com")
        self.assertEqual(user.profile.role, Profile.Role.APPLICANT)
        self.assertFalse(user.has_usable_password())

    def test_signup_flow_creates_provisional_account_without_university(self):
        user, error, meta = resolve_or_create_google_user(
            email="signup.only@example.com",
            full_name="Signup User",
            state={"flow": "signup", "role": Profile.Role.STUDENT, "university": ""},
        )
        self.assertIsNone(error)
        self.assertFalse(meta["linked_existing"])
        self.assertEqual(user.email, "signup.only@example.com")
        self.assertEqual(user.username, "signup.only@example.com")
        self.assertEqual(user.profile.role, Profile.Role.STUDENT)
        self.assertEqual(user.profile.university, "")

    @override_settings(DEBUG=True)
    def test_signup_flow_prefills_university_when_provided(self):
        user, error, meta = resolve_or_create_google_user(
            email="student.google@example.com",
            full_name="Student Google",
            state={
                "flow": "signup",
                "role": Profile.Role.STUDENT,
                "university": "Google Test University",
            },
        )
        self.assertIsNone(error)
        self.assertFalse(meta["linked_existing"])
        self.assertEqual(user.profile.role, Profile.Role.STUDENT)
        self.assertEqual(user.profile.university, "Google Test University")
        self.assertIn("@", user.username)

    def test_register_then_google_login_uses_same_account(self):
        client = APIClient()
        register = client.post(
            "/api/auth/register/",
            {
                "full_name": "Login User",
                "username": "marufxon4930",
                "email": "mmansurjonov58@gmail.com",
                "password": "SecurePass123!",
                "role": "applicant",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(register.status_code, 201)
        registered = User.objects.get(username="marufxon4930")

        linked, error, meta = resolve_or_create_google_user(
            email="mmansurjonov58@gmail.com",
            full_name="Maruf Google",
            state={"flow": "login"},
        )
        self.assertIsNone(error)
        self.assertTrue(meta["linked_existing"])
        self.assertEqual(linked.pk, registered.pk)
        self.assertEqual(User.objects.filter(email__iexact="mmansurjonov58@gmail.com").count(), 1)
        self.assertIsNotNone(linked.profile.email_verified_at)

    def test_signup_google_links_existing_account(self):
        registered = User.objects.create_user(
            username="marufxon4930",
            email="mmansurjonov58@gmail.com",
            password="SecurePass123!",
            first_name="Primary User",
        )
        Profile.objects.create(
            user=registered,
            full_name="Primary User",
            role=Profile.Role.APPLICANT,
            university="Google Test University",
        )

        linked, error, meta = resolve_or_create_google_user(
            email="mmansurjonov58@gmail.com",
            full_name="Maruf Google",
            state={
                "flow": "signup",
                "role": Profile.Role.STUDENT,
                "university": "Google Test University",
            },
        )
        self.assertIsNone(error)
        self.assertTrue(meta["linked_existing"])
        self.assertEqual(meta["flow"], "signup")
        self.assertEqual(linked.pk, registered.pk)
        self.assertEqual(User.objects.filter(email__iexact="mmansurjonov58@gmail.com").count(), 1)

    def test_prefers_password_account_when_google_duplicate_exists(self):
        primary = User.objects.create_user(
            username="marufxon4930",
            email="mmansurjonov58@gmail.com",
            password="SecurePass123!",
            first_name="Primary User",
        )
        Profile.objects.create(
            user=primary,
            full_name="Primary User",
            role=Profile.Role.APPLICANT,
            university="Google Test University",
        )
        ghost = User.objects.create_user(
            username="mmansurjonov58@gmail.com",
            email="mmansurjonov58@gmail.com",
            password=None,
        )
        ghost.set_unusable_password()
        ghost.save(update_fields=["password"])
        Profile.objects.create(
            user=ghost,
            full_name="Ghost Google",
            role=Profile.Role.APPLICANT,
            university="",
            email_verified_at=None,
        )

        found = find_user_for_google_email("mmansurjonov58@gmail.com")
        self.assertEqual(found.pk, primary.pk)

        linked, error, meta = resolve_or_create_google_user(
            email="mmansurjonov58@gmail.com",
            full_name="Maruf Google",
            state={"flow": "login"},
        )
        self.assertIsNone(error)
        self.assertTrue(meta["linked_existing"])
        self.assertEqual(linked.pk, primary.pk)
