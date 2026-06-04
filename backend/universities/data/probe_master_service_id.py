"""Find service_id constant and test master quota API with params."""
from __future__ import annotations

import json
import re

import requests

JS_URL = "https://my.edu.uz/static/js/main.b75cc748.js"
BASE = "https://my-api.edu.uz"


def main() -> int:
    js = requests.get(JS_URL, timeout=90, headers={"User-Agent": "Mozilla/5.0"}).text

    # find Bs constant near ADMISSION_MASTER
    for needle in ("ADMISSION_MASTER", "ADMISSION_SCHOLARSHIP_MASTER", "ADMISSION_SCHOLARSHIP_DOCTORATE", "Bs="):
        idx = js.find(needle)
        if idx >= 0:
            print(f"\n--- {needle} context ---")
            print(js[max(0, idx - 80) : idx + 200])

    service_ids = sorted(set(re.findall(r'service_id="\.concat\(([A-Za-z0-9_]+)\)', js)))
    print("\nservice_id vars:", service_ids)

    # literal service ids in master calls
    master_calls = re.findall(r'admission/master[^"\']{0,120}', js)
    for call in sorted(set(master_calls))[:20]:
        print("call", call)

    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0", "Accept": "application/json"})

    # try education-form without auth - often public lookup tables
    for service_id in range(1, 15):
        params = f"service_id={service_id}"
        url = f"{BASE}/admission/master/quota/education-form/?{params}"
        r = session.get(url, timeout=15)
        if r.status_code == 200 and "json" in r.headers.get("content-type", ""):
            data = r.json()
            print(f"\nHIT education-form service_id={service_id}")
            print(json.dumps(data, ensure_ascii=False)[:600])

    for service_id in range(1, 15):
        for path in (
            "/admission/master/quota/tm/",
            "/admission/master/quota/education-language/",
        ):
            url = BASE + path
            r = session.get(url, params={"service_id": service_id}, timeout=15)
            if r.status_code == 200:
                print(f"\nHIT {path} service_id={service_id}", r.text[:400])

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
