"""Extract admission/master and doctorate API paths from my.edu.uz JS."""
from __future__ import annotations

import re

import requests

JS_URL = "https://my.edu.uz/static/js/main.b75cc748.js"
BASE = "https://my-api.edu.uz"


def main() -> int:
    js = requests.get(JS_URL, timeout=90, headers={"User-Agent": "Mozilla/5.0"}).text
    paths = sorted(set(re.findall(r"/admission/[a-zA-Z0-9_./-]+", js)))
    print("admission paths", len(paths))
    for path in paths:
        if any(x in path for x in ("master", "doctor", "phd", "aspirant", "speciality", "university", "quota")):
            print(path)

    # probe master endpoints
    import json

    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0", "Accept": "application/json"})

    for path in paths:
        if "master" in path and "quota" in path:
            url = BASE + path.split("?")[0]
            if url.endswith("/?"):
                url = url[:-2]
            if not url.endswith("/"):
                url += "/"
            try:
                r = session.get(url, timeout=20)
                if r.status_code != 404:
                    print("\nTRY", url, r.status_code)
                    if "json" in r.headers.get("content-type", ""):
                        data = r.json()
                        print(json.dumps(data, ensure_ascii=False)[:500])
                    else:
                        print(r.text[:200])
            except Exception as exc:
                print("FAIL", url, exc)

    # common master quota endpoints with service_id
    for path in (
        "/admission/master/quota/education-form/",
        "/admission/master/quota/education-language/",
        "/admission/master/quota/speciality/",
        "/admission/master/quota/university/",
        "/admission/master/quota/tm/",
        "/admission/doctorate/quota/speciality/",
        "/admission/doctorate/quota/university/",
        "/admission/phd/quota/speciality/",
    ):
        url = BASE + path
        for params in ({}, {"service_id": "1"}, {"page": 1, "page_size": 10}):
            try:
                r = session.get(url, params=params, timeout=20)
                if r.status_code != 404:
                    print(f"\n{url} params={params} -> {r.status_code}")
                    if "json" in r.headers.get("content-type", ""):
                        data = r.json()
                        if isinstance(data, dict):
                            print("keys", list(data.keys()))
                            results = data.get("results") or data.get("data") or data
                            if isinstance(results, list) and results:
                                print("first", json.dumps(results[0], ensure_ascii=False)[:500])
                        elif isinstance(data, list) and data:
                            print("first", json.dumps(data[0], ensure_ascii=False)[:500])
                    else:
                        print(r.text[:150])
            except Exception as exc:
                print("FAIL", url, exc)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
