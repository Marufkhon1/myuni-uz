"""Fetch official contact info from infoedu.uz oligoh pages."""
from __future__ import annotations

import importlib.util
import json
import time
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
SAMPLES = DATA_DIR / "_infoedu_samples" / "all_oliygoh_slugs.json"
OUT = DATA_DIR / "_infoedu_contacts.json"

_spec = importlib.util.spec_from_file_location("build", DATA_DIR / "build_hei_directions.py")
_build = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_build)


def main() -> int:
    rows = json.loads(SAMPLES.read_text(encoding="utf-8"))
    seen: set[str] = set()
    results: dict[str, dict] = {}
    ok = fail = 0

    for row in rows:
        slug = row["slug"]
        if slug in seen:
            continue
        seen.add(slug)
        try:
            props = _build.fetch_page_props(_build.oliygoh_url(slug))
            node = props.get("data", {}).get("nodeByUri") or {}
            title = node.get("title") or row.get("title") or slug
            info = node.get("oliygohMalumotlari") or {}
            payload = {
                "slug": slug,
                "address": (info.get("manzil") or "").strip(),
                "phone": (info.get("telefon") or "").strip(),
                "email": (info.get("elektronPochta") or "").strip(),
                "website": (info.get("rasmiySayt") or "").strip(),
                "telegram_url": (info.get("telegramKanal") or "").strip(),
                "source": "infoedu_dtm",
            }
            if any(payload[k] for k in ("address", "phone", "email", "website", "telegram_url")):
                results[title] = payload
                ok += 1
            else:
                fail += 1
            time.sleep(0.2)
        except Exception as exc:
            fail += 1
            print(f"skip {slug}: {exc}")

    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {len(results)} contacts -> {OUT} (ok={ok} fail={fail})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
