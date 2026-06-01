import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UniversityPublicAdmission from "../components/catalog/UniversityPublicAdmission.jsx";
import UniversityPublicContact from "../components/catalog/UniversityPublicContact.jsx";
import UniversityPublicFaculties from "../components/catalog/UniversityPublicFaculties.jsx";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import JsonLd from "../components/seo/JsonLd.jsx";
import { PublicBackHomeButton } from "../components/PublicPageButtons.jsx";
import ReviewAuthPromptModal from "../components/ReviewAuthPromptModal.jsx";
import ReviewCard from "../components/dashboard/ReviewCard.jsx";
import ReviewAspectRatings from "../components/reviews/ReviewAspectRatings.jsx";
import ReviewInsightSummary from "../components/reviews/ReviewInsightSummary.jsx";
import UniversityCampusBanner from "../components/UniversityCampusBanner.jsx";
import UniversityRatingStars from "../components/dashboard/UniversityRatingStars.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { UniversityPublicPageSkeleton } from "../components/skeletons/PublicPageSkeletons.jsx";
import { getUniversityOgImagePath } from "../utils/universityImage.js";
import {
  buildBreadcrumbSchema,
  buildReviewSchemas,
  buildUniversitySchema,
} from "../utils/structuredData.js";
import {
  buildDashboardReviewsUniversityNext,
  buildDashboardReviewsUniversityPath,
} from "../utils/navigation.js";
import { mainContentProps } from "../utils/mainContent.js";
import { useAuth } from "../hooks/useAuth.js";
import { useDarkMode } from "../hooks/useDarkMode.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { getPublicUniversityBySlug } from "../services/publicService.js";

export default function UniversityPublicPage() {
  const { slug } = useParams();

  const navigate = useNavigate();

  const { isAuthenticated, isLoading: isAuthLoading, role } = useAuth();

  const { isDark, setIsDark } = useDarkMode();

  const [detail, setDetail] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  const [showReviewAuthModal, setShowReviewAuthModal] = useState(false);



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



  useEffect(() => {

    if (isAuthLoading || !isAuthenticated || !detail?.id) {

      return;

    }

    navigate(

      buildDashboardReviewsUniversityPath({

        role: role || "applicant",

        university: detail,

      }),

      { replace: true }

    );

  }, [isAuthLoading, isAuthenticated, role, detail, navigate]);



  const metaTitle = detail
    ? `${detail.name} — sharhlar va reyting | MyUni.uz`
    : "Universitet | MyUni.uz";
  const metaDescription = detail
    ? `${detail.name} (${detail.location}): ${detail.review_count ?? 0} ta talaba sharhi, o'rtacha baho ${
        detail.average_rating ?? "—"
      }. MyUni.uz da o'qing.`
    : "O'zbekiston universitetlari haqida talabalar sharhlari.";
  const metaImage = detail ? getUniversityOgImagePath(detail) : undefined;
  const metaImageAlt = detail
    ? `${detail.name} — MyUni.uz universitet sahifasi`
    : undefined;

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

  const showPublicContent = isGuest && !loading && detail;

  const showRedirecting = isAuthenticated && !isAuthLoading && !error;



  const reviewsNextPath = detail

    ? buildDashboardReviewsUniversityNext(detail)

    : "/dashboard?section=reviews";

  const signupTo = `/signup?next=${encodeURIComponent(reviewsNextPath)}`;

  const loginTo = `/login?next=${encodeURIComponent(reviewsNextPath)}`;



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
      <div className="min-h-screen bg-[#f5f7fb] text-slate-950 transition-colors dark:bg-slateNight dark:text-white" data-seo-ready={seoReady ? "true" : undefined}>

      <Navbar
        isDark={isDark}
        onToggleTheme={() => setIsDark((value) => !value)}
        loginTo={isGuest ? loginTo : undefined}
        signupTo={isGuest ? signupTo : undefined}
      />

      <main {...mainContentProps} className="container-shell pb-12 pt-24 sm:pt-28 lg:pt-32">
        {isGuest && !showRedirecting && (
          <div className="mb-5 w-fit">
            <PublicBackHomeButton />
          </div>
        )}



        {(isAuthLoading || loading) && !error && <UniversityPublicPageSkeleton />}



        {showRedirecting && !loading && (

          <p className="mt-10 text-center font-black text-primary">Kabinetga yo&apos;naltirilmoqda...</p>

        )}



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

              <UniversityCampusBanner university={detail} className="h-40 sm:h-48" />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">

                <h1 className="text-2xl font-black text-white sm:text-3xl">{detail.name}</h1>

                <p className="mt-1 text-sm font-semibold text-slate-200">{detail.location}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">

                  <UniversityRatingStars rating={detail.average_rating} />

                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-black text-white">

                    {detail.review_count ?? 0} ta sharh

                  </span>

                </div>

              </div>

            </div>



            {detail.summary && (
              <p className="border-b border-slate-100 px-5 py-4 text-sm leading-7 text-slate-600 dark:border-white/10 dark:text-slate-300 sm:px-6">
                {detail.summary}
              </p>
            )}

            <UniversityPublicContact detail={detail} />
            <UniversityPublicFaculties faculties={detail.faculties} />
            <UniversityPublicAdmission cycles={detail.admission_cycles} />

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

              <p className="text-xs font-black uppercase tracking-wide text-primary">Talabalar sharhlari</p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                Barcha sharhlar talabalar tomonidan yozilgan — abituriyentlar o&apos;qishi mumkin.

              </p>



              {detail.reviews?.length > 0 ? (

                <ul className="mt-5 space-y-4">

                  {detail.reviews.map((item) => (

                    <li key={item.id}>

                      <ReviewCard

                        item={item}

                        hideLike
                        showHelpfulCount

                        showStudentVoiceBadge

                      />

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


