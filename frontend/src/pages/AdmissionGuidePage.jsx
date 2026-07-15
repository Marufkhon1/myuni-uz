import { Link } from "react-router-dom";
import TrustStrip from "@/components/trust/TrustStrip.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import { admissionGuideDocument } from "@/content/admissionGuideContent.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

export default function AdmissionGuidePage() {
  const doc = admissionGuideDocument;
  const path = "/qabul-qollanmasi";

  usePageMeta({
    ...PAGE_META.admissionGuide,
    title: `${doc.title} | MyUni.uz`,
    description: doc.description,
    path,
  });

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Bosh sahifa", path: "/" },
      { name: "Qabul qo'llanmasi", path },
    ]),
    buildWebPageSchema({
      title: `${doc.title} | MyUni.uz`,
      description: doc.description,
      path,
    }),
  ];

  return (
    <PublicDocumentLayout>
      <JsonLd id="admission-guide-json-ld" schemas={schemas.filter(Boolean)} />
      <div className="max-w-3xl">
        <PageBreadcrumbs
          items={[
            { name: "Bosh sahifa", path: "/" },
            { name: "Qabul qo'llanmasi", path },
          ]}
        />
        <header className="space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Qo'llanma</p>
          <h1 className="text-3xl font-black sm:text-4xl">{doc.title}</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">{doc.description}</p>
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-100">
            {doc.disclaimer}
          </div>
        </header>

        <TrustStrip
          className="mt-8"
          updatedLabel={doc.updatedAt}
          sources={[
            { label: "Stipendiyalar", href: "/stipendiyalar" },
            { label: "Yo'nalishlar", href: "/yo-nalishlar" },
          ]}
          reportPath={path}
        />

        <ol className="mt-10 space-y-6">
          {doc.steps.map((step) => (
            <li key={step.title} className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
              <h2 className="text-lg font-black">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.body}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {step.links.map((link) => (
                  <Link key={link.to} to={link.to} className="text-sm font-bold text-primary hover:underline">
                    {link.label}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-10">
          <h2 className="text-xl font-black">Tezkor checklist</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {doc.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </PublicDocumentLayout>
  );
}
