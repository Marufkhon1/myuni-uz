import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../components/seo/JsonLd.jsx";
import { PAGE_META } from "../config/siteMeta.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { BlogListSkeleton } from "../components/skeletons/PublicPageSkeletons.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import { getPublicArticles } from "../services/publicService.js";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "../utils/structuredData.js";

function formatArticleDate(value) {
  if (!value) {
    return "";
  }
  try {
    return new Intl.DateTimeFormat("uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function BlogListPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  usePageMeta(PAGE_META.blogList);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getPublicArticles()
      .then((data) => {
        if (!cancelled) {
          setArticles(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArticles([]);
          setError("Maqolalar yuklanmadi. Keyinroq qayta urinib ko'ring.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const breadcrumbSchema = useMemo(
    () =>
      buildBreadcrumbSchema([
        { name: "Bosh sahifa", path: "/" },
        { name: "Maqolalar", path: "/maqolalar" },
      ]),
    []
  );

  const webPageSchema = useMemo(
    () =>
      buildWebPageSchema({
        title: PAGE_META.blogList.title,
        description: PAGE_META.blogList.description,
        path: "/maqolalar",
      }),
    []
  );

  const seoReady = !loading;

  return (
    <MainLayout>
      <JsonLd id="blog-list-breadcrumb-json-ld" data={breadcrumbSchema} />
      <JsonLd id="blog-list-webpage-json-ld" data={webPageSchema} />
      <div className="container-shell pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32" data-seo-ready={seoReady ? "true" : undefined}>
        <header className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary sm:text-sm">
            Maqolalar
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-[2.75rem]">
            Universitet tanlash va platforma haqida
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300">
            MyUni.uz jamoasi va hamjamiyat uchun foydali qo&apos;llanmalar. Barcha maqolalar
            ma&apos;muriyat paneli orqali nashr qilinadi.
          </p>
        </header>

        {loading && <BlogListSkeleton />}

        {error && !loading && (
          <EmptyState
            variant="search"
            title="Maqolalar yuklanmadi"
            description={error}
            action={{ label: "Qayta urinish", onClick: () => window.location.reload() }}
            secondaryAction={{ label: "Bosh sahifaga", to: "/" }}
            className="mt-10"
          />
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
            <p className="text-lg font-black">Hozircha nashr qilingan maqola yo&apos;q</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Yangi maqolalar tez orada qo&apos;shiladi.
            </p>
            <Link to="/" className="mt-5 inline-block font-bold text-primary hover:underline">
              Bosh sahifaga qaytish
            </Link>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.id}>
                <article className="flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.06]">
                  <time
                    className="text-xs font-bold uppercase tracking-wide text-slate-400"
                    dateTime={article.published_at || undefined}
                  >
                    {formatArticleDate(article.published_at)}
                  </time>
                  <h2 className="mt-3 text-xl font-black leading-snug text-slate-900 dark:text-white">
                    <Link
                      to={`/maqolalar/${article.slug}`}
                      className="transition hover:text-primary"
                    >
                      {article.title}
                    </Link>
                  </h2>
                  {article.excerpt && (
                    <p className="mt-3 flex-1 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {article.excerpt}
                    </p>
                  )}
                  <Link
                    to={`/maqolalar/${article.slug}`}
                    className="mt-5 inline-flex text-sm font-black text-primary hover:underline"
                  >
                    O&apos;qish →
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
}
