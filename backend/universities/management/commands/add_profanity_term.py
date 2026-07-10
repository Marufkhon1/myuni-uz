"""
Moderator: lug'atga yangi kanonik so'z qo'shish.

Jarayon:
  1) manage.py add_profanity_term <term> --lang uz|ru|en
  2) yoki --whitelist <term>
  3) JSON yangilanadi, cache tozalanadi, round-trip tekshiriladi

Variantlarni (ahmoqq, a-h-m-o-q) yozmang — normalizer ushlaydi.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from universities.profanity_dictionary import (
    clear_lexicon_cache,
    get_lexicon,
    get_lexicon_path,
    load_lexicon_from_path,
)
from universities.profanity_filter import find_profanity, reload_profanity_lexicon
from universities.profanity_normalize import normalize_for_moderation


MODERATOR_PROCESS = """
Moderator jarayoni (yangi so'z):
  1. Canonical ildizni tanlang (variantlar emas: ahmoqq / a-h-m-o-q yozilmaydi)
  2. Dry-run:  manage.py add_profanity_term <term> --lang uz --dry-run
  3. Yozish:    manage.py add_profanity_term <term> --lang uz
  4. Tekshir:   manage.py validate_profanity_lexicon
  5. Deploy:    lexicon JSON ni commit/push (cache reload avtomatik / reload_profanity_lexicon)
  6. Monitor:   manage.py profanity_stats --days 7
""".strip()


class Command(BaseCommand):
    help = (
        "Moderator: profanity lexicon ga kanonik so'z qo'shish "
        "(JSON fayl, hardcode emas). Keyin cache reload."
    )

    def add_arguments(self, parser):
        parser.add_argument("term", nargs="?", default="", help="Kanonik so'z (masalan: yangi ildiz)")
        parser.add_argument(
            "--lang",
            default="uz",
            choices=["uz", "ru", "en"],
            help="banned til guruhi (default: uz)",
        )
        parser.add_argument(
            "--whitelist",
            action="store_true",
            help="Banned o'rniga whitelist ga qo'shish",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Faylga yozmasdan tekshirish",
        )
        parser.epilog = MODERATOR_PROCESS

    def handle(self, *args, **options):
        term = (options["term"] or "").strip()
        if not term:
            raise CommandError("Term majburiy. Misol: manage.py add_profanity_term tentak --lang uz")

        path = get_lexicon_path()
        if not path.is_file():
            raise CommandError(f"Lexicon topilmadi: {path}")

        payload = json.loads(path.read_text(encoding="utf-8"))
        canonical = normalize_for_moderation(term)
        if len(canonical) < int(payload.get("min_term_length", 4)):
            raise CommandError(
                f"Term juda qisqa (canonical={canonical!r}). "
                f"min_term_length={payload.get('min_term_length', 4)}"
            )

        if options["whitelist"]:
            bucket = payload.setdefault("whitelist", [])
            if not isinstance(bucket, list):
                raise CommandError("whitelist ro'yxat bo'lishi kerak")
            if any(normalize_for_moderation(item) == canonical for item in bucket):
                self.stdout.write(self.style.WARNING(f"Allaqachon whitelist da: {term}"))
                return
            bucket.append(canonical)
            kind = "whitelist"
        else:
            banned = payload.setdefault("banned", {})
            if not isinstance(banned, dict):
                raise CommandError("banned object bo'lishi kerak")
            lang = options["lang"]
            bucket = banned.setdefault(lang, [])
            if not isinstance(bucket, list):
                raise CommandError(f"banned.{lang} ro'yxat bo'lishi kerak")
            if any(normalize_for_moderation(item) == canonical for item in bucket):
                self.stdout.write(self.style.WARNING(f"Allaqachon banned.{lang} da: {term}"))
                return
            bucket.append(canonical)
            kind = f"banned.{lang}"

        payload["updated"] = date.today().isoformat()

        # Validatsiya (yozishdan oldin)
        tmp_check = dict(payload)
        # parse via temp write in memory path simulation
        from universities.profanity_dictionary import parse_lexicon_payload

        try:
            parse_lexicon_payload(tmp_check, source_path=str(path))
        except Exception as exc:
            raise CommandError(f"Lexicon yaroqsiz: {exc}") from exc

        if options["dry_run"]:
            self.stdout.write(self.style.NOTICE(f"DRY-RUN OK: {term} → {kind} (canonical={canonical})"))
            return

        self._atomic_write(path, payload)
        reload_profanity_lexicon()
        lexicon = load_lexicon_from_path(path)

        if options["whitelist"]:
            if canonical not in lexicon.whitelist_canonical:
                raise CommandError("Yozildi lekin whitelist canonical ga tushmadi")
        else:
            if canonical not in lexicon.banned_canonical:
                raise CommandError("Yozildi lekin banned canonical ga tushmadi")
            hit = find_profanity(term)
            if hit is None:
                raise CommandError("Round-trip: yangi term ushlanmadi")

        self.stdout.write(
            self.style.SUCCESS(
                f"Qo'shildi: {term!r} → {kind} (canonical={canonical}) | banned={get_lexicon().banned_count}"
            )
        )
        self.stdout.write(
            "Moderator jarayoni: JSON yangilandi → cache reload → round-trip OK. "
            "Deploy da shu faylni commit/push qiling."
        )

    def _atomic_write(self, path: Path, payload: dict) -> None:
        text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
        tmp = path.with_suffix(path.suffix + ".tmp")
        tmp.write_text(text, encoding="utf-8")
        tmp.replace(path)
