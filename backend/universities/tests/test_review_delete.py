from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile
from universities.models import Review, University

User = get_user_model()


class ReviewDeleteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Delete Test University",
            short_name="DTU",
            location="Toshkent",
            founded_year=2001,
        )
        self.owner = User.objects.create_user(
            username="owner@uni.test",
            email="owner@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=self.owner,
            role=Profile.Role.STUDENT,
            full_name="Owner Talaba",
            university=self.university.name,
        )
        self.other = User.objects.create_user(
            username="other@uni.test",
            email="other@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=self.other,
            role=Profile.Role.STUDENT,
            full_name="Other Talaba",
            university=self.university.name,
        )
        self.applicant = User.objects.create_user(
            username="applicant@uni.test",
            email="applicant@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=self.applicant,
            role=Profile.Role.APPLICANT,
            full_name="Abituriyent",
            university="",
        )
        self.review = Review.objects.create(
            university=self.university,
            user=self.owner,
            rating=5,
            text="O'z sharhim — o'qish tajribam juda yaxshi va foydali bo'ldi.",
        )
        self.owner_token = str(RefreshToken.for_user(self.owner).access_token)
        self.other_token = str(RefreshToken.for_user(self.other).access_token)
        self.applicant_token = str(RefreshToken.for_user(self.applicant).access_token)

    def test_owner_can_delete_own_review(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.owner_token}")
        response = self.client.delete(f"/api/universities/reviews/{self.review.id}/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Review.objects.filter(pk=self.review.pk).exists())

    def test_other_student_cannot_delete_review(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.other_token}")
        response = self.client.delete(f"/api/universities/reviews/{self.review.id}/")
        self.assertEqual(response.status_code, 403)
        self.assertTrue(Review.objects.filter(pk=self.review.pk).exists())

    def test_applicant_cannot_delete_review(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.applicant_token}")
        response = self.client.delete(f"/api/universities/reviews/{self.review.id}/")
        self.assertEqual(response.status_code, 403)
