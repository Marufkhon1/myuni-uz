"""Quick probe for university magistratura pages."""
from __future__ import annotations

import re

import requests

SITES = [
    ("BuxDU", "https://buxdu.uz/uz/magistratura"),
    ("TDIU", "https://tsue.uz/uz/pages/magistratura"),
    ("TATU", "https://tatu.uz/magistratura"),
    ("SamDU", "https://samdu.uz/uz/magistratura"),
    ("O'zMU", "https://nuu.uz/uz/magistratura"),
]

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0 (compatible; MyUniResearch/1.0)"})


def main() -> int:
    for label, url in SITES:
        try:
            response = SESSION.get(url, timeout=20, allow_redirects=True)
            text = response.text
            print(f"\n{label} {response.status_code} final={response.url} len={len(text)}")
            if response.status_code >= 400:
                continue
            chunks = extract_text_chunks(text)
            magistr_like = [c for c in chunks if looks_like_magistr_specialty(c)]
            print(f"  chunks={len(chunks)} magistr_like={len(magistr_like)}")
            for item in magistr_like[:8]:
                print(f"    - {item}")
        except Exception as exc:
            print(f"{label} FAIL: {exc}")
    return 0


def extract_text_chunks(html: str) -> list[str]:
    from html import unescape

    html = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", html)
    chunks: list[str] = []
    for pattern in (
        r"(?is)<h[1-6][^>]*>(.*?)</h[1-6]>",
        r"(?is)<li[^>]*>(.*?)</li>",
        r"(?is)<td[^>]*>(.*?)</td>",
    ):
        for match in re.finditer(pattern, html):
            text = unescape(re.sub(r"(?is)<[^>]+>", " ", match.group(1)))
            text = re.sub(r"\s+", " ", text).strip()
            if 8 <= len(text) <= 120:
                chunks.append(text)
    return chunks


def looks_like_magistr_specialty(text: str) -> bool:
    lowered = text.lower()
    if "magistr" in lowered and len(text.split()) <= 3:
        return False
    if re.search(r"\b70\d{4,6}\b", text):
        return True
    return bool(
        re.search(
            r"(iqtisod|pedagog|huquq|tibbiyot|menejment|informatika|filolog|"
            r"psixolog|moliya|marketing|arxiv|dasturiy|sun'iy|kiber|bio|kimyo|"
            r"matemat|fizika|tarix|siyosat|jurnalist|migr|logistika|audit|"
            r"accounting|management|economics|law|medicine|engineering)",
            lowered,
        )
        and not any(bad in lowered for bad in ("bosh sahifa", "yangilik", "aloqa", "rektor", "fakultet"))
    )


if __name__ == "__main__":
    raise SystemExit(main())
