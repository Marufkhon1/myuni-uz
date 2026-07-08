from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.settings import api_settings
from rest_framework.test import APIClient
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken

from universities.models import Review, University

User = get_user_model()


@override_settings(
    PUBLIC_API_CACHE_ENABLED=True,
    PUBLIC_CACHE_TTL_STATS=300,
    PUBLIC_CACHE_BROWSER_MAX_AGE=60,
    REST_FRAMEWORK={
        **api_settings.user_settings,
        "DEFAULT_THROTTLE_RATES": {
            "public": "300/hour",
            "public_heavy": "120/hour",
            "public_stats": "3/hour",
        },
    },
)
class PublicApiCacheAndThrottleTests(TestCase):
    def setUp(self):
        cache.clear()
        AnonRateThrottle.cache.clear()
        self.client = APIClient()
        self.university = University.objects.create(
            name="Throttle Cache University",
            short_name="TCU",
            location="Toshkent",
            founded_year=2001,
            slug="throttle-cache-university",
        )
        self.user = User.objects.create_user(
            username="cache@uni.test",
            email="cache@uni.test",
            password="SecurePass123!",
        )
        Review.objects.create(
            university=self.university,
            user=self.user,
            rating=5,
            text="Juda yaxshi sharoit va kuchli professorlar jamoasi bor.",
        )

    def tearDown(self):
        cache.clear()
        AnonRateThrottle.cache.clear()

    def test_stats_sets_cache_control_and_hits_on_second_request(self):
        first = self.client.get("/api/public/stats/")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first["X-MyUni-Cache"], "MISS")
        self.assertIn("public", first["Cache-Control"])
        self.assertIn("s-maxage=", first["Cache-Control"])

        second = self.client.get("/api/public/stats/")
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second["X-MyUni-Cache"], "HIT")
        self.assertEqual(first.json(), second.json())

    def test_catalog_cache_varies_by_query(self):
        a = self.client.get("/api/public/universities/", {"city": "Toshkent"})
        b = self.client.get("/api/public/universities/", {"city": "Samarqand"})
        self.assertEqual(a.status_code, 200)
        self.assertEqual(b.status_code, 200)
        self.assertEqual(a["X-MyUni-Cache"], "MISS")
        self.assertEqual(b["X-MyUni-Cache"], "MISS")

        a2 = self.client.get("/api/public/universities/", {"city": "Toshkent"})
        self.assertEqual(a2["X-MyUni-Cache"], "HIT")

    def test_compare_is_cached(self):
        second_uni = University.objects.create(
            name="Second Compare Uni",
            short_name="SCU",
            location="Buxoro",
            founded_year=1999,
            slug="second-compare-uni",
        )
        ids = f"{self.university.id},{second_uni.id}"
        first = self.client.get("/api/public/compare/", {"ids": ids})
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first["X-MyUni-Cache"], "MISS")

        second = self.client.get("/api/public/compare/", {"ids": ids})
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second["X-MyUni-Cache"], "HIT")

    def test_sitemap_is_cached(self):
        first = self.client.get("/api/public/sitemap.xml")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first["X-MyUni-Cache"], "MISS")

        second = self.client.get("/api/public/sitemap.xml")
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second["X-MyUni-Cache"], "HIT")
        self.assertIn("throttle-cache-university", second.content.decode())

    def test_stats_throttle_returns_429(self):
        for _ in range(3):
            response = self.client.get("/api/public/stats/")
            self.assertEqual(response.status_code, 200)

        blocked = self.client.get("/api/public/stats/")
        self.assertEqual(blocked.status_code, 429)

    def test_authenticated_detail_bypasses_shared_cache_personalization_path(self):
        anon = self.client.get(f"/api/public/universities/{self.university.slug}/")
        self.assertEqual(anon.status_code, 200)
        self.assertEqual(anon["X-MyUni-Cache"], "MISS")

        token = str(RefreshToken.for_user(self.user).access_token)
        auth_client = APIClient()
        auth_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        auth = auth_client.get(f"/api/public/universities/{self.university.slug}/")
        self.assertEqual(auth.status_code, 200)
        # Auth path skips shared cache headers from cached_json.
        self.assertNotIn("X-MyUni-Cache", auth)
