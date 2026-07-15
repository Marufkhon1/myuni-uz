import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import CatalogPagination from "@/components/catalog/CatalogPagination.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import ReviewCard from "@/components/dashboard/ReviewCard.jsx";
import ReviewAspectRatings from "@/components/reviews/ReviewAspectRatings.jsx";
import ReviewInsightSummary from "@/components/reviews/ReviewInsightSummary.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { buildUniversitySiloPath } from "@/config/universitySilos.js";
import { buildCanonicalUrl } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { getPublicUniversityReviews } from "@/services/publicService.js";
import { getUniversityOgImagePath } from "@/utils/universityImage.js";
import { buildReviewSchemas } from "@/utils/structuredData.js";

const REVIEWS_PAGE_SIZE = 20;

export default function UniversityReviewsPage() {
  const { detail, slug, handleWriteReviewClick } = useOutletContext();
  const [searchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const [pageData, setPageData] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (!slug) {
      return undefined;
    }
    let cancelled = false;
    setLoadingReviews(true);
    getPublicUniversityReviews(slug, { page, page_size: REVIEWS_PAGE_SIZE })
      .then((data) => {
        if (!cancelled) {
          setPageData(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPageData({ count: 0, results: [], page, page_size: REVIEWS_PAGE_SIZE });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingReviews(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, page]);

  const reviews = pageData?.results || [];
  const totalCount = pageData?.count ?? detail?.review_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageData?.page_size || REVIEWS_PAGE_SIZE)));
  const siloPath = slug ? buildUniversitySiloPath(slug, "reviews") : undefined;
  const pathWithPage = page > 1 ? `${siloPath}?page=${page}` : siloPath;
  const isEmpty = !loadingReviews && totalCount === 0;

  usePageMeta({
    title: detail ? `${detail.name} sharhlari | MyUni.uz` : "Sharhlar | MyUni.uz",
    description: detail
      ? `${detail.name} haqida ${totalCount} ta tasdiqlangan talaba sharhi, mezonlar va soft reyting.`
      : "Talabalar sharhlari.",
    path: pathWithPage,
    image: detail ? getUniversityOgImagePath(detail) : undefined,
    imageAlt: detail ? `${detail.name} sharhlari` : undefined,
    robots: isEmpty ? "noindex, follow" : "index, follow",
    prevUrl: page > 1 ? buildCanonicalUrl(page === 2 ? siloPath : `${siloPath}?page=${page - 1}`) : "",
    nextUrl: page < totalPages ? buildCanonicalUrl(`${siloPath}?page=${page + 1}`) : "",
  });

  const reviewSchemas = useMemo(
    () =>
      buildReviewSchemas({
        reviews,
        universityName: detail?.name,
        slug,
      }),
    [detail?.name, reviews, slug]
  );

  if (!detail) {
    return null;
  }

  return (
    <div>
      <JsonLd id="university-reviews-json-ld" schemas={reviewSchemas.filter(Boolean)} />
      <section id="reviews" aria-labelledby="university-reviews-heading">
        {(detail.review_insight_summary || detail.aspect_averages?.review_count > 0) && (
          <div className="space-y-4 border-b border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6">
            {detail.review_insight_summary ? (
              <ReviewInsightSummary
                summary={detail.review_insight_summary}
                reviewCount={detail.aspect_averages?.review_count ?? detail.review_count}
              />
            ) : null}
            {detail.aspect_averages?.review_count > 0 ? (
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-primary">
                  Mezon bo&apos;yicha o&apos;rtacha
                </p>
                <ReviewAspectRatings averages={detail.aspect_averages} />
              </div>
            ) : null}
          </div>
        )}

        <div className="px-5 py-6 sm:px-6">
          <h1
            id="university-reviews-heading"
            className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl"
          >
            Talabalar sharhlari
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Moderatsiyadan o&apos;tgan sharhlar. «Kampus ovozi» — chat a&apos;zoligi signali.{" "}
            <Link to="/metodologiya" className="font-bold text-primary hover:underline">
              Metodologiya
            </Link>
          </p>

          {loadingReviews ? (
            <p className="mt-5 text-sm text-slate-500">Sharhlar yuklanmoqda…</p>
          ) : null}

          {!loadingReviews && reviews.length > 0 ? (
            <ul className="mt-5 space-y-4">
              {reviews.map((item) => (
                <li key={item.id}>
                  <ReviewCard item={item} hideLike showHelpfulCount showStudentVoiceBadge />
                </li>
              ))}
            </ul>
          ) : null}

          {!loadingReviews && reviews.length === 0 ? (
            <EmptyState
              variant="reviews"
              title="Hali sharh yo'q"
              description="Birinchi sharhingizni qoldiring — abituriyentlar tanlov qilishda foydalanadi."
              action={{
                label: "Birinchi sharhingizni yozing",
                onClick: handleWriteReviewClick,
              }}
              className="mt-5"
            />
          ) : null}

          <CatalogPagination
            page={page}
            totalPages={totalPages}
            buildPageHref={(nextPage) =>
              nextPage > 1 ? `${siloPath}?page=${nextPage}` : siloPath
            }
            className="!mt-8"
          />

          {!loadingReviews && reviews.length > 0 ? (
            <div className="mt-8">
              <button
                type="button"
                onClick={handleWriteReviewClick}
                className="w-full rounded-2xl bg-premium-gradient px-6 py-3.5 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5 sm:w-auto"
              >
                Sharh yozish
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
