from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from universities.models import Article, Review, ReviewLike, University

User = get_user_model()


class PublicApiTests(TestCase):
    def setUp(self):
        cache.clear()
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
        self.assertEqual(payload["page"], 1)
        self.assertEqual(payload["page_size"], 24)
        self.assertIn("count", payload)
        self.assertIn("total_pages", payload)
        self.assertIn("next", payload)
        self.assertIn("previous", payload)
        self.assertLessEqual(len(payload["results"]), 24)
        self.assertGreaterEqual(payload["count"], 1)

        found = self.client.get(
            "/api/public/universities/",
            {"q": "Public API University", "page_size": 48},
        )
        self.assertEqual(found.status_code, 200)
        self.assertTrue(
            any(item["slug"] == "public-api-university" for item in found.json()["results"])
        )

    def test_public_university_list_pagination(self):
        for index in range(5):
            University.objects.create(
                name=f"Paged University {index}",
                short_name=f"PU{index}",
                location="Toshkent",
                slug=f"paged-university-{index}",
            )
        response = self.client.get(
            "/api/public/universities/",
            {"page": 1, "page_size": 2},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["page"], 1)
        self.assertEqual(payload["page_size"], 2)
        self.assertEqual(len(payload["results"]), 2)
        self.assertGreaterEqual(payload["count"], 6)
        self.assertGreaterEqual(payload["total_pages"], 3)
        self.assertEqual(payload["previous"], None)
        self.assertEqual(payload["next"], 2)

        page_two = self.client.get(
            "/api/public/universities/",
            {"page": 2, "page_size": 2},
        )
        self.assertEqual(page_two.status_code, 200)
        page_two_payload = page_two.json()
        self.assertEqual(page_two_payload["page"], 2)
        self.assertEqual(page_two_payload["previous"], 1)
        first_page_slugs = {item["slug"] for item in payload["results"]}
        second_page_slugs = {item["slug"] for item in page_two_payload["results"]}
        self.assertTrue(first_page_slugs.isdisjoint(second_page_slugs))

    def test_public_related_universities(self):
        self.university.city = "Phase3 Related City"
        self.university.ownership_type = University.OwnershipType.STATE
        self.university.save(update_fields=["city", "ownership_type"])
        same_city = University.objects.create(
            name="Same City Uni",
            short_name="SCU",
            location="Phase3 Related City",
            city="Phase3 Related City",
            ownership_type=University.OwnershipType.PRIVATE,
            slug="same-city-uni",
        )
        University.objects.create(
            name="Same Ownership Uni",
            short_name="SOU",
            location="Toshkent",
            city="Toshkent",
            ownership_type=University.OwnershipType.STATE,
            slug="same-ownership-uni",
        )
        University.objects.create(
            name="Other Uni",
            short_name="OU",
            location="Samarqand",
            city="Samarqand",
            ownership_type=University.OwnershipType.INTERNATIONAL,
            slug="other-uni-related",
        )

        response = self.client.get(
            "/api/public/universities/public-api-university/related/"
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIsInstance(payload, list)
        self.assertLessEqual(len(payload), 4)
        self.assertGreaterEqual(len(payload), 1)
        slugs = [item["slug"] for item in payload]
        self.assertNotIn("public-api-university", slugs)
        # Unique city ranks above ownership/global fill (seeded state peers exist).
        self.assertEqual(slugs[0], same_city.slug)
        self.assertIn("name", payload[0])
        self.assertIn("review_count", payload[0])
        self.assertIn("faculty_count", payload[0])
        self.assertIn("admission_count", payload[0])

        missing = self.client.get("/api/public/universities/missing-slug/related/")
        self.assertEqual(missing.status_code, 404)

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
        self.assertIn("tuition_honesty", payload)
        self.assertIn("disclaimer_kind", payload["tuition_honesty"])
        self.assertIn(payload["tuition_honesty"]["disclaimer_kind"], {
            "national_estimate",
            "estimate",
            "published_catalog",
            "unavailable",
        })

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

    def test_public_share_preview_about_and_contact(self):
        about = self.client.get("/api/public/share-preview/?path=/haqida")
        self.assertEqual(about.status_code, 200)
        about_body = about.content.decode()
        self.assertIn("Biz haqimizda", about_body)
        self.assertIn("og:title", about_body)

        contact = self.client.get("/api/public/share-preview/?path=/aloqa")
        self.assertEqual(contact.status_code, 200)
        self.assertIn("Aloqa", contact.content.decode())

    def test_public_share_preview_rankings_and_report_error(self):
        rankings = self.client.get("/api/public/share-preview/?path=/reyting/2026")
        self.assertEqual(rankings.status_code, 200)
        rankings_body = rankings.content.decode()
        self.assertIn("soft reyting", rankings_body.lower())
        self.assertIn("og:title", rankings_body)

        missing_archive = self.client.get("/api/public/share-preview/?path=/reyting/2010")
        self.assertEqual(missing_archive.status_code, 200)
        missing_body = missing_archive.content.decode().lower()
        self.assertIn("arxiv", missing_body)
        self.assertIn('content="noindex, follow"', missing_body)

        invalid_token = self.client.get("/api/public/share-preview/?path=/reyting/abc")
        self.assertEqual(invalid_token.status_code, 200)
        invalid_body = invalid_token.content.decode().lower()
        self.assertIn('content="noindex, follow"', invalid_body)

        report = self.client.get("/api/public/share-preview/?path=/xato-xabar")
        self.assertEqual(report.status_code, 200)
        self.assertIn("Xato", report.content.decode())

    def test_public_share_preview_university(self):
        response = self.client.get(
            "/api/public/share-preview/?path=/universitet/public-api-university/"
        )
        self.assertEqual(response.status_code, 200)
        body = response.content.decode()
        self.assertIn("Public API University", body)
        self.assertIn("og:description", body)
        self.assertIn("og:image", body)
        self.assertTrue(
            "/images/hero/" in body or "/images/universities/" in body,
            msg="Expected share preview OG image path",
        )

    def test_public_share_preview_university_silos(self):
        reviews = self.client.get(
            "/api/public/share-preview/?path=/universitet/public-api-university/sharhlari"
        )
        self.assertEqual(reviews.status_code, 200)
        reviews_body = reviews.content.decode()
        self.assertIn("sharhlari", reviews_body.lower())
        self.assertIn("Public API University", reviews_body)

        faculties = self.client.get(
            "/api/public/share-preview/?path=/universitet/public-api-university/fakultetlar"
        )
        self.assertEqual(faculties.status_code, 200)
        faculties_body = faculties.content.decode().lower()
        self.assertIn("fakultet", faculties_body)
        self.assertIn("noindex", faculties_body)

        admission = self.client.get(
            "/api/public/share-preview/?path=/universitet/public-api-university/qabul"
        )
        self.assertEqual(admission.status_code, 200)
        admission_body = admission.content.decode().lower()
        self.assertIn("qabul", admission_body)
        self.assertIn("noindex", admission_body)

        sitemap_page = self.client.get("/api/public/share-preview/?path=/sayt-xaritasi")
        self.assertEqual(sitemap_page.status_code, 200)
        self.assertIn("Sayt xaritasi", sitemap_page.content.decode())

        news = self.client.get("/api/public/share-preview/?path=/yangiliklar")
        self.assertEqual(news.status_code, 200)
        self.assertIn("Yangiliklar", news.content.decode())

    def test_public_compare_by_ids(self):
        u2 = University.objects.create(
            name="Compare Two",
            short_name="CT",
            location="Toshkent",
            slug="compare-two",
        )
        u3 = University.objects.create(
            name="Compare Three",
            short_name="C3",
            location="Samarqand",
            slug="compare-three",
        )
        ids = f"{self.university.id},{u2.id},{u3.id}"
        response = self.client.get("/api/public/compare/", {"ids": ids})
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload["universities"]), 3)
        self.assertIn("highlights", payload)

        two = self.client.get(
            "/api/public/compare/",
            {"ids": f"{self.university.id},{u2.id}"},
        )
        self.assertEqual(two.status_code, 200)
        self.assertEqual(len(two.json()["universities"]), 2)

    def test_public_articles_list(self):
        response = self.client.get("/api/public/articles/")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
        payload = response.json()
        slugs = [item["slug"] for item in payload]
        self.assertIn("2026-qabul-tdiu-vs-tatu", slugs)
        self.assertGreaterEqual(len(slugs), 10)
        self.assertTrue(all("kind" in item for item in payload))

    def test_public_articles_filter_by_kind(self):
        guide = Article.objects.create(
            title="Guide kind test",
            slug="guide-kind-test",
            excerpt="Guide.",
            body="Guide body.",
            kind=Article.Kind.GUIDE,
            status=Article.Status.PUBLISHED,
        )
        news = Article.objects.create(
            title="News kind test",
            slug="news-kind-test",
            excerpt="News.",
            body="News body.",
            kind=Article.Kind.NEWS,
            status=Article.Status.PUBLISHED,
        )
        guides = self.client.get("/api/public/articles/", {"kind": "guide"})
        self.assertEqual(guides.status_code, 200)
        guide_slugs = [item["slug"] for item in guides.json()]
        self.assertIn(guide.slug, guide_slugs)
        self.assertNotIn(news.slug, guide_slugs)
        self.assertTrue(all(item["kind"] == "guide" for item in guides.json()))

        news_list = self.client.get("/api/public/articles/", {"kind": "news"})
        self.assertEqual(news_list.status_code, 200)
        news_slugs = [item["slug"] for item in news_list.json()]
        self.assertIn(news.slug, news_slugs)
        self.assertNotIn(guide.slug, news_slugs)

    def test_public_articles_detail_and_sitemap(self):
        article = Article.objects.create(
            title="Test maqola",
            slug="test-maqola",
            excerpt="Qisqa tavsif.",
            body="Maqola matni.",
            status=Article.Status.PUBLISHED,
            kind=Article.Kind.GUIDE,
        )
        news = Article.objects.create(
            title="Test yangilik",
            slug="test-yangilik",
            excerpt="Yangilik.",
            body="Yangilik matni.",
            status=Article.Status.PUBLISHED,
            kind=Article.Kind.NEWS,
        )
        list_response = self.client.get("/api/public/articles/")
        self.assertEqual(list_response.status_code, 200)
        slugs = [item["slug"] for item in list_response.json()]
        self.assertIn("test-maqola", slugs)

        detail_response = self.client.get("/api/public/articles/test-maqola/")
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.json()["title"], article.title)
        self.assertIn("body", detail_response.json())
        self.assertEqual(detail_response.json()["kind"], Article.Kind.GUIDE)

        sitemap_response = self.client.get("/api/public/sitemap.xml")
        sitemap_body = sitemap_response.content.decode()
        self.assertIn("/maqolalar", sitemap_body)
        self.assertIn("/maqolalar/test-maqola", sitemap_body)
        self.assertIn("/yangiliklar", sitemap_body)
        self.assertIn("/yangiliklar/test-yangilik", sitemap_body)
        self.assertNotIn("/maqolalar/test-yangilik", sitemap_body)
        self.assertIn("/sayt-xaritasi", sitemap_body)
        self.assertIn("/stipendiyalar", sitemap_body)
        self.assertIn("/yo-nalishlar", sitemap_body)
        self.assertIn("/hamkorlar", sitemap_body)
        self.assertIn("/qabul-qollanmasi", sitemap_body)
        # Featured city URLs only when at least one matching university exists.
        self.university.city = "Toshkent"
        self.university.save(update_fields=["city"])
        cache.clear()
        sitemap_with_city = self.client.get("/api/public/sitemap.xml").content.decode()
        self.assertIn("/shahar/toshkent", sitemap_with_city)
        self.assertIn("/universitet/public-api-university/sharhlari", sitemap_body)
        self.assertNotIn("/universitet/public-api-university/fakultetlar", sitemap_body)
        self.assertNotIn("/universitet/public-api-university/qabul", sitemap_body)
        self.assertIn("/metodologiya", sitemap_body)
        self.assertIn("/haqida", sitemap_body)
        self.assertIn("/aloqa", sitemap_body)
        self.assertIn("/reyting", sitemap_body)
        self.assertIn("/reyting/2026", sitemap_body)
        self.assertIn("/xato-xabar", sitemap_body)
        self.assertIn("/ishonch-xavfsizlik", sitemap_body)
        self.assertNotIn("/login", sitemap_body)
        self.assertNotIn("/signup", sitemap_body)

        share_response = self.client.get("/api/public/share-preview/?path=/maqolalar/test-maqola/")
        self.assertEqual(share_response.status_code, 200)
        self.assertIn("Test maqola", share_response.content.decode())

        news_on_guide_path = self.client.get(
            "/api/public/share-preview/?path=/maqolalar/test-yangilik/"
        )
        self.assertEqual(news_on_guide_path.status_code, 404)

        news_share = self.client.get(
            "/api/public/share-preview/?path=/yangiliklar/test-yangilik/"
        )
        self.assertEqual(news_share.status_code, 200)
        self.assertIn("Test yangilik", news_share.content.decode())

        guide_ok = self.client.get("/api/public/articles/test-maqola/", {"kind": "guide"})
        self.assertEqual(guide_ok.status_code, 200)
        news_as_guide = self.client.get("/api/public/articles/test-yangilik/", {"kind": "guide"})
        self.assertEqual(news_as_guide.status_code, 404)
        guide_as_news = self.client.get("/api/public/articles/test-maqola/", {"kind": "news"})
        self.assertEqual(guide_as_news.status_code, 404)

    def test_public_university_reviews_pagination(self):
        response = self.client.get(
            "/api/public/universities/public-api-university/reviews/",
            {"page": 1, "page_size": 10},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["count"], 1)
        self.assertEqual(payload["page"], 1)
        self.assertEqual(len(payload["results"]), 1)

    def test_public_articles_detail_resolves_legacy_cover_paths(self):
        article = Article.objects.create(
            title="Cover test",
            slug="cover-test-maqola",
            excerpt="Qisqa.",
            body="Matn.",
            cover_image="/images/campuses/campus-02.jpg",
            status=Article.Status.PUBLISHED,
        )
        response = self.client.get("/api/public/articles/cover-test-maqola/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["cover_image"], "/images/universities/tdiu.jpg")

    def test_public_programs_and_city_pages(self):
        from django.db.models import Q

        from universities.models import Faculty, StudyDirection

        self.university.city = "Toshkent"
        self.university.save(update_fields=["city"])
        faculty = Faculty.objects.create(
            university=self.university,
            name="Iqtisodiyot",
            slug="iqtisodiyot",
        )
        unique_name = "Phase5 Test Moliya Dasturi"
        StudyDirection.objects.create(
            faculty=faculty,
            name=unique_name,
            slug="phase5-test-moliya",
            degree_level=StudyDirection.DegreeLevel.BACHELOR,
        )

        programs = self.client.get("/api/public/programs/", {"q": "Phase5 Test Moliya"})
        self.assertEqual(programs.status_code, 200)
        payload = programs.json()
        self.assertGreaterEqual(payload["count"], 1)
        match = next((row for row in payload["results"] if row["name"] == unique_name), None)
        self.assertIsNotNone(match)
        self.assertEqual(match["university"]["slug"], "public-api-university")

        by_degree = self.client.get("/api/public/programs/", {"degree": "bachelor", "q": "Phase5 Test"})
        self.assertEqual(by_degree.status_code, 200)
        self.assertGreaterEqual(by_degree.json()["count"], 1)

        by_city = self.client.get("/api/public/programs/", {"city": "Toshkent", "q": "Phase5 Test"})
        self.assertEqual(by_city.status_code, 200)
        self.assertGreaterEqual(by_city.json()["count"], 1)

        # Second university to exercise city pagination (page_size=1 → total_pages≥2).
        other = University.objects.create(
            name="Phase5 Second Uni",
            short_name="P5S",
            location="Toshkent",
            city="Toshkent",
            founded_year=2001,
            slug="phase5-second-uni",
        )
        city = self.client.get("/api/public/cities/toshkent/", {"page_size": 1, "page": 1})
        self.assertEqual(city.status_code, 200)
        city_payload = city.json()
        self.assertEqual(city_payload["city"], "Toshkent")
        self.assertGreaterEqual(city_payload["count"], 2)
        self.assertEqual(len(city_payload["results"]), 1)
        self.assertGreaterEqual(city_payload["total_pages"], 2)
        self.assertEqual(city_payload["page"], 1)
        page_two = self.client.get("/api/public/cities/toshkent/", {"page_size": 1, "page": 2})
        self.assertEqual(page_two.status_code, 200)
        self.assertEqual(page_two.json()["page"], 2)
        self.assertEqual(len(page_two.json()["results"]), 1)
        self.assertNotEqual(
            city_payload["results"][0]["slug"],
            page_two.json()["results"][0]["slug"],
        )

        missing = self.client.get("/api/public/cities/not-a-city/")
        self.assertEqual(missing.status_code, 404)

        share = self.client.get("/api/public/share-preview/?path=/stipendiyalar")
        self.assertEqual(share.status_code, 200)
        self.assertIn("Stipendiya", share.content.decode())

        city_share = self.client.get("/api/public/share-preview/?path=/shahar/toshkent")
        self.assertEqual(city_share.status_code, 200)
        share_html = city_share.content.decode()
        self.assertIn("Toshkent", share_html)
        self.assertIn('name="robots" content="index, follow"', share_html)

        # Empty featured city → share-preview noindex (robots match FE empty city).
        University.objects.filter(
            Q(city__iexact="Nukus") | Q(location__icontains="Nukus")
        ).update(city="", location="Andijon viloyati")
        cache.clear()
        empty_share = self.client.get("/api/public/share-preview/?path=/shahar/nukus")
        self.assertEqual(empty_share.status_code, 200)
        self.assertIn('name="robots" content="noindex, follow"', empty_share.content.decode())

        # Sitemap omits empty cities; includes populated ones.
        cache.clear()
        sitemap_body = self.client.get("/api/public/sitemap.xml").content.decode()
        self.assertIn("/shahar/toshkent", sitemap_body)
        self.assertNotIn("/shahar/nukus", sitemap_body)

    def test_article_sets_published_at_on_publish(self):
        article = Article.objects.create(
            title="Nashr vaqti test",
            slug="nashr-vaqti-test",
            excerpt="Test.",
            body="Matn.",
            status=Article.Status.PUBLISHED,
        )
        self.assertIsNotNone(article.published_at)
