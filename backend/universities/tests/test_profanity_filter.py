from django.test import SimpleTestCase, override_settings
from rest_framework import serializers

from universities.profanity_filter import find_profanity, match_moderation_text
from universities.profanity_policy import PROFANITY_REJECTION_MESSAGE
from universities.review_validation import validate_review_text


class ProfanityFilterTests(SimpleTestCase):
    def test_detects_ahmoq_variants(self):
        for sample in ("ahmoq", "axmoq", "ahmoqq", "a-h-m-o-q", "Bu odam ahmoq ekan"):
            match = find_profanity(sample)
            self.assertIsNotNone(match, sample)
            self.assertEqual(match.term, "ahmoq")

    def test_detects_inflected_forms(self):
        self.assertEqual(find_profanity("ahmoqlar").term, "ahmoq")
        self.assertEqual(find_profanity("eshakdek").term, "eshak")
        self.assertEqual(find_profanity("durakami").term, "durak")
        self.assertEqual(find_profanity("fucking awful").term, "fuck")

    def test_clean_text_passes(self):
        text = "O'qish muhiti yaxshi, ustozlar yordam beradi va kutubxona qulay."
        self.assertIsNone(find_profanity(text))
        self.assertFalse(match_moderation_text(text).blocked)

    def test_no_substring_false_positives(self):
        clean = (
            "Dickens romanlari, urodinamika kursi, idiotizm tushunchasi, "
            "retardation in biology, assessment and classic campus, "
            "yaxshi tajriba, eshik qulay, scunthorpe mention."
        )
        self.assertIsNone(find_profanity(clean))

    def test_validate_review_rejects_profanity(self):
        text = "Universitet yomon, u yerda ahmoqlar ko'p va sharoit past."
        with self.assertRaises(serializers.ValidationError) as ctx:
            validate_review_text(text)
        self.assertIn(PROFANITY_REJECTION_MESSAGE, str(ctx.exception.detail))

    def test_validate_review_accepts_clean(self):
        text = "O'qish muhiti yaxshi, ustozlar yordam beradi va kutubxona qulay."
        self.assertEqual(validate_review_text(text), text)

    def test_detects_russian_insult(self):
        match = find_profanity("Bu universitetda faqat duraklar o'qiydi")
        self.assertIsNotNone(match)
        self.assertEqual(match.term, "durak")

    def test_eshik_not_confused_with_eshak(self):
        self.assertIsNone(find_profanity("Binoning eshigi qulay joylashgan"))

    def test_detects_eshak_insult(self):
        match = find_profanity("U eshakdek o'ylaydi")
        self.assertIsNotNone(match)
        self.assertEqual(match.term, "eshak")

    @override_settings(PROFANITY_FILTER_ENABLED=False)
    def test_filter_can_be_disabled(self):
        from universities.profanity_filter import check_text_for_scope
        from universities.profanity_policy import PROFANITY_SCOPE_REVIEWS

        self.assertIsNone(check_text_for_scope("ahmoq so'zi bor matn", PROFANITY_SCOPE_REVIEWS))
