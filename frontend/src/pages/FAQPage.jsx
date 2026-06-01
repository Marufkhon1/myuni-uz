import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../components/seo/JsonLd.jsx";
import { PAGE_META } from "../config/siteMeta.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { BlogListSkeleton } from "../components/skeletons/PublicPageSkeletons.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import { getPublicFaqItems } from "../services/publicService.js";
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildWebPageSchema,
} from "../utils/structuredData.js";

export default function FAQPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSlug, setOpenSlug] = useState("");

  usePageMeta(PAGE_META.faqList);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getPublicFaqItems()
      .then((data) => {
        if (!cancelled) {
          const list = data?.items ?? (Array.isArray(data) ? data : []);
          setItems(list);
          if (list[0]?.slug) {
            setOpenSlug(list[0].slug);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setError("Savol-javoblar yuklanmadi. Keyinroq qayta urinib ko'ring.");
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
        { name: "Savol-javob", path: "/savollar-javob" },
      ]),
    []
  );

  const faqSchema = useMemo(
    () =>
      buildFaqPageSchema(
        items.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))
      ),
    [items]
  );

  const webPageSchema = useMemo(
    () =>
      buildWebPageSchema({
        title: PAGE_META.faqList.title,
        description: PAGE_META.faqList.description,
        path: "/savollar-javob",
      }),
    []
  );

  const seoReady = !loading;

  return (
    <MainLayout>
      <JsonLd
        id="faq-list-json-ld"
        schemas={[breadcrumbSchema, faqSchema, webPageSchema].filter(Boolean)}
      />

      <section className="section-padding" data-seo-ready={seoReady ? "true" : undefined}>
        <div className="container-shell max-w-4xl">
          <span className="eyebrow">Savol-javob</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Ko&apos;p so&apos;raladigan savollar
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Platformadan foydalanish, sharhlar, chat va xavfsizlik haqida javoblar. Bu sahifa chatdan
            alohida va qidiruv tizimlari uchun indekslanadi.
          </p>

          {loading ? (
            <BlogListSkeleton className="mt-10" />
          ) : error ? (
            <EmptyState title="Xatolik" description={error} className="mt-10" />
          ) : items.length === 0 ? (
            <EmptyState
              title="Savollar hozircha yo'q"
              description="Tez orada bu yerda FAQ paydo bo'ladi."
              className="mt-10"
            />
          ) : (
            <div className="mt-10 space-y-3">
              {items.map((item) => {
                const isOpen = openSlug === item.slug;
                return (
                  <article
                    key={item.slug}
                    id={item.slug}
                    className={`faq-item ${isOpen ? "faq-item--open" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenSlug(isOpen ? "" : item.slug)}
                      className="faq-trigger w-full"
                      aria-expanded={isOpen}
                    >
                      <span className="text-left text-base font-black text-slate-950 dark:text-white sm:text-lg">
                        {item.question}
                      </span>
                      <span className={`faq-toggle ${isOpen ? "faq-toggle--open" : ""}`} aria-hidden="true">
                        <svg viewBox="0 0 24 24" className="faq-toggle-icon" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </button>
                    <div className={`faq-panel ${isOpen ? "faq-panel--open" : ""}`} aria-hidden={!isOpen}>
                      <div className="faq-panel-inner">
                        <div className="faq-panel-content">
                          <p>{item.answer}</p>
                          <Link
                            to={`/savollar-javob/${item.slug}`}
                            className="mt-3 inline-flex text-sm font-black text-primary hover:underline"
                          >
                            Alohida sahifa →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-12 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-6 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">Yana savol bormi?</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Kabinet ichidagi yordamchi chat-bot yoki{" "}
              <a href="mailto:hello@myuni.uz" className="font-black text-primary hover:underline">
                hello@myuni.uz
              </a>{" "}
              orqali biz bilan bog&apos;laning.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
