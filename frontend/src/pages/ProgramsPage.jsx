import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CatalogPagination from "@/components/catalog/CatalogPagination.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { PAGE_META, buildCanonicalUrl } from "@/config/siteMeta.js";
import { FEATURED_CITIES, buildCityPath } from "@/config/cities.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import { getPublicPrograms } from "@/services/publicService.js";
import { buildUniversitySiloPath } from "@/config/universitySilos.js";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

function buildProgramsItemListSchema(results = []) {
  if (!results.length) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Yo'nalishlar — MyUni.uz",
    url: buildCanonicalUrl("/yo-nalishlar"),
    numberOfItems: results.length,
    itemListElement: results.slice(0, 24).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.university?.slug
        ? buildCanonicalUrl(`/universitet/${item.university.slug}/fakultetlar`)
        : buildCanonicalUrl("/yo-nalishlar"),
    })),
  };
}

const DEGREE_OPTIONS = [
  { value: "", label: "Barcha darajalar" },
  { value: "bachelor", label: "Bakalavr" },
  { value: "master", label: "Magistr" },
  { value: "doctorate", label: "Doktorantura" },
];

export default function ProgramsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const degree = searchParams.get("degree") || "";
  const city = searchParams.get("city") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftQ, setDraftQ] = useState(q);

  useEffect(() => {
    setDraftQ(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPublicPrograms({ q, degree, city, page, page_size: 24 })
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData({ count: 0, results: [], page: 1, total_pages: 1 });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [q, degree, city, page]);

  const path = "/yo-nalishlar";
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (degree) query.set("degree", degree);
  if (city) query.set("city", city);
  if (page > 1) query.set("page", String(page));
  const pathWithQuery = query.toString() ? `${path}?${query}` : path;
  const hasFilters = Boolean(q || degree || city);

  usePageMeta({
    ...PAGE_META.programs,
    path: pathWithQuery,
    robots: hasFilters ? "noindex, follow" : "index, follow",
    prevUrl:
      page > 1
        ? buildCanonicalUrl(
            (() => {
              const p = new URLSearchParams(query);
              if (page === 2) p.delete("page");
              else p.set("page", String(page - 1));
              const s = p.toString();
              return s ? `${path}?${s}` : path;
            })()
          )
        : "",
    nextUrl:
      data && page < (data.total_pages || 1)
        ? buildCanonicalUrl(
            (() => {
              const p = new URLSearchParams(query);
              p.set("page", String(page + 1));
              return `${path}?${p}`;
            })()
          )
        : "",
  });

  const schemas = useMemo(
    () => [
      buildBreadcrumbSchema([
        { name: "Bosh sahifa", path: "/" },
        { name: "Yo'nalishlar", path },
      ]),
      buildWebPageSchema({
        title: PAGE_META.programs.title,
        description: PAGE_META.programs.description,
        path,
      }),
      !hasFilters && !loading ? buildProgramsItemListSchema(data?.results || []) : null,
    ],
    [hasFilters, loading, data?.results]
  );

  function applySearch(event) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (draftQ.trim()) next.set("q", draftQ.trim());
    if (degree) next.set("degree", degree);
    if (city) next.set("city", city);
    setSearchParams(next);
  }

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  }

  const results = data?.results || [];

  return (
    <PublicDocumentLayout seoReady={!loading}>
      <JsonLd id="programs-json-ld" schemas={schemas.filter(Boolean)} />
      <div className="max-w-4xl">
        <PageBreadcrumbs
          items={[
            { name: "Bosh sahifa", path: "/" },
            { name: "Yo'nalishlar", path },
          ]}
        />
        <header className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            Yo&apos;nalishlar katalogi
          </p>
          <h1 className="text-3xl font-black sm:text-4xl">Yo&apos;nalishlar</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            OTMlar bo&apos;ylab bakalavr/magistratura yo&apos;nalishlarini qidirish. Har bir natija
            universitet fakultet silosiga olib boradi.
          </p>
        </header>

        <form onSubmit={applySearch} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={draftQ}
            onChange={(event) => setDraftQ(event.target.value)}
            placeholder="Yo'nalish yoki OTM nomi…"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold dark:border-white/10 dark:bg-white/[0.04]"
            aria-label="Qidiruv"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-white"
          >
            Qidirish
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {DEGREE_OPTIONS.map((option) => (
            <button
              key={option.value || "all"}
              type="button"
              onClick={() => setParam("degree", option.value)}
              className={
                degree === option.value
                  ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-black text-white dark:bg-white dark:text-slate-900"
                  : "rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-white/10"
              }
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setParam("city", "")}
            className={
              !city
                ? "rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary"
                : "rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-white/10"
            }
          >
            Barcha shaharlar
          </button>
          {FEATURED_CITIES.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setParam("city", item.name)}
              className={
                city === item.name
                  ? "rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary"
                  : "rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-white/10"
              }
            >
              {item.name}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm font-semibold text-slate-500">
          {loading ? "Yuklanmoqda…" : `${data?.count ?? 0} ta yo'nalish`}
        </p>

        {!loading && results.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="Yo'nalish topilmadi"
            description="Qidiruvni kengaytiring yoki filtrni tozalang."
            action={{ label: "Katalog", to: "/universitetlar" }}
          />
        ) : null}

        <ul className="mt-4 space-y-3">
          {results.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-950 dark:text-white">{item.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.degree_level_label}
                    {item.faculty?.name ? ` · ${item.faculty.name}` : ""}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {item.university?.short_name || item.university?.name}
                    {item.university?.city ? ` · ${item.university.city}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.university?.slug ? (
                    <Link
                      to={buildUniversitySiloPath(item.university.slug, "faculties")}
                      className="rounded-full bg-primary px-3 py-1.5 text-xs font-black text-white"
                    >
                      Fakultetlar
                    </Link>
                  ) : null}
                  {item.university?.city ? (
                    <Link
                      to={
                        FEATURED_CITIES.find((c) => c.name === item.university.city)
                          ? buildCityPath(
                              FEATURED_CITIES.find((c) => c.name === item.university.city).slug
                            )
                          : `/universitetlar?city=${encodeURIComponent(item.university.city)}`
                      }
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-white/10"
                    >
                      Shahar
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <CatalogPagination
          page={page}
          totalPages={data?.total_pages || 1}
          buildPageHref={(nextPage) => {
            const p = new URLSearchParams();
            if (q) p.set("q", q);
            if (degree) p.set("degree", degree);
            if (city) p.set("city", city);
            if (nextPage > 1) p.set("page", String(nextPage));
            const s = p.toString();
            return s ? `${path}?${s}` : path;
          }}
        />
      </div>
    </PublicDocumentLayout>
  );
}
