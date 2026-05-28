from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Profile
from universities.models import University

User = get_user_model()


class RegisterApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Register Test University",
            short_name="RTU",
            location="Toshkent",
            founded_year=2010,
        )

    def test_student_register_success(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Yangi Talaba",
                "email": "new.student@uni.test",
                "password": "SecurePass123!",
                "role": "student",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("access", response.data)
        user = User.objects.get(email="new.student@uni.test")
        self.assertEqual(user.profile.role, Profile.Role.STUDENT)
        self.assertEqual(user.profile.university, self.university.name)

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(
            username="dup@uni.test",
            email="dup@uni.test",
            password="SecurePass123!",
        )
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Ikkinchi",
                "email": "dup@uni.test",
                "password": "SecurePass123!",
                "role": "applicant",
                "university": self.university.name,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
