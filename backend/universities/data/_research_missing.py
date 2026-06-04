"""Research official directions for 65 missing HEIs."""
from __future__ import annotations

import importlib.util
import json
import sys
import time
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(DATA_DIR))

from build_hei_directions import best_match, fetch_page_props, fetch_university_directions, oliygoh_url  # noqa: E402
from official_websites import OFFICIAL_WEBSITES  # noqa: E402

_spec = importlib.util.spec_from_file_location("scrape", DATA_DIR / "scrape_official_directions.py")
_scrape = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_scrape)

SHORTS = {
    "ATU", "BMU", "RHTU", "DiplomatU", "FVTU", "IVSFI", "Gubkin", "ISFTS", "Japan DigitalU",
    "MVIMA", "MEI", "MillatU", "MEPhI", "MSU", "RNIIMU", "OrientalU", "PerfectU", "PisaU",
    "RIVAU", "RenessansU", "SarbonU", "SharqU", "STARS IU", "TIUT", "TIUE", "TMU", "TTechU",
    "OxusU", "TAFU", "TIIU", "RGPU", "VGIK", "TOBB ETU", "TXMBVTU", "TDXU", "UMFT", "NIU",
    "IAU", "AngrenU", "AVIFU", "FTU", "MISiS OF", "IYIU", "GreenU", "Auezov ChF", "BelATKI",
    "O'z-Fin PI", "SamXTU", "UEP", "ISMA FF", "TuranU", "UBS", "AcharyaU", "BPVXTI", "OXU",
    "KFU JF", "SambhramU", "OTXU", "XinnovU", "TIVSU", "NavInvI", "MamunU", "URTU", "NukInvI",
    "TGFU",
}

OUT = DATA_DIR / "_missing_research.json"


def main() -> int:
    rows = json.loads((DATA_DIR / "uz_hei_directions_207.json").read_text(encoding="utf-8"))
    targets = [r for r in rows if r["short_name"] in SHORTS]
    slugs = json.loads((DATA_DIR / "_infoedu_samples" / "all_oliygoh_slugs.json").read_text(encoding="utf-8"))
    slug_titles = {s["title"]: s["slug"] for s in slugs}
    titles = list(slug_titles.keys())

    results: dict[str, dict] = {}

    for row in sorted(targets, key=lambda r: r["short_name"]):
        name = row["name"]
        short = row["short_name"]
        entry: dict = {"name": name, "short_name": short, "sources": []}

        # infoedu match
        matched_title, score = best_match(name, titles)
        if matched_title and score >= 0.55:
            slug = slug_titles[matched_title]
            try:
                title, directions = fetch_university_directions(slug)
                if directions:
                    entry["infoedu"] = {
                        "title": title,
                        "score": round(score, 3),
                        "url": oliygoh_url(slug),
                        "directions": [d["name"] for d in directions],
                    }
                    entry["sources"].append("infoedu")
            except Exception as exc:
                entry["infoedu_error"] = str(exc)

        # website scrape
        website = OFFICIAL_WEBSITES.get(name)
        if website:
            try:
                directions, note = _scrape.scrape_website(website)
                if directions:
                    entry["website"] = {
                        "url": website,
                        "note": note,
                        "directions": [d["name"] for d in directions],
                    }
                    entry["sources"].append("website")
            except Exception as exc:
                entry["website_error"] = str(exc)

        results[name] = entry
        time.sleep(0.1)

    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    found = sum(1 for v in results.values() if v.get("infoedu") or v.get("website"))
    print(f"Saved {OUT}: {found}/{len(results)} with data")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
