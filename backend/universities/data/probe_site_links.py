"""Quick probe a university website for direction links."""
from __future__ import annotations

import re
import sys

import requests

url = sys.argv[1] if len(sys.argv) > 1 else "https://csu.uz"
html = requests.get(url, timeout=20, headers={"User-Agent": "Mozilla/5.0"}).text
print("len", len(html))
for link in re.findall(r'href=["\']([^"\']+)["\']', html, re.I):
    if re.search(r"yonal|program|qabul|bakal|facult|direction|special|ta.lim", link, re.I):
        print(link)
