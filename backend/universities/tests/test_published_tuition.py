from django.test import TestCase

from universities.models import University
from universities.published_tuition import (
    curated_short_names,
    effective_contract_pricing,
    lookup_curated_entry,
    tuition_honesty_for_university,
)
from universities.tuition_honesty import build_tuition_honesty


class PublishedTuitionOverlayTests(TestCase):
    def test_catalog_has_twenty_flagship_heis(self):
        self.assertEqual(len(curated_short_names()), 20)

    def test_lookup_by_short_name(self):
        entry = lookup_curated_entry(short_name="TDIU")
        self.assertIsNotNone(entry)
        self.assertIn("Davlat", entry["catalog_reference"])
        self.assertIn("kontrakt", entry["source_url"].lower())

    def test_effective_pricing_promotes_to_published_catalog(self):
        university = University(
            short_name="TDIU",
            slug="tdiu",
            contract_pricing={
                "academic_year": "2025/2026",
                "currency": "UZS",
                "source": "national_base_2025_2026",
                "forms": [
                    {
                        "code": "kunduzgi",
                        "label": "Kunduzgi",
                        "average_uzs": 12_070_000,
                    }
                ],
                "note": "Old note.",
            },
        )
        merged = effective_contract_pricing(university)
        self.assertEqual(merged["source"], "published_catalog")
        self.assertEqual(merged["forms"][0]["average_uzs"], 12_070_000)
        self.assertIn("Vazirlik", merged["note"])
        self.assertEqual(merged["source_url"], "https://kontrakt.edu.uz/")

    def test_honesty_payload_includes_catalog_metadata(self):
        university = University(
            short_name="WIUT",
            slug="wiut",
            contract_pricing={
                "source": "estimated_international",
                "forms": [
                    {
                        "code": "kunduzgi",
                        "label": "Kunduzgi",
                        "average_uzs": 17_940_000,
                    }
                ],
            },
        )
        honesty = tuition_honesty_for_university(university)
        self.assertEqual(honesty["disclaimer_kind"], "published_catalog")
        self.assertEqual(honesty["badge_label"], "Katalog")
        self.assertEqual(honesty["source_url"], "https://www.wiut.uz/")
        self.assertEqual(honesty["published_at"], "2025-07-01")

    def test_non_curated_hei_unchanged(self):
        university = University(
            short_name="O'zXIA",
            slug="ozxia",
            contract_pricing={
                "source": "national_base_2025_2026",
                "forms": [{"code": "kunduzgi", "average_uzs": 8_150_000}],
            },
        )
        merged = effective_contract_pricing(university)
        self.assertEqual(merged["source"], "national_base_2025_2026")
        honesty = build_tuition_honesty(merged)
        self.assertEqual(honesty["disclaimer_kind"], "national_estimate")
