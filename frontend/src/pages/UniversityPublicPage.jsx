import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { rankingsYearPath } from "@/config/rankings.js";
import { resolveSiloFromHash, buildUniversitySiloPath, siloFromPathname, UNIVERSITY_SILOS } from "@/config/universitySilos.js";
import RelatedUniversities from "@/components/university/RelatedUniversities.jsx";
import UniversitySiloNav from "@/components/university/UniversitySiloNav.jsx";
import TrustStrip from "@/components/trust/TrustStrip.jsx";
import UniversityPublicContact, {
  UniversityMapEmbed,
} from "@/components/catalog/UniversityPublicContact.jsx";
import Footer from "@/components/Footer.jsx";
import Navbar from "@/components/Navbar.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import { PublicBackHomeButton } from "@/components/PublicPageButtons.jsx";
import ReviewAuthPromptModal from "@/components/ReviewAuthPromptModal.jsx";
import UniversityCampusBanner from "@/components/UniversityCampusBanner.jsx";
import UniversityRatingStars from "@/components/dashboard/UniversityRatingStars.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { UniversityPublicPageSkeleton } from "@/components/skeletons/PublicPageSkeletons.jsx";
import { getUniversityOgImagePath } from "@/utils/universityImage.js";
import { formatOwnershipLabel } from "@/utils/universityCatalog.js";
import { resolveUniversityLocationDisplay } from "@/utils/universityLocation.js";
import {
  buildBreadcrumbSchema,
  buildUniversitySchema,
} from "@/utils/structuredData.js";
import {
  buildDashboardReviewsUniversityNext,
  buildDashboardReviewsUniversityPath,
  buildUniversityPublicPath,
} from "@/utils/navigation.js";
import { mainContentProps } from "@/utils/mainContent.js";
import { useAuth } from "@/hooks/useAuth.js";
import { useDarkMode } from "@/hooks/useDarkMode.js";
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
      {title ? (
        <p className="text-[11px] font-black uppercase tracking-wide text-primary">{title}</p>
      ) : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </div>
  );
}

/**
 * Universitet silo layout — hero + sticky nav + Outlet (child silo body).
 * Legacy #reviews / #programs / #admission → child path redirect.
 */
