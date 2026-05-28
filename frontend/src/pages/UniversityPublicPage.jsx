import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Footer from "../components/Footer.jsx";

import Navbar from "../components/Navbar.jsx";
import { PublicBackHomeButton } from "../components/PublicPageButtons.jsx";

import ReviewAuthPromptModal from "../components/ReviewAuthPromptModal.jsx";

import ReviewCard from "../components/dashboard/ReviewCard.jsx";

import UniversityCampusBanner from "../components/UniversityCampusBanner.jsx";

import UniversityRatingStars from "../components/dashboard/UniversityRatingStars.jsx";

import { useAuth } from "../hooks/useAuth.js";

import { useDarkMode } from "../hooks/useDarkMode.js";

import { usePageMeta } from "../hooks/usePageMeta.js";

import { getPublicUniversityBySlug } from "../services/publicService.js";

import {

  buildDashboardReviewsUniversityNext,

  buildDashboardReviewsUniversityPath,

} from "../utils/navigation.js";



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



  usePageMeta({ title: metaTitle, description: metaDescription });



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

    <div className="min-h-screen bg-[#f5f7fb] text-slate-950 transition-colors dark:bg-slateNight dark:text-white">

      <Navbar
        isDark={isDark}
        onToggleTheme={() => setIsDark((value) => !value)}
        loginTo={isGuest ? loginTo : undefined}
        signupTo={isGuest ? signupTo : undefined}
      />

      <main className="container-shell pb-12 pt-28 sm:pt-32">
        {isGuest && !showRedirecting && (
          <div className="mb-5 w-fit">
            <PublicBackHomeButton />
          </div>
        )}



        {(isAuthLoading || loading) && !error && (

          <p className="mt-10 text-center font-black text-primary">Yuklanmoqda...</p>

        )}



        {showRedirecting && !loading && (

          <p className="mt-10 text-center font-black text-primary">Kabinetga yo&apos;naltirilmoqda...</p>

        )}



        {error && (

          <p className="mt-10 text-center font-semibold text-red-600">{error}</p>

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

                        onLike={() => {}}

                        likeLabel="Like"

                        showStudentVoiceBadge

                      />

                    </li>

                  ))}

                </ul>

              ) : (

                <div className="mt-5 rounded-xl bg-slate-50 px-4 py-8 text-center dark:bg-white/5">

                  <p className="font-black text-slate-800 dark:text-white">Hali sharh yo&apos;q</p>

                  <p className="mt-1 text-sm text-slate-500">

                    Birinchi sharhni talaba sifatida qoldiring.

                  </p>

                </div>

              )}



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

  );

}


