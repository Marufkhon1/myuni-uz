"""Inspect university pages for structured magistr/doctorate direction data."""
from __future__ import annotations

import json
import re

import requests

URLS = [
    ("BuxDU magistr", "https://buxdu.uz/uz/magistratura/"),
    ("TDIU qabul", "https://tsue.uz/uz/pages/qabul-kvotalari"),
    ("Kokand quotas", "https://www.kokandsu.uz/quotas"),
    ("NUU doktor", "https://nuu.uz/doktorantura/"),
]

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0 (compatible; MyUniResearch/1.0)"})


def extract_next_data(html: str) -> dict | None:
    match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.S)
    if not match:
        return None
    return json.loads(match.group(1))


def main() -> int:
    for label, url in URLS:
        r = SESSION.get(url, timeout=30)
        html = r.text
        print(f"\n=== {label} {r.status_code} len={len(html)} ===")
        codes70 = sorted(set(re.findall(r"\b(70\d{4,8})\b", html)))
        codes71 = sorted(set(re.findall(r"\b(71\d{4,8})\b", html)))
        print("70-codes", codes70[:20], "count", len(codes70))
        print("71-codes", codes71[:20], "count", len(codes71))
        nd = extract_next_data(html)
        if nd:
            dump = json.dumps(nd, ensure_ascii=False)
            if "magistr" in dump.lower() or "70" in dump:
                print("has next data with magistr/70")
        # table rows
        rows = re.findall(r"(?is)<tr[^>]*>(.*?)</tr>", html)
        magistr_rows = []
        for row in rows:
            text = re.sub(r"(?is)<[^>]+>", " ", row)
            text = re.sub(r"\s+", " ", text).strip()
            if re.search(r"\b70\d{4,6}\b", text) or (
                len(text) > 20 and re.search(r"magistr|mutaxassis", text, re.I)
            ):
                magistr_rows.append(text[:180])
        print("magistr-like rows", len(magistr_rows))
        for row in magistr_rows[:8]:
            print(" ", row)

    # turdosh pdf text check
    url = "https://www.kokandsu.uz/files/Magistratura_turdosh_2025.pdf"
    pdf = SESSION.get(url, timeout=60).content
    open("_magistr_turdosh.pdf", "wb").write(pdf)
    print("\nTurdosh PDF bytes", len(pdf))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
