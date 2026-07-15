import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { buildUniversitySiloPath, UNIVERSITY_SILO_LIST } from "@/config/universitySilos.js";
import { buildDashboardSectionPath } from "@/utils/navigation.js";

function formatRating(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }
  return Number(value).toFixed(1);
}

function ExternalAction({ to, children, variant = "outline" }) {
  const className =
    variant === "primary"
      ? "rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-black text-primary transition hover:bg-primary/10"
      : "rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-black text-slate-700 transition hover:border-primary/25 hover:text-primary dark:border-white/15 dark:text-slate-200";

  return (
    <NavLink to={to} className={className}>
      {children}
    </NavLink>
  );
}

/**
 * Universitet silo nav — route Links (hash emas).
 */
export default function UniversitySiloNav({
  detail,
  isAuthenticated,
  role,
  onWriteReview,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!detail?.slug) {
    return null;
  }

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

  const onReviewsSilo = pathname.includes("/sharhlari");

  return (
    <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/90">
      <div className="flex flex-col gap-3 px-5 py-3 sm:px-6 lg:flex-row lg:items-center">
        <nav className="flex flex-wrap items-center gap-2" aria-label="Universitet bo'limlari">
          <span className="mr-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
            Bo&apos;lim
          </span>
          {UNIVERSITY_SILO_LIST.map((silo) => {
            const to = buildUniversitySiloPath(detail.slug, silo.id);
            if (silo.id === "faculties" && !(detail.faculties?.length > 0)) {
              return null;
            }
            if (silo.id === "admission" && !(detail.admission_cycles?.length > 0)) {
              return null;
            }
            return (
              <NavLink
                key={silo.id}
                to={to}
                end={silo.id === "overview"}
                className={({ isActive }) =>
                  `rounded-xl px-3.5 py-2 text-xs font-black transition ${
                    isActive
                      ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                  }`
                }
              >
                {silo.label}
              </NavLink>
            );
          })}
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => navigate(chatPath)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-black text-slate-700 transition hover:border-primary/25 hover:text-primary dark:border-white/15 dark:text-slate-200"
              >
                Chatga kirish
              </button>
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
          {isAuthenticated && onReviewsSilo ? (
            <NavLink
              to={dashboardReviewsPath}
              className="text-xs font-bold text-primary transition hover:text-primary/80"
            >
              Kabinetda to&apos;liq ko&apos;rish →
            </NavLink>
          ) : null}
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Soft ball:{" "}
            {formatRating(detail.display_rating ?? detail.bayesian_rating ?? detail.average_rating)}
            {detail.rating_confidence === "low" ? " · kam sharh" : ""}
          </span>
          <NavLink
            to="/metodologiya"
            className="text-[11px] font-bold text-slate-400 underline-offset-2 hover:text-primary hover:underline"
          >
            Metodologiya
          </NavLink>
        </div>
      </div>
    </div>
  );
}
