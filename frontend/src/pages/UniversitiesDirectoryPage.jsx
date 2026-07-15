import { useEffect, useMemo, useState } from "react";
import CatalogFilterDrawer from "@/components/catalog/CatalogFilterDrawer.jsx";
import CatalogPagination, {
  buildCatalogPageHref,
  CATALOG_PAGE_SIZE,
} from "@/components/catalog/CatalogPagination.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import UniversityFiltersBar, {
  UniversityDirectoryCard,
} from "@/components/catalog/UniversityFiltersBar.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import MainLayout from "@/layouts/MainLayout.jsx";
import { useCatalogFilters } from "@/hooks/useCatalogFilters.js";
import { getPublicUniversityCatalog, getPublicUniversityFilters } from "@/services/publicService.js";
import {
  activeFilterCount,
  DEFAULT_CATALOG_FILTERS,
} from "@/utils/universityCatalog.js";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/utils/structuredData.js";
import { buildCanonicalUrl } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";

export default function UniversitiesDirectoryPage() {
  const { filters, debouncedFilters, setFilters } = useCatalogFilters();
  const [results, setResults] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const page = Number(debouncedFilters.page) > 1 ? Number(debouncedFilters.page) : 1;
  const activeCount = useMemo(() => activeFilterCount(filters), [filters]);
  const catalogPath =
    activeCount > 0 ? "/universitetlar" : buildCatalogPageHref(page, debouncedFilters);
  const prevUrl =
    activeCount === 0 && page > 1
      ? buildCanonicalUrl(buildCatalogPageHref(page - 1, debouncedFilters))
      : "";
  const nextUrl =
    activeCount === 0 && page < totalPages
      ? buildCanonicalUrl(buildCatalogPageHref(page + 1, debouncedFilters))
      : "";

  usePageMeta({
    title:
      activeCount === 0 && page > 1
        ? `Universitetlar katalogi — ${page}-sahifa | MyUni.uz`
        : "Universitetlar katalogi | MyUni.uz",
    description:
      "O'zbekiston universitetlarini shahar, turi, reyting va sharhlar bo'yicha filtrlash va qidirish.",
    path: catalogPath,
    prevUrl,
    nextUrl,
    robots: activeCount > 0 ? "noindex, follow" : "index, follow",
  });  useEffect(() => {
    let cancelled = false;
    getPublicUniversityFilters()
      .then((data) => {
        if (!cancelled && data) {
          setFilterOptions(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = Object.fromEntries(
      Object.entries(debouncedFilters).filter(([, value]) => value !== "" && value != null)
    );
    params.page = page;
    params.page_size = CATALOG_PAGE_SIZE;

    getPublicUniversityCatalog(params)
      .then((data) => {
        if (!cancelled) {
          setResults(data.results ?? []);
          setCount(data.count ?? data.results?.length ?? 0);
          setTotalPages(data.total_pages ?? 1);
          setFilterOptions(data.filters);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
          setCount(0);
          setTotalPages(1);
          setError("Universitetlar yuklanmadi. Keyinroq qayta urinib ko'ring.");
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
  }, [debouncedFilters, page]);

  const breadcrumbSchema = useMemo(
    () =>
      buildBreadcrumbSchema([
        { name: "Bosh sahifa", path: "/" },
        { name: "Universitetlar", path: "/universitetlar" },
      ]),
    []
  );

  const webPageSchema = useMemo(
    () =>
      buildWebPageSchema({
        title: "Universitetlar katalogi | MyUni.uz",
        description: "O'zbekiston universitetlari katalogi — filtr, qidiruv va reyting.",
        path: catalogPath,
      }),
    [catalogPath]
  );

  function applyFilters(nextFilters) {
    setFilters({ ...nextFilters, page: 1 });
  }

  function resetFilters() {
    applyFilters({ ...DEFAULT_CATALOG_FILTERS });
  }

  const seoReady = !loading;

  return (
    <MainLayout>
      <JsonLd
        id="universities-json-ld"
        schemas={[breadcrumbSchema, webPageSchema].filter(Boolean)}
      />

      <div
        className="container-shell pb-16 pt-24 sm:pt-28 lg:pt-32"
        data-seo-ready={seoReady ? "true" : undefined}
      >
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Katalog</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">
            O&apos;zbekiston universitetlari
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Shahar, turi (davlat/xususiy/xalqaro), reyting va sharhlar bo&apos;yicha qidiring —
            barcha ma&apos;lumotlar bitta professional katalogda.
          </p>
        </div>

        <div className="mt-6">
          <UniversityFiltersBar
            filters={filters}
            filterOptions={filterOptions}
            onChange={applyFilters}
            onReset={resetFilters}
            activeCount={activeCount}
            resultCount={count}
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
          />
          <CatalogFilterDrawer
            open={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            filters={filters}
            filterOptions={filterOptions}
            onChange={applyFilters}
            onReset={resetFilters}
            onApply={() => applyFilters({ ...filters })}
            resultCount={count}
            activeCount={activeCount}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {loading
              ? "Yuklanmoqda..."
              : `${count} ta universitet · ${page}/${totalPages} sahifa`}
          </p>
        </div>

        {error ? (
          <EmptyState
            variant="university"
            title="Yuklash xatosi"
            description={error}
            action={{ label: "Qayta urinish", onClick: () => applyFilters({ ...filters }) }}
            className="mt-8"
          />
        ) : null}

        {!error && !loading && results.length === 0 ? (
          <EmptyState
            variant="university"
            title="Natija topilmadi"
            description="Filtrlarni yumshating yoki boshqa shahar/tur tanlang."
            action={{ label: "Filtrlarni tozalash", onClick: resetFilters }}
            className="mt-8"
          />
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((university) => (
            <UniversityDirectoryCard key={university.id} university={university} />
          ))}
        </div>

        <CatalogPagination
          page={page}
          totalPages={totalPages}
          buildPageHref={(nextPage) => buildCatalogPageHref(nextPage, filters)}
        />
      </div>
    </MainLayout>
  );
}
