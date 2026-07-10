"""
Step 8 — chat scope + fuzzy + toxicity (ambiguous only) — hardened.
"""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase, override_settings
from rest_framework import serializers
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile
from universities.chat_reply_format import REPLY_END, REPLY_START, extract_chat_moderation_text
from universities.chat_validation import validate_chat_text
from universities.models import (
    ChatMembership,
    ChatMessage,
    DirectMessage,
    DirectThread,
    ProfanityBlockDaily,
    University,
)
from universities.profanity_dictionary import clear_lexicon_cache
from universities.profanity_filter import STRATEGY_FUZZY, STRATEGY_WORD, match_moderation_text
from universities.profanity_fuzzy import find_fuzzy_candidate, levenshtein_at_most
from universities.profanity_policy import (
    ACTIVE_PROFANITY_SCOPES,
    PROFANITY_REJECTION_MESSAGE,
    PROFANITY_SCOPE_CHAT,
    PROFANITY_SCOPE_REVIEWS,
)
from universities.profanity_toxicity import confirm_ambiguous_block, heuristic_toxicity_score


User = get_user_model()


class ProfanityScopeStep8Tests(SimpleTestCase):
    def test_chat_scope_active(self):
        self.assertIn(PROFANITY_SCOPE_CHAT, ACTIVE_PROFANITY_SCOPES)
        self.assertIn(PROFANITY_SCOPE_REVIEWS, ACTIVE_PROFANITY_SCOPES)


class FuzzyMatcherUnitTests(SimpleTestCase):
    def test_levenshtein_one(self):
        self.assertEqual(levenshtein_at_most("pastkasj", "pastkash", limit=1), 1)
        self.assertIsNone(levenshtein_at_most("abc", "xyz", limit=1))

    def test_short_stems_skipped(self):
        cand = find_fuzzy_candidate(
            "fucx",
            ("fuck", "pastkash"),
            whitelist=frozenset(),
            min_stem_len=5,
        )
        self.assertIsNone(cand)

    def test_high_confidence_long_stem(self):
        cand = find_fuzzy_candidate(
            "pastkasj",
            ("pastkash", "ahmoq", "bezori"),
            whitelist=frozenset(),
        )
        self.assertIsNotNone(cand)
        self.assertEqual(cand.matched, "pastkash")
        self.assertEqual(cand.confidence, "high")

    def test_six_letter_stem_is_medium_not_high(self):
        cand = find_fuzzy_candidate(
            "bezora",
            ("bezori",),
            whitelist=frozenset(),
        )
        self.assertIsNotNone(cand)
        self.assertEqual(cand.confidence, "medium")


class ToxicityGateTests(SimpleTestCase):
    def test_exact_path_does_not_call_toxicity(self):
        with patch("universities.profanity_toxicity.score_toxicity") as mock_score:
            result = match_moderation_text("ahmoq")
        self.assertTrue(result.blocked)
        self.assertEqual(result.strategy, STRATEGY_WORD)
        mock_score.assert_not_called()

    def test_high_fuzzy_blocks_without_ml(self):
        with override_settings(PROFANITY_TOXICITY_BACKEND="none", PROFANITY_FUZZY_ENABLED=True):
            result = match_moderation_text("pastkasj")
        self.assertTrue(result.blocked)
        self.assertEqual(result.strategy, STRATEGY_FUZZY)
        self.assertEqual(result.matched, "pastkash")

    def test_medium_fuzzy_allowed_without_toxicity(self):
        with override_settings(PROFANITY_TOXICITY_BACKEND="none", PROFANITY_FUZZY_ENABLED=True):
            result = match_moderation_text("ahmok")
        self.assertFalse(result.blocked)

    def test_medium_fuzzy_blocked_when_toxicity_high(self):
        with override_settings(
            PROFANITY_TOXICITY_BACKEND="callable",
            PROFANITY_TOXICITY_CALLABLE="universities.tests.test_profanity_step8._high_tox",
            PROFANITY_TOXICITY_THRESHOLD=0.5,
            PROFANITY_FUZZY_ENABLED=True,
        ):
            result = match_moderation_text("ahmok")
        self.assertTrue(result.blocked)
        self.assertEqual(result.strategy, STRATEGY_FUZZY)

    def test_high_fuzzy_soft_cleared_when_toxicity_very_low(self):
        with override_settings(
            PROFANITY_TOXICITY_BACKEND="callable",
            PROFANITY_TOXICITY_CALLABLE="universities.tests.test_profanity_step8._low_tox",
            PROFANITY_FUZZY_HIGH_MIN_SCORE=0.25,
            PROFANITY_FUZZY_ENABLED=True,
        ):
            result = match_moderation_text("pastkasj")
        self.assertFalse(result.blocked)

    def test_confirm_high_without_score_blocks(self):
        with override_settings(PROFANITY_TOXICITY_BACKEND="none"):
            self.assertTrue(
                confirm_ambiguous_block(text="x", matched="pastkash", confidence="high")
            )

    def test_heuristic_score_bounded(self):
        score = heuristic_toxicity_score("a.h.m.0.q!!")
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 1.0)


def _high_tox(_text: str) -> float:
    return 0.95


def _low_tox(_text: str) -> float:
    return 0.1