export default function UniversityPublicPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading, role } = useAuth();
  const { isDark, setIsDark } = useDarkMode();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showReviewAuthModal, setShowReviewAuthModal] = useState(false);

  useEffect(() => {
    const rawHash = location.hash;
    if (!rawHash || rawHash === "#") {
      return;
    }
    const silo = resolveSiloFromHash(rawHash);
    if (silo.path) {
      navigate(buildUniversitySiloPath(slug, silo.id), { replace: true });
      return;
    }
    const keyed = String(rawHash).trim().toLowerCase();
    const normalized = keyed.startsWith("#") ? keyed : `#${keyed}`;
    if (UNIVERSITY_SILOS.overview.hashAliases.includes(normalized)) {
      navigate({ pathname: location.pathname, search: location.search }, { replace: true });
    }
  }, [location.hash, location.pathname, location.search, navigate, slug]);

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

  const activeSilo = siloFromPathname(location.pathname);

  const universitySchema = useMemo(() => {
    if (!detail || activeSilo.id !== "overview") {
      return null;
    }
    return buildUniversitySchema({
      detail,
      slug,
      imagePath: getUniversityOgImagePath(detail),
    });
  }, [activeSilo.id, detail, slug]);

  const breadcrumbSchema = useMemo(() => {
    if (!detail || !slug) {
      return null;
    }
    const items = [
      { name: "Bosh sahifa", path: "/" },
      { name: "Universitetlar", path: "/universitetlar" },
      { name: detail.name, path: buildUniversityPublicPath(slug) },
    ];
    if (activeSilo.path) {
      items.push({
        name: activeSilo.label,
        path: buildUniversitySiloPath(slug, activeSilo.id),
      });
    }
    return buildBreadcrumbSchema(items);
  }, [activeSilo.id, activeSilo.label, activeSilo.path, detail, slug]);

  const visibleBreadcrumbs = useMemo(() => {
    if (!detail || !slug) {
      return [];
    }
    const items = [
      { name: "Bosh sahifa", path: "/" },
      { name: "Universitetlar", path: "/universitetlar" },
      { name: detail.short_name || detail.name, path: buildUniversityPublicPath(slug) },
    ];
    if (activeSilo.path) {
      items.push({
        name: activeSilo.label,
        path: buildUniversitySiloPath(slug, activeSilo.id),
      });
    }
    return items;
  }, [activeSilo.id, activeSilo.label, activeSilo.path, detail, slug]);
  const seoReady = !loading && (Boolean(detail) || Boolean(error));
  const isGuest = !isAuthLoading && !isAuthenticated;
  const showPublicContent = !loading && detail;
  const reviewsNextPath = detail
    ? buildDashboardReviewsUniversityNext(detail)
    : "/dashboard?section=reviews";
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

  const outletContext = {
    detail,
    slug,
    loading,
    error,
    isAuthenticated,
    isAuthLoading,
    role,
    handleWriteReviewClick,
    signupTo,
    loginTo,
  };

  return (
    <>
      <JsonLd
        id="university-layout-json-ld"
        schemas={[universitySchema, breadcrumbSchema].filter(Boolean)}
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
          {!isAuthenticated && !isAuthLoading ? (
            <div className="mb-5 w-fit">
              <PublicBackHomeButton />
            </div>
          ) : null}

          {(isAuthLoading || loading) && !error ? <UniversityPublicPageSkeleton /> : null}

          {error ? (
            <EmptyState
              variant="university"
              title="Universitet topilmadi"
              description="Bunday slug bilan ochiq sahifa mavjud emas yoki havola eskirgan."
              action={{ label: "Bosh sahifaga", to: "/" }}
              className="mt-10"
            />
          ) : null}

          {showPublicContent && detail ? (
            <article className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
              <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                <PageBreadcrumbs items={visibleBreadcrumbs} />
              </div>

              <div className="relative">
                <UniversityCampusBanner university={detail} className="h-44 sm:h-56 lg:h-64" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    {ownershipLabel ? (
                      <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-sm">
                        {ownershipLabel}
                      </span>
                    ) : null}
                    {detail.institution_type ? (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-100 backdrop-blur-sm">
                        {detail.institution_type}
                      </span>
                    ) : null}
                    {detail.short_name && detail.short_name !== detail.name ? (
                      <span className="rounded-full bg-primary/90 px-3 py-1 text-[11px] font-black text-white">
                        {detail.short_name}
                      </span>
                    ) : null}
                  </div>
                  {activeSilo.path ? (
                    <p className="mt-3 max-w-4xl text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
                      {detail.name}
                    </p>
                  ) : (
                    <h1 className="mt-3 max-w-4xl text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
                      {detail.name}
                    </h1>
                  )}
                  <p className="mt-2 text-sm font-semibold text-slate-200 sm:text-base">
                    {detail.location}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <UniversityRatingStars
                      rating={detail.display_rating ?? detail.bayesian_rating ?? detail.average_rating}
                    />
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white">
                      {detail.review_count ?? 0} ta sharh
                    </span>
                    {detail.member_count > 0 ? (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-100">
                        {detail.member_count} chat a&apos;zosi
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-20 lg:top-28">
                <UniversitySiloNav
                  detail={detail}
                  isAuthenticated={isAuthenticated}
                  role={role}
                  onWriteReview={handleWriteReviewClick}
                />
              </div>

              <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                <div className="min-w-0">
                  <Outlet context={outletContext} />
                  <RelatedUniversities slug={slug} />
                </div>

                <aside className="space-y-4 border-t border-slate-100 p-5 dark:border-white/10 lg:sticky lg:top-28 lg:border-t-0 lg:border-l lg:p-6">
                  {websiteUrl ? (
                    <SidebarCard title="Tezkor havola">
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center rounded-xl bg-premium-gradient px-4 py-3 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5"
                      >
                        Rasmiy veb-sayt
                      </a>
                      {detail.phone ? (
                        <a
                          href={`tel:${detail.phone.replace(/\s/g, "")}`}
                          className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:border-primary/30 dark:border-white/10 dark:text-slate-200"
                        >
                          Qo&apos;ng&apos;iroq qilish
                        </a>
                      ) : null}
                    </SidebarCard>
                  ) : null}

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
                  </SidebarCard>

                  <SidebarCard title="Sharh qoldiring">
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Bu universitetda o&apos;qigan bo&apos;lsangiz, tajribangizni ulashing.
                    </p>
                    <button
                      type="button"
                      onClick={handleWriteReviewClick}
                      className="mt-4 w-full rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-black text-primary transition hover:bg-primary/10"
                    >
                      Sharh yozish
                    </button>
                  </SidebarCard>

                  <TrustStrip
                    updatedLabel="Sharh tasdiqlangach yangilanadi"
                    sources={[
                      { label: "Metodologiya", href: "/metodologiya" },
                      { label: "Soft reyting", href: rankingsYearPath() },
                    ]}
                    reportPath={location.pathname}
                  />
                </aside>
              </div>
            </article>
          ) : null}
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
