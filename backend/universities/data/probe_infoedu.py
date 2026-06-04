"""Inspect infoedu.uz __NEXT_DATA__ JSON for universities and directions."""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0 (compatible; MyUniResearch/1.0)"}
OUT = Path(__file__).resolve().parent / "_infoedu_samples"


def fetch_next_data(url: str) -> dict:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as resp:
        html = resp.read().decode("utf-8", "replace")
    m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.S)
    if not m:
        raise ValueError(f"No __NEXT_DATA__ at {url}")
    return json.loads(m.group(1))["props"]["pageProps"]


def main() -> None:
    OUT.mkdir(exist_ok=True)
    samples = {
        "oliygoh_list": "https://infoedu.uz/oliygoh",
        "samisi": "https://infoedu.uz/oliygoh/samarqand-iqtisodiyot-va-servis-instituti",
        "yonalish_list": "https://infoedu.uz/yonalish",
        "yonalish_one": "https://infoedu.uz/yonalish/60810200",
    }
    for key, url in samples.items():
        data = fetch_next_data(url)
        path = OUT / f"{key}.json"
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(key, "keys:", list(data.keys()))
        if key == "samisi":
            print("  university keys:", list(data.get("university", {}).keys()) if isinstance(data.get("university"), dict) else type(data.get("university")))
            dirs = data.get("directions") or data.get("data") or data.get("quotas")
            if isinstance(dirs, list):
                print("  directions count:", len(dirs))
                if dirs:
                    print("  first direction keys:", list(dirs[0].keys()) if isinstance(dirs[0], dict) else dirs[0])
        if key == "oliygoh_list":
            items = data.get("universities") or data.get("data") or data.get("items")
            if isinstance(items, list):
                print("  universities count:", len(items))
                if items:
                    print("  first uni:", json.dumps(items[0], ensure_ascii=False)[:400])


if __name__ == "__main__":
    main()
