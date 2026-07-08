from django.test import TestCase

from universities.tuition_honesty import build_tuition_honesty, tuition_compare_fields


class TuitionHonestyTests(TestCase):
    def test_national_base_maps_to_national_estimate(self):
        payload = build_tuition_honesty(
            {
                "academic_year": "2025/2026",
                "currency": "UZS",
                "source": "national_base_2025_2026",
                "note": "Davlat bazasi note.",
                "forms": [
                    {
                        "code": "kunduzgi",
                        "label": "Kunduzgi",
                        "average_uzs": 8_150_000,
                        "min_uzs": 7_400_000,
                        "max_uzs": 8_950_000,
                    }
                ],
            }
        )
        self.assertTrue(payload["available"])
        self.assertEqual(payload["disclaimer_kind"], "national_estimate")
        self.assertEqual(payload["badge_label"], "Taxmin (davlat bazasi)")
        self.assertEqual(payload["primary"]["code"], "kunduzgi")
        self.assertEqual(payload["primary"]["average_uzs"], 8_150_000)

    def test_private_estimate(self):
        payload = build_tuition_honesty(
            {
                "source": "estimated_private",
                "forms": [
                    {"code": "kunduzgi", "label": "Kunduzgi", "average_uzs": 13_520_000}
                ],
                "note": "Private note.",
            }
        )
        self.assertEqual(payload["disclaimer_kind"], "estimate")
        self.assertEqual(payload["badge_label"], "Taxminiy")

    def test_empty_is_unavailable(self):
        payload = build_tuition_honesty({})
        self.assertFalse(payload["available"])
        self.assertEqual(payload["disclaimer_kind"], "unavailable")
        self.assertIsNone(payload["primary"])

    def test_published_catalog_maps_to_katalog_badge(self):
        payload = build_tuition_honesty(
            {
                "source": "published_catalog",
                "source_url": "https://kontrakt.edu.uz/",
                "published_at": "2025-06-15",
                "catalog_reference": "Davlat tariflari",
                "forms": [
                    {"code": "kunduzgi", "label": "Kunduzgi", "average_uzs": 10_500_000}
                ],
                "note": "Rasmiy katalog.",
            }
        )
        self.assertEqual(payload["disclaimer_kind"], "published_catalog")
        self.assertEqual(payload["badge_label"], "Katalog")
        self.assertEqual(payload["source_url"], "https://kontrakt.edu.uz/")
        self.assertEqual(payload["published_at"], "2025-06-15")

    def test_compare_fields_include_primary_average(self):
        fields = tuition_compare_fields(
            {
                "source": "estimated_international",
                "academic_year": "2025/2026",
                "forms": [
                    {
                        "code": "sirtqi",
                        "label": "Sirtqi",
                        "average_uzs": 10_000_000,
                        "min_uzs": 9_000_000,
                        "max_uzs": 11_000_000,
                    },
                    {
                        "code": "kunduzgi",
                        "label": "Kunduzgi",
                        "average_uzs": 17_940_000,
                        "min_uzs": 15_000_000,
                        "max_uzs": 20_000_000,
                    },
                ],
            }
        )
        self.assertTrue(fields["tuition_available"])
        self.assertEqual(fields["tuition_primary_label"], "Kunduzgi")
        self.assertEqual(fields["tuition_primary_average_uzs"], 17_940_000)
        self.assertEqual(fields["tuition_disclaimer_kind"], "estimate")
