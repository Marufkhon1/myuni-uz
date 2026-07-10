from django.core.management.base import BaseCommand, CommandError

from universities.profanity_dictionary import (
    ensure_lexicon_loaded,
    get_lexicon,
    get_lexicon_path,
    validate_lexicon_roundtrip,
    ProfanityLexiconError,
)


class Command(BaseCommand):
    help = "Profanity lexicon v1 ni yuklab, schema va round-trip integrity ni tekshiradi."

    def handle(self, *args, **options):
        path = get_lexicon_path()
        self.stdout.write(f"Lexicon path: {path}")

        try:
            lexicon = ensure_lexicon_loaded()
        except ProfanityLexiconError as exc:
            raise CommandError(str(exc)) from exc

        self.stdout.write(
            self.style.SUCCESS(
                f"OK schema=v{lexicon.version} banned={lexicon.banned_count} "
                f"whitelist={lexicon.whitelist_count} langs={dict(lexicon.lang_term_counts)}"
            )
        )
        # Ikkinchi chaqiriq — cache ishlayotganini ko'rsatish (xato bo'lmasligi kerak).
        errors = validate_lexicon_roundtrip(get_lexicon())
        if errors:
            raise CommandError("Round-trip residual: " + "; ".join(errors[:5]))
        self.stdout.write(self.style.SUCCESS(f"Round-trip: {lexicon.banned_count} terms OK"))
