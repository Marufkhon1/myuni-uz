"""Print contract pricing summary for uz_hei_207.json."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

DATA = Path(__file__).resolve().parent / "uz_hei_207.json"


def main() -> None:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    form_counts = Counter()
    for entry in data:
        for form in entry["contract_pricing"]["forms"]:
            form_counts[form["code"]] += 1

    print("Form availability (207 OTM):")
    for code, count in sorted(form_counts.items(), key=lambda x: -x[1]):
        print(f"  {code}: {count}")

    print()
    samples = ["SamISI", "TDIU SF", "TATU", "WIUT", "Akfa", "SamDU", "TDIU"]
    for short_name in samples:
        entry = next((x for x in data if x["short_name"] == short_name), None)
        if not entry:
            print(f"{short_name}: topilmadi")
            continue
        print(f"{short_name} ({entry['ownership_type']}):")
        for form in entry["contract_pricing"]["forms"]:
            avg = form["average_uzs"]
            print(f"  {form['label']}: {avg:,} so'm")
        print()


if __name__ == "__main__":
    main()
