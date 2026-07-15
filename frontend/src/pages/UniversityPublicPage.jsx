import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UniversityPublicSectionNav from "@/components/catalog/UniversityPublicSectionNav.jsx";
import { useUniversityPublicSection } from "@/hooks/useUniversityPublicSection.js";
import UniversityPublicAdmission from "@/components/catalog/UniversityPublicAdmission.jsx";
import UniversityPublicContact, {
  UniversityMapEmbed,
} from "@/components/catalog/UniversityPublicContact.jsx";
import UniversityPublicFaculties from "@/components/catalog/UniversityPublicFaculties.jsx";
import UniversityPublicOverview from "@/components/catalog/UniversityPublicOverview.jsx";
import UniversityPublicSummary from "@/components/catalog/UniversityPublicSummary.jsx";
import Footer from "@/components/Footer.jsx";
import Navbar from "@/components/Navbar.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import { PublicBackHomeButton } from "@/components/PublicPageButtons.jsx";
import ReviewAuthPromptModal from "@/components/ReviewAuthPromptModal.jsx";
import ReviewCard from "@/components/dashboard/ReviewCard.jsx";
import ReviewAspectRatings from "@/components/reviews/ReviewAspectRatings.jsx";
import ReviewInsightSummary from "@/components/reviews/ReviewInsightSummary.jsx";
import UniversityCampusBanner from "@/components/UniversityCampusBanner.jsx";
import UniversityRatingStars from "@/components/dashboard/UniversityRatingStars.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { UniversityPublicPageSkeleton } from "@/components/skeletons/PublicPageSkeletons.jsx";
import { getUniversityOgImagePath } from "@/utils/universityImage.js";
import { formatOwnershipLabel } from "@/utils/universityCatalog.js";
import { resolveUniversityLocationDisplay } from "@/utils/universityLocation.js";
import {
  buildBreadcrumbSchema,
  buildReviewSchemas,
  buildUniversitySchema,
} from "@/utils/structuredData.js";
import {
  buildDashboardReviewsUniversityNext,
  buildDashboardReviewsUniversityPath,
} from "@/utils/navigation.js";
import { mainContentProps } from "@/utils/mainContent.js";
import { useAuth } from "@/hooks/useAuth.js";
import { useDarkMode } from "@/hooks/useDarkMode.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { getPublicUniversityBySlug } from "@/services/publicService.js";

