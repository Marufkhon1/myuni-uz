from django.test import SimpleTestCase, override_settings
from rest_framework import serializers

from universities.profanity_filter import (
    STRATEGY_FRAGMENT_JOIN,
    STRATEGY_LETTER_JOIN,
    STRATEGY_WORD,
    ModerationMatchResult,
    find_profanity,
    match_moderation_text,
)
from universities.profanity_policy import PROFANITY_REJECTION_MESSAGE
from universities.review_validation import validate_review_text


class ModerationMatcherTests(SimpleTestCase):
    """Step 4 — word boundary + continuous; hit {blocked, matched}."""

    def test_clean_log_shape(self):
        result = match_moderation_text("O'qish muhiti yaxshi, ustozlar yordam beradi.")
        self.assertFalse(result.blocked)
        self.assertIsNone(result.matched)
        self.assertEqual(result.to_log_dict(), {"blocked": False, "matched": None})
        self.assertEqual(result.to_public_dict(), {"blocked": False})

    def test_hit_log_shape_blocked_matched(self):
        result = match_moderation_text("Bu odam ahmoq ekan")
        self.assertTrue(result.blocked)
        log = result.to_log_dict()
        self.assertEqual(log["blocked"], True)
        self.assertEqual(log["matched"], "ahmoq")
        self.assertEqual(log["strategy"], STRATEGY_WORD)

    def test_public_dict_never_exposes_matched(self):
        result = match_moderation_text("ahmoq")
        public = result.to_public_dict()
        self.assertEqual(
            public,
            {"blocked": True, "detail": PROFANITY_REJECTION_MESSAGE},
        )
        self.assertNotIn("matched", public)
        self.assertNotIn("ahmoq", str(public))

    def test_user_message_never_contains_matched_term(self):
        for sample in ("ahmoq", "durak", "fuck", "сука"):
            result = match_moderation_text(sample)
            self.assertTrue(result.blocked, sample)
            self.assertNotIn(result.matched, result.message)
            self.assertEqual(result.message, PROFANITY_REJECTION_MESSAGE)

    def test_hit_invariant_rejects_matched_in_message(self):
        with self.assertRaises(ValueError):
            ModerationMatchResult(
                blocked=True,
                matched="ahmoq",
                message="Xato: ahmoq topildi",
                strategy=STRATEGY_WORD,
            )

    def test_word_boundary_continuous_hyphen_and_dots(self):
        for sample in ("a-h-m-o-q", "a.h.m.o.q", "ah_moq", "(ahmoq)", "ahmoq."):
            result = match_moderation_text(sample)
            self.assertTrue(result.blocked, sample)
            self.assertEqual(result.matched, "ahmoq")
            self.assertEqual(result.strategy, STRATEGY_WORD)

    def test_letter_join_spaced_obfuscation(self):
        result = match_moderation_text("a h m o q")
        self.assertTrue(result.blocked)
        self.assertEqual(result.matched, "ahmoq")
        self.assertEqual(result.strategy, STRATEGY_LETTER_JOIN)

    def test_fragment_join_short_chunks(self):
        result = match_moderation_text("ah m o q")
        self.assertTrue(result.blocked)
        self.assertEqual(result.matched, "ahmoq")
        self.assertEqual(result.strategy, STRATEGY_FRAGMENT_JOIN)

    def test_variants_blocked(self):
        for sample in ("ahmoq", "axmoq", "ahmoqq", "ahm0q", "аҳмоқ", "AhMoq"):
            result = match_moderation_text(sample)
            self.assertTrue(result.blocked, sample)
            self.assertEqual(result.matched, "ahmoq")

    def test_inflection_word_boundary(self):
        result = match_moderation_text("ahmoqlar ko'p")
        self.assertTrue(result.blocked)
        self.assertEqual(result.matched, "ahmoq")
        self.assertEqual(result.strategy, STRATEGY_WORD)

    def test_no_cross_word_false_positive(self):
        result = match_moderation_text("yaxshi tajriba va qulay sharoit")
        self.assertFalse(result.blocked)

    def test_academic_false_positives_pass(self):
        clean = (
            "Dickens romanlari, urodinamika kursi, idiotizm tushunchasi, "
            "retardation in biology, assessment and classic campus."
        )
        self.assertFalse(match_moderation_text(clean).blocked)

    def test_find_profanity_compat(self):
        self.assertIsNone(find_profanity("Kutubxona qulay va tinch."))
        hit = find_profanity("durak")
        self.assertIsNotNone(hit)
        self.assertEqual(hit.term, "durak")

    def test_api_validation_hides_matched_from_user(self):
        text = "Universitet yomon, u yerda ahmoqlar ko'p va sharoit past."
        with self.assertRaises(serializers.ValidationError) as ctx:
            validate_review_text(text)
        detail = str(ctx.exception.detail)
        self.assertIn(PROFANITY_REJECTION_MESSAGE, detail)
        self.assertNotIn("ahmoq", detail.lower())

    def test_empty_and_none_clean(self):
        self.assertFalse(match_moderation_text(None).blocked)
        self.assertFalse(match_moderation_text("").blocked)
        self.assertFalse(match_moderation_text("   ").blocked)

    @override_settings(PROFANITY_FILTER_ENABLED=False)
    def test_disabled_filter_scope_wrapper(self):
        from universities.profanity_filter import check_text_for_scope
        from universities.profanity_policy import PROFANITY_SCOPE_REVIEWS

        self.assertIsNone(check_text_for_scope("ahmoq matn", PROFANITY_SCOPE_REVIEWS))
        self.assertTrue(match_moderation_text("ahmoq").blocked)
