from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from universities.models import Article, Review, ReviewLike, University

User = get_user_model()


class PublicApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(
            name="Public API University",
            short_name="PAU",
            location="Andijon",
            founded_year=1995,
            slug="public-api-university",
        )
        self.user = User.objects.create_user(
            username="public@uni.test",
            email="public@uni.test",
            password="test-pass-123",
        )
        Review.objects.create(
            university=self.university,
            user=self.user,
            rating=4,
            text="Yaxshi universitet — o'qish sharoiti qulay va zamonaviy.",
        )

    def test_public_university_list(self):
        response = self.client.get("/api/public/universities/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("results", payload)
        self.assertTrue(
            any(item["slug"] == "public-api-university" for item in payload["results"])
        )

    def test_public_university_list_filters_by_city(self):
        self.university.city = "Andijon"
        self.university.save(update_fields=["city"])
        response = self.client.get("/api/public/universities/", {"city": "Andijon"})
        self.assertEqual(response.status_code, 200)
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertIn("public-api-university", slugs)

    def test_public_university_detail_by_slug(self):
        response = self.client.get("/api/public/universities/public-api-university/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["name"], self.university.name)
        self.assertEqual(payload["review_count"], 1)
        self.assertEqual(len(payload["reviews"]), 1)

    def test_public_sitemap_xml(self):
        response = self.client.get("/api/public/sitemap.xml")
        self.assertEqual(response.status_code, 200)
        self.assertIn("application/xml", response["Content-Type"])
        self.assertIn("public-api-university", response.content.decode())

    def test_public_top_universities(self):
        response = self.client.get("/api/public/universities/top/")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_public_platform_stats(self):
        response = self.client.get("/api/public/stats/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreaterEqual(payload["university_count"], 1)
        self.assertGreaterEqual(payload["review_count"], 1)
        self.assertGreaterEqual(payload["member_count"], 0)
        self.assertGreaterEqual(payload["chat_member_count"], 0)
        self.assertGreaterEqual(payload["reviews_last_7_days"], 1)
        self.assertGreaterEqual(payload["new_members_last_7_days"], 0)
        self.assertGreaterEqual(payload["message_count"], 0)

    def test_public_landing_preview(self):
        response = self.client.get("/api/public/landing-preview/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("stats", payload)
        self.assertIn("universities", payload)
        self.assertIn("featured_review", payload)
        self.assertIn("chat_messages", payload)
        self.assertIsInstance(payload["universities"], list)
        self.assertIsInstance(payload["chat_messages"], list)
        if payload["featured_review"]:
            self.assertIn("text", payload["featured_review"])
            self.assertIn("author", payload["featured_review"])
        if payload["chat_messages"]:
            self.assertIn("author_role", payload["chat_messages"][0])

    def test_public_featured_universities(self):
        response = self.client.get("/api/public/universities/featured/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIsInstance(payload, list)
        self.assertTrue(any(item["slug"] == "public-api-university" for item in payload))

    def test_public_recent_reviews_limit(self):
        response = self.client.get("/api/public/reviews/recent/?limit=1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_public_top_university_reviews_returns_most_liked_per_top_university(self):
        other_user = User.objects.create_user(
            username="other@uni.test",
            email="other@uni.test",
            password="test-pass-123",
        )
        third_user = User.objects.create_user(
            username="third@uni.test",
            email="third@uni.test",
            password="test-pass-123",
        )
        uni_b = University.objects.create(
            name="Second Public University",
            short_name="SPU",
            location="Samarqand",
            slug="second-public-university",
        )
        review_a_low = Review.objects.create(
            university=self.university,
            user=third_user,
            rating=3,
            text="Kam like",
            status=Review.Status.APPROVED,
        )
        review_a_top = Review.objects.create(
            university=self.university,
            user=other_user,
            rating=5,
            text="Ko'p like",
            status=Review.Status.APPROVED,
        )
        ReviewLike.objects.create(user=other_user, review=review_a_top)
        ReviewLike.objects.create(user=self.user, review=review_a_top)
        ReviewLike.objects.create(user=other_user, review=review_a_low)

        review_b = Review.objects.create(
            university=uni_b,
            user=self.user,
            rating=4,
            text="B universitet sharhi",
            status=Review.Status.APPROVED,
        )
        ReviewLike.objects.create(user=other_user, review=review_b)

        response = self.client.get("/api/public/reviews/top-universities/?limit=3")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreaterEqual(len(payload), 1)
        first = payload[0]
        self.assertEqual(first["id"], review_a_top.id)
        self.assertEqual(first["helpful_count"], 2)

    def test_public_top_university_reviews_orders_by_like_count_across_universities(self):
        low_user = User.objects.create_user(
            username="low@uni.test",
            email="low@uni.test",
            password="test-pass-123",
        )
        liked_user = User.objects.create_user(
            username="liked@uni.test",
            email="liked@uni.test",
            password="test-pass-123",
        )
        uni_b = University.objects.create(
            name="Second Public University",
            short_name="SPU",
            location="Samarqand",
            slug="second-public-university-likes",
        )
        review_low = Review.objects.create(
            university=self.university,
            user=low_user,
            rating=4,
            text="Birinchi universitetda kam like",
            status=Review.Status.APPROVED,
        )
        review_high = Review.objects.create(
            university=uni_b,
            user=liked_user,
            rating=5,
            text="Ikkinchi universitetda ko'proq like",
            status=Review.Status.APPROVED,
        )
        ReviewLike.objects.create(user=self.user, review=review_high)

        response = self.client.get("/api/public/reviews/top-universities/?limit=3")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        ids = [item["id"] for item in payload]
        self.assertEqual(ids[0], review_high.id)
        self.assertIn(review_low.id, ids[1:])

    def test_public_review_filters(self):
        response = self.client.get("/api/public/reviews/filters/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("cities", payload)
        self.assertIn("directions", payload)
        self.assertIn("sort_options", payload)

    def test_public_share_preview_home(self):
        response = self.client.get("/api/public/share-preview/?path=/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/html", response["Content-Type"])
        body = response.content.decode()
        self.assertIn("og:title", body)
        self.assertIn("MyUni.uz", body)

    def test_public_share_preview_university(self):
        response = self.client.get(
            "/api/public/share-preview/?path=/universitet/public-api-university/"
        )
        self.assertEqual(response.status_code, 200)
        body = response.content.decode()
        self.assertIn("Public API University", body)
        self.assertIn("og:description", body)
        self.assertIn("/images/campuses/", body)

    def test_public_articles_list(self):
        response = self.client.get("/api/public/articles/")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
        slugs = [item["slug"] for item in response.json()]
        self.assertIn("2026-qabul-tdiu-vs-tatu", slugs)
        self.assertGreaterEqual(len(slugs), 10)

    def test_public_articles_detail_and_sitemap(self):
        article = Article.objects.create(
            title="Test maqola",
            slug="test-maqola",
            excerpt="Qisqa tavsif.",
            body="Maqola matni.",
            status=Article.Status.PUBLISHED,
        )
        list_response = self.client.get("/api/public/articles/")
        self.assertEqual(list_response.status_code, 200)
        slugs = [item["slug"] for item in list_response.json()]
        self.assertIn("test-maqola", slugs)

        detail_response = self.client.get("/api/public/articles/test-maqola/")
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.json()["title"], article.title)
        self.assertIn("body", detail_response.json())

        sitemap_response = self.client.get("/api/public/sitemap.xml")
        sitemap_body = sitemap_response.content.decode()
        self.assertNotIn("/maqolalar", sitemap_body)
        self.assertNotIn("test-maqola", sitemap_body)

        share_response = self.client.get("/api/public/share-preview/?path=/maqolalar/test-maqola/")
        self.assertEqual(share_response.status_code, 200)
        self.assertIn("Test maqola", share_response.content.decode())

    def test_article_sets_published_at_on_publish(self):
        article = Article.objects.create(
            title="Nashr vaqti test",
            slug="nashr-vaqti-test",
            excerpt="Test.",
            body="Matn.",
            status=Article.Status.PUBLISHED,
        )
        self.assertIsNotNone(article.published_at)
