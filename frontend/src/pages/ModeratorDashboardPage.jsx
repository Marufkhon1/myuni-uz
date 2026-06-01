import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthCheckSkeleton } from "../components/skeletons/DashboardSkeletons.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useToast } from "../hooks/useToast.js";
import {
  getModeratorReports,
  updateMessageReport,
  updateReviewReport,
} from "../services/moderatorService.js";
import { getApiErrorMessage } from "../utils/apiErrors.js";
import { dashboardPathForRole } from "../utils/navigation.js";
import { mainContentProps } from "../utils/mainContent.js";
import logo from "../assets/myuni-logo.png";

const STATUS_OPTIONS = [
  { value: "", label: "Barcha holatlar" },
  { value: "pending", label: "Kutilmoqda" },
  { value: "in_review", label: "Ko'rib chiqilmoqda" },
  { value: "resolved", label: "Hal qilindi" },
  { value: "dismissed", label: "Rad etildi" },
];

const KIND_OPTIONS = [
  { value: "", label: "Barcha turlar" },
  { value: "message", label: "Xabar shikoyatlari" },
  { value: "review", label: "Sharh shikoyatlari" },
];

const UPDATE_STATUS_OPTIONS = STATUS_OPTIONS.filter((item) => item.value);

const STATUS_BADGE = {
  pending: "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200",
  in_review: "bg-blue-100 text-blue-900 dark:bg-blue-400/15 dark:text-blue-200",
  resolved: "bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-200",
  dismissed: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
};

function formatDate(value) {
  if (!value) {
    return "";
  }
  try {
    return new Intl.DateTimeFormat("uz-UZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function ReportCard({ report, onUpdated }) {
  const toast = useToast();
  const [status, setStatus] = useState(report.status);
  const [notes, setNotes] = useState(report.moderator_notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setStatus(report.status);
    setNotes(report.moderator_notes || "");
  }, [report]);

  async function handleSave() {
    setIsSaving(true);
    try {
      const payload = { status, moderator_notes: notes };
      const updated =
        report.kind === "review"
          ? await updateReviewReport(report.id, payload)
          : await updateMessageReport(report.id, payload);
      onUpdated(updated);
      toast.success("Shikoyat holati yangilandi.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Saqlab bo'lmadi."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">
              {report.kind === "review" ? "Sharh" : "Xabar"}
            </span>
            {report.university_name ? (
              <span className="text-xs font-bold text-primary">{report.university_name}</span>
            ) : null}
          </div>
          <p className="mt-1 font-black text-slate-950 dark:text-white">{report.reason_label}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {report.reporter_name} · {formatDate(report.created_at)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
            STATUS_BADGE[report.status] || STATUS_BADGE.pending
          }`}
        >
          {report.status_label}
        </span>
      </button>

      {(expanded || report.target_preview) && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-white/10">
          {report.target_preview ? (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-300">
              «{report.target_preview}»
            </p>
          ) : null}
          {report.details ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-bold">Izoh:</span> {report.details}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Holat</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold dark:border-white/15 dark:bg-slate-800"
              >
                {UPDATE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">
              Moderator izohi (ixtiyoriy)
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/15 dark:bg-slate-800"
              placeholder="Ichki izoh..."
            />
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-black text-white disabled:opacity-60"
          >
            {isSaving ? "Saqlanmoqda..." : "Holatni saqlash"}
          </button>
        </div>
      )}
    </article>
  );
}

export default function ModeratorDashboardPage() {
  usePageMeta({
    title: "Moderator paneli | MyUni.uz",
    description: "MyUni.uz shikoyatlar moderatsiya paneli.",
    path: "/moderator",
    robots: "noindex, nofollow",
  });

  const { user, isLoading, isAuthenticated } = useAuth();
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [kindFilter, setKindFilter] = useState("");

  const isModerator = Boolean(user?.profile?.is_moderator);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (kindFilter) {
        params.kind = kindFilter;
      }
      const data = await getModeratorReports(params);
      setReports(Array.isArray(data?.results) ? data.results : []);
      setPendingCount(Number(data?.pending_count) || 0);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Shikoyatlarni yuklab bo'lmadi."));
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [kindFilter, statusFilter, toast]);

  useEffect(() => {
    if (isAuthenticated && isModerator) {
      loadReports();
    }
  }, [isAuthenticated, isModerator, loadReports]);

  const dashboardPath = useMemo(
    () => dashboardPathForRole(user?.profile?.role),
    [user?.profile?.role]
  );

  if (isLoading) {
    return <AuthCheckSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?next=%2Fmoderator" replace />;
  }

  if (!isModerator) {
    return <Navigate to={dashboardPath} replace />;
  }

  function handleReportUpdated(updated) {
    setReports((current) =>
      current.map((item) =>
        item.id === updated.id && item.kind === updated.kind ? { ...item, ...updated } : item
      )
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-slateNight">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="container-shell flex h-16 items-center justify-between sm:h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="MyUni.uz" className="h-10 w-10 rounded-2xl object-cover" />
            <div>
              <p className="font-black text-slate-950 dark:text-white">Moderator paneli</p>
              <p className="text-xs font-semibold text-slate-500">
                {pendingCount > 0 ? `${pendingCount} ta ochiq shikoyat` : "Navbat bo'sh"}
              </p>
            </div>
          </Link>
          <Link
            to={dashboardPath}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black dark:border-white/15"
          >
            Kabinetga qaytish
          </Link>
        </div>
      </header>

      <main {...mainContentProps} className="container-shell py-8 sm:py-10">
        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold dark:border-white/15 dark:bg-slate-900"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all-status"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={kindFilter}
            onChange={(event) => setKindFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold dark:border-white/15 dark:bg-slate-900"
          >
            {KIND_OPTIONS.map((option) => (
              <option key={option.value || "all-kind"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadReports}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-slate-950"
          >
            Yangilash
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-[1.5rem] bg-slate-200 dark:bg-white/10"
              />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <p className="rounded-[1.5rem] border border-dashed border-slate-200 px-6 py-10 text-center text-sm font-semibold text-slate-500 dark:border-white/15">
            Tanlangan filtr bo&apos;yicha shikoyat topilmadi.
          </p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard
                key={`${report.kind}-${report.id}`}
                report={report}
                onUpdated={handleReportUpdated}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
