"""Scrape official magistratura and doktorantura directions from university websites."""
from __future__ import annotations

import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urljoin

import requests

from graduate_direction_utils import dedupe_directions, parse_doctorate_lines, parse_magistr_lines
from direction_language_utils import detect_page_language, resolve_preferred_language
from official_websites import OFFICIAL_WEBSITES

DATA_DIR = Path(__file__).resolve().parent
OUT_PATH = DATA_DIR / "_graduate_directions.json"

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (compatible; MyUniBot/1.0; +https://myuni.uz)",
        "Accept-Language": "uz-UZ,uz;q=0.9,ru;q=0.8,en;q=0.7",
    }
)

GRADUATE_PATHS = [
    "/magistratura-mutaxassisliklar",
    "/magistratura-mutaxassisliklari",
    "/uz/magistratura-mutaxassisliklar",
    "/uz/magistratura-mutaxassisliklari",
    "/magistratura",
    "/uz/magistratura",
    "/fakultetlar/magistratura",
    "/uz/fakultetlar/magistratura",
    "/doktorantura",
    "/uz/doktorantura",
    "/phd",
    "/phd_program",
]

KEYWORD_LINK = re.compile(
    r"magistratura-mutaxassislik|/magistratura|/doktorantura|/phd",
    re.I,
)


def fetch_url(url: str, timeout: int = 12) -> str | None:
    try:
        response = SESSION.get(url, timeout=timeout, allow_redirects=True)
        if response.status_code >= 400:
            return None
        response.encoding = response.apparent_encoding or "utf-8"
        return response.text
    except requests.RequestException:
        return None


def discover_links(base_url: str, html: str) -> list[str]:
    found: list[str] = []
    for href in re.findall(r'href=["\']([^"\']+)["\']', html, re.I):
        if href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:"):
            continue
        absolute = urljoin(base_url, href)
        if KEYWORD_LINK.search(href) or KEYWORD_LINK.search(absolute):
            found.append(absolute)
    return found[:10]


def scrape_graduate(base_url: str, university_name: str) -> tuple[list[dict], list[dict], str]:
    candidates = [base_url.rstrip("/") + path for path in GRADUATE_PATHS]
    pages_checked: list[str] = []
    page_languages: list[str] = []
    master: list[dict] = []
    doctorate: list[dict] = []

    homepage = fetch_url(base_url)
    if homepage:
        pages_checked.append(base_url)
        page_languages.append(detect_page_language(homepage, base_url))
        candidates.extend(discover_links(base_url, homepage))

    seen_pages: set[str] = set()
    for url in candidates:
        if url in seen_pages:
            continue
        seen_pages.add(url)
        html = fetch_url(url)
        if not html:
            continue
        pages_checked.append(url)
        page_languages.append(detect_page_language(html, url))
        master.extend(parse_magistr_lines(html))
        doctorate.extend(parse_doctorate_lines(html))

    preferred = resolve_preferred_language(
        university_name,
        website=base_url,
        page_languages=page_languages,
        direction_names=[row["name"] for row in master + doctorate],
    )
    master = dedupe_directions(master, preferred)
    doctorate = dedupe_directions(doctorate, preferred)
    note = f"website:{base_url} pages={len(pages_checked)} lang={preferred}"
    return master, doctorate, note


def scrape_one(item: tuple[str, str]) -> tuple[str, dict | None]:
    name, website = item
    master, doctorate, note = scrape_graduate(website, name)
    if not master and not doctorate:
        return name, None
    return name, {
        "website": website,
        "master_directions": master,
        "doctorate_directions": doctorate,
        "master_count": len(master),
        "doctorate_count": len(doctorate),
        "note": note,
    }


def main() -> int:
    results: dict[str, dict] = {}
    master_ok = doctorate_ok = empty = 0
    items = list(OFFICIAL_WEBSITES.items())

    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = {pool.submit(scrape_one, item): item[0] for item in items}
        for index, future in enumerate(as_completed(futures), start=1):
            name = futures[future]
            try:
                _, payload = future.result()
            except Exception as exc:
                print(f"[{index}/{len(items)}] {name[:55]} ERR {exc}")
                empty += 1
                continue
            if payload:
                results[name] = payload
                if payload["master_count"]:
                    master_ok += 1
                if payload["doctorate_count"]:
                    doctorate_ok += 1
                print(
                    f"[{index}/{len(items)}] {name[:55]} "
                    f"master={payload['master_count']} doctorate={payload['doctorate_count']}"
                )
            else:
                empty += 1
                print(f"[{index}/{len(items)}] {name[:55]} none")

    OUT_PATH.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nSaved {OUT_PATH}")
    print(f"master={master_ok} doctorate={doctorate_ok} empty={empty}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
