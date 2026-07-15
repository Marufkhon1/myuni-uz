import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import RankingsTable from "@/components/rankings/RankingsTable.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import TrustStrip from "@/components/trust/TrustStrip.jsx";
import {
  CURRENT_RANKING_YEAR,
  isSupportedRankingYear,
  RANKINGS_MIN_REVIEWS,
  RANKINGS_PATH,
  rankingsYearPath,
} from "@/config/rankings.js";
import { PAGE_META } from "@/config/siteMeta.js";
import { rankingsDocument } from "@/content/rankingsContent.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import { getAllPublicUniversities } from "@/services/publicService.js";
import {
  buildBreadcrumbSchema,
  buildRankingsListSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

function RankingsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Reyting yuklanmoqda">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5"
        />
      ))}
    </div>
  );
}

export default function RankingsYearPage() {
  const { year: yearParam } = useParams();
  const year = Number(yearParam);
  const supported = isSupportedRankingYear(year);
  const path = rankingsYearPath(year);
  const yearLabel = String(yearParam || "").trim() || String(year);
  const doc = rankingsDocument;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(supported);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const yearDescription = doc.yearDescription(year);

  usePageMeta({
    ...PAGE_META.rankingsYear,
    title: supported
      ? `${year} soft reyting | MyUni.uz`
      : `Arxiv yo'q (${yearLabel}) | MyUni.uz`,
    description: supported
      ? yearDescription
      : `${yearLabel} yil uchun muzlatilgan soft reyting arxivi hali yo'q. Hozir faqat ${CURRENT_RANKING_YEAR} jonli jadval mavjud.`,
    path: supported ? path : RANKINGS_PATH,
    robots: supported ? "index, follow" : "noindex, follow",
  });

  useEffect(() => {
    if (!supported) {
      return undefined;
    }
    let alive = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getAllPublicUniversities({
          sort: "rating",
          min_reviews: RANKINGS_MIN_REVIEWS,
        });
        if (!alive) {
          return;
        }
        const list = (data.results || []).filter(
          (row) => (row.review_count ?? 0) >= RANKINGS_MIN_REVIEWS
        );
        setRows(list);
      } catch {
        if (alive) {
          setRows([]);
          setError("Reyting yuklanmadi. Keyinroq urinib ko'ring.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [supported, year, reloadToken]);

  const breadcrumbItems = [
    { name: "Bosh sahifa", path: "/" },
    { name: "Reyting", path: RANKINGS_PATH },
    { name: String(year), path },
  ];

  const breadcrumbSchema = useMemo(
    () => buildBreadcrumbSchema(breadcrumbItems),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- path/year stable per render
    [path, year]
  );

  const webPageSchema = useMemo(
    () =>
      buildWebPageSchema({
        title: `${year} soft reyting | MyUni.uz`,
        description: yearDescription,
        path,
      }),
    [path, year, yearDescription]
  );

  const listSchema = useMemo(
    () =>
      buildRankingsListSchema({
        year,
        universities: rows.slice(0, 50),
        totalCount: rows.length,
      }),
    [rows, year]
  );

  const seoReady = supported ? !loading : true;

  if (!supported) {
    return (
      <PublicDocumentLayout seoReady={seoReady}>
        <div className="max-w-3xl">
          <PageBreadcrumbs
            items={[
              { name: "Bosh sahifa", path: "/" },
              { name: "Reyting", path: RANKINGS_PATH },
              { name: yearLabel },
            ]}
          />
          <h1 className="text-3xl font-black">Arxiv hali yo&apos;q</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            {yearLabel} yil uchun muzlatilgan (snapshot) jadval hali chiqarilmagan. Hozir faqat{" "}
            <strong>{CURRENT_RANKING_YEAR}</strong> jonli soft reyting mavjud.
          </p>
          <TrustStrip
            className="mt-8"
            updatedLabel={doc.updatedAt}
            sources={doc.sources}
            reportPath={RANKINGS_PATH}
          />
          <Link
            to={rankingsYearPath(CURRENT_RANKING_YEAR)}
            className="mt-8 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-bold text-white"
          >
            {CURRENT_RANKING_YEAR} reytingiga o&apos;tish
          </Link>
        </div>
      </PublicDocumentLayout>
    );
  }

  return (
    <PublicDocumentLayout seoReady={seoReady}>
      <JsonLd
        id="rankings-year-json-ld"
        schemas={[breadcrumbSchema, webPageSchema, listSchema].filter(Boolean)}
      />
      <div className="max-w-5xl">
        <PageBreadcrumbs items={breadcrumbItems} />
        <header className="space-y-4 sm:space-y-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary sm:text-sm">
            Soft reyting · jonli
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-[2.75rem]">
            {year} MyUni soft reytingi
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {yearDescription}
          </p>
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-100">
            {doc.honestyBanner}
          </div>
        </header>

        <TrustStrip
          className="mt-8"
          updatedLabel={`${doc.updatedAt} · sharh tasdiqlangach yangilanadi`}
          sources={doc.sources}
          reportPath={path}
        />

        <div className="mt-8">
          {loading ? <RankingsSkeleton /> : null}
          {!loading && error ? (
            <div
              className="rounded-[1.75rem] border border-rose-200 bg-rose-50 px-4 py-4 dark:border-rose-400/30 dark:bg-rose-500/10"
              role="alert"
            >
              <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">{error}</p>
              <button
                type="button"
                onClick={() => setReloadToken((token) => token + 1)}
                className="mt-3 inline-flex rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-bold text-rose-900 transition hover:bg-rose-50 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/20"
              >
                Qayta urinish
              </button>
            </div>
          ) : null}
          {!loading && !error ? <RankingsTable rows={rows} year={year} /> : null}
        </div>

        <nav
          aria-label="Tegishli sahifalar"
          className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold"
        >
          <Link to="/metodologiya" className="text-primary hover:underline">
            Metodologiya
          </Link>
          <Link to="/universitetlar?sort=rating" className="text-primary hover:underline">
            Katalog (reyting tartibi)
          </Link>
          <Link to="/taqqoslash" className="text-primary hover:underline">
            Taqqoslash
          </Link>
          <Link to={RANKINGS_PATH} className="text-primary hover:underline">
            Reytinglar indeksi
          </Link>
        </nav>
      </div>
    </PublicDocumentLayout>
  );
}
