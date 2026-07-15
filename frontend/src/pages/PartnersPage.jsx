import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TrustStrip from "@/components/trust/TrustStrip.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import { partnersDocument } from "@/content/partnersContent.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import { getPublicFeaturedUniversities } from "@/services/publicService.js";
import { buildUniversityPublicPath } from "@/utils/navigation.js";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

export default function PartnersPage() {
  const doc = partnersDocument;
  const path = "/hamkorlar";
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  usePageMeta({
    ...PAGE_META.partners,
    title: `${doc.title} | MyUni.uz`,
    description: doc.description,
    path,
  });

  useEffect(() => {
    let alive = true;
    getPublicFeaturedUniversities(12)
      .then((data) => {
        if (alive) {
          setFeatured(Array.isArray(data) ? data : data?.results || []);
        }
      })
      .catch(() => {
        if (alive) {
          setFeatured([]);
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Bosh sahifa", path: "/" },
      { name: "Hamkorlar", path },
    ]),
    buildWebPageSchema({
      title: `${doc.title} | MyUni.uz`,
      description: doc.description,
      path,
    }),
  ];

  return (
    <PublicDocumentLayout seoReady={!loading}>
      <JsonLd id="partners-json-ld" schemas={schemas.filter(Boolean)} />
      <div className="max-w-3xl">
        <PageBreadcrumbs
          items={[
            { name: "Bosh sahifa", path: "/" },
            { name: "Hamkorlar", path },
          ]}
        />
        <header className="space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Ishonch</p>
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
            { label: "Metodologiya", href: "/metodologiya" },
            { label: "Aloqa", href: "/aloqa" },
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

        <section className="mt-10">
          <h2 className="text-xl font-black">Faol universitetlar</h2>
          <p className="mt-2 text-sm text-slate-500">
            Platformadagi faollik asosida — rasmiy hamkorlik belgisi emas.
          </p>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Yuklanmoqda…</p>
          ) : featured.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Hozircha faol universitetlar ro&apos;yxati bo&apos;sh.{" "}
              <Link to="/universitetlar" className="font-bold text-primary hover:underline">
                Katalogga o&apos;tish
              </Link>
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {featured.map((uni) => (
                <li key={uni.slug || uni.id}>
                  <Link
                    to={buildUniversityPublicPath(uni.slug)}
                    className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold hover:border-primary/40 dark:border-white/10"
                  >
                    {uni.short_name || uni.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 p-6 dark:border-white/10">
          <h2 className="text-lg font-black">{doc.cta.title}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{doc.cta.body}</p>
          <Link
            to={doc.cta.to}
            className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-black text-white"
          >
            {doc.cta.label}
          </Link>
        </section>
      </div>
    </PublicDocumentLayout>
  );
}
