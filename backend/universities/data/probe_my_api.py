"""Extract and probe my-api.edu.uz endpoints from my.edu.uz bundle."""
from __future__ import annotations

import json
import re

import requests

JS_URL = "https://my.edu.uz/static/js/main.b75cc748.js"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0 (compatible; MyUniResearch/1.0)"})


def main() -> int:
    js = SESSION.get(JS_URL, timeout=90).text
    print("js len", len(js))

    patterns = [
        r"https://my-api\.edu\.uz/[a-zA-Z0-9_./?=&-]+",
        r"my-api\.edu\.uz/[a-zA-Z0-9_./?=&-]+",
        r"/v1/[a-zA-Z0-9_./-]+",
        r"magistr[a-zA-Z0-9_./-]{0,40}",
        r"quota[a-zA-Z0-9_./-]{0,40}",
        r"specialt[a-zA-Z0-9_./-]{0,40}",
        r"universit[a-zA-Z0-9_./-]{0,40}",
    ]
    for pattern in patterns:
        hits = sorted(set(re.findall(pattern, js, re.I)))
        if hits:
            print(f"\n{pattern} ({len(hits)}):")
            for hit in hits[:25]:
                print(" ", hit)

    candidates = sorted(
        {
            url if url.startswith("http") else f"https://{url}"
            for url in re.findall(r"https://my-api\.edu\.uz/[a-zA-Z0-9_./-]+", js)
        }
    )
    print("\nProbing", len(candidates), "candidate URLs...")
    for url in candidates[:40]:
        try:
            response = SESSION.get(url, timeout=20)
            ctype = response.headers.get("content-type", "")
            print(url, response.status_code, ctype[:40], response.text[:120].replace("\n", " "))
        except Exception as exc:
            print(url, "FAIL", exc)

    # brute common REST paths
    base = "https://my-api.edu.uz"
    for path in (
        "/",
        "/api/",
        "/api/v1/",
        "/api/v1/universities/",
        "/api/v1/university/",
        "/api/v1/magistr/",
        "/api/v1/magistratura/",
        "/api/v1/specialties/",
        "/api/v1/quotas/",
        "/api/v1/admission/",
        "/api/v1/admission/magistr/",
        "/api/v1/admission/magistratura/",
        "/api/v1/admission/magistr/specialties/",
        "/api/v1/admission/magistr/universities/",
        "/swagger/",
        "/docs/",
    ):
        url = base + path
        try:
            response = SESSION.get(url, timeout=15)
            if response.status_code != 404:
                print("BRUTE", url, response.status_code, response.headers.get("content-type", ""), response.text[:200])
        except Exception as exc:
            print("BRUTE", url, "FAIL", exc)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
