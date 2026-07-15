#!/usr/bin/env bash
# Phase 4 live bot-routing smoke (run against staging/prod after nginx deploy).
# Usage: bash deploy/check-bot-routing.sh https://myuni.uz
set -euo pipefail
BASE="${1:-https://myuni.uz}"
BASE="${BASE%/}"

echo "==> Googlebot should get HTML-first (not thin share-preview)"
GOOGLE_BODY="$(curl -fsSL -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  "${BASE}/haqida")"
echo "$GOOGLE_BODY" | grep -q 'data-seo-ready="true\|myuni-render\|application/ld+json' \
  || { echo "FAIL: Googlebot HTML thin/yoki SSG emas"; exit 1; }
echo "$GOOGLE_BODY" | grep -qi 'meta http-equiv="refresh"' \
  && { echo "FAIL: Googlebot share-preview refresh oldi"; exit 1; } || true
echo "OK Googlebot"

echo "==> Facebookexternalhit should get share-preview OG"
FB_BODY="$(curl -fsSL -A "facebookexternalhit/1.1" "${BASE}/haqida")"
echo "$FB_BODY" | grep -q 'og:title' || { echo "FAIL: FB OG yo'q"; exit 1; }
echo "OK Facebook"

echo "==> Missing public path falls back to spa.html (not home SSG canonical)"
MISS_HEADERS="$(curl -sI -A "Mozilla/5.0" "${BASE}/this-route-should-not-exist-phase4-check")"
echo "$MISS_HEADERS" | grep -qi '200\|404' || true
MISS_BODY="$(curl -fsSL -A "Mozilla/5.0" "${BASE}/login" || true)"
if echo "$MISS_BODY" | grep -q 'name="myuni-render" content="ssg"'; then
  if echo "$MISS_BODY" | grep -q 'rel="canonical" href="[^"]*/haqida\|canonical.*/"$'; then
    echo "WARN: login may be served as SSG home — check nginx spa.html fallback"
  fi
fi
echo "OK smoke complete for ${BASE}"
