"""Print study directions summary for uz_hei_207.json."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

DATA = Path(__file__).resolve().parent / "uz_hei_207.json"


def main() -> None:
    rows = json.loads(DATA.read_text(encoding="utf-8"))
    sources = Counter(r["directions_meta"]["source"] for r in rows)
    total = sum(len(r["study_directions"]) for r in rows)
    print("Manba bo'yicha (207 OTM):")
    for key, count in sources.most_common():
        print(f"  {key}: {count}")
    print(f"\nJami yo'nalishlar: {total}")
    print(f"O'rtacha / OTM: {total / len(rows):.1f}")

    for short in ("SamISI", "TDIU", "TATU", "Akfa", "WIUT"):
        entry = next(r for r in rows if r["short_name"] == short)
        print(f"\n{short} — {entry['directions_meta']['direction_count']} ta yo'nalish ({entry['directions_meta']['source']}):")
        for direction in entry["study_directions"][:8]:
            forms = ", ".join(direction.get("study_forms") or [])
            print(f"  • {direction['name']}" + (f" [{forms}]" if forms else ""))
        if entry["directions_meta"]["direction_count"] > 8:
            print(f"  ... va yana {entry['directions_meta']['direction_count'] - 8} ta")


if __name__ == "__main__":
    main()
