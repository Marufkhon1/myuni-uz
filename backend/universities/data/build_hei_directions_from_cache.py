"""Build uz_hei_directions_207.json from local infoedu cache only."""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
CACHE_DIR = DATA_DIR / "_infoedu_cache"
HEI_PATH = DATA_DIR / "uz_hei_207.json"
OUT_PATH = DATA_DIR / "uz_hei_directions_207.json"

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from universities.direction_fallback import fallback_directions  # noqa: E402

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
    uni_dir = CACHE_DIR / "universities"
    mapping: dict[str, list[dict]] = {}
    for path in uni_dir.glob("*.json"):
        payload = json.loads(path.read_text(encoding="utf-8"))
        mapping[payload["title"]] = payload["directions"]
    return mapping


def load_reverse_map() -> dict[str, list[dict]]:
    otm_map: dict[str, dict[str, dict]] = {}
    dir_dir = CACHE_DIR / "directions"
    for path in dir_dir.glob("*.json"):
        dirid = path.stem
        quotas = json.loads(path.read_text(encoding="utf-8"))
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
    return payload


def main() -> int:
    heis = json.loads(HEI_PATH.read_text(encoding="utf-8"))
    direct_map = load_direct_map()
    reverse_map = load_reverse_map()
    reverse_titles = list(reverse_map.keys())

    results = []
    stats = {"direct": 0, "reverse": 0, "fallback": 0}

    for entry in heis:
        name = entry["name"]
        directions: list[dict] = []
        source = "fallback_estimated"
        infoedu_title = None
        score = 0.0

        direct_title, direct_score = best_match(name, list(direct_map.keys()))
        reverse_title, reverse_score = best_match(name, reverse_titles)

        if direct_score >= 0.55 and direct_score >= reverse_score:
            infoedu_title = direct_title
            directions = direct_map[direct_title]
            source = "infoedu_university_page"
            score = direct_score
            stats["direct"] += 1
        elif reverse_score >= 0.55:
            infoedu_title = reverse_title
            directions = reverse_map[reverse_title]
            source = "infoedu_direction_reverse"
            score = reverse_score
            stats["reverse"] += 1
        else:
            directions = fallback_directions(name, entry["ownership_type"])
            stats["fallback"] += 1

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
    total = sum(len(r["study_directions"]) for r in results)
    with_dirs = sum(1 for r in results if r["study_directions"])
    print(f"Saved {OUT_PATH}")
    print(f"Universities with directions: {with_dirs}/207")
    print(f"Total directions: {total}")
    print(f"Stats: {stats}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
