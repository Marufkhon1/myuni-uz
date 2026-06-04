"""Search my.edu.uz bundle for public reference/classifier endpoints."""
from __future__ import annotations

import json
import re

import requests

JS = requests.get("https://my.edu.uz/static/js/main.b75cc748.js", timeout=90, headers={"User-Agent": "Mozilla/5.0"}).text
BASE = "https://my-api.edu.uz"


def main() -> int:
    all_paths = sorted(set(re.findall(r'fN\("(/[a-zA-Z0-9_./?=&-]+)"', JS)))
    print("fN paths", len(all_paths))
    keywords = ("univers", "special", "classif", "dict", "reference", "master", "doctor", "aspirant", "mutaxassis", "oliygoh", "tm")
    interesting = [p for p in all_paths if any(k in p.lower() for k in keywords)]
    for path in interesting:
        print(path)

    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0", "Accept": "application/json"})

    for path in interesting[:40]:
        url = BASE + path.split("?")[0]
        if not url.endswith("/"):
            url += "/"
        try:
            r = session.get(url, timeout=15)
            if r.status_code == 200 and "json" in r.headers.get("content-type", ""):
                print("\nOK", url)
                print(r.text[:400])
        except Exception as exc:
            pass

    # stat.edu.uz public charts
    for url in (
        "https://stat.edu.uz/admission/charts/4",
        "https://stat.edu.uz/api/admission/magistr/",
    ):
        try:
            r = session.get(url, timeout=20)
            print("\nSTAT", url, r.status_code, r.headers.get("content-type", ""), r.text[:300])
        except Exception as exc:
            print("STAT FAIL", url, exc)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
