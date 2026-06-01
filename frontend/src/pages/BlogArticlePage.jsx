import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import JsonLd from "../components/seo/JsonLd.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { BlogArticleSkeleton } from "../components/skeletons/PublicPageSkeletons.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import { getPublicArticleBySlug } from "../services/publicService.js";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
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

export default function BlogArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const metaTitle = article ? `${article.title} | MyUni.uz` : "Maqola | MyUni.uz";
  const metaDescription = article?.excerpt || article?.body?.slice(0, 160) || "MyUni.uz maqolasi";

  usePageMeta({
    title: metaTitle,
    description: metaDescription,
    path: slug ? `/maqolalar/${slug}` : undefined,
    type: "article",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setArticle(null);

    getPublicArticleBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setArticle(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArticle(null);
          setError("Maqola topilmadi.");
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

  const breadcrumbSchema = useMemo(() => {
    if (!article) {
      return null;
    }
    return buildBreadcrumbSchema([
      { name: "Bosh sahifa", path: "/" },
      { name: "Maqolalar", path: "/maqolalar" },
      { name: article.title, path: `/maqolalar/${slug}` },
    ]);
  }, [article, slug]);

  const articleSchema = useMemo(
    () => buildArticleSchema({ article, slug }),
    [article, slug]
  );

  const paragraphs = useMemo(() => {
    if (!article?.body) {
      return [];
    }
    return article.body.split(/\n\n+/).map((part) => part.trim()).filter(Boolean);
  }, [article]);

  const seoReady = !loading && (Boolean(article) || Boolean(error));

  return (
    <MainLayout>
      <JsonLd id="blog-article-breadcrumb-json-ld" data={breadcrumbSchema} />
      <JsonLd id="blog-article-json-ld" data={articleSchema} />
      <div className="container-shell pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32" data-seo-ready={seoReady ? "true" : undefined}>
        <nav aria-label="Breadcrumb" className="mb-6 text-sm font-bold text-slate-500 dark:text-slate-400">
          <Link to="/" className="transition hover:text-primary">
            Bosh sahifa
          </Link>
          <span className="mx-2">/</span>
          <Link to="/maqolalar" className="transition hover:text-primary">
            Maqolalar
          </Link>
        </nav>

        {loading && <BlogArticleSkeleton />}

        {error && !loading && (
          <EmptyState
            variant="search"
            title="Maqola topilmadi"
            description={error}
            action={{ label: "Barcha maqolalar", to: "/maqolalar" }}
            secondaryAction={{ label: "Bosh sahifaga", to: "/" }}
          />
        )}

        {article && !loading && (
          <article className="max-w-3xl">
            <header className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary sm:text-sm">
                Maqola
              </p>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-[2.75rem]">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300">
                  {article.excerpt}
                </p>
              )}
              {article.published_at && (
                <time
                  className="block text-sm text-slate-400 dark:text-slate-500"
                  dateTime={article.published_at}
                >
                  {formatArticleDate(article.published_at)}
                </time>
              )}
            </header>

            <div className="mt-10 space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft sm:p-10 dark:border-white/10 dark:bg-white/[0.06]">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={`${article.slug}-p-${index}`}
                  className="text-sm leading-8 text-slate-600 sm:text-base dark:text-slate-300"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/maqolalar" className="text-sm font-black text-primary hover:underline">
                ← Barcha maqolalar
              </Link>
            </div>
          </article>
        )}
      </div>
    </MainLayout>
  );
}
