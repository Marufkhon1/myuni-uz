"""Apply SUMMARIES from uz_hei_summaries.py to uz_hei_207.json."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
JSON_PATH = DATA_DIR / "uz_hei_207.json"

from uz_hei_summaries import SUMMARIES  # noqa: E402

MIN_WORDS = 120
MAX_WORDS = 220


def word_count(text: str) -> int:
    return len(text.split())


def main() -> int:
    entries = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    errors: list[str] = []

    if len(SUMMARIES) != 207:
        errors.append(f"SUMMARIES has {len(SUMMARIES)} entries, expected 207")

    json_names = [e["name"] for e in entries]
    if len(json_names) != 207:
        errors.append(f"uz_hei_207.json has {len(json_names)} entries, expected 207")

    missing = [n for n in json_names if n not in SUMMARIES]
    extra = [n for n in SUMMARIES if n not in json_names]
    if missing:
        errors.append(f"SUMMARIES missing {len(missing)} JSON names (e.g. {missing[0]!r})")
    if extra:
        errors.append(f"SUMMARIES has {len(extra)} keys not in JSON (e.g. {extra[0]!r})")

    empty = [n for n, t in SUMMARIES.items() if not t.strip()]
    if empty:
        errors.append(f"Empty summaries: {len(empty)} (e.g. {empty[0]!r})")

    for name, text in SUMMARIES.items():
        wc = word_count(text)
        if wc < MIN_WORDS or wc > MAX_WORDS:
            errors.append(f"Word count {wc} for {name!r} (expected {MIN_WORDS}-{MAX_WORDS})")
        if "\n\n" not in text:
            errors.append(f"Missing paragraph break for {name!r}")

    if errors:
        for msg in errors[:25]:
            print(f"ERROR: {msg}", file=sys.stderr)
        if len(errors) > 25:
            print(f"ERROR: ... and {len(errors) - 25} more", file=sys.stderr)
        return 1

    for entry in entries:
        entry["summary"] = SUMMARIES[entry["name"]]

    JSON_PATH.write_text(
        json.dumps(entries, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {len(entries)} entries in {JSON_PATH.name}")
    print(f"SUMMARIES count: {len(SUMMARIES)}")
    print(f"All summaries: {MIN_WORDS}-{MAX_WORDS} words, two paragraphs each")
    print("Samples:")
    for key in (
        "Toshkent davlat iqtisodiyot universiteti",
        "Aniq va ijtimoiy fanlar universiteti",
        "Toshkent davlat iqtisodiyot universiteti Samarqand filiali",
    ):
        wc = word_count(SUMMARIES[key])
        print(f"  {wc} words <- {key[:50]}...")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
