"""Generate contract_pricing for all entries in uz_hei_207.json."""
from __future__ import annotations

import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
JSON_PATH = DATA_DIR / "uz_hei_207.json"

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from universities.contract_pricing import build_contract_pricing  # noqa: E402


def main() -> int:
    entries = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    for entry in entries:
        entry["contract_pricing"] = build_contract_pricing(
            entry["name"],
            entry["ownership_type"],
            entry.get("short_name", ""),
        )

    JSON_PATH.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    samisi = next(e for e in entries if e["short_name"] == "SamISI")
    print("SamISI forms:")
    for form in samisi["contract_pricing"]["forms"]:
        print(f"  {form['label']}: o'rtacha {form['average_uzs']:,} so'm")
    print(f"Updated {len(entries)} entries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
