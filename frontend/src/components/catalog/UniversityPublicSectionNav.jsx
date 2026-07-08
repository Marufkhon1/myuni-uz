import { Link, useNavigate } from "react-router-dom";
import { buildDashboardSectionPath } from "@/utils/navigation.js";
import {
  UNIVERSITY_PUBLIC_REVIEWS_HASH,
  buildUniversityPublicSectionUrl,
} from "@/utils/universityPublicHash.js";
import { UNIVERSITY_PUBLIC_SECTIONS } from "@/utils/universityPublicSections.js";

function formatRating(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }
  return Number(value).toFixed(1);
}

function SectionTabLink({ active, href, onNavigate, children }) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={(event) => {
        event.preventDefault();
        onNavigate();
      }}
      className={`rounded-xl px-3.5 py-2 text-xs font-black transition ${
        active
          ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </a>
  );
}

function ExternalAction({ to, children, variant = "outline" }) {
  const className =
    variant === "primary"
      ? "rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-black text-primary transition hover:bg-primary/10"
      : "rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-black text-slate-700 transition hover:border-primary/25 hover:text-primary dark:border-white/15 dark:text-slate-200";

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

export default function UniversityPublicSectionNav({
  detail,
  activeSection,
  onSectionChange,
  isAuthenticated,
  role,
  onWriteReview,
}) {
  const navigate = useNavigate();

  if (!detail) {
    return null;
  }

  const pathname = `/universitet/${detail.slug || ""}`;
  const search = typeof window !== "undefined" ? window.location.search : "";
  const overviewHref = buildUniversityPublicSectionUrl(
    pathname,
    search,
    UNIVERSITY_PUBLIC_SECTIONS.overview
  );
  const reviewsHref = buildUniversityPublicSectionUrl(
    pathname,
    search,
    UNIVERSITY_PUBLIC_SECTIONS.reviews
  );

  const comparePath = role
    ? `${buildDashboardSectionPath(role, "compare")}?compare_ids=${detail.id}`
    : `/login?next=${encodeURIComponent(`/dashboard?section=compare&compare_ids=${detail.id}`)}`;

  const chatPath = isAuthenticated
    ? buildDashboardSectionPath(role || "applicant", "chats", { universityId: detail.id })
    : `/login?next=${encodeURIComponent(
        `/dashboard?section=chats&university_id=${detail.id}`
      )}`;

  const dashboardReviewsPath = buildDashboardSectionPath(role || "applicant", "reviews", {
    universityId: detail.id,
  });

  function handleChatClick(event) {
    event.preventDefault();
    navigate(chatPath);
  }

  return (
    <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/90">
      <div className="flex flex-col gap-3 px-5 py-3 sm:px-6 lg:flex-row lg:items-center">
        <nav className="flex flex-wrap items-center gap-2" aria-label="Universitet bo'limlari">
          <span className="mr-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
            Bo&apos;lim
          </span>
          <SectionTabLink
            active={activeSection === UNIVERSITY_PUBLIC_SECTIONS.overview}
            href={overviewHref || "#overview"}
            onNavigate={() => onSectionChange(UNIVERSITY_PUBLIC_SECTIONS.overview)}
          >
            Umumiy ma&apos;lumot
          </SectionTabLink>
          <SectionTabLink
            active={activeSection === UNIVERSITY_PUBLIC_SECTIONS.reviews}
            href={reviewsHref.includes(UNIVERSITY_PUBLIC_REVIEWS_HASH) ? reviewsHref : "#reviews"}
            onNavigate={() => onSectionChange(UNIVERSITY_PUBLIC_SECTIONS.reviews)}
          >
            Sharhlarni ko&apos;rish
          </SectionTabLink>
          {isAuthenticated ? (
            <>
              <a
                href={chatPath}
                onClick={handleChatClick}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-black text-slate-700 transition hover:border-primary/25 hover:text-primary dark:border-white/15 dark:text-slate-200"
              >
                Chatga kirish
              </a>
              <ExternalAction to={comparePath} variant="primary">
                Taqqoslash
              </ExternalAction>
            </>
          ) : (
            <button
              type="button"
              onClick={onWriteReview}
              className="rounded-xl bg-premium-gradient px-3.5 py-2 text-xs font-black text-white shadow-glow"
            >
              Sharh yozish
            </button>
          )}
        </nav>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {isAuthenticated && activeSection === UNIVERSITY_PUBLIC_SECTIONS.reviews && (
            <Link
              to={dashboardReviewsPath}
              className="text-xs font-bold text-primary transition hover:text-primary/80"
            >
              Kabinetda to&apos;liq ko&apos;rish →
            </Link>
          )}
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Ishonchli reyting:{" "}
            {formatRating(detail.display_rating ?? detail.bayesian_rating ?? detail.average_rating)}
            {detail.rating_confidence === "low" && " · kam sharh"}
          </span>
          <Link
            to="/metodologiya"
            className="text-[11px] font-bold text-slate-400 underline-offset-2 hover:text-primary hover:underline"
          >
            Metodologiya
          </Link>
        </div>
      </div>
    </div>
  );
}
