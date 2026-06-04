"""Merge contact info into uz_hei_207.json from infoedu + official_websites."""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
HEI_PATH = DATA_DIR / "uz_hei_207.json"
INFOEDU_CONTACTS = DATA_DIR / "_infoedu_contacts.json"

sys.path.insert(0, str(DATA_DIR))
from official_websites import OFFICIAL_WEBSITES  # noqa: E402

_aliases_spec = importlib.util.spec_from_file_location("infoedu_aliases", DATA_DIR / "infoedu_aliases.py")
_aliases = importlib.util.module_from_spec(_aliases_spec)
assert _aliases_spec.loader is not None
_aliases_spec.loader.exec_module(_aliases)

_build_spec = importlib.util.spec_from_file_location("build", DATA_DIR / "build_hei_directions.py")
_build = importlib.util.module_from_spec(_build_spec)
assert _build_spec.loader is not None
_build_spec.loader.exec_module(_build)
best_match = _build.best_match


def reverse_alias_map() -> dict[str, str]:
    mapping: dict[str, str] = {}
    for our_name, infoedu_title in _aliases.INFOEDU_TITLE_ALIASES.items():
        mapping[infoedu_title] = our_name
    return mapping


def pick_infoedu_contact(name: str, contacts: dict[str, dict]) -> dict | None:
    alias = _aliases.INFOEDU_TITLE_ALIASES.get(name, name)
    for candidate in (alias, name):
        if candidate in contacts:
            return contacts[candidate]
    pool = list(contacts.keys())
    title, score = best_match(alias, pool)
    if score >= 0.72 and title:
        return contacts.get(title)
    title, score = best_match(name, pool)
    if score >= 0.72 and title:
        return contacts.get(title)
    return None


def main() -> int:
    entries = json.loads(HEI_PATH.read_text(encoding="utf-8"))
    infoedu = (
        json.loads(INFOEDU_CONTACTS.read_text(encoding="utf-8"))
        if INFOEDU_CONTACTS.is_file()
        else {}
    )
    stats = {"infoedu": 0, "website_only": 0, "fallback": 0}

    for entry in entries:
        name = entry["name"]
        city = entry.get("city", "")
        contact: dict = {
            "address": "",
            "phone": "",
            "email": "",
            "website": "",
            "telegram_url": "",
            "contact_source": "",
        }

        picked = pick_infoedu_contact(name, infoedu)
        if picked:
            contact.update({k: picked.get(k, "") or "" for k in contact if k != "contact_source"})
            contact["contact_source"] = "infoedu_dtm"
            stats["infoedu"] += 1
        elif name in OFFICIAL_WEBSITES:
            contact["website"] = OFFICIAL_WEBSITES[name]
            contact["contact_source"] = "official_website"
            stats["website_only"] += 1
        else:
            contact["address"] = f"{city}, O'zbekiston" if city else ""
            contact["contact_source"] = "city_fallback"
            stats["fallback"] += 1

        if not contact["website"] and name in OFFICIAL_WEBSITES:
            contact["website"] = OFFICIAL_WEBSITES[name]

        entry["contact"] = contact
        if contact["address"]:
            entry["address"] = contact["address"]
        if contact["phone"]:
            entry["phone"] = contact["phone"]
        if contact["email"]:
            entry["email"] = contact["email"]
        if contact["website"]:
            entry["website"] = contact["website"]
        if contact["telegram_url"]:
            entry["telegram_url"] = contact["telegram_url"]

    HEI_PATH.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {HEI_PATH}")
    print(f"Stats: {stats}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
