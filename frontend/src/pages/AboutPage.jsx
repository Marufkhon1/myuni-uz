import TrustStrip from "@/components/trust/TrustStrip.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import { Link, useLocation } from "react-router-dom";
import { aboutDocument } from "@/content/aboutContent.js";
import { PAGE_META } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import { scrollPageToTop } from "@/utils/scrollPageToTop.js";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

const path = "/haqida";

export default function AboutPage() {
  const doc = aboutDocument;
  const { pathname } = useLocation();

  const breadcrumbItems = [
    { name: "Bosh sahifa", path: "/" },
    { name: "Biz haqimizda", path },
  ];

  const relatedLinks = [
    { to: "/reyting", label: "Soft reyting" },
    { to: "/metodologiya", label: "Metodologiya" },
    { to: "/ishonch-xavfsizlik", label: "Ishonch va xavfsizlik" },
    { to: "/aloqa", label: "Aloqa" },
  ];

  usePageMeta({
    ...PAGE_META.about,
    title: `${doc.title} | MyUni.uz`,
    description: doc.description,
    path,
  });

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const webPageSchema = buildWebPageSchema({
    title: `${doc.title} | MyUni.uz`,
    description: doc.description,
    path,
    pageType: "AboutPage",
  });

  return (
    <PublicDocumentLayout>
      <JsonLd
        id="about-json-ld"
        schemas={[breadcrumbSchema, webPageSchema].filter(Boolean)}
      />
      <div className="max-w-3xl">
        <PageBreadcrumbs items={breadcrumbItems} />

        <header className="space-y-4 sm:space-y-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary sm:text-sm">
            MyUni.uz
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-[2.75rem]">
            {doc.title}
          </h1>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {doc.description}
          </p>
          <p className="text-sm font-semibold text-slate-400">Yangilangan: {doc.updatedAt}</p>
        </header>

        <TrustStrip
          className="mt-8"
          updatedLabel={doc.updatedAt}
          sources={[
            { label: "Metodologiya", href: "/metodologiya" },
            { label: "Soft reyting", href: "/reyting" },
            { label: "Ishonch", href: "/ishonch-xavfsizlik" },
          ]}
          reportPath={path}
        />

        <nav aria-label="Sahifa bo'limlari" className="mt-8 flex flex-wrap gap-2">
          {doc.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-primary/30 hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-blue-200"
            >
              {section.heading}
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-8">
          {doc.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
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
                className="text-primary hover:underline"
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
