import json
import tempfile
from pathlib import Path

from django.test import SimpleTestCase, override_settings

from universities.profanity_dictionary import (
    DEFAULT_LEXICON_PATH,
    ProfanityLexiconError,
    clear_lexicon_cache,
    ensure_lexicon_loaded,
    get_lexicon,
    load_lexicon_from_path,
    parse_lexicon_payload,
    validate_lexicon_roundtrip,
)
from universities.profanity_filter import find_profanity, reload_profanity_lexicon


class ProfanityLexiconV1Tests(SimpleTestCase):
    def setUp(self):
        clear_lexicon_cache()

    def tearDown(self):
        clear_lexicon_cache()

    def test_default_lexicon_file_exists(self):
        self.assertTrue(DEFAULT_LEXICON_PATH.is_file())

    def test_loads_default_lexicon(self):
        lexicon = get_lexicon()
        self.assertEqual(lexicon.version, 1)
        self.assertEqual(lexicon.min_term_length, 4)
        self.assertIn("ahmoq", lexicon.banned_canonical)
        self.assertIn("durak", lexicon.banned_canonical)
        self.assertIn("fuck", lexicon.banned_canonical)
        self.assertGreaterEqual(lexicon.banned_count, 40)
        self.assertGreaterEqual(lexicon.whitelist_count, 1)
        self.assertIn("bozori", lexicon.whitelist_canonical)
        self.assertIn("regard", lexicon.whitelist_canonical)
        self.assertEqual(len(lexicon.banned_by_length), lexicon.banned_count)
        self.assertEqual(
            lexicon.banned_by_length,
            tuple(sorted(lexicon.banned_canonical, key=len, reverse=True)),
        )
        self.assertNotIn("kot", lexicon.banned_canonical)
        self.assertNotIn("huy", lexicon.banned_canonical)
        self.assertNotIn("jinni", lexicon.banned_canonical)
        self.assertGreaterEqual(dict(lexicon.lang_term_counts).get("uz", 0), 10)
        self.assertGreaterEqual(dict(lexicon.lang_term_counts).get("ru", 0), 10)

    def test_roundtrip_every_canonical_term(self):
        lexicon = ensure_lexicon_loaded()
        self.assertEqual(validate_lexicon_roundtrip(lexicon), [])

    def test_cyrillic_and_latin_collapse(self):
        lexicon = get_lexicon()
        self.assertIn("ahmoq", lexicon.banned_canonical)
        self.assertIn("durak", lexicon.banned_canonical)
        self.assertTrue({"jopa", "zhopa"} & set(lexicon.banned_canonical))

    def test_schema_required(self):
        with self.assertRaises(ProfanityLexiconError):
            parse_lexicon_payload(
                {
                    "version": 1,
                    "min_term_length": 4,
                    "banned": {"uz": ["ahmoq"], "ru": [], "en": []},
                    "whitelist": [],
                },
                source_path="memory",
            )

    def test_missing_ahmoq_rejected(self):
        with self.assertRaises(ProfanityLexiconError):
            parse_lexicon_payload(
                {
                    "version": 1,
                    "schema": "myuni.profanity_lexicon.v1",
                    "min_term_length": 4,
                    "banned": {"uz": ["tentak"], "ru": [], "en": []},
                    "whitelist": [],
                },
                source_path="memory",
            )

    def test_banned_whitelist_overlap_rejected(self):
        with self.assertRaises(ProfanityLexiconError):
            parse_lexicon_payload(
                {
                    "version": 1,
                    "schema": "myuni.profanity_lexicon.v1",
                    "min_term_length": 4,
                    "banned": {"uz": ["ahmoq"], "ru": [], "en": []},
                    "whitelist": ["ahmoq"],
                },
                source_path="memory",
            )

    def test_custom_lexicon_path_override(self):
        payload = {
            "version": 1,
            "schema": "myuni.profanity_lexicon.v1",
            "min_term_length": 4,
            "banned": {"uz": ["ahmoq", "tentak"], "ru": ["durak"], "en": []},
            "whitelist": [],
        }
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "custom_lexicon.json"
            path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            with override_settings(PROFANITY_LEXICON_PATH=str(path)):
                clear_lexicon_cache()
                lexicon = get_lexicon()
                self.assertEqual(Path(lexicon.source_path).resolve(), path.resolve())
                self.assertEqual(lexicon.banned_canonical, frozenset({"ahmoq", "tentak", "durak"}))
                self.assertEqual(lexicon.whitelist_count, 0)

    def test_reload_picks_up_file_change(self):
        payload = {
            "version": 1,
            "schema": "myuni.profanity_lexicon.v1",
            "min_term_length": 4,
            "banned": {"uz": ["ahmoq"], "ru": [], "en": []},
            "whitelist": [],
        }
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "reload_lexicon.json"
            path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            with override_settings(PROFANITY_LEXICON_PATH=str(path)):
                clear_lexicon_cache()
                self.assertIsNotNone(find_profanity("u ahmoq ekan"))
                self.assertIsNone(find_profanity("u tentak ekan"))

                payload["banned"]["uz"].append("tentak")
                path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
                reload_profanity_lexicon()
                self.assertIsNotNone(find_profanity("u tentak ekan"))

    def test_invalid_json_raises(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "bad.json"
            path.write_text("{not-json", encoding="utf-8")
            with self.assertRaises(ProfanityLexiconError):
                load_lexicon_from_path(path)

    def test_fuzzy_fp_whitelist_loaded(self):
        lexicon = get_lexicon()
        self.assertGreaterEqual(lexicon.whitelist_count, 1)
        for term in ("bozori", "regard", "reward", "sucker"):
            self.assertIn(term, lexicon.whitelist_canonical)

    def test_raw_cyrillic_entries_detect(self):
        self.assertIsNotNone(find_profanity("аҳмоқ"))
        self.assertIsNotNone(find_profanity("дурак"))
        self.assertIsNotNone(find_profanity("блять"))
