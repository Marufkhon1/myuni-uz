"""Inspect fN axios wrapper and test API host variants."""
from __future__ import annotations

import re

import requests

JS = requests.get("https://my.edu.uz/static/js/main.b75cc748.js", timeout=90, headers={"User-Agent": "Mozilla/5.0"}).text

match = re.search(r"function fN\(e\)\{.{0,800}", JS)
if match:
    print("fN def:", match.group(0)[:800])

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "Origin": "https://my.edu.uz",
        "Referer": "https://my.edu.uz/",
    }
)

paths = [
    "https://my-api.edu.uz/admission/master/quota/education-form/?service_id=1",
    "https://my-api.edu.uz/api/admission/master/quota/education-form/?service_id=1",
    "https://my.edu.uz/admission/master/quota/education-form/?service_id=1",
]

for url in paths:
    try:
        r = SESSION.get(url, timeout=20)
        print(url, r.status_code, r.text[:200])
    except Exception as exc:
        print(url, "FAIL", exc)
