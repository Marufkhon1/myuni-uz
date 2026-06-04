"""Build university -> directions map from infoedu.uz (DTM 2025/2026)."""
from __future__ import annotations

import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
SAMPLES = DATA_DIR / "_infoedu_samples"
HEI_PATH = DATA_DIR / "uz_hei_207.json"
OUT_PATH = DATA_DIR / "uz_hei_directions_207.json"
CACHE_DIR = DATA_DIR / "_infoedu_cache"
UA = {"User-Agent": "Mozilla/5.0 (compatible; MyUniResearch/1.0)"}
REQUEST_DELAY = 0.25


def fetch_page_props(url: str) -> dict:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as resp:
        html = resp.read().decode("utf-8", "replace")
    match = re.search(
        r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
        html,
        re.S,
    )
    if not match:
        raise ValueError(f"No __NEXT_DATA__ at {url}")
    return json.loads(match.group(1))["props"]["pageProps"]


def oliygoh_url(slug: str) -> str:
    encoded = urllib.parse.quote(slug, safe="-")
    return f"https://infoedu.uz/oliygoh/{encoded}"


def normalize_name(value: str) -> str:
    text = unicodedata.normalize("NFKC", value or "")
    text = text.replace("ʻ", "'").replace("’", "'").replace("`", "'")
    text = text.replace("O‘", "O'").replace("G‘", "G'").replace("o‘", "o'").replace("g‘", "g'")
    text = text.replace("O'", "O'").replace("G'", "G'")
    text = re.sub(r"[^\w\s'-]", " ", text.lower())
    text = re.sub(r"\s+", " ", text).strip()
    replacements = {
        "davlat": "",
        "universiteti": "universitet",
        "instituti": "institut",
        "akademiyasi": "akademiya",
        "filiali": "filial",
        "fakulteti": "fakultet",
        "milliy": "",
        "respublikasi": "",
        "nomidagi": "",
        "shahridagi": "",
        "shahrida": "",
        "xorijiy": "xalqaro",
        "nodavlat": "",
        "xususiy": "",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def token_set(value: str) -> set[str]:
    stop = {"va", "ham", "uchun", "bilan", "the", "of", "in", "university", "institut", "filial"}
    return {t for t in normalize_name(value).split() if len(t) > 2 and t not in stop}


def match_score(a: str, b: str) -> float:
    ta, tb = token_set(a), token_set(b)
    if not ta or not tb:
        return 0.0
    inter = len(ta & tb)
    return inter / max(len(ta), len(tb))


def best_match(name: str, candidates: list[str]) -> tuple[str | None, float]:
    best_name = None
    best_score = 0.0
    for candidate in candidates:
        score = match_score(name, candidate)
        if score > best_score:
            best_score = score
            best_name = candidate
    return best_name, best_score


def dedupe_directions(rows: list[dict]) -> list[dict]:
    seen: set[tuple[str, str]] = set()
    result: list[dict] = []
    for row in rows:
        key = (row["dirid"], row["name"])
        if key in seen:
            continue
        seen.add(key)
        result.append(row)
    result.sort(key=lambda r: (r["name"], r["dirid"]))
    return result


def aggregate_quotas(quotas: list[dict]) -> list[dict]:
    by_dirid: dict[str, dict] = {}
    for quota in quotas:
        dirid = str(quota.get("dirid") or "").strip()
        if not dirid:
            continue
        name = (quota.get("dirnm") or "").strip()
        entry = by_dirid.setdefault(
            dirid,
            {
                "dirid": dirid,
                "name": name,
                "exam_subjects": [],
                "study_forms": set(),
                "languages": set(),
            },
        )
        if name and not entry["name"]:
            entry["name"] = name
        fans = [quota.get("fan_1"), quota.get("fan_2")]
        entry["exam_subjects"] = [f for f in fans if f]
        form = (quota.get("emnm") or "").strip()
        if form:
            entry["study_forms"].add(form)
        lang = (quota.get("langnm") or "").strip()
        if lang:
            entry["languages"].add(lang)

    rows = []
    for entry in by_dirid.values():
        rows.append(
            {
                "dirid": entry["dirid"],
                "name": entry["name"],
                "exam_subjects": entry["exam_subjects"],
                "study_forms": sorted(entry["study_forms"]),
                "languages": sorted(entry["languages"]),
            }
        )
    return dedupe_directions(rows)


def fetch_university_directions(slug: str) -> tuple[str, list[dict]]:
    cache_file = CACHE_DIR / "universities" / f"{slug}.json"
    if cache_file.is_file():
        cached = json.loads(cache_file.read_text(encoding="utf-8"))
        return cached["title"], cached["directions"]

    url = oliygoh_url(slug)
    props = fetch_page_props(url)
    node = props.get("data", {}).get("nodeByUri") or props.get("data", {}).get("oliygohBy") or {}
    title = node.get("title") or slug
    quotas = props.get("quotas") or []
    directions = aggregate_quotas(quotas)
    cache_file.parent.mkdir(parents=True, exist_ok=True)
    cache_file.write_text(
        json.dumps({"title": title, "directions": directions}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    time.sleep(REQUEST_DELAY)
    return title, directions


def fetch_all_direction_dirids() -> list[str]:
    cache_file = CACHE_DIR / "all_dirids.json"
    if cache_file.is_file():
        return json.loads(cache_file.read_text(encoding="utf-8"))

    yonalish_cache = SAMPLES / "yonalish_list.json"
    if yonalish_cache.is_file():
        props = json.loads(yonalish_cache.read_text(encoding="utf-8"))
        dirids = sorted({str(item["dirid"]) for item in props.get("directions", []) if item.get("dirid")})
        if dirids:
            cache_file.write_text(json.dumps(dirids, ensure_ascii=False, indent=2), encoding="utf-8")
            return dirids

    dirids: list[str] = []
    for page in range(1, 120):
        url = f"https://infoedu.uz/yonalish?page={page}" if page > 1 else "https://infoedu.uz/yonalish"
        props = fetch_page_props(url)
        batch = [str(item["dirid"]) for item in props.get("directions", []) if item.get("dirid")]
        if not batch:
            break
        dirids.extend(batch)
        time.sleep(REQUEST_DELAY)

    dirids = sorted(set(dirids))
    cache_file.write_text(json.dumps(dirids, ensure_ascii=False, indent=2), encoding="utf-8")
    return dirids


def fetch_direction_otm_map() -> dict[str, list[dict]]:
    cache_file = CACHE_DIR / "otm_direction_map.json"
    if cache_file.is_file():
        return json.loads(cache_file.read_text(encoding="utf-8"))

    dirids = fetch_all_direction_dirids()
    otm_map: dict[str, dict[str, dict]] = defaultdict(dict)
    print(f"Fetching {len(dirids)} direction pages for reverse OTM map...")

    for index, dirid in enumerate(dirids, start=1):
        page_cache = CACHE_DIR / "directions" / f"{dirid}.json"
        if page_cache.is_file():
            quotas = json.loads(page_cache.read_text(encoding="utf-8"))
        else:
            props = fetch_page_props(f"https://infoedu.uz/yonalish/{dirid}")
            quotas = props.get("quotas") or []
            page_cache.parent.mkdir(parents=True, exist_ok=True)
            page_cache.write_text(json.dumps(quotas, ensure_ascii=False), encoding="utf-8")
            time.sleep(REQUEST_DELAY)

        for quota in quotas:
            otm = (quota.get("OTM") or "").strip()
            if not otm:
                continue
            name = (quota.get("dirnm") or "").strip()
            entry = otm_map[otm].setdefault(
                dirid,
                {
                    "dirid": dirid,
                    "name": name,
                    "exam_subjects": [quota.get("fan_1"), quota.get("fan_2")],
                    "study_forms": set(),
                    "languages": set(),
                },
            )
            form = (quota.get("emnm") or "").strip()
            if form:
                entry["study_forms"].add(form)
            lang = (quota.get("langnm") or "").strip()
            if lang:
                entry["languages"].add(lang)

        if index % 50 == 0:
            print(f"  direction pages: {index}/{len(dirids)}")

    payload: dict[str, list[dict]] = {}
    for otm, directions in otm_map.items():
        rows = []
        for entry in directions.values():
            rows.append(
                {
                    "dirid": entry["dirid"],
                    "name": entry["name"],
                    "exam_subjects": [f for f in entry["exam_subjects"] if f],
                    "study_forms": sorted(entry["study_forms"]),
                    "languages": sorted(entry["languages"]),
                }
            )
        payload[otm] = dedupe_directions(rows)

    cache_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return payload


def load_unique_slugs() -> list[dict]:
    slugs_path = SAMPLES / "all_oliygoh_slugs.json"
    rows = json.loads(slugs_path.read_text(encoding="utf-8"))
    seen: set[str] = set()
    unique: list[dict] = []
    for row in rows:
        slug = row["slug"]
        if slug in seen:
            continue
        seen.add(slug)
        unique.append(row)
    return unique


def main() -> int:
    CACHE_DIR.mkdir(exist_ok=True)
    heis = json.loads(HEI_PATH.read_text(encoding="utf-8"))
    hei_names = [entry["name"] for entry in heis]

    print("Step 1: direct infoedu university pages...")
    slug_rows = load_unique_slugs()
    direct_map: dict[str, list[dict]] = {}
    infoedu_titles: list[str] = []
    for index, row in enumerate(slug_rows, start=1):
        try:
            title, directions = fetch_university_directions(row["slug"])
        except Exception as exc:
            print(f"  skip slug {row['slug']}: {exc}")
            continue
        infoedu_titles.append(title)
        direct_map[title] = directions
        if index % 20 == 0:
            print(f"  fetched {index}/{len(slug_rows)}")

    print("Step 2: reverse map from all direction pages...")
    reverse_map = fetch_direction_otm_map()
    reverse_titles = list(reverse_map.keys())

    print("Step 3: match to 207 HEIs...")
    results = []
    matched_direct = matched_reverse = unmatched = 0

    for entry in heis:
        name = entry["name"]
        directions: list[dict] = []
        source = "unmatched"
        infoedu_title = None
        score = 0.0

        direct_title, direct_score = best_match(name, list(direct_map.keys()))
        reverse_title, reverse_score = best_match(name, reverse_titles)

        if direct_score >= 0.55 and direct_score >= reverse_score:
            infoedu_title = direct_title
            directions = direct_map[direct_title]
            source = "infoedu_university_page"
            score = direct_score
            matched_direct += 1
        elif reverse_score >= 0.55:
            infoedu_title = reverse_title
            directions = reverse_map[reverse_title]
            source = "infoedu_direction_reverse"
            score = reverse_score
            matched_reverse += 1
        else:
            unmatched += 1

        results.append(
            {
                **entry,
                "study_directions": directions,
                "directions_meta": {
                    "academic_year": "2025/2026",
                    "source": source,
                    "infoedu_title": infoedu_title,
                    "match_score": round(score, 3),
                    "direction_count": len(directions),
                },
            }
        )

    OUT_PATH.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    total_dirs = sum(len(r["study_directions"]) for r in results)
    with_dirs = sum(1 for r in results if r["study_directions"])
    print(f"Saved {OUT_PATH}")
    print(f"Universities with directions: {with_dirs}/207")
    print(f"Total direction records: {total_dirs}")
    print(f"Matched direct: {matched_direct}, reverse: {matched_reverse}, unmatched: {unmatched}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
