"""Probe my.edu.uz for magistratura API endpoints."""
from __future__ import annotations

import json
import re

import requests

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0 (compatible; MyUniResearch/1.0)"})


def main() -> int:
    for url in (
        "https://my.edu.uz/",
        "https://my.edu.uz/uz",
        "https://backend.my.edu.uz/",
        "https://backend.my.edu.uz/api/v1/universities",
        "https://my.edu.uz/api/universities",
        "https://my.edu.uz/api/v1/universities",
    ):
        try:
            response = SESSION.get(url, timeout=25)
            print(f"\n{url} -> {response.status_code} len={len(response.text)} ct={response.headers.get('content-type','')}")
            if response.headers.get("content-type", "").startswith("application/json"):
                data = response.json()
                print("json keys:", list(data.keys()) if isinstance(data, dict) else type(data))
                print(json.dumps(data, ensure_ascii=False)[:500])
            else:
                text = response.text
                for pattern in (
                    r"https?://[^\s\"']+",
                    r"/api/[a-zA-Z0-9_./-]+",
                ):
                    hits = sorted(set(re.findall(pattern, text)))
                    api_hits = [h for h in hits if "api" in h.lower() or "backend" in h.lower()]
                    if api_hits:
                        print("api-like:", api_hits[:15])
                scripts = re.findall(r'src="([^"]+\.js)"', text)
                print("js files:", scripts[:8])
        except Exception as exc:
            print(f"{url} FAIL: {exc}")

    # try common ministry static files
    for url in (
        "https://edu.uz/media/files/magistratura_kvotalari_2025.pdf",
        "https://my.edu.uz/static/config.json",
    ):
        try:
            r = SESSION.head(url, timeout=15, allow_redirects=True)
            print(f"HEAD {url} -> {r.status_code}")
        except Exception as exc:
            print(f"HEAD {url} FAIL: {exc}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
