import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import CatalogPagination from "@/components/catalog/CatalogPagination.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { FEATURED_CITIES, buildCityPath, resolveFeaturedCity } from "@/config/cities.js";
import { buildCanonicalUrl } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import { getPublicCityUniversities } from "@/services/publicService.js";
import { buildUniversityPublicPath } from "@/utils/navigation.js";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

function buildCityItemListSchema(cityName, path, results = []) {
  if (!results.length) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cityName} universitetlari`,
    url: buildCanonicalUrl(path),
    numberOfItems: results.length,
    itemListElement: results.map((uni, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: uni.short_name || uni.name,
      url: buildCanonicalUrl(buildUniversityPublicPath(uni.slug)),
    })),
  };
}

export default function CityUniversitiesPage() {
  const { citySlug } = useParams();
  const [searchParams] = useSearchParams();
  const featured = resolveFeaturedCity(citySlug);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(Boolean(featured));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!featured) {
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    getPublicCityUniversities(featured.slug, { page, page_size: 24 })
      .then((data) => {
        if (!cancelled) {
          setPayload(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPayload(null);
          setError("Shahar ma'lumotlari yuklanmadi.");
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
  }, [featured, page]);

  const path = featured ? buildCityPath(featured.slug) : "/universitetlar";
  const pathWithQuery = page > 1 ? `${path}?page=${page}` : path;
  const cityName = featured?.name || citySlug;
  const isEmpty = !loading && (payload?.count ?? 0) === 0;

  usePageMeta(
    featured
      ? {
          title: `${cityName} universitetlari | MyUni.uz`,
          description: `${cityName} (${featured.region}): universitetlar katalogi, soft reyting va sharhlar.`,
          path: pathWithQuery,
          robots: isEmpty ? "noindex, follow" : "index, follow",
          prevUrl:
            page > 1
              ? buildCanonicalUrl(page === 2 ? path : `${path}?page=${page - 1}`)
              : "",
          nextUrl:
            payload && page < (payload.total_pages || 1)
              ? buildCanonicalUrl(`${path}?page=${page + 1}`)
              : "",
        }
      : {
          title: "Shahar | MyUni.uz",
          path: "/universitetlar",
          robots: "noindex, follow",
        }
  );

  const results = payload?.results || [];

  const schemas = useMemo(
    () =>
      featured
        ? [
            buildBreadcrumbSchema([
              { name: "Bosh sahifa", path: "/" },
              { name: "Universitetlar", path: "/universitetlar" },
              { name: cityName, path },
            ]),
            buildWebPageSchema({
              title: `${cityName} universitetlari | MyUni.uz`,
              description: `${cityName} universitetlari — MyUni.uz`,
              path,
            }),
            !isEmpty && page === 1
              ? buildCityItemListSchema(cityName, path, payload?.results || [])
              : null,
          ]
        : [],
    [cityName, featured, path, isEmpty, page, payload?.results]
  );

  if (!featured) {
    return <Navigate to="/universitetlar" replace />;
  }

  return (
    <PublicDocumentLayout seoReady={!loading}>
      <JsonLd id="city-page-json-ld" schemas={schemas.filter(Boolean)} />
      <div className="max-w-4xl">
        <PageBreadcrumbs
          items={[
            { name: "Bosh sahifa", path: "/" },
            { name: "Universitetlar", path: "/universitetlar" },
            { name: cityName, path },
          ]}
        />
        <header className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {featured.region}
          </p>
          <h1 className="text-3xl font-black sm:text-4xl">{cityName} universitetlari</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Mintaqaviy katalog — soft reyting, sharhlar va taqqoslash. Boshqa shaharlar uchun
            filtrlangan katalogdan foydalaning.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {FEATURED_CITIES.map((city) => (
              <Link
                key={city.slug}
                to={buildCityPath(city.slug)}
                className={
                  city.slug === featured.slug
                    ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-black text-white dark:bg-white dark:text-slate-900"
                    : "rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-white/10"
                }
              >
                {city.name}
              </Link>
            ))}
          </div>
        </header>

        <p className="mt-8 text-sm font-semibold text-slate-500">
          {loading
            ? "Yuklanmoqda…"
            : `${payload?.count ?? 0} ta universitet${
                payload?.total_pages > 1 ? ` · ${page}/${payload.total_pages} sahifa` : ""
              }`}
        </p>

        {error ? (
          <EmptyState
            className="mt-6"
            title="Xato"
            description={error}
            action={{ label: "Katalog", to: "/universitetlar" }}
          />
        ) : null}

        {!loading && !error && results.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="Hali universitet yo'q"
            description="Bu shahar bo'yicha ochiq kartochkalar topilmadi."
            action={{ label: "Katalog", to: "/universitetlar" }}
          />
        ) : null}

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {results.map((uni) => (
            <li key={uni.slug}>
              <Link
                to={buildUniversityPublicPath(uni.slug)}
                className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary/40 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <p className="text-sm font-black">{uni.short_name || uni.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {uni.review_count ?? 0} sharh
                  {uni.display_rating != null ? ` · ${uni.display_rating}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <CatalogPagination
          page={page}
          totalPages={payload?.total_pages || 1}
          buildPageHref={(nextPage) => (nextPage > 1 ? `${path}?page=${nextPage}` : path)}
        />

        <p className="mt-8 text-sm">
          <Link
            to={`/universitetlar?city=${encodeURIComponent(cityName)}`}
            className="font-bold text-primary hover:underline"
          >
            Katalogda «{cityName}» filtri →
          </Link>
          {" · "}
          <Link to="/yo-nalishlar" className="font-bold text-primary hover:underline">
            Yo&apos;nalishlar
          </Link>
        </p>
      </div>
    </PublicDocumentLayout>
  );
}
