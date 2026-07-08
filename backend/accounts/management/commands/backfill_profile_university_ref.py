from django.core.management.base import BaseCommand

from accounts.models import Profile
from accounts.university_resolution import resolve_university_by_text


class Command(BaseCommand):
    help = (
        "Backfill Profile.university_ref from legacy CharField `university` "
        "(exact name / short_name match only)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Hisobot chiqaradi, bazaga yozmaydi.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Maksimal profil soni (0 = hammasi).",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        limit = options["limit"]

        queryset = (
            Profile.objects.filter(university_ref__isnull=True)
            .exclude(university="")
            .order_by("id")
        )
        if limit > 0:
            queryset = queryset[:limit]

        matched = 0
        unmatched = 0
        unmatched_samples = []

        for profile in queryset.iterator(chunk_size=200):
            university = resolve_university_by_text(profile.university)
            if university is None:
                unmatched += 1
                if len(unmatched_samples) < 20:
                    unmatched_samples.append(
                        f"#{profile.id} user={profile.user_id} text={profile.university!r}"
                    )
                continue

            matched += 1
            if dry_run:
                continue
            profile.university_ref = university
            # Normalize display string to canonical catalog name.
            profile.university = university.name
            profile.save(update_fields=["university_ref", "university", "updated_at"])

        self.stdout.write(
            self.style.SUCCESS(
                f"matched={matched} unmatched={unmatched} dry_run={dry_run}"
            )
        )
        for sample in unmatched_samples:
            self.stdout.write(f"  unmatched: {sample}")
