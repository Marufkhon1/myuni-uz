"""DRF throttles for anonymous /api/public/* traffic."""

from django.conf import settings
from rest_framework.throttling import AnonRateThrottle


def _rate_from_settings(scope: str, default: str) -> str:
    rates = getattr(settings, "REST_FRAMEWORK", {}).get("DEFAULT_THROTTLE_RATES") or {}
    return rates.get(scope) or default


class PublicAnonThrottle(AnonRateThrottle):
    """Default public GET budget (filters, articles, FAQ, top)."""

    scope = "public"

    def get_rate(self):
        return _rate_from_settings(self.scope, "300/hour")


class PublicHeavyAnonThrottle(AnonRateThrottle):
    """Heavier queries: catalog, detail, landing, recent reviews, compare."""

    scope = "public_heavy"

    def get_rate(self):
        return _rate_from_settings(self.scope, "120/hour")


class PublicStatsAnonThrottle(AnonRateThrottle):
    """Aggregate / sitemap — stricter against scrape storms."""

    scope = "public_stats"

    def get_rate(self):
        return _rate_from_settings(self.scope, "60/hour")
