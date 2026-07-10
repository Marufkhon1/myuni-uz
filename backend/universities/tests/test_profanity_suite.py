"""
Step 7 — bypass + false-positive test to'plami + privacy metrics.
"""

from unittest.mock import patch

from django.test import SimpleTestCase, TestCase, override_settings
from rest_framework import serializers

from universities.models import ProfanityBlockDaily
from universities.profanity_filter import find_profanity, log_moderation_hit, match_moderation_text
from universities.profanity_metrics import blocks_per_day, record_profanity_block, today_block_count
from universities.profanity_policy import PROFANITY_REJECTION_MESSAGE, PROFANITY_SCOPE_REVIEWS
from universities.review_validation import validate_review_text


class ProfanityBypassSuiteTests(SimpleTestCase):
    """Bypass variantlari ushlanishi kerak (FN = regression)."""

    BYPASS_SAMPLES = (
        # canonical + case
        "ahmoq",
        "AxMoQ",
        "AHMOQ",
        "axmoq",
        # elongation
        "ahmoqq",
        "ahmoqqq",
        # separators / letter-join
        "a h m o q",
        "a-h-m-o-q",
        "a.h.m.o.q",
        "a_h_m_o_q",
        "ah m o q",
        "a  h  m  o  q",
        # zero-width / soft hyphen
        "ahm\u200boq",
        "ahm\u00adoq",
        # leet / homoglyph / fullwidth (NFKC)
        "ahm0q",
        "@hmoq",
        "4hmoq",
        "аҳмоқ",
        "ахмоқ",
        "αhmoq",
        "ａｈｍｏｑ",
        # mid-word punctuation / EN leet (noise strip → stem)
        "f.u.c.k",
        "f-u-c-k",
        "sh1t",
        # inflection / sentence
        "ahmoqlar",
        "Bu odam ahmoq ekan",
        "U yerda faqat ahmoqlar",
        # RU / EN lexicon (kirill + lotin)
        "дурак",
        "Duraklar",
        "блять",
        "б л я т ь",
        "blyat",
        "suka",
        "сука",
        "fuck",
        "fucking",
        "shit",
    )

    def test_bypass_variants_are_blocked(self):
        for sample in self.BYPASS_SAMPLES:
            result = match_moderation_text(sample)
            self.assertTrue(result.blocked, msg=f"FN (bypass missed): {sample!r}")
            self.assertIsNotNone(result.matched)
            self.assertNotIn("matched", result.to_public_dict())
            self.assertEqual(result.message, PROFANITY_REJECTION_MESSAGE)
            self.assertNotIn(result.matched, result.message)

    def test_validate_review_rejects_bypass_without_db_noise(self):
        """SimpleTestCase: metrika DB yo'q — validation baribir 400 beradi."""
        text = "Universitetda ahmoqlar ko'p va sharoit umuman yomon."
        self.assertGreaterEqual(len(text), 30)
        with self.assertRaises(serializers.ValidationError) as ctx:
            validate_review_text(text)
        self.assertIn(PROFANITY_REJECTION_MESSAGE, str(ctx.exception.detail))


class ProfanityFalsePositiveSuiteTests(SimpleTestCase):
    """Toza / akademik matnlar o'tishi kerak (FP = regression)."""

    CLEAN_SAMPLES = (
        "O'qish muhiti yaxshi, ustozlar yordam beradi.",
        "yaxshi tajriba va qulay sharoit",
        "Binoning eshigi qulay joylashgan",
        "Dickens romanlarini o'qidik",
        "Urodinamika kursi foydali",
        "Idiotizm tushunchasi psixologiyada",
        "Retardation of growth in biology",
        "Assessment and classic campus architecture",
        "Scunthorpe city mention in lecture",
        "Password cocktail assumption bass",
        "Moliyaviy yordam va amaliyot dasturi",
        "Texnika universiteti laboratoriya",
        "Kutubxona va Wi-Fi tezligi yaxshi",
        "Professor klassik adabiyotni tushuntirdi",
        "Kampus sport zali va ovqatlanish joyi yaxshi",
        "Grant va kontrakt kvotalari shaffof",
        "Talabalar turar joyi toza va xavfsiz",
        "Assotsiatsiya va klublar faol",
        # zoology / farm stemlar insult emas (eshak/chochqa stem-match FP)
        "Eshik oldidagi kutubxona qulay",
        "Klassik campus assessment va architecture",
    )

    def test_clean_samples_pass(self):
        for sample in self.CLEAN_SAMPLES:
            result = match_moderation_text(sample)
            self.assertFalse(result.blocked, msg=f"FP: {sample!r} -> {result.matched!r}")
            self.assertIsNone(find_profanity(sample))


