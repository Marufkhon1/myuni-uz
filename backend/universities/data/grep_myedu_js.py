"""Find full my-api URL construction in my.edu.uz bundle."""
from __future__ import annotations

import re

import requests

JS_URL = "https://my.edu.uz/static/js/main.b75cc748.js"


def main() -> int:
    js = requests.get(JS_URL, timeout=90, headers={"User-Agent": "Mozilla/5.0"}).text
    for needle in (
        "quota/speciality",
        "my-api.edu.uz",
        "quota/education-form",
        "magistr_info",
        "university_data",
    ):
        print(f"\n=== contexts for {needle!r} ===")
        for match in re.finditer(re.escape(needle), js):
            start = max(0, match.start() - 120)
            end = min(len(js), match.end() + 120)
            snippet = js[start:end].replace("\n", " ")
            print(snippet[:260])
            print("---")

    # axios/fetch baseURL patterns
    for pattern in (
        r'baseURL:"[^"]+"',
        r"baseURL:'[^']+'",
        r'REACT_APP_[A-Z_]+:"[^"]+"',
        r"my-api\.edu\.uz[^\"']{0,80}",
    ):
        hits = sorted(set(re.findall(pattern, js)))
        if hits:
            print(f"\n{pattern}:")
            for hit in hits[:30]:
                print(" ", hit)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