class FuzzyFalsePositiveTests(SimpleTestCase):
    def setUp(self):
        clear_lexicon_cache()

    def tearDown(self):
        clear_lexicon_cache()

    def test_clean_and_neighbor_words_not_fuzzy_blocked(self):
        samples = (
            "campus",
            "classic",
            "hello",
            "kutubxona",
            "professor",
            "yaxshi",
            "bozori",
            "regard",
            "reward",
            "sucker",
            "In this regard the campus is fine",
            "Great reward for students",
            "Universitet yonidagi bozori qulay",
        )
        for sample in samples:
            with override_settings(PROFANITY_FUZZY_ENABLED=True, PROFANITY_TOXICITY_BACKEND="heuristic"):
                result = match_moderation_text(sample)
            self.assertFalse(result.blocked, msg=f"FP fuzzy: {sample!r} -> {result.matched}")


class InflectionFalseNegativeTests(SimpleTestCase):
    def test_uzbek_person_suffixes_blocked(self):
        for sample in ("ahmoqsan", "ahmoqsiz", "Sen ahmoqsan", "tentaksan", "duraksan"):
            result = match_moderation_text(sample)
            self.assertTrue(result.blocked, msg=f"FN: {sample!r}")


class ChatReplyEnvelopeTests(SimpleTestCase):
    def test_extract_body_only(self):
        raw = f'{REPLY_START}{{"id":1,"author":"A","text":"ahmoq"}}{REPLY_END}\nSalom do\'st'
        self.assertEqual(extract_chat_moderation_text(raw), "Salom do'st")

    def test_reply_with_quoted_insult_allows_clean_body(self):
        raw = f'{REPLY_START}{{"id":1,"author":"A","text":"ahmoq"}}{REPLY_END}\nRoziman, uchrashamiz'
        validate_chat_text(raw)

    def test_reply_with_dirty_body_still_blocked(self):
        raw = f'{REPLY_START}{{"id":1,"author":"A","text":"salom"}}{REPLY_END}\nahmoq'
        with self.assertRaises(serializers.ValidationError):
            validate_chat_text(raw)


class ChatValidationTests(SimpleTestCase):
    def test_chat_rejects_profanity(self):
        with self.assertRaises(serializers.ValidationError) as ctx:
            validate_chat_text("Bu yerda ahmoqlar ko'p")
        self.assertIn(PROFANITY_REJECTION_MESSAGE, str(ctx.exception.detail))

    def test_chat_allows_clean(self):
        text = validate_chat_text("Salom, bugun kutubxonada uchrashamizmi?")
        self.assertIn("kutubxona", text)


@override_settings(PROFANITY_FILTER_ENABLED=True)
class ChatApiProfanityTests(TestCase):
    def setUp(self):
        clear_lexicon_cache()
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="chatmod@uni.test",
            email="chatmod@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=self.user,
            role=Profile.Role.STUDENT,
            full_name="Chat Mod",
            university="Chat Uni",
        )
        self.other = User.objects.create_user(
            username="chatpeer@uni.test",
            email="chatpeer@uni.test",
            password="test-pass-123",
        )
        Profile.objects.create(
            user=self.other,
            role=Profile.Role.STUDENT,
            full_name="Peer",
            university="Chat Uni",
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.university = University.objects.create(
            name="Chat Filter University",
            short_name="CFU",
            location="Toshkent",
            founded_year=2012,
        )
        ChatMembership.objects.create(user=self.user, university=self.university)
        self.thread = DirectThread.objects.create(user_one=self.user, user_two=self.other)

    def tearDown(self):
        clear_lexicon_cache()

    def test_group_message_blocked_records_chat_scope(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post(
            f"/api/universities/{self.university.id}/messages/",
            {"text": "Siz ahmoq ekansiz"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn(PROFANITY_REJECTION_MESSAGE, str(response.data))
        self.assertEqual(ChatMessage.objects.count(), 0)
        self.assertTrue(ProfanityBlockDaily.objects.filter(scope="chat", matched="ahmoq").exists())

    def test_group_message_clean_ok(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post(
            f"/api/universities/{self.university.id}/messages/",
            {"text": "Bugun seminar soat 3 da boshlanadi."},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ChatMessage.objects.count(), 1)

    def test_direct_message_blocked(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post(
            f"/api/universities/directs/{self.thread.id}/messages/",
            {"text": "durak"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn(PROFANITY_REJECTION_MESSAGE, str(response.data))

    def test_edit_group_message_blocked(self):
        msg = ChatMessage.objects.create(
            university=self.university,
            user=self.user,
            text="Dastlabki toza xabar matni.",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.patch(
            f"/api/universities/messages/{msg.id}/edit/",
            {"text": "Endi ahmoq deb yozdim"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        msg.refresh_from_db()
        self.assertEqual(msg.text, "Dastlabki toza xabar matni.")

    def test_edit_direct_message_blocked(self):
        msg = DirectMessage.objects.create(
            thread=self.thread,
            sender=self.user,
            text="Dastlabki toza DM matni.",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.patch(
            f"/api/universities/directs/messages/{msg.id}/edit/",
            {"text": "durak"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        msg.refresh_from_db()
        self.assertEqual(msg.text, "Dastlabki toza DM matni.")