class ProfanityMetricsPrivacyTests(TestCase):
    def test_record_increments_daily_without_raw_text(self):
        record_profanity_block(matched="ahmoq", strategy="word_boundary", scope="reviews")
        record_profanity_block(matched="ahmoq", strategy="word_boundary", scope="reviews")
        record_profanity_block(matched="durak", strategy="word_boundary", scope="reviews")

        self.assertEqual(today_block_count(scope="reviews"), 3)
        rows = list(ProfanityBlockDaily.objects.filter(matched="ahmoq"))
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0].count, 2)
        field_names = {f.name for f in ProfanityBlockDaily._meta.get_fields()}
        self.assertNotIn("text", field_names)
        self.assertNotIn("raw", field_names)
        self.assertNotIn("review", field_names)
        self.assertNotIn("content", field_names)

    def test_log_moderation_hit_records_metric_not_raw(self):
        hit = match_moderation_text("ahmoq")
        self.assertTrue(hit.blocked)
        log_moderation_hit(hit, scope=PROFANITY_SCOPE_REVIEWS)
        self.assertGreaterEqual(today_block_count(scope="reviews"), 1)
        row = ProfanityBlockDaily.objects.get(matched="ahmoq")
        self.assertEqual(row.matched, "ahmoq")
        self.assertTrue(row.strategy)
        self.assertGreaterEqual(row.count, 1)

    def test_validate_review_e2e_records_metric_without_raw(self):
        """Validation → log_moderation_hit → kunlik metrika; xom gap DB da yo'q."""
        raw = "Universitetda ahmoqlar ko'p va sharoit umuman yomon."
        before = today_block_count(scope="reviews")
        with self.assertRaises(serializers.ValidationError) as ctx:
            validate_review_text(raw)
        self.assertIn(PROFANITY_REJECTION_MESSAGE, str(ctx.exception.detail))
        self.assertEqual(today_block_count(scope="reviews"), before + 1)
        for row in ProfanityBlockDaily.objects.all():
            blob = f"{row.matched}|{row.strategy}|{row.scope}|{row.count}"
            self.assertNotIn("universitet", blob.lower())
            self.assertNotIn(raw, blob)

    def test_logger_never_receives_raw_text(self):
        raw = "Bu universitetdagi ahmoqlar haqida uzoq sharh matni"
        hit = match_moderation_text(raw)
        with patch("universities.profanity_filter.logger.info") as mock_info:
            log_moderation_hit(hit, scope=PROFANITY_SCOPE_REVIEWS)
        self.assertTrue(mock_info.called)
        logged = " ".join(str(a) for a in mock_info.call_args[0])
        self.assertNotIn(raw, logged)
        self.assertNotIn("universitetdagi", logged)
        self.assertIn("ahmoq", logged)

    def test_blocks_per_day_shape(self):
        record_profanity_block(matched="ahmoq", strategy="word_boundary")
        series = blocks_per_day(days=3, scope="reviews")
        self.assertEqual(len(series), 3)
        self.assertIn("day", series[-1])
        self.assertIn("total", series[-1])
        self.assertIn("by_matched", series[-1])
        self.assertGreaterEqual(series[-1]["total"], 1)

    def test_empty_matched_ignored(self):
        record_profanity_block(matched="", strategy="x")
        self.assertEqual(ProfanityBlockDaily.objects.count(), 0)

    def test_raw_insult_never_persisted_on_block(self):
        raw = "Bu universitetdagi ahmoqlar haqida uzoq sharh matni"
        hit = match_moderation_text(raw)
        self.assertTrue(hit.blocked)
        log_moderation_hit(hit, scope=PROFANITY_SCOPE_REVIEWS)
        for row in ProfanityBlockDaily.objects.all():
            blob = f"{row.matched}|{row.strategy}|{row.scope}|{row.count}"
            self.assertNotIn("universitet", blob.lower())
            self.assertNotIn("sharh", blob.lower())
            self.assertNotIn(raw, blob)


@override_settings(PROFANITY_FILTER_ENABLED=True)
class ProfanityFindCompatSuite(SimpleTestCase):
    def test_find_profanity_none_on_clean(self):
        self.assertIsNone(find_profanity("Universitet kutubxonasi tinch va qulay."))
