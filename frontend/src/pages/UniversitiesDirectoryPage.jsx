import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../components/seo/JsonLd.jsx";
import UniversityFiltersBar, {
  UniversityDirectoryCard,
} from "../components/catalog/UniversityFiltersBar.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import { useCatalogFilters } from "../hooks/useCatalogFilters.js";
import { getPublicUniversityCatalog } from "../services/publicService.js";
import {
  activeFilterCount,
  DEFAULT_CATALOG_FILTERS,
} from "../utils/universityCatalog.js";
import { buildBreadcrumbSchema, buildWebPageSchema } from "../utils/structuredData.js";
import { usePageMeta } from "../hooks/usePageMeta.js";

export default function UniversitiesDirectoryPage() {
  const { filters, debouncedFilters, setFilters } = useCatalogFilters();
  const [results, setResults] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  usePageMeta({
    title: "Universitetlar katalogi | MyUni.uz",
    description:
      "O'zbekiston universitetlarini shahar, turi, reyting va sharhlar bo'yicha filtrlash va qidirish.",
    path: "/universitetlar",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = Object.fromEntries(
      Object.entries(debouncedFilters).filter(([, value]) => value !== "" && value != null)
    );

    getPublicUniversityCatalog(params)
      .then((data) => {
        if (!cancelled) {
          setResults(data.results ?? []);
          setCount(data.count ?? data.results?.length ?? 0);
          setFilterOptions(data.filters);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
          setCount(0);
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
  }, [debouncedFilters]);

  const activeCount = useMemo(() => activeFilterCount(filters), [filters]);

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
        path: "/universitetlar",
      }),
    []
  );

  function applyFilters(nextFilters) {
    setFilters(nextFilters);
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
        <div className="flex flex-wrap items-end justify-between gap-4">
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
          <Link
            to="/universitetlar/xarita"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 shadow-sm transition hover:border-primary hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
          >
            Xaritada ko&apos;rish
          </Link>
        </div>

        <div className="mt-6">
          <UniversityFiltersBar
            filters={filters}
            filterOptions={filterOptions}
            onChange={applyFilters}
            onReset={resetFilters}
            activeCount={activeCount}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {loading ? "Yuklanmoqda..." : `${count} ta universitet topildi`}
          </p>
        </div>

        {error && (
          <EmptyState
            variant="university"
            title="Yuklash xatosi"
            description={error}
            action={{ label: "Qayta urinish", onClick: () => applyFilters({ ...filters }) }}
            className="mt-8"
          />
        )}

        {!error && !loading && results.length === 0 && (
          <EmptyState
            variant="university"
            title="Natija topilmadi"
            description="Filtrlarni yumshating yoki boshqa shahar/tur tanlang."
            action={{ label: "Filtrlarni tozalash", onClick: resetFilters }}
            className="mt-8"
          />
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((university) => (
            <UniversityDirectoryCard key={university.id} university={university} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
