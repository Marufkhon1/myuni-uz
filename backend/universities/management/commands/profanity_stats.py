from django.core.management.base import BaseCommand

from universities.profanity_metrics import blocks_per_day, today_block_count
from universities.profanity_policy import PROFANITY_SCOPE_REVIEWS


class Command(BaseCommand):
    help = (
        "Step 7: kunlik profanity block statistikasi "
        "(faqat stem/count — xom so'kinish saqlanmaydi)."
    )

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=7, help="Necha kun (default 7, max 90)")
        parser.add_argument(
            "--scope",
            default=PROFANITY_SCOPE_REVIEWS,
            help="Scope filtri (default: reviews)",
        )

    def handle(self, *args, **options):
        days = options["days"]
        scope = options["scope"]
        today = today_block_count(scope=scope)
        series = blocks_per_day(days=days, scope=scope)

        self.stdout.write(self.style.NOTICE(f"Scope={scope} | Bugun={today}"))
        for row in series:
            matched = row["by_matched"]
            top = ", ".join(
                f"{stem}:{count}"
                for stem, count in sorted(matched.items(), key=lambda item: (-item[1], item[0]))[:5]
            ) or "—"
            self.stdout.write(f"{row['day']}: total={row['total']} | {top}")

        total = sum(row["total"] for row in series)
        self.stdout.write(self.style.SUCCESS(f"Jami {days} kun: {total} block"))
