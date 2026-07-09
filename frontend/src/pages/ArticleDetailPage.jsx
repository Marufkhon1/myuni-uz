import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import JsonLd from "@/components/seo/JsonLd.jsx";
import { PAGE_META, resolveArticleCoverImage, truncateMetaDescription } from "@/config/siteMeta.js";
import ArticleCoverImage from "@/components/articles/ArticleCoverImage.jsx";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { BlogArticleSkeleton } from "@/components/skeletons/PublicPageSkeletons.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import MainLayout from "@/layouts/MainLayout.jsx";
import { getPublicArticleBySlug, getPublicArticles } from "@/services/publicService.js";
import {
  buildArticleSchema,
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

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setArticle(null);

    Promise.all([getPublicArticleBySlug(slug), getPublicArticles().catch(() => [])])
      .then(([detail, list]) => {
        if (cancelled) {
          return;
        }
        setArticle(detail);
        const others = (Array.isArray(list) ? list : [])
          .filter((item) => item.slug !== slug)
          .slice(0, 3);
        setRelated(others);
      })
      .catch(() => {
        if (!cancelled) {
          setArticle(null);
          setError("Maqola topilmadi yoki yuklanmadi.");
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
  }, [slug]);

  const path = `/maqolalar/${slug || ""}`;
  const cover = resolveArticleCoverImage(article?.cover_image, undefined, slug);

  usePageMeta(
    article
      ? {
          title: `${article.title} | MyUni.uz`,
          description: article.excerpt || truncateMetaDescription(article.body),
          path,
          image: cover,
          imageAlt: `${article.title} — MyUni.uz maqolasi`,
          type: "article",
          publishedTime: article.published_at || null,
          modifiedTime: article.updated_at || article.published_at || null,
        }
      : {
          ...PAGE_META.articlesList,
          title: "Maqola | MyUni.uz",
          path,
          robots: loading ? "index, follow" : "noindex, follow",
        }
  );

  const breadcrumbSchema = useMemo(
    () =>
      buildBreadcrumbSchema([
        { name: "Bosh sahifa", path: "/" },
        { name: "Maqolalar", path: "/maqolalar" },
        { name: article?.title || "Maqola", path },
      ]),
    [article?.title, path]
  );

  const articleSchema = useMemo(
    () => (article ? buildArticleSchema({ article, slug }) : null),
    [article, slug]
  );

  const webPageSchema = useMemo(
    () =>
      article
        ? buildWebPageSchema({
            title: `${article.title} | MyUni.uz`,
            description: article.excerpt || truncateMetaDescription(article.body),
            path,
          })
        : null,
    [article, path]
  );

  const seoReady = !loading && Boolean(article);

  return (
    <MainLayout>
      <JsonLd
        id="article-detail-json-ld"
        schemas={[breadcrumbSchema, articleSchema, webPageSchema].filter(Boolean)}
      />

      <section className="section-padding" data-seo-ready={seoReady ? "true" : undefined}>
        <div className="container-shell">
          <div className="mb-8">
            <Link
              to="/maqolalar"
              className="text-sm font-black text-primary hover:underline"
            >
              ← Barcha maqolalar
            </Link>
          </div>

          {loading ? (
            <BlogArticleSkeleton />
          ) : error || !article ? (
            <EmptyState
              title="Maqola topilmadi"
              description={error || "Bu slug bo'yicha nashr qilingan maqola yo'q."}
              action={{ to: "/maqolalar", label: "Maqolalar ro'yxati" }}
            />
          ) : (
            <article className="mx-auto max-w-3xl">
              <header>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {formatArticleDate(article.published_at || article.updated_at) || "Maqola"}
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                  {article.title}
                </h1>
                {article.excerpt ? (
                  <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                    {article.excerpt}
                  </p>
                ) : null}
              </header>

              <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 dark:border-white/10">
                <ArticleCoverImage
                  coverImage={article.cover_image}
                  slug={article.slug}
                  className="aspect-[16/9] w-full object-cover"
                  loading="eager"
                />
              </div>

              <div className="mt-10 whitespace-pre-line text-base leading-8 text-slate-700 dark:text-slate-300 sm:text-lg sm:leading-9">
                {article.body}
              </div>

              <div className="mt-12 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-6 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">
                  Qo&apos;shimcha
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Reyting qanday hisoblanadi?{" "}
                  <Link to="/metodologiya" className="font-black text-primary hover:underline">
                    Metodologiya
                  </Link>
                  . Moderatsiya haqida:{" "}
                  <Link to="/ishonch-xavfsizlik" className="font-black text-primary hover:underline">
                    ishonch va xavfsizlik
                  </Link>
                  .
                </p>
              </div>

              {related.length > 0 ? (
                <aside className="mt-14">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    Boshqa maqolalar
                  </h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                    {related.map((item) => (
                      <li key={item.slug}>
                        <Link
                          to={`/maqolalar/${item.slug}`}
                          className="block rounded-2xl border border-slate-200 bg-white p-4 text-sm font-black text-slate-900 transition hover:border-primary/30 hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}
            </article>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
