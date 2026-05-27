"""
Test va sitecheck akkauntlarini va bog'liq ma'lumotlarni o'chirish.

Ishlatish:
  python manage.py purge_test_accounts
  python manage.py purge_test_accounts --dry-run
  python manage.py purge_test_accounts --email-pattern sitecheck.test
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from universities.models import (
    ChatMembership,
    ChatMessage,
    ChatMessageReaction,
    DirectMessage,
    DirectMessageReaction,
    DirectThread,
    Review,
    ReviewLike,
    UniversityFavorite,
)

User = get_user_model()

DEFAULT_PATTERNS = ("sitecheck.test", "@test.com")


class Command(BaseCommand):
    help = "Sitecheck/test emaildagi foydalanuvchilarni va chat/sharh ma'lumotlarini tozalaydi."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Faqat hisobot, o'chirmasdan.",
        )
        parser.add_argument(
            "--email-pattern",
            action="append",
            dest="patterns",
            help="Email qismi (masalan sitecheck.test). Bir necha marta berish mumkin.",
        )

    def handle(self, *args, **options):
        patterns = options["patterns"] or list(DEFAULT_PATTERNS)
        dry_run = options["dry_run"]

        users = User.objects.all()
        matched = []
        for user in users:
            email = (user.email or "").lower()
            if any(pattern in email for pattern in patterns):
                matched.append(user)

        if not matched:
            self.stdout.write(self.style.SUCCESS("O'chirish uchun test akkaunt topilmadi."))
            return

        self.stdout.write(f"Topildi: {len(matched)} ta foydalanuvchi")
        for user in matched:
            self.stdout.write(f"  - {user.email} (id={user.pk})")

        user_ids = [user.pk for user in matched]

        stats = {
            "chat_messages": ChatMessage.objects.filter(user_id__in=user_ids).count(),
            "chat_memberships": ChatMembership.objects.filter(user_id__in=user_ids).count(),
            "direct_threads": DirectThread.objects.filter(
                user_one_id__in=user_ids
            ).count()
            + DirectThread.objects.filter(user_two_id__in=user_ids)
            .exclude(user_one_id__in=user_ids)
            .count(),
            "direct_messages": DirectMessage.objects.filter(sender_id__in=user_ids).count(),
            "reviews": Review.objects.filter(user_id__in=user_ids).count(),
            "favorites": UniversityFavorite.objects.filter(user_id__in=user_ids).count(),
        }
        self.stdout.write("Bog'liq yozuvlar (taxminan):")
        for key, value in stats.items():
            self.stdout.write(f"  {key}: {value}")

        if dry_run:
            self.stdout.write(self.style.WARNING("Dry-run: hech narsa o'chirilmadi."))
            return

        with transaction.atomic():
            deleted_count, _ = User.objects.filter(pk__in=user_ids).delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Tayyor: {len(matched)} akkaunt va {deleted_count} bog'liq obyekt o'chirildi (CASCADE)."
            )
        )
