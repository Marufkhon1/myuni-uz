import { Link, useLocation } from "react-router-dom";
import JsonLd from "@/components/seo/JsonLd.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import { trustSafetyDocument } from "@/content/trustContent.js";
import { PAGE_META } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import { scrollPageToTop } from "@/utils/scrollPageToTop.js";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

export default function TrustSafetyPage() {
  const doc = trustSafetyDocument;
  const path = "/ishonch-xavfsizlik";
  const { pathname } = useLocation();

  const breadcrumbItems = [
    { name: "Bosh sahifa", path: "/" },
    { name: doc.title, path },
  ];

  const relatedLinks = [
    { to: "/metodologiya", label: "Metodologiya" },
    { to: "/ishonch-xavfsizlik", label: "Ishonch va xavfsizlik" },
    { to: "/maxfiylik-siyosati", label: "Maxfiylik siyosati" },
    { to: "/sharh-qoidalari", label: "Sharh qoidalari" },
    { to: "/foydalanish-shartlari", label: "Foydalanish shartlari" },
  ];

  usePageMeta({
    ...PAGE_META.trustSafety,
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
        id="trust-json-ld"
        schemas={[breadcrumbSchema, webPageSchema].filter(Boolean)}
      />
      <div className="max-w-3xl">
        <PageBreadcrumbs items={breadcrumbItems} />
        <header className="space-y-4 sm:space-y-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary sm:text-sm">
            Ishonch va xavfsizlik
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-[2.75rem]">
            {doc.title}
          </h1>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {doc.description}
          </p>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Yangilangan: {doc.updatedAt}
          </p>
        </header>

        <div className="mt-10 space-y-8">
          {doc.sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.04] sm:p-8"
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
          aria-label="Boshqa huquqiy hujjatlar"
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
                    ? "text-slate-600 dark:text-slate-300"
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
