"""Probe my-api classifier and master quota endpoints."""
from __future__ import annotations

import json

import requests

BASE = "https://my-api.edu.uz"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0", "Accept": "application/json"})


def get(path: str, **params) -> None:
    url = BASE + path
    r = SESSION.get(url, params=params, timeout=25)
    print(f"\nGET {path} {params or ''} -> {r.status_code}")
    if "json" in r.headers.get("content-type", ""):
        data = r.json()
        text = json.dumps(data, ensure_ascii=False)
        print(text[:1200])
        if isinstance(data, dict) and "results" in data and data["results"]:
            print("results count", len(data["results"]))
    else:
        print(r.text[:300])


def main() -> int:
    get("/classifier/service/", limit=200)
    get("/classifier/service/", limit=100, offset=0)

    for classifier in (
        "university",
        "speciality",
        "education_form",
        "education_language",
        "tm",
        "master_speciality",
        "magistr_speciality",
        "doctoral_speciality",
    ):
        get("/classifier/cached/", classifier=classifier)

    # master quota root
    get("/admission/master/quota/")
    for sid in range(1, 30):
        r = SESSION.get(BASE + "/admission/master/quota/", params={"service_id": sid}, timeout=15)
        if r.status_code == 200 and "json" in r.headers.get("content-type", ""):
            data = r.json()
            if data:
                print(f"\nmaster/quota service_id={sid}")
                print(json.dumps(data, ensure_ascii=False)[:800])

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
