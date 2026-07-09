from django.test import SimpleTestCase

from universities.article_covers import resolve_article_cover_image


class ArticleCoverResolutionTests(SimpleTestCase):
    def test_legacy_campus_paths_map_to_bundled_assets(self):
        self.assertEqual(
            resolve_article_cover_image("/images/campuses/campus-02.jpg"),
            "/images/universities/tdiu.jpg",
        )

    def test_slug_specific_cover_takes_priority(self):
        self.assertEqual(
            resolve_article_cover_image("/images/campuses/campus-03.jpg", "2026-qabul-tsu-vs-tdtu"),
            "/images/universities/ozmu.jpg",
        )

    def test_empty_cover_falls_back_to_default(self):
        self.assertEqual(resolve_article_cover_image(""), "/images/hero/landing-campus.jpg")

    def test_absolute_url_normalizes_to_local_path(self):
        self.assertEqual(
            resolve_article_cover_image("https://myuni.uz/images/universities/tdiu.jpg"),
            "/images/universities/tdiu.jpg",
        )
