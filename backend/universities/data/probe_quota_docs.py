"""Find PDF/document links on university quota pages."""
from __future__ import annotations

import re
from html import unescape
from urllib.parse import urljoin

import requests

PAGES = [
    "https://www.kokandsu.uz/quotas",
    "https://buxdu.uz/uz/qabul",
    "https://tsue.uz/uz/pages/qabul-kvotalari",
    "https://nuu.uz/uz/qabul",
    "https://edu.uz/uz/pages/magistratura",
]

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0 (compatible; MyUniResearch/1.0)"})


def main() -> int:
    for url in PAGES:
        try:
            r = SESSION.get(url, timeout=25, allow_redirects=True)
            print(f"\n{url} -> {r.status_code} final={r.url}")
            links = re.findall(r'href=["\']([^"\']+)["\']', r.text, re.I)
            docs = []
            for href in links:
                low = href.lower()
                if any(x in low for x in (".pdf", ".xlsx", ".xls", ".doc", "drive.google", "docs.google")):
                    docs.append(urljoin(r.url, href))
                if any(x in low for x in ("magistr", "kvota", "quota", "doktor", "phd")):
                    if href.startswith("http") or href.startswith("/"):
                        docs.append(urljoin(r.url, href))
            for doc in sorted(set(docs))[:20]:
                print(" ", doc)
            # 70xxxx codes in page
            codes = sorted(set(re.findall(r"\b70\d{4,6}\b", r.text)))
            if codes:
                print(" 70-codes:", codes[:15])
        except Exception as exc:
            print(url, "FAIL", exc)

    # edu.uz pdf head
    pdf = "https://edu.uz/media/files/magistratura_kvotalari_2025.pdf"
    r = SESSION.get(pdf, timeout=30)
    print(f"\nPDF {pdf} -> {r.status_code} bytes={len(r.content)} type={r.headers.get('content-type')}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
