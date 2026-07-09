"""
Remove auto-created Google-only duplicates when a password account exists for the same email.

Ishlatish:
  python manage.py merge_google_duplicate_accounts --dry-run
  python manage.py merge_google_duplicate_accounts
  python manage.py merge_google_duplicate_accounts --email mmansurjonov58@gmail.com
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q

from accounts.google_user_resolution import find_user_for_google_email

User = get_user_model()


class Command(BaseCommand):
    help = "Password hisobini saqlab, Google bilan yaratilgan dublikat akkauntlarni o'chiradi."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Faqat hisobot.")
        parser.add_argument("--email", help="Faqat shu email uchun tekshirish.")

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        target_email = (options.get("email") or "").lower().strip()

        ghosts = User.objects.filter(username__contains="@")
        if target_email:
            ghosts = ghosts.filter(Q(email__iexact=target_email) | Q(username__iexact=target_email))

        removed = 0
        for ghost in ghosts:
            if ghost.has_usable_password():
                continue

            email = str(ghost.email or ghost.username or "").lower().strip()
            if not email or "@" not in email:
                continue

            primary = find_user_for_google_email(email)
            if primary is None or primary.pk == ghost.pk:
                continue
            if not primary.has_usable_password():
                continue

            self.stdout.write(
                f"{'[dry-run] ' if dry_run else ''}merge: keep pk={primary.pk} "
                f"({primary.username}) delete pk={ghost.pk} ({ghost.username})"
            )
            if not dry_run:
                with transaction.atomic():
                    ghost.delete()
            removed += 1

        self.stdout.write(self.style.SUCCESS(f"Done. duplicates handled: {removed}"))
