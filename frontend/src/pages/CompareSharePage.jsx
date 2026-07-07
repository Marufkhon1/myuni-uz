import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CompareShareLayout from "@/layouts/CompareShareLayout.jsx";
import CompareResults from "@/components/dashboard/compare/CompareResults.jsx";
import { getPublicCompareByIds, getPublicCompareShare } from "@/services/publicService.js";
import { PUBLIC_COMPARE_CONTENT } from "@/utils/compareRoleContent.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";

function formatExpiry(isoString) {
  if (!isoString) {
    return "";
  }
  try {
    return new Intl.DateTimeFormat("uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

function parseIdsParam(raw) {
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function StatusCard({ icon, title, description }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-white px-6 py-10 text-center shadow-xl ring-1 ring-slate-200/80 dark:bg-[#0b1220] dark:ring-white/10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-2xl dark:bg-white/[0.06]">
        {icon}
      </div>
      <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

export default function CompareSharePage() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const idsParam = searchParams.get("ids");
  const compareIds = useMemo(() => parseIdsParam(idsParam), [idsParam]);
  const [state, setState] = useState({ status: "loading" });

  const pagePath = token
    ? `/taqqoslash/${token}`
    : compareIds.length
      ? `/taqqoslash?ids=${compareIds.join(",")}`
      : "/taqqoslash";

  usePageMeta({
    title: "Universitetlar taqqoslashi — MyUni.uz",
    description: "3 ta OTM ni yonma-yon solishtiring — sharhlar, reyting va qabul ma'lumotlari.",
    path: pagePath,
    robots: token ? "noindex, nofollow" : "index, follow",
  });

  const loadCompare = useCallback(async () => {
    setState({ status: "loading" });
    try {
      if (token) {
        const data = await getPublicCompareShare(token);
        setState({ status: "ready", data, mode: "share" });
        return;
      }
      if (compareIds.length === 3) {
        const data = await getPublicCompareByIds(compareIds);
        setState({ status: "ready", data, mode: "ids" });
        return;
      }
      setState({ status: "error" });
    } catch (error) {
      const statusCode = error?.response?.status;
      if (statusCode === 410) {
        setState({ status: "expired" });
        return;
      }
      setState({ status: "error" });
    }
  }, [token, compareIds]);

  useEffect(() => {
    loadCompare();
  }, [loadCompare]);

  const selectedIds = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }
    return (state.data?.universities ?? []).map((university) => String(university.id));
  }, [state]);

  const universityNames = useMemo(() => {
    if (state.status !== "ready") {
      return "";
    }
    return (state.data?.universities ?? [])
      .map((university) => university.short_name || university.name)
      .join(" · ");
  }, [state]);

  return (
    <CompareShareLayout>
      <div className="relative overflow-hidden pb-8 pt-6 sm:pt-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.12),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.16),transparent_65%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
          {state.status === "ready" && (
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  {PUBLIC_COMPARE_CONTENT.eyebrow}
                </p>
                <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
                  {universityNames || PUBLIC_COMPARE_CONTENT.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                  {PUBLIC_COMPARE_CONTENT.subtitle}
                </p>
              </div>

              {state.mode === "share" && state.data?.expires_at && (
                <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-slate-200/70 backdrop-blur dark:bg-white/[0.04] dark:ring-white/10 sm:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Amal qilish muddati
                  </p>
                  <p className="mt-0.5 text-sm font-black text-slate-800 dark:text-white">
                    {formatExpiry(state.data.expires_at)} gacha
                  </p>
                </div>
              )}
            </div>
          )}

          {state.status === "loading" && (
            <div className="rounded-3xl bg-white/70 px-6 py-16 text-center ring-1 ring-slate-200/70 dark:bg-white/[0.03] dark:ring-white/10">
              <p className="text-sm font-semibold text-slate-500">Taqqoslash yuklanmoqda...</p>
            </div>
          )}

          {state.status === "expired" && (
            <StatusCard
              icon="⏳"
              title="Havola muddati tugagan"
              description="Ushbu taqqoslash havolasi faqat 2 kun amal qiladi. Yangi taqqoslash yaratish uchun MyUni.uz ga qo'shiling."
            />
          )}

          {state.status === "error" && (
            <StatusCard
              icon="!"
              title="Taqqoslash topilmadi"
              description={
                compareIds.length > 0 && compareIds.length !== 3
                  ? "Taqqoslash uchun aniq 3 ta universitet ID kerak (?ids=1,2,3)."
                  : "Havola noto'g'ri yoki muddati tugagan bo'lishi mumkin."
              }
            />
          )}

          {state.status === "ready" && (
            <div className="rounded-3xl bg-white/90 p-4 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/80 backdrop-blur dark:bg-[#0b1220]/90 dark:ring-white/10 sm:p-6">
              <CompareResults
                data={state.data}
                selectedIds={selectedIds}
                content={PUBLIC_COMPARE_CONTENT}
                readOnly
              />
            </div>
          )}
        </div>
      </div>
    </CompareShareLayout>
  );
}
