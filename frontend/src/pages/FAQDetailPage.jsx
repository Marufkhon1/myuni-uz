import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import JsonLd from "../components/seo/JsonLd.jsx";
import { buildPageMeta } from "../config/siteMeta.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { BlogListSkeleton } from "../components/skeletons/PublicPageSkeletons.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import { getPublicFaqDetail } from "../services/publicService.js";
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildWebPageSchema,
} from "../utils/structuredData.js";

export default function FAQDetailPage() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageMeta = useMemo(() => {
    if (!item) {
      return buildPageMeta({
        title: "Savol-javob | MyUni.uz",
        description: "MyUni.uz FAQ — platforma haqida savol va javoblar.",
        path: `/savollar-javob/${slug || ""}`,
      });
    }
    return buildPageMeta({
      title: `${item.question} | MyUni.uz FAQ`,
      description: item.answer,
      path: `/savollar-javob/${item.slug}`,
    });
  }, [item, slug]);

  usePageMeta(pageMeta);

  useEffect(() => {
    if (!slug) {
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError("");

    getPublicFaqDetail(slug)
      .then((data) => {
        if (!cancelled) {
          setItem(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItem(null);
          setError("Savol topilmadi yoki vaqtincha mavjud emas.");
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

  const breadcrumbSchema = useMemo(
    () =>
      buildBreadcrumbSchema([
        { name: "Bosh sahifa", path: "/" },
        { name: "Savol-javob", path: "/savollar-javob" },
        item ? { name: item.question, path: `/savollar-javob/${item.slug}` } : null,
      ].filter(Boolean)),
    [item]
  );

  const faqSchema = useMemo(
    () =>
      item
        ? buildFaqPageSchema([{ question: item.question, answer: item.answer }])
        : null,
    [item]
  );

  const webPageSchema = useMemo(
    () =>
      item
        ? buildWebPageSchema({
            title: pageMeta.title,
            description: pageMeta.description,
            path: `/savollar-javob/${item.slug}`,
          })
        : null,
    [item, pageMeta.description, pageMeta.title]
  );

  return (
    <MainLayout>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={webPageSchema} />

      <section className="section-padding">
        <div className="container-shell max-w-3xl">
          <Link to="/savollar-javob" className="text-sm font-black text-primary hover:underline">
            ← Barcha savollar
          </Link>

          {loading ? (
            <BlogListSkeleton className="mt-8" />
          ) : error || !item ? (
            <EmptyState title="Topilmadi" description={error} className="mt-8" />
          ) : (
            <article className="mt-8">
              <span className="eyebrow">FAQ</span>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                {item.question}
              </h1>
              <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 text-lg leading-8 text-slate-700 shadow-soft dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200">
                {item.answer}
              </div>
            </article>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
