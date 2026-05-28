from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile
from universities.models import University, UniversityFavorite

User = get_user_model()


class FavoriteUniversityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="fav@uni.test",
            email="fav@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=self.user,
            role=Profile.Role.APPLICANT,
            full_name="Fav Abituriyent",
            university="",
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.university = University.objects.create(
            name="Favorite Test University",
            short_name="FTU",
            location="Buxoro",
            founded_year=2005,
        )

    def test_add_list_and_remove_favorite(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        add = self.client.post(
            "/api/universities/favorites/",
            {"university_id": self.university.id},
            format="json",
        )
        self.assertEqual(add.status_code, 200)
        self.assertTrue(
            UniversityFavorite.objects.filter(user=self.user, university=self.university).exists()
        )

        listing = self.client.get("/api/universities/favorites/")
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(len(listing.json()), 1)

        remove = self.client.delete(f"/api/universities/favorites/{self.university.id}/")
        self.assertEqual(remove.status_code, 200)
        self.assertFalse(
            UniversityFavorite.objects.filter(user=self.user, university=self.university).exists()
        )
