from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings
from io import StringIO
import json
import tempfile
from pathlib import Path

from universities.profanity_dictionary import clear_lexicon_cache
from universities.profanity_filter import find_profanity


class AddProfanityTermCommandTests(TestCase):
    def _temp_lexicon(self, payload: dict):
        tmp = tempfile.TemporaryDirectory()
        path = Path(tmp.name) / "lex.json"
        path.write_text(json.dumps(payload), encoding="utf-8")
        return tmp, path

    def test_add_term_dry_run_and_persist_canonical(self):
        payload = {
            "version": 1,
            "schema": "myuni.profanity_lexicon.v1",
            "min_term_length": 4,
            "banned": {"uz": ["ahmoq"], "ru": [], "en": []},
            "whitelist": [],
        }
        tmp, path = self._temp_lexicon(payload)
        with tmp, override_settings(PROFANITY_LEXICON_PATH=str(path)):
            clear_lexicon_cache()
            out = StringIO()
            call_command(
                "add_profanity_term",
                "Tentak",
                "--lang",
                "uz",
                "--dry-run",
                stdout=out,
            )
            self.assertIn("DRY-RUN", out.getvalue())
            data = json.loads(path.read_text(encoding="utf-8"))
            self.assertNotIn("tentak", data["banned"]["uz"])

            out2 = StringIO()
            call_command("add_profanity_term", "Tentak", "--lang", "uz", stdout=out2)
            clear_lexicon_cache()
            data = json.loads(path.read_text(encoding="utf-8"))
            self.assertIn("tentak", data["banned"]["uz"])
            self.assertNotIn("Tentak", data["banned"]["uz"])
            self.assertIsNotNone(find_profanity("tentak"))
            self.assertIn("Moderator jarayoni", out2.getvalue())

    def test_duplicate_term_is_noop(self):
        payload = {
            "version": 1,
            "schema": "myuni.profanity_lexicon.v1",
            "min_term_length": 4,
            "banned": {"uz": ["ahmoq"], "ru": [], "en": []},
            "whitelist": [],
        }
        tmp, path = self._temp_lexicon(payload)
        with tmp, override_settings(PROFANITY_LEXICON_PATH=str(path)):
            clear_lexicon_cache()
            out = StringIO()
            call_command("add_profanity_term", "ahmoq", "--lang", "uz", stdout=out)
            self.assertIn("Allaqachon", out.getvalue())
            data = json.loads(path.read_text(encoding="utf-8"))
            self.assertEqual(data["banned"]["uz"].count("ahmoq"), 1)

    def test_whitelist_add(self):
        payload = {
            "version": 1,
            "schema": "myuni.profanity_lexicon.v1",
            "min_term_length": 4,
            "banned": {"uz": ["ahmoq"], "ru": [], "en": []},
            "whitelist": [],
        }
        tmp, path = self._temp_lexicon(payload)
        with tmp, override_settings(PROFANITY_LEXICON_PATH=str(path)):
            clear_lexicon_cache()
            call_command("add_profanity_term", "scunthorpe", "--whitelist", stdout=StringIO())
            data = json.loads(path.read_text(encoding="utf-8"))
            self.assertIn("scunthorpe", data["whitelist"])

    def test_short_term_rejected(self):
        payload = {
            "version": 1,
            "schema": "myuni.profanity_lexicon.v1",
            "min_term_length": 4,
            "banned": {"uz": ["ahmoq"], "ru": [], "en": []},
            "whitelist": [],
        }
        tmp, path = self._temp_lexicon(payload)
        with tmp, override_settings(PROFANITY_LEXICON_PATH=str(path)):
            clear_lexicon_cache()
            with self.assertRaises(CommandError):
                call_command("add_profanity_term", "ab", "--lang", "uz")


class ProfanityStatsCommandTests(TestCase):
    def test_stats_command_runs(self):
        from universities.profanity_metrics import record_profanity_block

        record_profanity_block(matched="ahmoq", strategy="word_boundary")
        out = StringIO()
        call_command("profanity_stats", "--days", "3", stdout=out)
        text = out.getvalue()
        self.assertIn("Bugun=", text)
        self.assertIn("ahmoq", text)
        self.assertIn("block", text.lower())

    def test_stats_scope_filter(self):
        from universities.profanity_metrics import record_profanity_block

        record_profanity_block(matched="ahmoq", strategy="word_boundary", scope="reviews")
        record_profanity_block(matched="ahmoq", strategy="word_boundary", scope="chat")
        out = StringIO()
        call_command("profanity_stats", "--days", "1", "--scope", "reviews", stdout=out)
        self.assertIn("Scope=reviews", out.getvalue())
        self.assertIn("Bugun=1", out.getvalue())


class ValidateAndReloadCommandTests(TestCase):
    def test_validate_command(self):
        out = StringIO()
        call_command("validate_profanity_lexicon", stdout=out)
        text = out.getvalue()
        self.assertIn("OK schema=", text)
        self.assertIn("Round-trip", text)

    def test_reload_command(self):
        out = StringIO()
        call_command("reload_profanity_lexicon", stdout=out)
        self.assertIn("Reloaded", out.getvalue())
