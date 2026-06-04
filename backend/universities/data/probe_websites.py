"""Probe official website URLs."""
from __future__ import annotations

import requests

from official_websites import OFFICIAL_WEBSITES

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0"})


def main() -> None:
    ok = bad = 0
    for name, url in OFFICIAL_WEBSITES.items():
        try:
            r = SESSION.get(url, timeout=12, allow_redirects=True)
            status = "OK" if r.status_code < 400 else f"HTTP {r.status_code}"
            if r.status_code < 400:
                ok += 1
            else:
                bad += 1
            print(f"{status:12} {url}")
        except requests.RequestException as exc:
            bad += 1
            print(f"FAIL         {url} ({exc.__class__.__name__})")
    print(f"\nok={ok} bad={bad}")


if __name__ == "__main__":
    main()
