import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "@/components/seo/JsonLd.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import { CURRENT_RANKING_YEAR, rankingsYearPath } from "@/config/rankings.js";
import { buildUniversitySiloPath } from "@/config/universitySilos.js";
import { FEATURED_CITIES, buildCityPath } from "@/config/cities.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import { getAllPublicUniversities } from "@/services/publicService.js";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

const STATIC_SECTIONS = [
  {
    heading: "Asosiy",
    links: [
      { to: "/", label: "Bosh sahifa" },
      { to: "/universitetlar", label: "Universitetlar katalogi" },
      { to: "/reyting", label: "Soft reyting indeksi" },
      { to: rankingsYearPath(CURRENT_RANKING_YEAR), label: `${CURRENT_RANKING_YEAR} soft reyting` },
      { to: "/taqqoslash", label: "Taqqoslash" },
    ],
  },
  {
    heading: "Kontent",
    links: [
      { to: "/maqolalar", label: "Maqolalar (qo'llanmalar)" },
      { to: "/yangiliklar", label: "Yangiliklar" },
      { to: "/yo-nalishlar", label: "Yo'nalishlar" },
      { to: "/stipendiyalar", label: "Stipendiyalar" },
      { to: "/qabul-qollanmasi", label: "Qabul qo'llanmasi" },
      { to: "/savollar-javob", label: "Savollar (FAQ)" },
      { to: "/metodologiya", label: "Metodologiya" },
    ],
  },
  {
    heading: "Kompaniya",
    links: [
      { to: "/haqida", label: "Biz haqimizda" },
      { to: "/aloqa", label: "Aloqa" },
      { to: "/hamkorlar", label: "Hamkorlar" },
      { to: "/ishonch-xavfsizlik", label: "Ishonch va xavfsizlik" },
      { to: "/xato-xabar", label: "Xato haqida xabar" },
    ],
  },
  {
    heading: "Huquqiy",
    links: [
      { to: "/foydalanish-shartlari", label: "Foydalanish shartlari" },
      { to: "/maxfiylik-siyosati", label: "Maxfiylik siyosati" },
      { to: "/sharh-qoidalari", label: "Sharh qoidalari" },
    ],
  },
];

export default function HtmlSitemapPage() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const path = "/sayt-xaritasi";

  usePageMeta({ ...PAGE_META.htmlSitemap, path });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAllPublicUniversities({ sort: "name" })
      .then((data) => {
        if (alive) {
          setUniversities(data.results || []);
        }
      })
      .catch(() => {
        if (alive) {
          setUniversities([]);
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

  const breadcrumbItems = [
    { name: "Bosh sahifa", path: "/" },
    { name: "Sayt xaritasi", path },
  ];

  const schemas = useMemo(
    () => [
      buildBreadcrumbSchema(breadcrumbItems),
      buildWebPageSchema({
        title: PAGE_META.htmlSitemap.title,
        description: PAGE_META.htmlSitemap.description,
        path,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <PublicDocumentLayout seoReady={!loading}>
      <JsonLd id="html-sitemap-json-ld" schemas={schemas.filter(Boolean)} />
      <div className="max-w-4xl">
        <PageBreadcrumbs items={breadcrumbItems} />
        <header className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Navigatsiya</p>
          <h1 className="text-3xl font-black sm:text-4xl">Sayt xaritasi</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Asosiy ochiq sahifalar va universitet silolari.
          </p>
        </header>

        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {STATIC_SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-400">
                {section.heading}
              </h2>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm font-bold text-primary hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-400">
            Shaharlar
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {FEATURED_CITIES.map((city) => (
              <li key={city.slug}>
                <Link to={buildCityPath(city.slug)} className="text-sm font-bold text-primary hover:underline">
                  {city.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-400">
            Universitetlar
          </h2>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Yuklanmoqda…</p>
          ) : (
            <ul className="mt-4 columns-1 gap-x-8 sm:columns-2">
              {universities.map((uni) => (
                <li key={uni.slug} className="mb-3 break-inside-avoid">
                  <Link
                    to={buildUniversitySiloPath(uni.slug)}
                    className="text-sm font-bold text-slate-800 hover:text-primary dark:text-slate-100"
                  >
                    {uni.short_name || uni.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] font-semibold text-slate-400">
                    <Link
                      to={buildUniversitySiloPath(uni.slug, "reviews")}
                      className="hover:text-primary"
                    >
                      Sharhlar
                    </Link>
                    {(uni.faculty_count ?? 0) > 0 ? (
                      <Link
                        to={buildUniversitySiloPath(uni.slug, "faculties")}
                        className="hover:text-primary"
                      >
                        Fakultetlar
                      </Link>
                    ) : null}
                    {(uni.admission_count ?? 0) > 0 ? (
                      <Link
                        to={buildUniversitySiloPath(uni.slug, "admission")}
                        className="hover:text-primary"
                      >
                        Qabul
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PublicDocumentLayout>
  );
}
