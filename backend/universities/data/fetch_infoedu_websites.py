"""Fetch official websites from infoedu.uz university pages."""
from __future__ import annotations

import importlib.util
import json
import time
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
SAMPLES = DATA_DIR / "_infoedu_samples" / "all_oliygoh_slugs.json"
OUT = DATA_DIR / "_infoedu_websites.json"

_spec = importlib.util.spec_from_file_location("build", DATA_DIR / "build_hei_directions.py")
_build = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_build)


def main() -> None:
    rows = json.loads(SAMPLES.read_text(encoding="utf-8"))
    seen: set[str] = set()
    results: dict[str, str] = {}

    for row in rows:
        slug = row["slug"]
        if slug in seen:
            continue
        seen.add(slug)
        try:
            props = _build.fetch_page_props(_build.oliygoh_url(slug))
            node = props.get("data", {}).get("nodeByUri") or {}
            title = node.get("title") or row["title"]
            site = (node.get("oliygohMalumotlari") or {}).get("rasmiySayt") or ""
            if site:
                results[title] = site.strip()
            time.sleep(0.2)
        except Exception as exc:
            print(f"skip {slug}: {exc}")

    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {len(results)} websites -> {OUT}")


if __name__ == "__main__":
    main()
