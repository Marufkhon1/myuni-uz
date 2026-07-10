"""
Step 7 — privacy-safe profanity block metrikalari.

Saqlanadi: kun, scope, matched stem, strategy, count.
SaqlanMAYDI: xom sharh matni / so'kinish.
"""

from __future__ import annotations

from datetime import date, timedelta

from django.db import IntegrityError, transaction
from django.db.models import F, Sum
from django.utils import timezone

from .models import ProfanityBlockDaily
from .profanity_policy import PROFANITY_SCOPE_REVIEWS


def record_profanity_block(
    *,
    matched: str,
    strategy: str = "",
    scope: str = PROFANITY_SCOPE_REVIEWS,
    on_day: date | None = None,
) -> None:
    """Hit ni kunlik agregatga yozish (raw text yo'q). Concurrent-safe."""
    stem = (matched or "").strip().lower()[:64]
    if not stem:
        return
    day = on_day or timezone.localdate()
    strat = (strategy or "").strip()[:32]
    scope_key = (scope or PROFANITY_SCOPE_REVIEWS).strip()[:32] or PROFANITY_SCOPE_REVIEWS

    for _ in range(3):
        try:
            with transaction.atomic():
                row, created = ProfanityBlockDaily.objects.get_or_create(
                    day=day,
                    scope=scope_key,
                    matched=stem,
                    strategy=strat,
                    defaults={"count": 1},
                )
                if not created:
                    ProfanityBlockDaily.objects.filter(pk=row.pk).update(
                        count=F("count") + 1,
                        updated_at=timezone.now(),
                    )
            return
        except IntegrityError:
            # Ikki parallel birinchi hit — unique collision; qayta urinish
            continue
    # Oxirgi urinish: mavjud qatorni incr (race window yopilgan bo'lishi kerak)
    updated = ProfanityBlockDaily.objects.filter(
        day=day,
        scope=scope_key,
        matched=stem,
        strategy=strat,
    ).update(count=F("count") + 1, updated_at=timezone.now())
    if not updated:
        ProfanityBlockDaily.objects.create(
            day=day,
            scope=scope_key,
            matched=stem,
            strategy=strat,
            count=1,
        )


def blocks_per_day(*, days: int = 7, scope: str | None = None) -> list[dict]:
    """
    Oxirgi N kun: [{day, total, by_matched: {stem: n}}]
    scope=None → barcha scope; scope="" ham "all" deb emas — reviews default emas, filter yo'q.
    """
    days = max(1, min(int(days), 90))
    end = timezone.localdate()
    start = end - timedelta(days=days - 1)
    qs = ProfanityBlockDaily.objects.filter(day__gte=start, day__lte=end)
    if scope is not None and scope != "":
        qs = qs.filter(scope=scope)

    totals = {
        row["day"]: row["total"]
        for row in qs.values("day").annotate(total=Sum("count")).order_by("day")
    }
    by_matched: dict[date, dict[str, int]] = {}
    for row in qs.values("day", "matched").annotate(total=Sum("count")):
        by_matched.setdefault(row["day"], {})[row["matched"]] = row["total"]

    result = []
    cursor = start
    while cursor <= end:
        result.append(
            {
                "day": cursor.isoformat(),
                "total": int(totals.get(cursor, 0) or 0),
                "by_matched": by_matched.get(cursor, {}),
            }
        )
        cursor += timedelta(days=1)
    return result


def today_block_count(*, scope: str | None = PROFANITY_SCOPE_REVIEWS) -> int:
    qs = ProfanityBlockDaily.objects.filter(day=timezone.localdate())
    if scope is not None and scope != "":
        qs = qs.filter(scope=scope)
    return int(qs.aggregate(total=Sum("count"))["total"] or 0)
