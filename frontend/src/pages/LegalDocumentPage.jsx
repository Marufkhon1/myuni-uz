import { Link, useLocation } from "react-router-dom";
import JsonLd from "@/components/seo/JsonLd.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import { legalDocuments } from "@/content/legalContent.js";
import { PAGE_META } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import { scrollPageToTop } from "@/utils/scrollPageToTop.js";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

const pathToDoc = {
  "/foydalanish-shartlari": legalDocuments.terms,
  "/maxfiylik-siyosati": legalDocuments.privacy,
  "/sharh-qoidalari": legalDocuments.reviews,
};

const relatedLinks = [
  { to: "/metodologiya", label: "Metodologiya" },
  { to: "/ishonch-xavfsizlik", label: "Ishonch va xavfsizlik" },
  { to: "/foydalanish-shartlari", label: legalDocuments.terms.title },
  { to: "/maxfiylik-siyosati", label: legalDocuments.privacy.title },
  { to: "/sharh-qoidalari", label: legalDocuments.reviews.title },
];

export default function LegalDocumentPage() {
  const { pathname } = useLocation();
  const doc = pathToDoc[pathname];

  usePageMeta(
    doc
      ? {
          title: `${doc.title} | MyUni.uz`,
          description: doc.description,
          path: pathname,
        }
      : { ...PAGE_META.notFound, path: pathname }
  );

  const breadcrumbItems = doc
    ? [
        { name: "Bosh sahifa", path: "/" },
        { name: doc.title, path: pathname },
      ]
    : [];

  const breadcrumbSchema = doc ? buildBreadcrumbSchema(breadcrumbItems) : null;

  const webPageSchema = doc
    ? buildWebPageSchema({
        title: `${doc.title} | MyUni.uz`,
        description: doc.description,
        path: pathname,
      })
    : null;

  if (!doc) {
    return (
      <PublicDocumentLayout seoReady={false}>
        <div className="text-center">
          <h1 className="text-2xl font-black">Sahifa topilmadi</h1>
          <Link to="/" className="mt-4 inline-block font-bold text-primary">
            Bosh sahifaga
          </Link>
        </div>
      </PublicDocumentLayout>
    );
  }

  return (
    <PublicDocumentLayout>
      <JsonLd
        id="legal-json-ld"
        schemas={[breadcrumbSchema, webPageSchema].filter(Boolean)}
      />
      <div className="max-w-3xl">
        <PageBreadcrumbs items={breadcrumbItems} />
        <header className="space-y-4 sm:space-y-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary sm:text-sm">
            Huquqiy hujjat
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-[2.75rem]">
            {doc.title}
          </h1>
          <p className="max-w-none text-base leading-8 text-pretty text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-300">
            {doc.description}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Oxirgi yangilanish: {doc.updatedAt}
          </p>
        </header>

        <article className="mt-10 space-y-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft sm:mt-12 sm:space-y-12 sm:p-10 lg:mt-14 lg:p-12 dark:border-white/10 dark:bg-white/[0.06]">
          {doc.sections.map((section, index) => (
            <section
              key={section.heading}
              className={
                index > 0 ? "border-t border-slate-100 pt-10 sm:pt-12 dark:border-white/10" : ""
              }
            >
              <h2 className="text-xl font-black text-slate-900 sm:text-2xl dark:text-white">
                {section.heading}
              </h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-600 sm:text-base dark:text-slate-300">
                {section.body}
              </p>
            </section>
          ))}
        </article>

        <nav
          aria-label="Boshqa huquqiy hujjatlar"
          className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold sm:mt-12"
        >
          {relatedLinks.map((link) => (
            <Link
              key={link.to}
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
          ))}
        </nav>
      </div>
    </PublicDocumentLayout>
  );
}
