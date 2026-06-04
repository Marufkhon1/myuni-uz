"""Probe my-api.edu.uz quota endpoints for magistratura data."""
from __future__ import annotations

import json

import requests

BASE = "https://my-api.edu.uz"
SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (compatible; MyUniResearch/1.0)",
        "Accept": "application/json",
    }
)


def fetch(path: str, params: dict | None = None) -> None:
    url = BASE + path
    try:
        response = SESSION.get(url, params=params or {}, timeout=30)
        print(f"\nGET {url} params={params} -> {response.status_code}")
        text = response.text
        if response.headers.get("content-type", "").startswith("application/json"):
            data = response.json()
            if isinstance(data, dict):
                print("keys:", list(data.keys()))
                for key in ("results", "data", "items", "count"):
                    if key in data:
                        val = data[key]
                        print(f"  {key}: type={type(val).__name__}", end="")
                        if isinstance(val, list):
                            print(f" len={len(val)}")
                            if val:
                                print("  first:", json.dumps(val[0], ensure_ascii=False)[:400])
                        else:
                            print()
            elif isinstance(data, list):
                print("list len", len(data))
                if data:
                    print("first:", json.dumps(data[0], ensure_ascii=False)[:400])
            else:
                print(str(data)[:300])
        else:
            print(text[:300])
    except Exception as exc:
        print(f"FAIL {url}: {exc}")


def main() -> int:
    for path in (
        "/",
        "/quota/",
        "/quota/speciality/",
        "/quota/education-form/",
        "/quota/education-language/",
        "/quota/achievement-type/",
        "/quota/research-form/",
        "/quota/research-type/",
        "/quota/tm/",
        "/v1/user/auth/one-id",
    ):
        fetch(path)

    # paginated speciality list
    for page in (1, 2):
        fetch("/quota/speciality/", {"page": page, "page_size": 5})

    # try filters seen in frontend
    for params in (
        {"education_form": 1},
        {"education_form_id": 1},
        {"education_form": "Kunduzgi"},
        {"university": 1},
        {"university_id": 1},
    ):
        fetch("/quota/speciality/", params)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
