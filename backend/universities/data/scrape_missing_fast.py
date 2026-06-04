"""Fast scrape for missing HEIs with per-site timeout."""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(DATA_DIR))

from official_websites import OFFICIAL_WEBSITES  # noqa: E402

_spec = importlib.util.spec_from_file_location("scrape", DATA_DIR / "scrape_official_directions.py")
_scrape = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_scrape)
_scrape.SESSION.timeout = 8  # type: ignore[attr-defined]

DIRECTIONS_PATH = DATA_DIR / "uz_hei_directions_207.json"
OUT_PATH = DATA_DIR / "_website_directions.json"


def main() -> int:
    rows = json.loads(DIRECTIONS_PATH.read_text(encoding="utf-8"))
    missing = [row for row in rows if row["directions_meta"].get("source") == "missing"]
    existing = json.loads(OUT_PATH.read_text(encoding="utf-8")) if OUT_PATH.is_file() else {}

    print(f"Missing HEIs: {len(missing)}", flush=True)
    ok = fail = skip = 0

    for index, row in enumerate(missing, start=1):
        name = row["name"]
        if name in existing and existing[name].get("directions"):
            skip += 1
            continue
        website = OFFICIAL_WEBSITES.get(name)
        if not website:
            print(f"[{index}] SKIP no website: {row['short_name']}", flush=True)
            fail += 1
            continue

        print(f"[{index}] {row['short_name']} -> {website}", flush=True)
        try:
            directions, note = _scrape.scrape_website(website)
        except Exception as exc:  # noqa: BLE001
            print(f"  ERROR {exc}", flush=True)
            fail += 1
            continue

        if directions:
            ok += 1
            existing[name] = {
                "website": website,
                "direction_count": len(directions),
                "directions": directions,
                "note": note,
            }
            OUT_PATH.write_text(
                json.dumps(existing, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print(f"  OK {len(directions)}", flush=True)
        else:
            fail += 1
            print("  FAIL", flush=True)

    print(f"done ok={ok} fail={fail} skip={skip}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
