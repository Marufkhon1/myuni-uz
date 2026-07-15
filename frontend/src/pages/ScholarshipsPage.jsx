import { Link } from "react-router-dom";
import TrustStrip from "@/components/trust/TrustStrip.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import { scholarshipsDocument } from "@/content/scholarshipsContent.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

export default function ScholarshipsPage() {
  const doc = scholarshipsDocument;
  const path = "/stipendiyalar";

  usePageMeta({
    ...PAGE_META.scholarships,
    title: `${doc.title} | MyUni.uz`,
    description: doc.description,
    path,
  });

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Bosh sahifa", path: "/" },
      { name: "Stipendiyalar", path },
    ]),
    buildWebPageSchema({
      title: `${doc.title} | MyUni.uz`,
      description: doc.description,
      path,
    }),
  ];

  return (
    <PublicDocumentLayout>
      <JsonLd id="scholarships-json-ld" schemas={schemas.filter(Boolean)} />
      <div className="max-w-3xl">
        <PageBreadcrumbs
          items={[
            { name: "Bosh sahifa", path: "/" },
            { name: "Stipendiyalar", path },
          ]}
        />
        <header className="space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Qo&apos;llanma</p>
          <h1 className="text-3xl font-black sm:text-4xl">{doc.title}</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">{doc.description}</p>
          <p className="text-sm font-semibold text-slate-400">Yangilangan: {doc.updatedAt}</p>
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-100">
            {doc.disclaimer}
          </div>
        </header>

        <TrustStrip
          className="mt-8"
          updatedLabel={doc.updatedAt}
          sources={[
            { label: "Qabul qo'llanmasi", href: "/qabul-qollanmasi" },
            { label: "Metodologiya", href: "/metodologiya" },
          ]}
          reportPath={path}
        />

        <div className="mt-10 space-y-8">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-black">{section.heading}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <ul className="mt-10 space-y-4">
          {doc.items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="text-[11px] font-black uppercase tracking-wide text-primary">
                {item.audience}
              </p>
              <h2 className="mt-1 text-lg font-black">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {item.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {item.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    {link.label} →
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PublicDocumentLayout>
  );
}
