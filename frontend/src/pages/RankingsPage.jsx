import { Link } from "react-router-dom";
import JsonLd from "@/components/seo/JsonLd.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import TrustStrip from "@/components/trust/TrustStrip.jsx";
import { CURRENT_RANKING_YEAR, RANKINGS_PATH, rankingsYearPath } from "@/config/rankings.js";
import { PAGE_META } from "@/config/siteMeta.js";
import { rankingsDocument } from "@/content/rankingsContent.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

/**
 * /reyting hub — yillar indeksi (hozir faqat jonli yil).
 */
export default function RankingsPage() {
  const path = RANKINGS_PATH;
  const doc = rankingsDocument;
  const yearPath = rankingsYearPath(CURRENT_RANKING_YEAR);

  const breadcrumbItems = [
    { name: "Bosh sahifa", path: "/" },
    { name: "Reyting", path },
  ];

  usePageMeta({
    ...PAGE_META.rankings,
    title: PAGE_META.rankings.title,
    description: doc.hubDescription,
    path,
  });

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const webPageSchema = buildWebPageSchema({
    title: PAGE_META.rankings.title,
    description: doc.hubDescription,
    path,
  });

  return (
    <PublicDocumentLayout>
      <JsonLd
        id="rankings-index-json-ld"
        schemas={[breadcrumbSchema, webPageSchema].filter(Boolean)}
      />
      <div className="max-w-3xl">
        <PageBreadcrumbs items={breadcrumbItems} />
        <header className="space-y-4 sm:space-y-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary sm:text-sm">
            Soft reyting
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-[2.75rem]">
            {doc.title}
          </h1>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {doc.hubDescription}
          </p>
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-100">
            {doc.honestyBanner}
          </div>
        </header>

        <TrustStrip
          className="mt-8"
          updatedLabel={doc.updatedAt}
          sources={doc.sources}
          reportPath={path}
        />

        <section className="mt-10">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Mavjud yillar</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                to={yearPath}
                className="flex items-center justify-between rounded-[1.35rem] border border-slate-200 bg-white px-5 py-4 font-bold text-slate-950 transition hover:border-primary/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              >
                <span>
                  {CURRENT_RANKING_YEAR}
                  <span className="ml-2 text-xs font-black uppercase tracking-wide text-primary">
                    Jonli
                  </span>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Muzlatilgan yillik arxiv (snapshot) keyingi fazalarda qo&apos;shiladi. Hozirgi jadval
            tasdiqlangan sharhlardan jonli hisoblanadi.
          </p>
        </section>

        <nav aria-label="Tegishli sahifalar" className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold">
          <Link to="/metodologiya" className="text-primary hover:underline">
            Metodologiya
          </Link>
          <Link to="/universitetlar?sort=rating" className="text-primary hover:underline">
            Katalog
          </Link>
          <Link to="/haqida" className="text-primary hover:underline">
            Biz haqimizda
          </Link>
        </nav>
      </div>
    </PublicDocumentLayout>
  );
}
