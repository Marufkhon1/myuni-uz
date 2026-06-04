import json
from collections import Counter
from pathlib import Path

d = json.loads(Path(__file__).parent.joinpath("uz_hei_207.json").read_text(encoding="utf-8"))
shorts = [x["short_name"] for x in d]
c = Counter(shorts)
dups = [k for k, v in c.items() if v > 1]
print("Duplicates:", dups or "none")
print(f"Total: {len(d)}")
for x in d:
    print(f"{x['short_name']:18} | {x['name']}")
