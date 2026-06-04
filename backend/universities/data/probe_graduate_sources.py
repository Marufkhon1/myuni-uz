"""Probe official graduate program data sources."""
from __future__ import annotations

import json
import re
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (compatible; MyUniResearch/1.0)"}


def fetch_json(url: str) -> dict | list | None:
    try:
        req = urllib.request.Request(url, headers={**UA, "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8", "replace"))
    except Exception as exc:
        print(f"FAIL {url}: {exc}")
        return None


def fetch_next_data(url: str) -> dict:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as resp:
        html = resp.read().decode("utf-8", "replace")
    match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.S)
    if not match:
        raise ValueError("no next data")
    return json.loads(match.group(1))["props"]["pageProps"]


def main() -> int:
    from pathlib import Path

    cache = Path(__file__).parent / "_infoedu_cache" / "directions"
    prefixes: dict[str, int] = {}
    for path in cache.glob("*.json"):
        pref = path.stem[:2]
        prefixes[pref] = prefixes.get(pref, 0) + 1
    print("bakalavriat dirid prefixes:", sorted(prefixes.items(), key=lambda x: -x[1])[:8])

    props = fetch_next_data("https://infoedu.uz/oliygoh/buxoro-davlat-universiteti")
    text = json.dumps(props, ensure_ascii=False)
    for kw in ["magistr", "Magistr", "doktor", "Doktor", "70", "oliygohMagistr"]:
        print("infoedu page has", kw, ":", kw.lower() in text.lower())

    node = props.get("data", {}).get("nodeByUri", {})
    print("node keys:", list(node.keys()))

    def walk(obj, path=""):
        if isinstance(obj, dict):
            for key, value in obj.items():
                p = f"{path}.{key}" if path else key
                if any(x in key.lower() for x in ("magistr", "doktor", "master", "phd")):
                    preview = value
                    if isinstance(value, (list, dict)):
                        preview = f"type={type(value).__name__} len={len(value)}"
                    print("KEY", p, "=>", preview)
                walk(value, p)
        elif isinstance(obj, list) and obj and isinstance(obj[0], dict):
            for index, item in enumerate(obj[:2]):
                walk(item, f"{path}[{index}]")

    walk(node)

    # my.uzbmb bachelor sample (UZFI id from subagent)
    for url in [
        "https://my.uzbmb.uz/university-about-direction/415",
        "https://my.uzbmb.uz/university-about-master/415",
        "https://my.uzbmb.uz/university-about-magistr/415",
    ]:
        data = fetch_json(url)
        if data is not None:
            print("OK", url, type(data), str(data)[:200])

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
