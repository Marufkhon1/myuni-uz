import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import JsonLd from "../components/seo/JsonLd.jsx";
import UniversityFiltersBar from "../components/catalog/UniversityFiltersBar.jsx";
import UzbekistanUniversitiesMap from "../components/catalog/UzbekistanUniversitiesMap.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import { useCatalogFilters } from "../hooks/useCatalogFilters.js";
import { getPublicUniversityMap } from "../services/publicService.js";
import {
  activeFilterCount,
  DEFAULT_CATALOG_FILTERS,
} from "../utils/universityCatalog.js";
import { buildBreadcrumbSchema, buildWebPageSchema } from "../utils/structuredData.js";
import { usePageMeta } from "../hooks/usePageMeta.js";

export default function UniversitiesMapPage() {
  const navigate = useNavigate();
  const { filters, debouncedFilters, setFilters } = useCatalogFilters();
  const [markers, setMarkers] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  usePageMeta({
    title: "Universitetlar xaritasi | MyUni.uz",
    description: "O'zbekiston xaritasida universitetlar joylashuvi, reyting va sharhlar.",
    path: "/universitetlar/xarita",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = Object.fromEntries(
      Object.entries(debouncedFilters).filter(([, value]) => value !== "" && value != null)
    );

    getPublicUniversityMap(params)
      .then((data) => {
        if (!cancelled) {
          setMarkers(data.markers ?? []);
          setCount(data.count ?? data.markers?.length ?? 0);
          setFilterOptions(data.filters);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMarkers([]);
          setCount(0);
          setError("Xarita ma'lumotlari yuklanmadi.");
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
        { name: "Xarita", path: "/universitetlar/xarita" },
      ]),
    []
  );

  const webPageSchema = useMemo(
    () =>
      buildWebPageSchema({
        title: "Universitetlar xaritasi | MyUni.uz",
        description: "O'zbekiston xaritasida OTMlar.",
        path: "/universitetlar/xarita",
      }),
    []
  );

  function applyFilters(nextFilters) {
    setFilters(nextFilters);
  }

  function resetFilters() {
    applyFilters({ ...DEFAULT_CATALOG_FILTERS });
  }

  const onMarkerClick = useCallback((university) => {
    if (university?.slug) {
      navigate(`/universitet/${university.slug}`);
    }
  }, [navigate]);

  return (
    <MainLayout>
      <JsonLd id="map-breadcrumb-json-ld" data={breadcrumbSchema} />
      <JsonLd id="map-webpage-json-ld" data={webPageSchema} />

      <div className="container-shell pb-16 pt-24 sm:pt-28 lg:pt-32">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Xarita</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">
              O&apos;zbekiston OTMlari xaritasi
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Universitetlarni joylashuvi bo&apos;yicha ko&apos;ring — marker ustiga bosing va batafsil sahifaga
              o&apos;ting.
            </p>
          </div>
          <Link
            to="/universitetlar"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 shadow-sm transition hover:border-primary hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
          >
            Ro&apos;yxat ko&apos;rinishi
          </Link>
        </div>

        <div className="mt-6">
          <UniversityFiltersBar
            filters={filters}
            filterOptions={filterOptions}
            onChange={applyFilters}
            onReset={resetFilters}
            activeCount={activeCount}
            showSort={false}
          />
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {loading ? "Xarita yuklanmoqda..." : `${count} ta universitet xaritada`}
        </p>

        {error && (
          <EmptyState
            variant="university"
            title="Xatolik"
            description={error}
            action={{ label: "Qayta urinish", onClick: () => applyFilters({ ...filters }) }}
            className="mt-8"
          />
        )}

        {!error && (
          <div className="mt-4 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-soft dark:border-white/10 dark:bg-white/[0.06] sm:p-4">
            {!loading && markers.length === 0 ? (
              <EmptyState
                variant="university"
                title="Marker topilmadi"
                description="Filtrlarni yumshating yoki boshqa shahar tanlang."
                action={{ label: "Filtrlarni tozalash", onClick: resetFilters }}
              />
            ) : (
              <UzbekistanUniversitiesMap markers={markers} onMarkerClick={onMarkerClick} />
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
