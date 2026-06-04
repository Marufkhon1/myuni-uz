from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from universities.data.official_websites import OFFICIAL_WEBSITES
from universities.infoedu_images import refresh_infoedu_image_index, refresh_infoedu_images_for_heis
from universities.models import University
from universities.university_image_scraper import (
    fetch_for_university,
    load_manifest,
    public_image_path,
    save_manifest,
)


class Command(BaseCommand):
    help = "Official saytlardan universitet rasmlarini yuklab, DB va public/images/universities ga saqlaydi."

    def add_arguments(self, parser):
        parser.add_argument(
            "--output-dir",
            default="",
            help="Rasm papkasi (default: frontend/public/images/universities)",
        )
        parser.add_argument("--slug", default="", help="Faqat bitta universitet slug")
        parser.add_argument("--limit", type=int, default=0, help="Maksimal son (0 = hammasi)")
        parser.add_argument("--skip-existing", action="store_true", help="Mavjud fayllarni o'tkazib yuborish")
        parser.add_argument("--retry-failed", action="store_true", help="Faqat muvaffaqiyatsiz universitetlarni qayta urinish")
        parser.add_argument("--refresh-infoedu", action="store_true", help="infoedu.uz indeksini yangilash")
        parser.add_argument("--dry-run", action="store_true", help="Faqat qidirish, saqlamaslik")

    def handle(self, *args, **options):
        base_dir = Path(settings.BASE_DIR).resolve()
        repo_root = base_dir.parent
        output_dir = Path(options["output_dir"] or repo_root / "frontend" / "public" / "images" / "universities")
        output_dir.mkdir(parents=True, exist_ok=True)

        queryset = University.objects.order_by("id")
        if options["slug"]:
            queryset = queryset.filter(slug=options["slug"])
        if options["limit"] > 0:
            queryset = queryset[: options["limit"]]

        if options["refresh_infoedu"]:
            hei_names = list(queryset.values_list("name", flat=True))
            count = len(refresh_infoedu_images_for_heis(hei_names))
            self.stdout.write(self.style.SUCCESS(f"infoedu HEI indeks yangilandi: {count} ta rasm"))

        manifest = load_manifest()
        manifest_items = manifest.setdefault("items", {})

        stats = {"ok": 0, "cached": 0, "failed": 0, "updated": 0}

        for index, university in enumerate(queryset, start=1):
            if options["retry_failed"]:
                prior = manifest_items.get(university.slug, {})
                if prior.get("status") in {"ok", "cached"}:
                    continue

            website = (university.website or "").strip() or OFFICIAL_WEBSITES.get(university.name, "")
            if website and website != university.website:
                university.website = website
                university.save(update_fields=["website"])

            dest = output_dir / f"{university.slug}.jpg"
            if options["skip_existing"] and dest.is_file() and dest.stat().st_size > 8_000:
                image_path = public_image_path(university.slug)
                if not options["dry_run"]:
                    university.image_url = image_path
                    if not university.gallery_urls:
                        university.gallery_urls = [image_path]
                    university.save(update_fields=["image_url", "gallery_urls"])
                    stats["updated"] += 1
                stats["cached"] += 1
                self.stdout.write(f"[{index}] {university.short_name}: cached")
                continue

            if options["dry_run"]:
                self.stdout.write(f"[{index}] {university.short_name}: dry-run ({university.website})")
                continue

            result = fetch_for_university(
                university,
                output_dir,
                prefer_infoedu=options["retry_failed"],
            )
            if website:
                result["website"] = website
            manifest_items[university.slug] = result

            if result["status"] in {"ok", "cached"}:
                university.image_url = result["image_url"]
                if not university.gallery_urls:
                    university.gallery_urls = [result["image_url"]]
                university.save(update_fields=["image_url", "gallery_urls"])
                stats["updated"] += 1
                stats["ok" if result["status"] == "ok" else "cached"] += 1
                self.stdout.write(self.style.SUCCESS(f"[{index}] {university.short_name}: {result['status']}"))
            else:
                stats["failed"] += 1
                self.stdout.write(
                    self.style.WARNING(
                        f"[{index}] {university.short_name}: {result['status']} ({result.get('error') or result.get('source_url')})"
                    )
                )

        if not options["dry_run"]:
            save_manifest(manifest)

        self.stdout.write(
            self.style.SUCCESS(
                f"Tayyor: ok={stats['ok']} cached={stats['cached']} failed={stats['failed']} db_updated={stats['updated']}"
            )
        )
