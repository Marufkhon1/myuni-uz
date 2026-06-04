import re
import requests

sites = ["https://wiut.uz/", "https://tdiu.uz/", "https://tsue.uz/", "https://edu.uz/"]
for site in sites:
    print("===", site)
    try:
        r = requests.get(site, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
        html = r.text
        print("status", r.status_code, "len", len(html))
        for m in re.finditer(r'<meta[^>]+(?:og:image|twitter:image)[^>]+>', html[:80000], re.I):
            print("meta", m.group(0)[:180])
        count = 0
        for m in re.finditer(r'<img[^>]+src=["\']([^"\']+)["\']', html[:120000], re.I):
            s = m.group(1)
            if any(x in s.lower() for x in ("logo", "icon", "svg")):
                continue
            print("img", s[:140])
            count += 1
            if count >= 5:
                break
    except Exception as exc:
        print("error", exc)