function normalizeWebsiteUrl(value) {
  if (!value) {
    return null;
  }
  const trimmed = String(value).trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function SidebarCard({ title, children, className = "" }) {
  return (
    <div
      className={`rounded-[1.25rem] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] ${className}`}
    >
      {title && (
        <p className="text-[11px] font-black uppercase tracking-wide text-primary">{title}</p>
      )}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </div>
  );
}

export default function UniversityPublicPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading, role } = useAuth();
  const { isDark, setIsDark } = useDarkMode();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showReviewAuthModal, setShowReviewAuthModal] = useState(false);
  const { activeSection, handleSectionChange } = useUniversityPublicSection(slug);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getPublicUniversityBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setError("Universitet topilmadi.");
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

  const metaTitle = detail
    ? `${detail.name} — sharhlar va reyting | MyUni.uz`
    : "Universitet | MyUni.uz";
  const metaDescription = detail
    ? `${detail.name} (${detail.location}): ${detail.review_count ?? 0} ta talaba sharhi, o'rtacha baho ${
        detail.average_rating ?? "—"
      }. MyUni.uz da o'qing.`
    : "O'zbekiston universitetlari haqida talabalar sharhlari.";
  const metaImage = detail ? getUniversityOgImagePath(detail) : undefined;
  const metaImageAlt = detail ? `${detail.name} — MyUni.uz universitet sahifasi` : undefined;

  usePageMeta({
    title: metaTitle,
    description: metaDescription,
    path: slug ? `/universitet/${slug}` : undefined,
    image: metaImage,
    imageAlt: metaImageAlt,
    type: "website",
  });

  const universitySchema = useMemo(
    () =>
      buildUniversitySchema({
        detail,
        slug,
        imagePath: detail ? getUniversityOgImagePath(detail) : undefined,
      }),
    [detail, slug]
  );

  const breadcrumbSchema = useMemo(() => {
    if (!detail || !slug) {
      return null;
    }
    return buildBreadcrumbSchema([
      { name: "Bosh sahifa", path: "/" },
      { name: detail.name, path: `/universitet/${slug}` },
    ]);
  }, [detail, slug]);

  const reviewSchemas = useMemo(
    () =>
      buildReviewSchemas({
        reviews: detail?.reviews || [],
        universityName: detail?.name,
        slug,
      }),
    [detail, slug]
  );

  const seoReady = !loading && (Boolean(detail) || Boolean(error));
  const isGuest = !isAuthLoading && !isAuthenticated;
  const showPublicContent = !loading && detail;
  const reviewsNextPath = detail ? buildDashboardReviewsUniversityNext(detail) : "/dashboard?section=reviews";
  const signupTo = `/signup?next=${encodeURIComponent(reviewsNextPath)}`;
  const loginTo = `/login?next=${encodeURIComponent(reviewsNextPath)}`;
  const websiteUrl = normalizeWebsiteUrl(detail?.website);
  const ownershipLabel = formatOwnershipLabel(detail);
  const locationDisplay = useMemo(
    () => (detail ? resolveUniversityLocationDisplay(detail) : null),
    [detail]
  );

  function handleWriteReviewClick() {
    if (isAuthenticated) {
      navigate(
        buildDashboardReviewsUniversityPath({
          role: role || "applicant",
          university: detail,
        })
      );
      return;
    }
    setShowReviewAuthModal(true);
  }

  return (
    <>
      <JsonLd
        id="university-json-ld"
        schemas={[universitySchema, breadcrumbSchema, ...reviewSchemas].filter(Boolean)}
      />
      <div
        className="min-h-screen bg-[#f5f7fb] text-slate-950 transition-colors dark:bg-slateNight dark:text-white"
        data-seo-ready={seoReady ? "true" : undefined}
      >
        <Navbar
          isDark={isDark}
          onToggleTheme={() => setIsDark((value) => !value)}
          loginTo={isGuest ? loginTo : undefined}
          signupTo={isGuest ? signupTo : undefined}
        />

        <main {...mainContentProps} className="container-shell pb-12 pt-24 sm:pt-28 lg:pt-32">
          {!isAuthenticated && !isAuthLoading && (
            <div className="mb-5 w-fit">
              <PublicBackHomeButton />
            </div>
          )}

          {(isAuthLoading || loading) && !error && <UniversityPublicPageSkeleton />}

          {error && (
            <EmptyState
              variant="university"
              title="Universitet topilmadi"
              description="Bunday slug bilan ochiq sahifa mavjud emas yoki havola eskirgan."
              action={{ label: "Bosh sahifaga", to: "/" }}
              className="mt-10"
            />
          )}

          {showPublicContent && detail && (
            <article className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
              <div className="relative">
                <UniversityCampusBanner university={detail} className="h-44 sm:h-56 lg:h-64" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    {ownershipLabel && (
                      <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-sm">
                        {ownershipLabel}
                      </span>
                    )}
                    {detail.institution_type && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-100 backdrop-blur-sm">
                        {detail.institution_type}
                      </span>
                    )}
                    {detail.short_name && detail.short_name !== detail.name && (
                      <span className="rounded-full bg-primary/90 px-3 py-1 text-[11px] font-black text-white">
                        {detail.short_name}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-3 max-w-4xl text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
                    {detail.name}
                  </h1>
                  <p className="mt-2 text-sm font-semibold text-slate-200 sm:text-base">{detail.location}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <UniversityRatingStars
                      rating={detail.display_rating ?? detail.bayesian_rating ?? detail.average_rating}
                    />
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white">
                      {detail.review_count ?? 0} ta sharh
                    </span>
                    {detail.member_count > 0 && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-100">
                        {detail.member_count} chat a&apos;zosi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-20 lg:top-28">
                <UniversityPublicSectionNav
                  detail={detail}
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                  isAuthenticated={isAuthenticated}
                  role={role}
                  onWriteReview={handleWriteReviewClick}
                />
              </div>

              <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                <div className="min-w-0">
                  {/* Stacked sections — ikkala kontent ham har doim HTML da va ko'rinadi (crawler-friendly). */}
                  <div id="university-overview-panel">
                    <UniversityPublicOverview detail={detail} />
                    <UniversityPublicSummary summary={detail.summary} />
                    <UniversityPublicContact detail={detail} />
                    <UniversityPublicFaculties faculties={detail.faculties} />
                    <UniversityPublicAdmission cycles={detail.admission_cycles} />
                  </div>

                  <section id="reviews" aria-labelledby="university-reviews-heading">
                    {(detail.review_insight_summary || detail.aspect_averages?.review_count > 0) && (
                      <div className="space-y-4 border-b border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6">
                        {detail.review_insight_summary && (
                          <ReviewInsightSummary
                            summary={detail.review_insight_summary}
                            reviewCount={detail.aspect_averages?.review_count ?? detail.review_count}
                          />
                        )}
                        {detail.aspect_averages?.review_count > 0 && (
                          <div>
                            <p className="text-xs font-black uppercase tracking-wide text-primary">
                              Mezon bo&apos;yicha o&apos;rtacha
                            </p>
                            <ReviewAspectRatings averages={detail.aspect_averages} />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="px-5 py-6 sm:px-6">
                      <p
                        id="university-reviews-heading"
                        className="text-xs font-black uppercase tracking-wide text-primary"
                      >
                        Talabalar sharhlari
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Moderatsiyadan o&apos;tgan sharhlar. «Kampus ovozi» — chat a&apos;zoligi
                        signali, rasmiy OTM tasdiqi emas.{" "}
                        <Link to="/metodologiya" className="font-bold text-primary hover:underline">
                          Metodologiya
                        </Link>
                      </p>

                      {detail.reviews?.length > 0 ? (
                        <ul className="mt-5 space-y-4">
                          {detail.reviews.map((item) => (
                            <li key={item.id}>
                              <ReviewCard item={item} hideLike showHelpfulCount showStudentVoiceBadge />
                            </li>
                          ))}
                        </ul>
                      ) : (
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
                      )}

                      {(detail.reviews?.length ?? 0) > 0 && (
                        <div className="mt-8">
                          <button
                            type="button"
                            onClick={handleWriteReviewClick}
                            className="w-full rounded-2xl bg-premium-gradient px-6 py-3.5 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5 sm:w-auto"
                          >
                            Sharh yozish
                          </button>
                          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                            Sharh yozish uchun talaba hisobi kerak. Bosganda ro&apos;yxatdan o&apos;tish yoki kirish
                            taklif qilinadi.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <aside className="space-y-4 border-t border-slate-100 p-5 dark:border-white/10 lg:sticky lg:top-28 lg:border-t-0 lg:border-l lg:p-6">
                  {websiteUrl && (
                    <SidebarCard title="Tezkor havola">
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center rounded-xl bg-premium-gradient px-4 py-3 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5"
                      >
                        Rasmiy veb-sayt
                      </a>
                      {detail.phone && (
                        <a
                          href={`tel:${detail.phone.replace(/\s/g, "")}`}
                          className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:border-primary/30 dark:border-white/10 dark:text-slate-200"
                        >
                          Qo&apos;ng&apos;iroq qilish
                        </a>
                      )}
                    </SidebarCard>
                  )}

                  <SidebarCard title="Joylashuv">
                    {locationDisplay?.showMap ? (
                      <UniversityMapEmbed
                        latitude={locationDisplay.latitude}
                        longitude={locationDisplay.longitude}
                        name={detail.name}
                        showMarker={locationDisplay.showMarker}
                        honestyLabel={locationDisplay.honestyLabel}
                        cityLabel={locationDisplay.cityLabel}
                      />
                    ) : (
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {locationDisplay?.honestyLabel ||
                          "Aniq kampus koordinatasi yo'q — faqat matnli manzil."}
                      </p>
                    )}
                    {(locationDisplay?.addressLabel || locationDisplay?.cityLabel) && (
                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {locationDisplay.addressLabel || locationDisplay.cityLabel}
                      </p>
                    )}
                    {locationDisplay?.precision === "city" && locationDisplay.showMap ? (
                      <p className="mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                        Shahar darajasi — kampus deb o&apos;qimang.
                      </p>
                    ) : null}
                  </SidebarCard>

                  <SidebarCard title="Sharh qoldiring">
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Bu universitetda o&apos;qigan bo&apos;lsangiz, tajribangizni ulashing — abituriyentlar uchun
                      foydali bo&apos;ladi.
                    </p>
                    <button
                      type="button"
                      onClick={handleWriteReviewClick}
                      className="mt-4 w-full rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-black text-primary transition hover:bg-primary/10"
                    >
                      Sharh yozish
                    </button>
                  </SidebarCard>
                </aside>
              </div>
            </article>
          )}
        </main>

        <Footer />

        <ReviewAuthPromptModal
          open={showReviewAuthModal && isGuest}
          onClose={() => setShowReviewAuthModal(false)}
          signupTo={signupTo}
          loginTo={loginTo}
          universityName={detail?.short_name || detail?.name}
        />
      </div>
    </>
  );
}
