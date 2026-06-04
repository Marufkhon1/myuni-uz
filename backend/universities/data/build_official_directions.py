"""Merge official directions: infoedu (DTM) + university websites."""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
HEI_PATH = DATA_DIR / "uz_hei_207.json"
OUT_PATH = DATA_DIR / "uz_hei_directions_207.json"
WEBSITE_PATH = DATA_DIR / "_website_directions.json"
GRADUATE_PATH = DATA_DIR / "_graduate_directions.json"
CACHE_DIR = DATA_DIR / "_infoedu_cache"

sys.path.insert(0, str(DATA_DIR))

_aliases_spec = importlib.util.spec_from_file_location("infoedu_aliases", DATA_DIR / "infoedu_aliases.py")
_aliases = importlib.util.module_from_spec(_aliases_spec)
assert _aliases_spec.loader is not None
_aliases_spec.loader.exec_module(_aliases)
INFOEDU_TITLE_ALIASES = _aliases.INFOEDU_TITLE_ALIASES

_curated_spec = importlib.util.spec_from_file_location("curated_private_directions", DATA_DIR / "curated_private_directions.py")
_curated = importlib.util.module_from_spec(_curated_spec)
assert _curated_spec.loader is not None
_curated_spec.loader.exec_module(_curated)
CURATED_DIRECTIONS = _curated.CURATED_DIRECTIONS

_lang_spec = importlib.util.spec_from_file_location(
    "direction_language_utils",
    DATA_DIR / "direction_language_utils.py",
)
_lang = importlib.util.module_from_spec(_lang_spec)
assert _lang_spec.loader is not None
_lang_spec.loader.exec_module(_lang)
normalize_university_directions = _lang.normalize_university_directions

_build_spec = importlib.util.spec_from_file_location(
    "build_hei_directions",
    DATA_DIR / "build_hei_directions.py",
)
_build = importlib.util.module_from_spec(_build_spec)
assert _build_spec.loader is not None
_build_spec.loader.exec_module(_build)

best_match = _build.best_match
dedupe_directions = _build.dedupe_directions


def load_direct_map() -> dict[str, list[dict]]:
    mapping: dict[str, list[dict]] = {}
    for path in (CACHE_DIR / "universities").glob("*.json"):
        payload = json.loads(path.read_text(encoding="utf-8"))
        mapping[payload["title"]] = payload["directions"]
    return mapping


