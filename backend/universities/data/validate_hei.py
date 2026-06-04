"""Validate uz_hei_207.json against stat.edu.uz / HEMIS ministry totals."""
from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent / "uz_hei_207.json"

EXPECTED_TOTAL = 207
EXPECTED_OWNERSHIP = {
    "state": 101,
    "private": 74,
    "international": 32,
}
EXPECTED_REGIONS = {
    "Toshkent shahar": 95,
    "Toshkent viloyati": 17,
    "Samarqand viloyati": 14,
    "Qoraqalpog'iston Respublikasi": 11,
    "Buxoro viloyati": 10,
    "Andijon viloyati": 9,
    "Farg'ona viloyati": 9,
    "Qashqadaryo viloyati": 9,
    "Surxondaryo viloyati": 6,
    "Xorazm viloyati": 8,
    "Namangan viloyati": 7,
    "Jizzax viloyati": 5,
    "Navoiy viloyati": 4,
    "Sirdaryo viloyati": 3,
}

REQUIRED_KEYS = {
    "name",
    "ownership_type",
    "city",
    "region",
    "short_name",
    "summary",
    "contract_pricing",
    "study_directions",
    "directions_meta",
}
VALID_OWNERSHIP = set(EXPECTED_OWNERSHIP)
VALID_FORM_CODES = {"kunduzgi", "kechki", "sirtqi", "masofaviy"}


def load_heis() -> list[dict]:
    with DATA_PATH.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError("Root JSON value must be an array")
    return data


def validate(heis: list[dict]) -> list[str]:
    errors: list[str] = []

    if len(heis) != EXPECTED_TOTAL:
        errors.append(f"total: expected {EXPECTED_TOTAL}, got {len(heis)}")

    ownership = Counter()
    regions = Counter()
    names: list[str] = []

    for index, entry in enumerate(heis, start=1):
        if not isinstance(entry, dict):
            errors.append(f"entry {index}: must be an object")
            continue

        missing = REQUIRED_KEYS - entry.keys()
        if missing:
            errors.append(f"entry {index}: missing keys {sorted(missing)}")
            continue

        name = entry["name"]
        if not isinstance(name, str) or not name.strip():
            errors.append(f"entry {index}: invalid name")
        else:
            names.append(name.strip())

        ownership_type = entry["ownership_type"]
        if ownership_type not in VALID_OWNERSHIP:
            errors.append(
                f"entry {index}: ownership_type must be one of {sorted(VALID_OWNERSHIP)}, "
                f"got {ownership_type!r}"
            )
        else:
            ownership[ownership_type] += 1

        region = entry["region"]
        regions[region] += 1

        for field in ("city", "region"):
            value = entry[field]
            if not isinstance(value, str) or not value.strip():
                errors.append(f"entry {index}: invalid {field}")

        pricing = entry.get("contract_pricing")
        if not isinstance(pricing, dict):
            errors.append(f"entry {index}: contract_pricing must be an object")
        else:
            forms = pricing.get("forms")
            if not isinstance(forms, list) or not forms:
                errors.append(f"entry {index}: contract_pricing.forms must be a non-empty list")
            else:
                for form in forms:
                    if not isinstance(form, dict):
                        errors.append(f"entry {index}: each form must be an object")
                        continue
                    code = form.get("code")
                    if code not in VALID_FORM_CODES:
                        errors.append(f"entry {index}: invalid form code {code!r}")
                    if not isinstance(form.get("average_uzs"), int) or form["average_uzs"] <= 0:
                        errors.append(f"entry {index}: form {code!r} missing average_uzs")

        directions = entry.get("study_directions")
        if not isinstance(directions, list):
            errors.append(f"entry {index}: study_directions must be a list")
        elif not directions:
            errors.append(f"entry {index}: study_directions must not be empty")
        else:
            for direction in directions:
                if not isinstance(direction, dict):
                    errors.append(f"entry {index}: each study direction must be an object")
                    continue
                if not isinstance(direction.get("name"), str) or not direction["name"].strip():
                    errors.append(f"entry {index}: study direction missing name")

        meta = entry.get("directions_meta")
        if not isinstance(meta, dict):
            errors.append(f"entry {index}: directions_meta must be an object")

    if len(names) != len(set(names)):
        dupes = [n for n in names if names.count(n) > 1]
        errors.append(f"duplicate names: {sorted(set(dupes))}")

    short_names = [entry.get("short_name", "").strip() for entry in heis if isinstance(entry, dict)]
    if len(short_names) != len(set(short_names)):
        dupes = [n for n in short_names if short_names.count(n) > 1]
        errors.append(f"duplicate short_name values: {sorted(set(dupes))}")

    for key, expected in EXPECTED_OWNERSHIP.items():
        actual = ownership.get(key, 0)
        if actual != expected:
            errors.append(f"ownership {key}: expected {expected}, got {actual}")

    for region, expected in EXPECTED_REGIONS.items():
        actual = regions.get(region, 0)
        if actual != expected:
            errors.append(f"region {region}: expected {expected}, got {actual}")

    extra_regions = set(regions) - set(EXPECTED_REGIONS)
    if extra_regions:
        errors.append(f"unexpected regions: {sorted(extra_regions)}")

    return errors


def main() -> int:
    if not DATA_PATH.is_file():
        print(f"Missing data file: {DATA_PATH}", file=sys.stderr)
        return 1

    heis = load_heis()
    errors = validate(heis)

    ownership = Counter(e["ownership_type"] for e in heis)
    regions = Counter(e["region"] for e in heis)

    print(f"File: {DATA_PATH}")
    print(f"Total: {len(heis)}")
    print("Ownership:")
    for key in ("state", "private", "international"):
        print(f"  {key}: {ownership.get(key, 0)}")
    print("Regions:")
    for region in sorted(EXPECTED_REGIONS, key=lambda r: -EXPECTED_REGIONS[r]):
        print(f"  {region}: {regions.get(region, 0)}")

    if errors:
        print("\nVALIDATION FAILED:")
        for err in errors:
            print(f"  - {err}")
        return 1

    print("\nVALIDATION PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
