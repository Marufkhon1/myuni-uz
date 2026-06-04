"""Merge study_directions from uz_hei_directions_207.json into uz_hei_207.json."""
from __future__ import annotations

import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
HEI_PATH = DATA_DIR / "uz_hei_207.json"
DIRECTIONS_PATH = DATA_DIR / "uz_hei_directions_207.json"


def main() -> int:
    heis = json.loads(HEI_PATH.read_text(encoding="utf-8"))
    directions = json.loads(DIRECTIONS_PATH.read_text(encoding="utf-8"))
    by_name = {entry["name"]: entry for entry in directions}

    missing = []
    for entry in heis:
        payload = by_name.get(entry["name"])
        if not payload:
            missing.append(entry["name"])
            continue
        entry["study_directions"] = payload.get("study_directions", [])
        entry["study_directions_master"] = payload.get("study_directions_master", [])
        entry["study_directions_doctorate"] = payload.get("study_directions_doctorate", [])
        entry["directions_meta"] = payload.get("directions_meta", {})

    if missing:
        raise SystemExit(f"Missing direction payloads for: {missing}")

    HEI_PATH.write_text(json.dumps(heis, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(len(e.get("study_directions", [])) for e in heis)
    total_master = sum(len(e.get("study_directions_master", [])) for e in heis)
    total_doctorate = sum(len(e.get("study_directions_doctorate", [])) for e in heis)
    print(f"Updated {len(heis)} entries, {total} bachelor + {total_master} master + {total_doctorate} doctorate")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
