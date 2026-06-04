"""Probe infoedu.uz and my.edu.uz for magistratura/doktorantura data."""
from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location("build", DATA_DIR / "build_hei_directions.py")
_build = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_build)

fetch_page_props = _build.fetch_page_props
oliygoh_url = _build.oliygoh_url

CANDIDATE_URLS = [
    "https://infoedu.uz/magistratura",
    "https://infoedu.uz/mutaxassislik",
    "https://infoedu.uz/magistr",
    "https://infoedu.uz/doktorantura",
    "https://infoedu.uz/phd",
    "https://infoedu.uz/yonalish-magistr",
    "https://infoedu.uz/magistr-yonalish",
    "https://my.edu.uz",
    "https://api.my.edu.uz",
]


def summarize_props(url: str, props: dict) -> None:
    print(f"\n=== {url} ===")
    print("top keys:", list(props.keys()))
    for key in ("directions", "quotas", "magistr", "mutaxassisliklar", "specialties"):
        val = props.get(key)
        if val is not None:
            print(f"  {key}: type={type(val).__name__} len={len(val) if hasattr(val, '__len__') else val}")
            if isinstance(val, list) and val and isinstance(val[0], dict):
                print(f"    first keys: {list(val[0].keys())}")
                print(f"    first item: {json.dumps(val[0], ensure_ascii=False)[:300]}")


def inspect_university(slug: str) -> None:
    props = fetch_page_props(oliygoh_url(slug))
    quotas = props.get("quotas") or []
    print(f"\n--- {slug} quotas={len(quotas)} ---")
    if quotas:
        sample = quotas[0]
        print("quota keys:", list(sample.keys()))
        dirids = {str(q.get("dirid", ""))[:2] for q in quotas}
        print("dirid prefixes:", sorted(dirids))
    text = json.dumps(props, ensure_ascii=False)
    for pattern in (r"70\d{4,8}", r"71\d{4,8}", r"magistr", r"doktor", r"mutaxassis"):
        hits = re.findall(pattern, text, re.I)
        if hits:
            print(f"  pattern {pattern}: {len(hits)} hits, sample={hits[:3]}")


def main() -> int:
    for url in CANDIDATE_URLS:
        try:
            summarize_props(url, fetch_page_props(url))
        except Exception as exc:
            print(f"\n=== {url} === FAIL: {exc}")

    for slug in ("buxoro-davlat-universiteti", "toshkent-davlat-iqtisodiyot-universiteti", "ozbekiston-milliy-universiteti"):
        try:
            inspect_university(slug)
        except Exception as exc:
            print(f"uni {slug} FAIL: {exc}")

    yonalish = fetch_page_props("https://infoedu.uz/yonalish")
    dirs = yonalish.get("directions") or []
    prefixes: dict[str, int] = {}
    for item in dirs:
        pref = str(item.get("dirid", ""))[:2]
        prefixes[pref] = prefixes.get(pref, 0) + 1
    print("\n--- yonalish list dirid prefixes ---", prefixes)
    magistr_like = [d for d in dirs if str(d.get("dirid", "")).startswith(("70", "71", "72"))]
    print(f"70/71/72 codes in yonalish list: {len(magistr_like)}")
    if magistr_like:
        print("sample:", json.dumps(magistr_like[:3], ensure_ascii=False, indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
