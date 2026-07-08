from django.test import TestCase
from rest_framework.test import APIClient

from universities.models import University


class LoginApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Login Test University",
            short_name="LTU",
            location="Toshkent",
            founded_year=2010,
        )
        register = self.client.post(
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

    def test_login_with_username_case_insensitive(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "Marufxon4930", "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_login_with_registered_email(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "mmansurjonov58@gmail.com", "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_login_missing_password_returns_uzbek_message(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "marufxon4930"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["password"][0], "Parol kiriting.")

    def test_login_empty_body_returns_uzbek_message(self):
        response = self.client.post("/api/auth/login/", {}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["username"][0], "Login yoki email kiriting.")

    def test_login_wrong_password(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "marufxon4930", "password": "wrong-password"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
