"""Atomic-ish cache counters for rate limits (works on LocMem + Redis)."""

from __future__ import annotations

from django.core.cache import cache


def cache_bump(key: str, *, timeout: int) -> int:
    """
    Increment key by 1. Prefer atomic incr; fall back to get+set for backends
    that require the key to already exist.
    """
    try:
        return int(cache.incr(key))
    except ValueError:
        # Key missing — seed then incr if possible.
        added = cache.add(key, 1, timeout=timeout)
        if added:
            return 1
        try:
            return int(cache.incr(key))
        except ValueError:
            current = int(cache.get(key, 0) or 0) + 1
            cache.set(key, current, timeout=timeout)
            return current
