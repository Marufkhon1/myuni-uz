"""Quick scan official websites for 70xxxxxx codes on common paths."""
from __future__ import annotations

import re
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

from official_websites import OFFICIAL_WEBSITES

PATHS = (
    "/magistratura-mutaxassisliklar",
    "/magistratura-mutaxassisliklari",
    "/uz/magistratura-mutaxassisliklar",
    "/uz/magistratura-mutaxassisliklari",
    "/magistratura",
    "/uz/magistratura",
    "/pages/magistratura",
    "/uz/pages/magistratura",
    "/qabul/kvotalari",
    "/uz/qabul/kvotalari",
    "/fakultetlar/magistratura",
)

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0"})


def scan(item: tuple[str, str]) -> tuple[str, int, str | None]:
    name, base = item
    best = 0
    best_url = None
    for path in PATHS:
        url = base.rstrip("/") + path
        try:
            r = SESSION.get(url, timeout=10, allow_redirects=True)
            if r.status_code >= 400:
                continue
            codes = set(re.findall(r"\b70\d{6,8}\b", r.text))
            if len(codes) > best:
                best = len(codes)
                best_url = r.url
        except requests.RequestException:
            continue
    return name, best, best_url


def main() -> int:
    hits = []
    with ThreadPoolExecutor(max_workers=12) as pool:
        futures = [pool.submit(scan, item) for item in OFFICIAL_WEBSITES.items()]
        for future in as_completed(futures):
            name, count, url = future.result()
            if count:
                hits.append((count, name, url))
    hits.sort(reverse=True)
    print(f"Found {len(hits)} universities with 70-codes")
    for count, name, url in hits[:40]:
        print(f"{count:3d} {name[:60]} -> {url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
