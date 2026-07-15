# Phase 5 — Market expansion (scholarships, programs, regional)

**Status:** Ship bar met (2026-07-15) — re-audit P0/P1 closed  
**Deferred (by design):** careers job board, full CA/Studyportals clone, Partner CRM, per-program SEO URLs × thousands

## Shipped URLs

| URL | Role | Data |
|-----|------|------|
| `/stipendiyalar` | Scholarships / grant vs kontrakt hub | Editorial content |
| `/qabul-qollanmasi` | Admission guide | Editorial content |
| `/yo-nalishlar` | Program discovery | `GET /api/public/programs/` |
| `/hamkorlar` | Partners trust page | Content + featured unis API |
| `/shahar/:slug` | Regional city landings (8 cities) | `GET /api/public/cities/<slug>/?page=` |

## SEO wiring

- `PAGE_META` + `usePageMeta` (cities: dynamic title/desc + paginated canonical)
- Nav `RESOURCE_NAV_LINKS` + Footer **Shaharlar** + landing explore strip
- XML sitemap `v6` (featured cities only if ≥1 university)
- Share-preview `v5` (empty city → `noindex`)
- Prerender all hubs + 8 cities; `verify-prerender` asserts all 8
- Faceted `/yo-nalishlar?q|degree|city` → `noindex`; unfiltered `?page=` kept in canonical
- Empty city pages → FE + share-preview `noindex` + omitted from XML

## Re-audit fixes (→ true 10/10)

1. City API pagination (count == total, pages of 24) — no silent 48-cap
2. Product copy: no roadmap speak; About → `/hamkorlar`; partners “ro'yxat” not “logotiplar”
3. City discoverability: footer Shaharlar + multi-city landing links
4. Tests: filters, pagination, empty-city robots/sitemap

## Explicit non-goals

- Empty `/karyera` portal
- Fake Partner CRM / contracts
- Invented scholarship registry without update pipeline
- Full `/ru` translation (Phase 4 scaffold only)

## Next bets

1. Seed / refresh study directions coverage  
2. City → region pages after traffic validates  
3. Selective outbound study tab (labeled), after UZ SERP ownership
