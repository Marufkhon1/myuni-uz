"""Merge infoedu rasmiySayt URLs into official_websites.py map."""
from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
INFOEDU_SITES = DATA_DIR / "_infoedu_websites.json"
HEI_PATH = DATA_DIR / "uz_hei_207.json"
OFFICIAL_PATH = DATA_DIR / "official_websites.py"

_spec = importlib.util.spec_from_file_location("aliases", DATA_DIR / "infoedu_aliases.py")
_aliases = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_aliases)

_spec2 = importlib.util.spec_from_file_location("build", DATA_DIR / "build_hei_directions.py")
_build = importlib.util.module_from_spec(_spec2)
assert _spec2.loader is not None
_spec2.loader.exec_module(_build)


def main() -> None:
    heis = json.loads(HEI_PATH.read_text(encoding="utf-8"))
    infoedu_sites = json.loads(INFOEDU_SITES.read_text(encoding="utf-8"))
    reverse = {_build.normalize_name(k): (k, v) for k, v in infoedu_sites.items()}

    module_text = OFFICIAL_PATH.read_text(encoding="utf-8")
    match = re.search(r"OFFICIAL_WEBSITES: dict\[str, str\] = \{", module_text)
    if not match:
        raise SystemExit("Could not parse official_websites.py")

    # Load existing dict via exec in isolated namespace
    namespace: dict = {}
    exec(module_text, namespace)
    sites: dict[str, str] = dict(namespace["OFFICIAL_WEBSITES"])

    added = 0
    for entry in heis:
        name = entry["name"]
        if name in sites:
            continue
        alias = _aliases.INFOEDU_TITLE_ALIASES.get(name, name)
        for candidate in (alias, name):
            norm = _build.normalize_name(candidate)
            if norm in reverse:
                sites[name] = reverse[norm][1]
                added += 1
                break
            for info_title, url in infoedu_sites.items():
                if _build.match_score(candidate, info_title) >= 0.82:
                    sites[name] = url
                    added += 1
                    break
            else:
                continue
            break

    lines = ['"""Known official websites for Uzbekistan HEIs (2025/2026)."""\nfrom __future__ import annotations\n\nOFFICIAL_WEBSITES: dict[str, str] = {\n']
    for name in sorted(sites, key=lambda value: value.lower()):
        lines.append(f'    "{name}": "{sites[name]}",\n')
    lines.append("}\n")
    OFFICIAL_PATH.write_text("".join(lines), encoding="utf-8")
    print(f"Updated {OFFICIAL_PATH} | total={len(sites)} added={added}")


if __name__ == "__main__":
    main()
