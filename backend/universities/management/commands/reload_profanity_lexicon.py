from django.core.management.base import BaseCommand

from universities.profanity_dictionary import clear_lexicon_cache, ensure_lexicon_loaded, get_lexicon_path
from universities.profanity_filter import reload_profanity_lexicon


class Command(BaseCommand):
    help = "Profanity lexicon cache ni tozalash (JSON qo'lda tahrirlangandan keyin)."

    def handle(self, *args, **options):
        path = get_lexicon_path()
        reload_profanity_lexicon()
        clear_lexicon_cache()
        lexicon = ensure_lexicon_loaded()
        self.stdout.write(
            self.style.SUCCESS(
                f"Reloaded {path} | v{lexicon.version} banned={lexicon.banned_count} "
                f"whitelist={lexicon.whitelist_count}"
            )
        )