def load_reverse_map() -> dict[str, list[dict]]:
    path = CACHE_DIR / "otm_direction_map.json"
    if path.is_file():
        return json.loads(path.read_text(encoding="utf-8"))

    otm_map: dict[str, dict[str, dict]] = {}
    for file_path in (CACHE_DIR / "directions").glob("*.json"):
        dirid = file_path.stem
        quotas = json.loads(file_path.read_text(encoding="utf-8"))
        for quota in quotas:
            otm = (quota.get("OTM") or "").strip()
            if not otm:
                continue
            name = (quota.get("dirnm") or "").strip()
            entry = otm_map.setdefault(otm, {}).setdefault(
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

    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return payload


def resolve_infoedu_title(name: str) -> str:
    return INFOEDU_TITLE_ALIASES.get(name, name)


def pick_infoedu_directions(
    name: str,
    direct_map: dict[str, list[dict]],
    reverse_map: dict[str, list[dict]],
) -> tuple[list[dict], str, str | None, float]:
    alias = resolve_infoedu_title(name)
    pool = list(set(direct_map.keys()) | set(reverse_map.keys()))

    for candidate in (alias, name):
        if candidate in direct_map and direct_map[candidate]:
            return direct_map[candidate], "infoedu_dtm", candidate, 1.0
        if candidate in reverse_map and reverse_map[candidate]:
            return reverse_map[candidate], "infoedu_dtm", candidate, 1.0

    best_title = None
    best_score = 0.0
    for query in (alias, name):
        title, score = best_match(query, pool)
        if score > best_score:
            best_score = score
            best_title = title

    if best_title and best_score >= 0.55:
        data = direct_map.get(best_title) or reverse_map.get(best_title) or []
        if data:
            return data, "infoedu_dtm", best_title, best_score

    return [], "", None, 0.0


def main() -> int:
    heis = json.loads(HEI_PATH.read_text(encoding="utf-8"))
    direct_map = load_direct_map()
    reverse_map = load_reverse_map()
    website_data = (
        json.loads(WEBSITE_PATH.read_text(encoding="utf-8")) if WEBSITE_PATH.is_file() else {}
    )
    graduate_data = (
        json.loads(GRADUATE_PATH.read_text(encoding="utf-8")) if GRADUATE_PATH.is_file() else {}
    )

    stats = {"infoedu_dtm": 0, "official_website": 0, "curated_official": 0, "missing": 0}
    graduate_stats = {"master": 0, "doctorate": 0}
    results = []

    for entry in heis:
        name = entry["name"]
        directions: list[dict] = []
        source = "missing"
        matched_title = None
        score = 0.0
        website = None

        directions, source, matched_title, score = pick_infoedu_directions(
            name, direct_map, reverse_map
        )
        if directions:
            stats["infoedu_dtm"] += 1
        elif name in website_data and website_data[name]["directions"]:
            payload = website_data[name]
            directions = payload["directions"]
            source = "official_website"
            website = payload.get("website")
            stats["official_website"] += 1
        elif name in CURATED_DIRECTIONS and CURATED_DIRECTIONS[name]:
            directions = CURATED_DIRECTIONS[name]
            source = "curated_official"
            stats["curated_official"] += 1
        else:
            source = "missing"
            stats["missing"] += 1

        website = website or (website_data.get(name) or {}).get("website")
        directions = normalize_university_directions(
            name,
            directions,
            website=website,
            source=source,
        )
        if not directions and name in CURATED_DIRECTIONS and CURATED_DIRECTIONS[name]:
            directions = normalize_university_directions(
                name,
                CURATED_DIRECTIONS[name],
                website=website,
                source="curated_official",
            )
            if directions:
                source = "curated_official"
                stats["curated_official"] += 1
                if stats["missing"]:
                    stats["missing"] -= 1
                elif stats["official_website"]:
                    stats["official_website"] -= 1

        graduate_payload = graduate_data.get(name) or {}
        master_directions = graduate_payload.get("master_directions") or []
        doctorate_directions = graduate_payload.get("doctorate_directions") or []
        master_directions = normalize_university_directions(
            name,
            master_directions,
            website=graduate_payload.get("website") or website,
            source="official_website" if master_directions else None,
        )
        doctorate_directions = normalize_university_directions(
            name,
            doctorate_directions,
            website=graduate_payload.get("website") or website,
            source="official_website" if doctorate_directions else None,
        )
        if master_directions:
            graduate_stats["master"] += 1
        if doctorate_directions:
            graduate_stats["doctorate"] += 1

        meta = {
            "academic_year": "2025/2026",
            "source": source,
            "infoedu_title": matched_title,
            "match_score": round(score, 3),
            "direction_count": len(directions),
            "master_count": len(master_directions),
            "doctorate_count": len(doctorate_directions),
        }
        if website:
            meta["website"] = website
        if master_directions:
            meta["master_source"] = "official_website"
        if doctorate_directions:
            meta["doctorate_source"] = "official_website"

        results.append(
            {
                **entry,
                "study_directions": directions,
                "study_directions_master": master_directions,
                "study_directions_doctorate": doctorate_directions,
                "directions_meta": meta,
            }
        )

    OUT_PATH.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(len(r["study_directions"]) for r in results)
    total_master = sum(len(r.get("study_directions_master") or []) for r in results)
    total_doctorate = sum(len(r.get("study_directions_doctorate") or []) for r in results)
    print(f"Saved {OUT_PATH}")
    print(f"Stats: {stats}")
    print(f"Graduate stats: {graduate_stats}")
    print(f"Total directions: {total} | master: {total_master} | doctorate: {total_doctorate}")
    if stats["missing"]:
        print("Missing:")
        for row in results:
            if row["directions_meta"]["source"] == "missing":
                print(f"  - {row['short_name']}: {row['name']}")
    return 0 if stats["missing"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
