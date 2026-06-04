"""Apply SHORT_NAMES from uz_hei_short_names.py to uz_hei_207.json."""
from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
JSON_PATH = DATA_DIR / "uz_hei_207.json"

from uz_hei_short_names import SHORT_NAMES  # noqa: E402


def main() -> int:
    entries = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    errors: list[str] = []

    if len(SHORT_NAMES) != 207:
        errors.append(f"SHORT_NAMES has {len(SHORT_NAMES)} entries, expected 207")

    json_names = [e["name"] for e in entries]
    if len(json_names) != 207:
        errors.append(f"uz_hei_207.json has {len(json_names)} entries, expected 207")

    missing = [n for n in json_names if n not in SHORT_NAMES]
    extra = [n for n in SHORT_NAMES if n not in json_names]
    if missing:
        errors.append(f"SHORT_NAMES missing {len(missing)} JSON names (e.g. {missing[0]!r})")
    if extra:
        errors.append(f"SHORT_NAMES has {len(extra)} keys not in JSON (e.g. {extra[0]!r})")

    shorts = list(SHORT_NAMES.values())
    dupes = [k for k, v in Counter(shorts).items() if v > 1]
    if dupes:
        errors.append(f"Duplicate short_name values: {dupes}")

    for short in shorts:
        if short.endswith("-2") or short.rstrip().endswith("-2"):
            errors.append(f"Disallowed -2 suffix: {short!r}")

    if errors:
        for msg in errors:
            print(f"ERROR: {msg}", file=sys.stderr)
        return 1

    for entry in entries:
        entry["short_name"] = SHORT_NAMES[entry["name"]]

    JSON_PATH.write_text(
        json.dumps(entries, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {len(entries)} entries in {JSON_PATH.name}")
    print(f"SHORT_NAMES count: {len(SHORT_NAMES)}")
    print(f"Unique short_name values: {len(set(shorts))}")
    print("Samples:")
    for key in (
        "Toshkent davlat iqtisodiyot universiteti Samarqand filiali",
        "Samarqand iqtisodiyot va servis instituti",
    ):
        print(f"  {SHORT_NAMES[key]!r} <- {key[:55]}...")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
