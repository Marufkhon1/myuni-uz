# MyUni.uz — Enterprise Information Architecture & Product Architecture Review

**Date:** 2026-07-15  
**Scope:** Complete product research + full codebase audit (no code changes)  
**Stack audited:** Vite 8 + React 19 SPA (React Router 7) · Django 5 + DRF · nginx bot share-preview  
**Brand:** [myuni.uz](https://myuni.uz)

---

## Executive verdict

**Hash-section homepage architecture is suitable for an early MVP landing page. It is not suitable as the primary information architecture for becoming the #1 university platform in Uzbekistan and Central Asia.**

MyUni already has real product routes (catalog, university profiles, compare, articles, FAQ, methodology, trust). The critical gap is that **core brand and discovery intents still live as `/#…` scroll sections**, while category leaders give each intent a durable, indexable URL with its own title, schema, analytics surface, and internal-link graph.

**Homepage should remain a premium landing hub** — not emptied — and every section should link to a dedicated page.

---

## Scorecard (/100)

| # | Dimension | Score | Rationale |
|---|-----------|------:|-----------|
| 1 | Current Architecture | **58** | Solid product core; marketing IA is landing-page shaped |
| 2 | UX | **68** | Strong catalog/compare; weak authority & hub journeys |
| 3 | SEO | **52** | Meta/JSON-LD/sitemap/share-preview exist; SPA + thin hubs ceiling |
| 4 | Scalability | **62** | API cache/throttle good; content/URL silos incomplete |
| 5 | Trust / E-E-A-T | **64** | Methodology + trust + moderation; About & citations incomplete |
| 6 | Information Architecture | **48** | Hybrid hash + route is the structural bottleneck |
| 7 | Navigation | **45** | Product nav mixed with scroll marketing |
| 8 | Mobile | **70** | Drawer, focus trap, filter drawer — solid |
| 9 | Desktop | **65** | Functional; cramped nav density, long landing |
| 10 | Accessibility | **62** | Skip link, traps, reduced motion; axe not in CI |
| 11 | Performance | **58** | Lazy routes + PWA; CSR LCP / HTML-first debt |

**Target for #1 regional platform:** ≥85 on IA, SEO, Trust, Navigation within 12 months.

---

## Step 1 — Competitor research: common patterns among best education sites

Studied professionally: **QS / TopUniversities, Times Higher Education, Niche, College Board (BigFuture), UCAS, Studyportals, U.S. News Education, Coursera, edX, FutureLearn, Common App, Unibuddy, Study.eu, DAAD, EDUopinions**.

### Universal patterns (consensus across leaders)

| Pattern | What elites do | Why it wins |
|---------|----------------|-------------|
| **Hub homepage** | Search + featured rankings + CTAs; links out | Clear entry → many indexable exits |
| **Rankings as URL cluster** | `/rankings`, `/rankings/2026`, subject/region | Yearly SERP ownership + backlinks |
| **University profiles as silos** | Overview + local nav + child paths | Depth without one giant page |
| **Global search in chrome** | Always in navbar | Task completion without hunting |
| **Authority cluster** | About, methodology, editorial, press | E-E-A-T + Knowledge Graph |
| **Resources mega-nav** | Guides, scholarships, FAQ, news | Content marketing without nav clutter |
| **Compare as product** | Side-by-side utility | High engagement / retention |
| **Trust chrome** | Sources, last updated, methodology links | Conversion + Google quality rater signals |
| **HTML-first public pages** | SSR/SSG for public; CSR for dashboards | Crawl reliability + LCP |
| **Breadcrumbs + ItemList** | Visible + schema | Sitellinks + crawl paths |
| **i18n-ready locales** | `/en`, `/de`, etc. or hreflang | Regional expansion |
| **Program discovery** | Course/program URLs (Studyportals/UCAS) | Long-tail SEO machine |

### Platform archetypes (MyUni positioning)

| Archetype | Examples | Primary job |
|-----------|----------|-------------|
| Ranking authority | QS, THE, US News | Rank + explain methodology |
| Discovery + reviews | Niche, EDUopinions | Honest fit + social proof |
| Application rails | Common App, UCAS | Apply |
| Program catalog | Studyportals, Study.eu, DAAD | Find programs abroad |
| Learning marketplace | Coursera, edX, FutureLearn | Courses |
| Peer chat | Unibuddy | Talk to students |

**MyUni today:** closest to **Niche × EDUopinions** (reviews + soft ranking) with strong **compare** and early **methodology/trust**. To lead Uzbekistan/Central Asia, evolve toward **Niche + THE authority layer** without pretending to be an official ministry ranking.

---

## Step 2 — Current architecture audit (MyUni)

### Tech & folders

```
frontend/          Vite SPA — src/{pages,components,layouts,hooks,services,config,content,utils}
backend/           Django — accounts/, universities/ (public APIs, sitemap, share-preview)
deploy/            nginx (bot → /api/public/share-preview/)
docs/              Deploy / smoke / SMTP
```

**Not Next.js.** Client-side React Router. SEO via `usePageMeta`, `JsonLd`, Django `sitemap.xml`, nginx bot HTML, `prerender-public.mjs`.

### Routing (actual)

| Path | Type | Notes |
|------|------|-------|
| `/` | Landing | Hash sections: `#home` `#how-it-works` `#universities` `#reviews` `#about` `#faq` `#features` `#partners` `#community` |
| `/universitetlar` | Catalog | Search + filters in URL |
| `/universitet/:slug` | University | Overview + reviews |
| `/taqqoslash`, `/taqqoslash/:token` | Compare | Guest + shared |
| `/maqolalar`, `/maqolalar/:slug` | Articles | |
| `/savollar-javob`, `/savollar-javob/:slug` | FAQ | |
| `/metodologiya` | Methodology | |
| `/ishonch-xavfsizlik` | Trust | |
| Legal pages | Terms / Privacy / Review rules | |
| Auth + dashboards | CSR, robots Disallow | Correct |

### Navbar (problem)

Mix of **hash marketing** and **route product**:

- Hash: Bosh sahifa, Qanday ishlaydi, Sharhlar, Biz haqimizda  
- Route: Katalog, Maqolalar, Savollar  
- No: Reyting hub, Aloqa, Haqida page, global Search in nav, Resources mega

### Footer

Already route-based (good): Platform, Legal, Contact block. Contact is **footer-only**, not a page.

### Rankings

**No `/reyting`.** Soft Bayesian rating + sort + methodology. Honest positioning — but missing year-based ranking product URLs.

### State

Context (Auth, Toast, Dashboard) + URL state for filters/compare. No Redux. Appropriate for current scale.

### SEO today

- Strengths: Organization/WebSite schema, sitemap, robots, share-preview, university/article/FAQ schemas, prerender  
- Weaknesses: CSR baseline; bot HTML thinner than true SSR; hash intents; missing rankings/about/contact hubs; Uzbek-only

---

## Step 3 — Is landing-page IA suitable for #1?

### Answer: **No** (as primary IA)

Landing-page IA maximizes conversion storytelling. Category leadership maximizes **crawlable surface area, topical authority, and task-based journeys**. Those goals conflict when About/Mission/Reviews live only as homepage sections.

### Disadvantages (exhaustive)

#### SEO
- Multiple intents compete on one URL (`/`).
- Title/description cannot simultaneously optimize for “haqida”, “sharhlar”, “qanday ishlaydi”.
- Homepages are over-crawled; section depth is under-ranked.

#### Indexing
- `#fragments` are **not** separate Google documents.
- Soft duplicate risk if content later cloned to pages without canonical discipline.

#### Crawl budget
- Long landing HTML burns crawl on marketing chrome.
- Less budget for hundreds of university + article URLs as catalog grows.

#### Knowledge Graph / E-E-A-T
- Google/entity systems expect a stable **About** URL, Organization markup, and clear authorship for editorial claims.
- Methodology exists (`/metodologiya`) — good — but About/editorial/team are weak as entities.

#### Analytics
- Scroll depth ≠ pageview. Hard to measure “About completed”, “FAQ conversion”, funnel drop-off by intent.
- Paid/organic landing reports conflate brand and product sessions.

#### Deep linking & sharing
- Shared `myuni.uz/#about` is fragile (apps strip hashes; previews use homepage OG).
- Cannot A/B or localize sections independently.

#### Maintainability & scalability
- `LandingPage` becomes a god-component; every stakeholder request balloons homepage weight.
- LCP/CLS risk grows with each new section.
- Teams cannot ship About vs Catalog releases safely in parallel.

#### Future features
- Scholarships, news, careers, partners portal, Central Asia country pages have **no IA shelf**.
- Program-level SEO (Studyportals model) has nowhere to hang.

#### Authority vs competitors
- QS/THE/Niche own `/about`, `/rankings`, `/methodology` SERP real estate.
- Hash IA cedes those query classes permanently.

#### Content updates
- Editorial/legal/product copy mixed in one deploy unit increases review friction and regression risk.

#### Google ranking / content clustering
- Clusters need parent → child → sibling links.
- A single homepage cannot be an effective parent for “reviews”, “about”, and “how it works” simultaneously without diluted relevance.

**Conclusion:** Keep a **premium homepage**. Stop using it as the **site map**.

---

## Step 4 — Recommended enterprise information architecture

### Design principles (each decision)

| Decision | Why | Benefits | Drawbacks | SEO | UX | Scale |
|----------|-----|----------|-----------|-----|----|-------|
| Homepage as hub | Match leaders | Clear CTA + links | More pages to maintain | High | High | High |
| Preserve Uzbek URLs | Equity | No ranking burn | English aliases later | Protects | Local-first | Fine |
| Additive `/haqida` `/reyting` `/aloqa` | Fill gaps | Authority + rankings product | Content work | High | High | High |
| Resources mega-nav | Reduce top-level clutter | Scalable content | Mega-menu UX cost | Medium | High | High |
| Rankings from Bayesian aggregates | Honest productization | New SERP cluster | Must avoid “official” overclaim | High | High | Med |
| Public SSR later | HTML-first | Crawl/LCP | Migration cost | Critical | Med | High |
| Dashboards stay CSR/noindex | Correct hybrid | Perf focus | — | Neutral | High | High |

### Routing structure (Uzbek-first; English shown for clarity)

```
/                              Homepage hub
/universitetlar                Directory (KEEP)
/universitet/:slug             University hub (KEEP)
/universitet/:slug/sharhlari   Reviews silo (Phase 3)
/universitet/:slug/qabul       Admission (Phase 3)
/universitet/:slug/fakultetlar Faculties (Phase 3)
/reyting                       Rankings index (NEW)
/reyting/:year                 Year table (NEW)
/taqqoslash                    Compare (KEEP)
/qidiruv                       Optional dedicated search; or canonical to /universitetlar?q=
/maqolalar                     Guides / editorial (KEEP)
/maqolalar/:slug
/yangiliklar                   News (NEW — split from articles)
/stipendiyalar                 Scholarships (Phase 4–5)
/qabul-qollanmasi              Admission guide (NEW)
/haqida                        About (NEW)
/haqida/jamoa                  Team (optional child)
/haqida/tahririyat             Editorial policy
/aloqa                         Contact (NEW)
/savollar-javob                FAQ (KEEP)
/metodologiya                  Methodology (KEEP)
/ishonch-xavfsizlik            Trust (KEEP)
/hamkorlar                     Partners (NEW)
/xato-xabar                    Report error (NEW)
/fikr                          Feedback (NEW)
/maxfiylik-siyosati …          Legal (KEEP)
/applicant|student/dashboard…  App (KEEP, noindex)
```

Optional later: `/ru/...` hreflang without replacing Uzbek defaults.

---

## Step 5 — Homepage redesign (hub, not empty)

**Purpose:** Introduce MyUni → get users into catalog/rankings/compare → build trust → convert signup.

| Section | Links to |
|---------|----------|
| Hero + search | `/universitetlar?q=` |
| Featured rankings teaser | `/reyting` |
| Popular universities | `/universitet/:slug` |
| Latest guides/news | `/maqolalar`, `/yangiliklar` |
| Student reviews teaser | Catalog + sample reviews |
| Top cities / categories | Filtered catalog |
| Live statistics | `/metodologiya`, `/haqida` |
| Success stories | Articles or About |
| Partners logos | `/hamkorlar` |
| Short FAQ | `/savollar-javob` |
| CTA / newsletter | Signup |
| Full footer | Complete IA |

**Rule:** Homepage copy is a **summary**. Canonical depth lives on child pages (avoid duplicate content).

---

## Step 6 — Navbar redesign

### Desktop

`Logo | Search | Universitetlar | Reyting | Taqqoslash | Resurslar▾ | Haqida | Theme | Kirish`

**Resurslar:** Maqolalar · Savollar · Metodologiya · Qabul qo'llanmasi · Stipendiyalar (when live) · Yangiliklar

**Remove from primary nav:** scroll-only “Qanday ishlaydi”, “Sharhlar”, “Biz haqimizda” hashes.  
**Optional:** How-it-works becomes an About subsection or homepage teaser only.

### Mobile

- Sticky top bar: Logo · Search · Hamburger  
- Drawer: same IA as desktop, grouped  
- No hash scroll-spy as primary active state  
- Sticky CTA: Kirish / Kabinet

---

## Step 7 — Dedicated About page (`/haqida`)

Recommended sections (single page first; split later if needed):

1. Mission  
2. Vision  
3. Story  
4. Editorial Policy  
5. Verification Process (campus-affiliated reviews)  
6. Research / Rating Methodology → deep-link `/metodologiya`  
7. How Rankings Work (when `/reyting` ships)  
8. Our Team  
9. Partners → `/hamkorlar`  
10. Media kit  
11. Contact → `/aloqa`

Schemas: `AboutPage` + `Organization` + breadcrumbs.

---

## Step 8 — Enterprise SEO architecture

### Per public page checklist

- [ ] Unique `<title>` (intent + brand)  
- [ ] Unique meta description  
- [ ] Self-referencing canonical  
- [ ] Open Graph + Twitter Card  
- [ ] `meta robots` (index/follow or noindex for private/utility)  
- [ ] Visible breadcrumbs + `BreadcrumbList`  
- [ ] Page-type JSON-LD (`CollegeOrUniversity`, `FAQPage`, `Article`, `ItemList`, `WebPage`)  
- [ ] Sitewide `Organization` + `WebSite` + `SearchAction` (once)  
- [ ] Internal links: parent, siblings, children  
- [ ] Last updated date (visible)  
- [ ] Sitemap inclusion  
- [ ] Share-preview / SSR parity  

### Technical roadmap

| Phase | SEO tech |
|-------|----------|
| 1–2 | New pages + meta + breadcrumbs + ItemList for rankings |
| 3 | Pagination policy; HTML sitemap; related-links blocks |
| 4 | True SSR/SSG for public routes (preferred long-term over UA-based dynamic rendering) |

**Note:** Google treats dynamic rendering (bot share-preview) as an interim pattern. Keep it until Phase 4, then prefer HTML-first rendering for humans and bots alike.

---

## Step 9 — Content strategy & silos

```
Universitetlar (hub)
  └─ Universitet (entity)
       ├─ Umumiy
       ├─ Fakultetlar → Yo'nalishlar (programs)
       ├─ Sharhlar
       ├─ Qabul
       ├─ Stipendiya (later)
       ├─ Kampus / fotos
       ├─ Reytingdagi o'rni
       ├─ FAQ (entity-level)
       └─ O'xshash universitetlar
```

**Supporting silos:** Reyting · Maqolalar · Yangiliklar · Savollar · Metodologiya · Haqida

**Interconnect rule:** Every leaf links up to hub, sideways to 2–4 related entities, and to one trust page (methodology or editorial).

---

## Step 10 — Trust chrome (every public content page)

Show where truthful:

- Verified / moderation badge semantics (honest naming)  
- Data sources  
- Last updated  
- Editorial review / fact-checked (for articles & rankings claims)  
- Update history (expandable)  
- Report error (`/xato-xabar?url=`)  
- Citations / methodology link  

Do **not** invent verification you do not have. Soft Bayesian ratings must stay labeled as student-review signals, not official state rankings.

---

## Step 11 — UX quality bar

| Area | Direction |
|------|-----------|
| Typography | Distinct display + body (avoid default Inter-only brand feel) |
| Spacing | 8-pt grid; reduce homepage section density |
| Cards | Interaction containers only (catalog, compare, review) |
| Motion | 2–3 intentional motions; honor `prefers-reduced-motion` (already) |
| Loading | Route skeletons (exist for dashboard; extend to catalog/profile) |
| Focus | Visible focus rings sitewide |
| Dark mode | Keep ThemeToggle; ensure contrast audits |
| Breakpoints | Mobile drawer · tablet 2-col catalog · desktop 12-col |

---

## Step 12 — Performance

| Metric | Action |
|--------|--------|
| LCP | Hero image priority; SSR/SSG public shells; avoid mega landing JS |
| CLS | Image dimensions; font subsetting / `font-display` |
| INP | Debounce filters; avoid heavy main-thread on catalog |
| Images | Responsive `srcset`, WebP/AVIF, lazy below fold |
| Bundle | Keep route `lazy()`; design-system tree-shaking |
| Prefetch | In-viewport university links |
| Caching | Keep Redis public API cache; CDN HTML after SSR |

---

## Step 13 — Design system (tokens)

Create reusable tokens under `frontend/src/styles/` + `components/ui/`:

- Color (brand, surface, border, success/warn/danger)  
- Type scale (display, h1–h3, body, caption)  
- Space (4–48) · Radius · Elevation (flat preferred)  
- Components: Button, Input, Badge, Tag, Card, Table, Chart shell, Skeleton, Breadcrumb, TrustBadge  

**Why tokens now:** Prevents One-off CSS as page count multiplies in Phases 1–3.

---

## Step 14 — Folder structure (target)

```
frontend/src/
  pages/
    public/           # Landing, About, Contact, Rankings, Catalog, Uni, Compare, FAQ, Articles…
    auth/
    app/              # dashboards
  components/
    chrome/           # Navbar, Footer, MobileDrawer, GlobalSearch
    seo/
    trust/            # LastUpdated, Sources, ReportError, VerifiedBadge
    catalog/
    university/
    rankings/
    compare/
    content/          # articles, news, FAQ
    ui/               # design system primitives
  content/            # MD/JSON editorial (methodology, legal, about)
  config/             # siteMeta, routes map, nav IA config
  hooks/
  services/
  layouts/
```

Backend: add optional `RankingSnapshot` model when yearly rankings ship (immutable published tables), separate from live Bayesian scores.

---

## Step 15 — Component hierarchy

```
App
├─ Chrome (SkipLink, Analytics, PWA)
├─ MainLayout
│   ├─ Navbar (Search, primary links, Resources mega, Auth)
│   ├─ Breadcrumbs
│   ├─ Page
│   │   ├─ PageHero / TrustStrip
│   │   ├─ Content
│   │   └─ RelatedRail
│   └─ Footer (full IA)
└─ AppShell (dashboard — CSR)
```

**Nav IA config** should be data-driven (`config/navigation.js`) so Product can ship hubs without editing `Navbar.jsx` markup each time.

---

## Implementation roadmap

### Phase 1 — IA foundations (2–3 weeks) · Risk: Low
- Ship `/haqida`, `/aloqa`
- Homepage sections → teasers with links (no content deletion)
- New navbar + footer map
- Breadcrumbs on all public pages
- Analytics: route-level page_view + outbound hub clicks
- Update sitemap + share-preview paths

### Phase 2 — Rankings & trust (3–4 weeks) · Risk: Medium
- `/reyting`, `/reyting/:year` from aggregates (clear labeling)
- About editorial + verification copy
- Trust chrome components sitewide
- Report error endpoint/page
- FAQ / rankings ItemList schema

### Phase 3 — University silos (4–6 weeks) · Risk: Medium
- Child routes without duplicate body (canonical strategy)
- Related universities
- News vs articles
- HTML sitemap page
- Pagination SEO

### Phase 4 — Rendering & scale (6–10 weeks) · Risk: High
- SSR/SSG public surface (Next.js App Router or Astro+React islands — evaluate; do not big-bang rewrite dashboards)
- Core Web Vitals budgets in CI
- i18n architecture (uz primary, ru secondary)

### Phase 4 status (2026-07-15) — **10/10 ship bar met** (HTML-first SSG, fail-closed)

- **Decision:** Playwright SSG on Vite/React Router; dashboards CSR; no Next.js rewrite
- **Googlebot:** social-only nginx UA map; crawl bots get prerendered HTML
- **`spa.html` CSR fallback** — never reuse SSG home as catch-all (`try_files … /spa.html`)
- Fail-closed: `check-ssg-health.mjs` in build + Turon (escape: `ALLOW_SPA_ONLY=1`)
- CI uploads **full** `frontend/dist`; live smoke: `deploy/check-bot-routing.sh`
- Empty facultet/qabul: omit from XML/prerender/nav/HTML sitemap; reviews silo always present (noindex if empty)
- CWV: LCP ≤2.5s / CLS ≤0.1 smoke + tighter bundle budgets
- i18n scaffold: `/ru` noindex hub; no fake `/ru/*` hreflang targets
- Docs: `docs/architecture/PHASE4_HTML_FIRST.md`

*Interactive scoreboard: Cursor canvas `phase4-qa-scorecard.canvas.tsx`*

### Phase 5 — Market expansion · Complete (scoped)

### Phase 5 status (2026-07-15) — **10/10 ship bar met** (re-audit fixes applied)

- `/stipendiyalar`, `/qabul-qollanmasi` — editorial hubs (not fake registries)
- `/yo-nalishlar` — cross-uni StudyDirection search API + facet `noindex`
- `/hamkorlar` — trust page + featured universities (no Partner CRM)
- `/shahar/{8 cities}` — regional landings with **pagination** (no silent 48-cap)
- Empty cities: FE + share-preview `noindex`; XML sitemap omits
- Wired: nav/footer (Shaharlar), landing strip, PAGE_META, sitemap v6, share-preview v5, prerender + verify all 8 cities
- **Deferred:** careers board, full CA/Studyportals, partner CRM, per-program URL explosion
- Docs: `docs/architecture/PHASE5_MARKET_EXPANSION.md`

*Interactive scoreboard: Cursor canvas `phase5-qa-scorecard.canvas.tsx`*

---

## Migration plan

1. **Additive first:** new routes live beside hash sections.  
2. **Tease, then slim:** after `/haqida` indexes, shorten `#about` to summary + link (no full duplicate).  
3. **Navbar feature flag:** old vs new IA for 1–2 weeks.  
4. **GSC monitoring:** coverage, impressions for new URLs, homepage cannibalization.  
5. **Redirects only when retiring** a public URL; never 404 old university/article slugs.  
6. **Keep** `/metodologiya`, catalog, compare, FAQ, legal paths stable.  
7. **Dashboards** remain noindex CSR.

---

## Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Duplicate About (hash + page) | High | SEO | Canonical + shorten hash section |
| Claiming “official ranking” | Med | Trust/legal | Copy review with methodology |
| Next.js rewrite burnout | Med | Delivery | Phase 4 scoped to public only |
| Nav overload | Med | UX | Resources mega; progressive disclosure |
| Share-preview drift | High | Social/SEO | Shared route meta registry |
| Ranking URL empty at launch | Med | Bounce | Ship with real aggregates + methodology CTA |

---

## Decision log — should we keep anything as hash?

| Keep as homepage section teaser? | Promote to route? |
|----------------------------------|-------------------|
| How it works (short) | Optional `/haqida#qanday` or article |
| Features demo | Product marketing only |
| Partners strip | `/hamkorlar` |
| Reviews strip | Catalog + uni pages |
| About strip | `/haqida` |
| FAQ strip | `/savollar-javob` |
| Top universities strip | Catalog + `/reyting` |

---

## Final recommendation

Ship **Phase 1 immediately** (About, Contact, navbar IA, hub homepage). It is production-safe, preserves all features and existing URL equity, and closes the largest gap vs QS/THE/Niche without a rewrite.

Treat **Phase 4 (HTML-first public rendering)** as the strategic SEO ceiling raiser — required to compete regionally at scale, not required to start correcting IA this sprint.

---

### Phase 3 status (2026-07-15) — **10/10 ship bar met** (final pro polish)

- University silos: thin hub + `/sharhlari` · `/fakultetlar` · `/qabul` (unique silo H1; banner name is not H1 on children)
- Legacy hashes → silo paths; overview aliases strip hash; CollegeOrUniversity schema hub-only
- Empty silos: `noindex` (SPA + share-preview); XML sitemap omits empty silo URLs
- Reviews silo pagination: `GET /api/public/universities/<slug>/reviews/` + crawlable `?page=`
- `getAllPublicUniversities()` pages through catalog max — rankings / signup / compare / HTML sitemap
- Related universities API + rail (empty → catalog CTA)
- News vs articles: `Article.kind`; SPA Navigate mutual gate; API `?kind=`; NewsArticle JSON-LD on `/yangiliklar/`; share-preview GUIDE-only on `/maqolalar/`
- HTML `/sayt-xaritasi` with `seoReady` after full uni load
- Catalog pagination SEO: crawlable pages, `rel prev/next`, facet `noindex`
- Orphan hash-section utils removed

*Interactive scoreboard: Cursor canvas `phase3-qa-scorecard.canvas.tsx`*

