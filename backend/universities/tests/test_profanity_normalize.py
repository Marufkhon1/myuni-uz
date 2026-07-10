from django.test import SimpleTestCase

from universities.profanity_normalize import (
    NORMALIZATION_STEP_COUNT,
    NORMALIZATION_STEPS,
    normalize_for_moderation,
    normalize_for_profanity,
    normalize_steps,
    normalize_token,
)


class NormalizeForModerationTests(SimpleTestCase):
    def test_pipeline_has_seven_named_steps(self):
        self.assertEqual(NORMALIZATION_STEP_COUNT, 7)
        self.assertEqual(len(NORMALIZATION_STEPS), 7)

    def test_ahmoq_canonical(self):
        self.assertEqual(normalize_for_moderation("ahmoq"), "ahmoq")

    def test_axmoq_maps_x_to_h(self):
        self.assertEqual(normalize_for_moderation("axmoq"), "ahmoq")

    def test_ahmoqq_stretch_keeps_max_two(self):
        # 2 takror saqlanadi; 3+ → 2 (matcher qo'shimcha q ni ushlaydi)
        self.assertEqual(normalize_for_moderation("ahmoqq"), "ahmoqq")
        self.assertEqual(normalize_for_moderation("ahmoqqq"), "ahmoqq")
        self.assertEqual(normalize_for_moderation("ahmoqqqq"), "ahmoqq")

    def test_spaced_and_hyphenated_join(self):
        self.assertEqual(normalize_for_moderation("a h m o q"), "ahmoq")
        self.assertEqual(normalize_for_moderation("a-h-m-o-q"), "ahmoq")
        self.assertEqual(normalize_for_moderation("a_h_m_o_q"), "ahmoq")
        self.assertEqual(normalize_for_moderation("a*h*m*o*q"), "ahmoq")

    def test_leet_and_case(self):
        self.assertEqual(normalize_for_moderation("AhMoq"), "ahmoq")
        self.assertEqual(normalize_for_moderation("ahm0q"), "ahmoq")
        self.assertEqual(normalize_for_moderation("@hmoq"), "ahmoq")
        self.assertEqual(normalize_for_moderation("4hmoq"), "ahmoq")

    def test_cyrillic_uzbek(self):
        self.assertEqual(normalize_for_moderation("аҳмоқ"), "ahmoq")
        self.assertEqual(normalize_for_moderation("ахмоқ"), "ahmoq")

    def test_all_ahmoq_bypass_variants_share_stem(self):
        samples = [
            "ahmoq",
            "AxMoq",
            "axmoq",
            "ahmoqq",
            "ahmoqqq",
            "a h m o q",
            "a-h-m-o-q",
            "ahm0q",
            "аҳмоқ",
            "ахмоқ",
            "a‌h‌m‌o‌q",  # zero-width
        ]
        for sample in samples:
            value = normalize_for_moderation(sample)
            self.assertTrue(
                value == "ahmoq" or value.startswith("ahmoq"),
                msg=f"{sample!r} → {value!r}",
            )

    def test_clean_review_text_keeps_readable_letters(self):
        text = "O'qish muhiti yaxshi, ustozlar yordam beradi."
        value = normalize_for_moderation(text)
        self.assertIn("oqish", value)
        self.assertIn("yahshi", value)  # x→h
        self.assertNotIn("ahmoq", value)
        self.assertNotIn(" ", value)
        self.assertNotIn("'", value)

    def test_clean_text_does_not_invent_profanity(self):
        text = "Universitet kutubxonasi qulay va amaliyot yaxshi."
        value = normalize_for_moderation(text)
        for banned_stem in ("ahmoq", "durak", "fuck", "shit", "suka"):
            self.assertNotIn(banned_stem, value)

    def test_edge_none_and_empty(self):
        self.assertEqual(normalize_for_moderation(None), "")
        self.assertEqual(normalize_for_moderation(""), "")
        self.assertEqual(normalize_for_moderation("   "), "")

    def test_edge_zero_width_and_bom(self):
        self.assertEqual(normalize_for_moderation("\ufeffahmoq"), "ahmoq")
        self.assertEqual(normalize_for_moderation("ahm\u200boq"), "ahmoq")
        self.assertEqual(normalize_for_moderation("ahm\u00adoq"), "ahmoq")

    def test_edge_fullwidth_nfkc(self):
        # ａｈｍｏｑ (fullwidth) → ahmoq
        fullwidth = "ａｈｍｏｑ"
        self.assertEqual(normalize_for_moderation(fullwidth), "ahmoq")

    def test_edge_apostrophe_variants(self):
        self.assertEqual(normalize_for_moderation("o‘qish"), "oqish")
        self.assertEqual(normalize_for_moderation("o'qish"), "oqish")
        self.assertEqual(normalize_for_moderation("o`qish"), "oqish")

    def test_russian_insult_normalizes(self):
        self.assertEqual(normalize_for_moderation("Дурак"), "durak")
        self.assertEqual(normalize_for_moderation("дурак"), "durak")

    def test_aliases_match_primary(self):
        sample = "a-h-m-o-q"
        primary = normalize_for_moderation(sample)
        self.assertEqual(normalize_for_profanity(sample), primary)
        self.assertEqual(normalize_token(sample), primary)

    def test_normalize_steps_exposes_each_stage(self):
        steps = normalize_steps("AxMoq")
        self.assertEqual(steps["output"], "ahmoq")
        self.assertEqual(steps["casefold"], "axmoq")
        self.assertIn("ahmoq", steps["uzbek_spelling"])
        for name in NORMALIZATION_STEPS:
            self.assertIn(name, steps)
