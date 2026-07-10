from django.apps import AppConfig


class UniversitiesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "universities"

    def ready(self):
        # Fail-soft: migrate/collectstatic ni buzmasin; filter yoqilganda lug'atni isitadi.
        from django.conf import settings

        if not getattr(settings, "PROFANITY_FILTER_ENABLED", True):
            return

        import logging
        import sys

        skip_cmds = {"makemigrations", "migrate", "collectstatic", "shell", "test"}
        if any(arg in skip_cmds for arg in sys.argv):
            return

        try:
            from .profanity_dictionary import get_lexicon

            lexicon = get_lexicon()
            logging.getLogger(__name__).info(
                "Profanity lexicon ready: v%s banned=%s path=%s",
                lexicon.version,
                lexicon.banned_count,
                lexicon.source_path,
            )
        except Exception:
            logging.getLogger(__name__).exception(
                "Profanity lexicon yuklanmadi — sharh filtri ishlamasligi mumkin"
            )
