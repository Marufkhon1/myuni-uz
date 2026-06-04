"""Fetch all infoedu.uz oliygoh slugs (paginated)."""
from __future__ import annotations

import json
import re
import time
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent / "_infoedu_samples" / "all_oliygoh_slugs.json"
UA = {"User-Agent": "Mozilla/5.0 (compatible; MyUniResearch/1.0)"}


def fetch_page_props(url: str) -> dict:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as resp:
        html = resp.read().decode("utf-8", "replace")
    match = re.search(
        r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
        html,
        re.S,
    )
    if not match:
        raise ValueError(f"No __NEXT_DATA__ at {url}")
    return json.loads(match.group(1))["props"]["pageProps"]


def main() -> None:
    all_nodes: list[dict] = []
    for page in range(1, 20):
        url = f"https://infoedu.uz/oliygoh?page={page}" if page > 1 else "https://infoedu.uz/oliygoh"
        data = fetch_page_props(url)
        nodes = data["data"]["contentNodesWithOliygoh"]["nodes"]
        print(f"page {page}: {len(nodes)}")
        if not nodes:
            break
        all_nodes.extend(nodes)
        time.sleep(0.3)

    payload = [{"title": node["title"], "slug": node["slug"]} for node in all_nodes]
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"total {len(payload)} -> {OUT}")


if __name__ == "__main__":
    main()
