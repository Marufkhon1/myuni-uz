# Phase 4 — HTML-first public rendering (SSG)

**Status:** Production ship bar met (2026-07-15) — fail-closed SSG + spa.html fallback  
**Strategy:** Playwright build-time SSG on Vite + React Router. Dashboards stay CSR. No Next.js rewrite.

## What ships

| Surface | Behavior |
|---------|----------|
| Humans + Googlebot / Bingbot | `try_files` → prerendered `dist/<route>/index.html` |
| Missing / auth / dashboard routes | **`/spa.html` CSR shell** (never SSG home) |
| Social crawlers (FB, TG, Twitter, …) | Django share-preview OG cards only |

## Hard gates (fail closed)

1. `prerender-public.mjs` copies Vite `index.html` → `spa.html` **before** overwriting home with SSG
2. `verify-prerender.mjs` + `check-ssg-health.mjs` assert `spa.html` is not SSG-polluted
3. `npm run build` runs budgets + CWV smoke + SSG health
4. Turon `install.sh` requires full SSG (`ALLOW_SPA_ONLY=1` emergency only)
5. CI uploads **full** `frontend/dist` artifact (`myuni-ssg-dist`)
6. Live check: `bash deploy/check-bot-routing.sh https://myuni.uz`

## nginx (required)

```nginx
try_files $uri $uri/ $uri/index.html /spa.html;
```

Googlebot is **not** in the social UA map.

## Content sync

| Source | Empty faculties/admission | Empty reviews |
|--------|---------------------------|---------------|
| XML sitemap | omitted | omitted |
| Prerender | skipped | always (noindex page) |
| Silo nav / HTML sitemap / hub teasers | hidden / not linked | always linked |

## CWV

- Bundle gzip budgets (entry / total JS / CSS)
- Playwright LCP ≤ 2.5s, CLS ≤ 0.1 on `/`, `/haqida`, `/taqqoslash`

## i18n

Scaffold only: `src/i18n/*`, `/ru` noindex hub, Footer switcher, `html[lang]`.  
`buildHreflangAlternates` points `ru` → `/ru` only (no fake `/ru/*` URLs). Full RU content is progressive.

## Why not Next.js

HTML-first crawl + CWV without dashboard rewrite. Request-time SSR remains optional if rebuild freshness becomes the bottleneck.
