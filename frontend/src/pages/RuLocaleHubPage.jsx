import { Link } from "react-router-dom";
import JsonLd from "@/components/seo/JsonLd.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/utils/structuredData.js";

/**
 * Phase 4 — RU locale hub placeholder (scaffold only).
 * Full translation ships progressively; this reserves /ru without fake child routes.
 */
export default function RuLocaleHubPage() {
  const path = "/ru";

  usePageMeta({
    title: "MyUni.uz — русская версия",
    description:
      "Русская версия MyUni.uz готовится. Сейчас основной контент доступен на узбекском языке.",
    path,
    robots: "noindex, follow",
    ogLocale: "ru_RU",
  });

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Bosh sahifa", path: "/" },
      { name: "Русский", path },
    ]),
    buildWebPageSchema({
      title: "MyUni.uz — русская версия",
      description: "Русская версия готовится. Основной контент на узбекском.",
      path,
    }),
  ];

  return (
    <PublicDocumentLayout seoReady>
      <JsonLd id="ru-locale-hub-json-ld" schemas={schemas.filter(Boolean)} />
      <div className="max-w-2xl">
        <PageBreadcrumbs
          items={[
            { name: "Bosh sahifa", path: "/" },
            { name: "Русский", path },
          ]}
        />
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Locale</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Русская версия</h1>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          i18n scaffolding (Phase 4): префикс <code className="font-mono text-sm">/ru</code>,
          message catalogs и locale helpers готовы. Полный перевод публичных страниц — поэтапно.
          Сейчас индексируется узбекская версия.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-black text-white"
          >
            O&apos;zbekcha — bosh sahifa
          </Link>
          <Link
            to="/universitetlar"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold dark:border-white/10"
          >
            Universitetlar
          </Link>
        </div>
        <p className="mt-6 text-xs text-slate-400">
          {PAGE_META.about?.title || "MyUni.uz"} · noindex until RU content ships
        </p>
      </div>
    </PublicDocumentLayout>
  );
}
