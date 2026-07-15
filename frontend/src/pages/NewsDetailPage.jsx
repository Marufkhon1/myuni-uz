import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
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

export default function NewsDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redirectToGuide, setRedirectToGuide] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setArticle(null);
    setRedirectToGuide(false);

    Promise.all([
      getPublicArticleBySlug(slug),
      getPublicArticles({ kind: "news" }).catch(() => []),
    ])
      .then(([detail, list]) => {
        if (cancelled) {
          return;
        }
        if (detail?.kind && detail.kind !== "news") {
          setRedirectToGuide(true);
          return;
        }
        setArticle(detail);
        const others = (Array.isArray(list) ? list : list?.results || [])
          .filter((item) => item.slug !== slug)
          .slice(0, 3);
        setRelated(others);
      })
      .catch(() => {
        if (!cancelled) {
          setArticle(null);
          setError("Yangilik topilmadi.");
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

  const path = `/yangiliklar/${slug || ""}`;
  const cover = resolveArticleCoverImage(article?.cover_image, undefined, slug);

  usePageMeta(
    article
      ? {
          title: `${article.title} | MyUni.uz`,
          description: article.excerpt || truncateMetaDescription(article.body),
          path,
          image: cover,
          imageAlt: `${article.title} — MyUni.uz yangilik`,
          type: "article",
          publishedTime: article.published_at || null,
          modifiedTime: article.updated_at || article.published_at || null,
        }
      : {
          ...PAGE_META.news,
          title: "Yangilik | MyUni.uz",
          path,
          robots: "noindex, follow",
        }
  );

  const breadcrumbSchema = useMemo(
    () =>
      buildBreadcrumbSchema([
        { name: "Bosh sahifa", path: "/" },
        { name: "Yangiliklar", path: "/yangiliklar" },
        { name: article?.title || "Yangilik", path },
      ]),
    [article, path]
  );

  const articleSchema = useMemo(
    () =>
      article
        ? buildArticleSchema({
            article,
            slug,
            basePath: "/yangiliklar",
            schemaType: "NewsArticle",
          })
        : null,
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

  if (redirectToGuide && slug) {
    return <Navigate to={`/maqolalar/${slug}`} replace />;
  }

  const seoReady = !loading && (Boolean(article) || Boolean(error));

  return (
    <MainLayout>
      <JsonLd
        id="news-detail-json-ld"
        schemas={[breadcrumbSchema, articleSchema, webPageSchema].filter(Boolean)}
      />
      <article className="section-padding" data-seo-ready={seoReady ? "true" : undefined}>
        <div className="container-shell mx-auto max-w-3xl">
          <div className="mb-8">
            <Link to="/yangiliklar" className="text-sm font-black text-primary hover:underline">
              ← Barcha yangiliklar
            </Link>
          </div>
          {loading ? <BlogArticleSkeleton /> : null}
          {!loading && (error || !article) ? (
            <EmptyState
              variant="articles"
              title="Yangilik topilmadi"
              description={error || "Bu slug bo'yicha nashr qilingan yangilik yo'q."}
              action={{ label: "Yangiliklar", to: "/yangiliklar" }}
            />
          ) : null}
          {!loading && article ? (
            <>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                Yangilik
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{article.title}</h1>
              <p className="mt-3 text-sm font-semibold text-slate-500">
                {formatArticleDate(article.published_at)}
              </p>
              <ArticleCoverImage
                coverImage={article.cover_image}
                slug={article.slug}
                className="mt-8 aspect-[16/9] w-full rounded-[1.5rem] object-cover"
                loading="eager"
              />
              {article.excerpt ? (
                <p className="mt-6 text-base leading-7 text-slate-600 dark:text-slate-300">
                  {article.excerpt}
                </p>
              ) : null}
              <div className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap dark:prose-invert">
                {article.body}
              </div>
              {related.length > 0 ? (
                <section className="mt-12 border-t border-slate-200 pt-8 dark:border-white/10">
                  <h2 className="text-lg font-black">Boshqa yangiliklar</h2>
                  <ul className="mt-4 space-y-2">
                    {related.map((item) => (
                      <li key={item.slug}>
                        <Link
                          to={`/yangiliklar/${item.slug}`}
                          className="font-bold text-primary hover:underline"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          ) : null}
        </div>
      </article>
    </MainLayout>
  );
}
