"""Redis/LocMem response cache helpers for public API GETs."""

from __future__ import annotations

import hashlib
import json
from collections.abc import Callable
from typing import Any

from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponse
from rest_framework.response import Response


def public_cache_enabled() -> bool:
    return bool(getattr(settings, "PUBLIC_API_CACHE_ENABLED", True))


def ttl(name: str, default: int) -> int:
    return int(getattr(settings, f"PUBLIC_CACHE_TTL_{name}", default))


def is_anonymous_request(request) -> bool:
    user = getattr(request, "user", None)
    return not (user is not None and getattr(user, "is_authenticated", False))


def query_fingerprint(query_params) -> str:
    items: list[tuple[str, str]] = []
    if hasattr(query_params, "keys"):
        keys = list(query_params.keys())
    elif isinstance(query_params, dict):
        keys = list(query_params.keys())
    else:
        keys = []
    for key in sorted(str(k) for k in keys):
        if hasattr(query_params, "getlist"):
            values = query_params.getlist(key)
        else:
            raw = query_params.get(key)
            if isinstance(raw, (list, tuple)):
                values = list(raw)
            else:
                values = [raw]
        for value in values:
            items.append((str(key), str(value)))
    raw = json.dumps(items, ensure_ascii=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]


def cached_payload_or_none(
    key: str,
    timeout: int,
    builder,
    *,
    browser_max_age: int = 60,
    s_maxage: int | None = None,
) -> Response | None:
    """
    Like cached_json, but builder may return None to mean 'do not cache / not found'.
    Returns None when builder returns None (caller should craft 404).
    """
    if not public_cache_enabled() or timeout <= 0:
        payload = builder()
        if payload is None:
            return None
        return apply_cache_control(
            Response(payload),
            max_age=0,
            s_maxage=0,
            hit=False,
        )

    cached = cache.get(key)
    if cached is not None:
        return apply_cache_control(
            Response(cached),
            max_age=browser_max_age,
            s_maxage=s_maxage if s_maxage is not None else timeout,
            hit=True,
        )

    payload = builder()
    if payload is None:
        return None
    cache.set(key, payload, timeout=timeout)
    return apply_cache_control(
        Response(payload),
        max_age=browser_max_age,
        s_maxage=s_maxage if s_maxage is not None else timeout,
        hit=False,
    )


def cache_key(*parts: Any) -> str:
    safe = [str(part).replace(" ", "_") for part in parts if part is not None and part != ""]
    return "public:" + ":".join(safe)


def apply_cache_control(
    response: HttpResponse | Response,
    *,
    max_age: int,
    s_maxage: int | None = None,
    hit: bool = False,
) -> HttpResponse | Response:
    s_maxage = max_age if s_maxage is None else s_maxage
    response["Cache-Control"] = f"public, max-age={max_age}, s-maxage={s_maxage}"
    response["X-MyUni-Cache"] = "HIT" if hit else "MISS"
    return response


def cached_json(
    key: str,
    timeout: int,
    builder: Callable[[], Any],
    *,
    browser_max_age: int = 60,
    s_maxage: int | None = None,
) -> Response:
    """Return a Response from cache or builder(); set Cache-Control headers."""
    if not public_cache_enabled() or timeout <= 0:
        return apply_cache_control(
            Response(builder()),
            max_age=0,
            s_maxage=0,
            hit=False,
        )

    cached = cache.get(key)
    if cached is not None:
        return apply_cache_control(
            Response(cached),
            max_age=browser_max_age,
            s_maxage=s_maxage if s_maxage is not None else timeout,
            hit=True,
        )

    payload = builder()
    cache.set(key, payload, timeout=timeout)
    return apply_cache_control(
        Response(payload),
        max_age=browser_max_age,
        s_maxage=s_maxage if s_maxage is not None else timeout,
        hit=False,
    )


def cached_http(
    key: str,
    timeout: int,
    builder: Callable[[], tuple[str | bytes, str]],
    *,
    browser_max_age: int = 60,
    s_maxage: int | None = None,
) -> HttpResponse:
    """
    Cache body+content_type tuples for sitemap / share-preview HTML.
    builder() -> (content, content_type)
    """
    if not public_cache_enabled() or timeout <= 0:
        content, content_type = builder()
        response = HttpResponse(content, content_type=content_type)
        return apply_cache_control(response, max_age=0, s_maxage=0, hit=False)

    cached = cache.get(key)
    if cached is not None:
        content, content_type = cached
        response = HttpResponse(content, content_type=content_type)
        return apply_cache_control(
            response,
            max_age=browser_max_age,
            s_maxage=s_maxage if s_maxage is not None else timeout,
            hit=True,
        )

    content, content_type = builder()
    cache.set(key, (content, content_type), timeout=timeout)
    response = HttpResponse(content, content_type=content_type)
    return apply_cache_control(
        response,
        max_age=browser_max_age,
        s_maxage=s_maxage if s_maxage is not None else timeout,
        hit=False,
    )
