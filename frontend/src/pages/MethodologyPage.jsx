import TrustStrip from "@/components/trust/TrustStrip.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import { Link, useLocation } from "react-router-dom";
import { methodologyDocument } from "@/content/methodologyContent.js";
import { PAGE_META } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import { scrollPageToTop } from "@/utils/scrollPageToTop.js";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

export default function MethodologyPage() {
  const doc = methodologyDocument;
  const path = "/metodologiya";
  const { pathname } = useLocation();

  const breadcrumbItems = [
    { name: "Bosh sahifa", path: "/" },
    { name: "Metodologiya", path },
  ];

  const relatedLinks = [
    { to: "/haqida", label: "Biz haqimizda" },
    { to: "/reyting", label: "Soft reyting" },
    { to: "/metodologiya", label: "Metodologiya" },
    { to: "/ishonch-xavfsizlik", label: "Ishonch va xavfsizlik" },
  ];

  usePageMeta({
    ...PAGE_META.methodology,
    title: `${doc.title} | MyUni.uz`,
    description: doc.description,
    path,
  });

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const webPageSchema = buildWebPageSchema({
    title: `${doc.title} | MyUni.uz`,
    description: doc.description,
    path,
  });

  return (
    <PublicDocumentLayout>
      <JsonLd
        id="methodology-json-ld"
        schemas={[breadcrumbSchema, webPageSchema].filter(Boolean)}
      />
      <div className="max-w-3xl">
        <PageBreadcrumbs items={breadcrumbItems} />
        <header className="space-y-4 sm:space-y-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary sm:text-sm">
            Ochiq metodologiya
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-[2.75rem]">
            {doc.title}
          </h1>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {doc.description}
          </p>
          <p className="text-sm font-semibold text-slate-400">Yangilangan: {doc.updatedAt}</p>
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-100">
            Bu sahifa faqat hisoblash qoidalarini tushuntiradi. Schema.org da MyUni uchun soxta
            AggregateRating yo&apos;q — reyting faqat universitet sahifalarida, real sharhlardan.
          </div>
        </header>

        <TrustStrip
          className="mt-8"
          updatedLabel={doc.updatedAt}
          sources={[
            { label: "Soft reyting", href: "/reyting" },
            { label: "Ishonch va xavfsizlik", href: "/ishonch-xavfsizlik" },
            { label: "Sharh qoidalari", href: "/sharh-qoidalari" },
          ]}
          reportPath={path}
        />

        <div className="mt-10 space-y-8">
          {doc.sections.map((section) => (
            <section
              key={section.heading}
              id={section.id || undefined}
              className="scroll-mt-28 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.04] sm:p-8"
            >
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                {section.heading}
              </h2>
              <div className="mt-4 whitespace-pre-line text-base leading-8 text-slate-600 dark:text-slate-300">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <nav
          aria-label="Tegishli sahifalar"
          className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3 text-sm font-bold"
        >
          {relatedLinks.map((link, index) => (
            <span key={link.to} className="flex items-center gap-3">
              {index > 0 ? (
                <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                  ·
                </span>
              ) : null}
              <Link
                to={link.to}
                onClick={() => {
                  if (pathname === link.to) {
                    scrollPageToTop();
                  }
                }}
                className={
                  pathname === link.to
                    ? "text-slate-400 dark:text-slate-500"
                    : "text-primary hover:underline"
                }
                aria-current={pathname === link.to ? "page" : undefined}
              >
                {link.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </PublicDocumentLayout>
  );
}
