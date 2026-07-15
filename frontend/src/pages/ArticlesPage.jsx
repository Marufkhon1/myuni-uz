import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "@/components/seo/JsonLd.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import ArticleCoverImage from "@/components/articles/ArticleCoverImage.jsx";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { BlogListSkeleton } from "@/components/skeletons/PublicPageSkeletons.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import MainLayout from "@/layouts/MainLayout.jsx";
import { getPublicArticles } from "@/services/publicService.js";
import {
  buildBlogListSchema,
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

function formatArticleDate(isoString) {
  if (!isoString) {
    return "";
  }
  try {
    return new Intl.DateTimeFormat("uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(isoString));
  } catch {
    return "";
  }
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  usePageMeta(PAGE_META.articlesList);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getPublicArticles({ kind: "guide" })
      .then((data) => {
        if (!cancelled) {
          setArticles(Array.isArray(data) ? data : data?.results ?? []);
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

  const listSchema = useMemo(() => buildBlogListSchema(articles), [articles]);

  const webPageSchema = useMemo(
    () =>
      buildWebPageSchema({
        title: PAGE_META.articlesList.title,
        description: PAGE_META.articlesList.description,
        path: "/maqolalar",
      }),
    []
  );

  const seoReady = !loading;

  return (
    <MainLayout>
      <JsonLd
        id="articles-list-json-ld"
        schemas={[breadcrumbSchema, listSchema, webPageSchema].filter(Boolean)}
      />

      <section className="section-padding" data-seo-ready={seoReady ? "true" : undefined}>
        <div className="container-shell">
          <div className="max-w-3xl">
            <span className="eyebrow">Maqolalar</span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Universitet tanlash bo&apos;yicha qo&apos;llanmalar
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Qabul, reytingni tushunish, taqqoslash va platformadan foydalanish haqida qisqa
              maqolalar. Reyting formulalari uchun{" "}
              <Link to="/metodologiya" className="font-black text-primary hover:underline">
                metodologiya
              </Link>{" "}
              sahifasini ko&apos;ring.
            </p>
          </div>

          {loading ? (
            <BlogListSkeleton />
          ) : error ? (
            <EmptyState title="Xatolik" description={error} className="mt-10" />
          ) : articles.length === 0 ? (
            <EmptyState
              title="Maqolalar hozircha yo'q"
              description="Tez orada bu yerda yangi materiallar paydo bo'ladi."
              className="mt-10"
            />
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => {
                const dateLabel = formatArticleDate(article.published_at || article.updated_at);

                return (
                  <li key={article.slug}>
                    <Link
                      to={`/maqolalar/${article.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-white/[0.06]">
                        <ArticleCoverImage
                          coverImage={article.cover_image}
                          slug={article.slug}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        {dateLabel ? (
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            {dateLabel}
                          </p>
                        ) : null}
                        <h2 className="mt-2 text-lg font-black leading-snug text-slate-950 group-hover:text-primary dark:text-white">
                          {article.title}
                        </h2>
                        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {article.excerpt}
                        </p>
                        <span className="mt-4 text-sm font-black text-primary">O&apos;qish →</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
