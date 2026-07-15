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

/**
 * Yangiliklar hub — Article.kind=news (maqolalar qo'llanmalardan ajralgan).
 */
export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  usePageMeta(PAGE_META.news);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getPublicArticles({ kind: "news" })
      .then((data) => {
        if (!cancelled) {
          setArticles(Array.isArray(data) ? data : data?.results ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArticles([]);
          setError("Yangiliklar yuklanmadi.");
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
        { name: "Yangiliklar", path: "/yangiliklar" },
      ]),
    []
  );

  const listSchema = useMemo(() => buildBlogListSchema(articles), [articles]);
  const webPageSchema = useMemo(
    () =>
      buildWebPageSchema({
        title: PAGE_META.news.title,
        description: PAGE_META.news.description,
        path: "/yangiliklar",
      }),
    []
  );

  const seoReady = !loading;

  return (
    <MainLayout>
      <JsonLd
        id="news-list-json-ld"
        schemas={[breadcrumbSchema, webPageSchema, listSchema].filter(Boolean)}
      />
      <section
        className="section-padding"
        data-seo-ready={seoReady ? "true" : undefined}
      >
        <div className="container-shell">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Yangiliklar</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Oliy ta&apos;lim yangiliklari</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Tezkor xabarlar. Chuqur qo&apos;llanmalar{" "}
            <Link to="/maqolalar" className="font-bold text-primary hover:underline">
              /maqolalar
            </Link>{" "}
            da.
          </p>

          {loading ? <BlogListSkeleton /> : null}
          {error ? (
            <EmptyState variant="articles" title="Xato" description={error} className="mt-10" />
          ) : null}
          {!loading && !error && articles.length === 0 ? (
            <EmptyState
              variant="articles"
              title="Hali yangilik yo'q"
              description="Tez orada nashr qilamiz. Hozir qo'llanmalarni o'qing."
              action={{ label: "Maqolalarga", to: "/maqolalar" }}
              className="mt-10"
            />
          ) : null}

          {!loading && articles.length > 0 ? (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    to={`/yangiliklar/${article.slug}`}
                    className="group block overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <ArticleCoverImage article={article} className="h-40 w-full object-cover" />
                    <div className="p-5">
                      <p className="text-[11px] font-bold text-slate-400">
                        {formatArticleDate(article.published_at)}
                      </p>
                      <h2 className="mt-2 text-lg font-black text-slate-950 group-hover:text-primary dark:text-white">
                        {article.title}
                      </h2>
                      {article.excerpt ? (
                        <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                          {article.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </MainLayout>
  );
}
