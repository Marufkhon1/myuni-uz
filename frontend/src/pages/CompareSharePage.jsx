import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import CompareShareLayout from "@/layouts/CompareShareLayout.jsx";
import CompareResults from "@/components/dashboard/compare/CompareResults.jsx";
import GuestCompareBuilder from "@/components/compare/GuestCompareBuilder.jsx";
import { getPublicCompareByIds, getPublicCompareShare } from "@/services/publicService.js";
import { PUBLIC_COMPARE_CONTENT } from "@/utils/compareRoleContent.js";
import { isValidCompareCount, MAX_COMPARE, MIN_COMPARE } from "@/utils/compareMath.js";
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
  const ids = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set(ids)].slice(0, MAX_COMPARE);
}

function StatusCard({ icon, title, description, action }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-white px-6 py-10 text-center shadow-xl ring-1 ring-slate-200/80 dark:bg-[#0b1220] dark:ring-white/10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-2xl dark:bg-white/[0.06]">
        {icon}
      </div>
      <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      {action}
    </div>
  );
}

export default function CompareSharePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idsParam = searchParams.get("ids");
  const compareIds = useMemo(() => parseIdsParam(idsParam), [idsParam]);
  const [state, setState] = useState({ status: "loading" });
  const [editing, setEditing] = useState(false);
  const [builderKey, setBuilderKey] = useState(0);
  const [seedIds, setSeedIds] = useState([]);

  const hasValidIds = isValidCompareCount(compareIds.length);
  const showBuilder = !token && (editing || !hasValidIds);

  const pagePath = token
    ? `/taqqoslash/${token}`
    : hasValidIds
      ? `/taqqoslash?ids=${compareIds.join(",")}`
      : "/taqqoslash";

  usePageMeta({
    title: "Universitetlar taqqoslashi — MyUni.uz",
    description: `${MIN_COMPARE}–${MAX_COMPARE} ta OTM ni yonma-yon solishtiring — sharhlar, reyting va qabul ma'lumotlari. Login shart emas.`,
    path: pagePath,
    robots: token ? "noindex, nofollow" : "index, follow",
  });

  const loadCompare = useCallback(async () => {
    if (editing || (!token && !hasValidIds)) {
      setState({ status: "idle" });
      return;
    }

    setState({ status: "loading" });
    try {
      if (token) {
        const data = await getPublicCompareShare(token);
        setState({ status: "ready", data, mode: "share" });
        return;
      }
      const data = await getPublicCompareByIds(compareIds);
      setState({ status: "ready", data, mode: "ids" });
    } catch (error) {
      const statusCode = error?.response?.status;
      if (statusCode === 410) {
        setState({ status: "expired" });
        return;
      }
      setState({ status: "error" });
    }
  }, [token, compareIds, hasValidIds, editing]);

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

  function openBuilder(nextSeedIds = []) {
    setSeedIds(nextSeedIds.map(String).slice(0, MAX_COMPARE));
    setEditing(true);
    setBuilderKey((value) => value + 1);
    setState({ status: "idle" });
    navigate("/taqqoslash", { replace: true });
  }

  return (
    <CompareShareLayout>
      <div className="relative overflow-hidden pb-8 pt-6 sm:pt-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.12),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.16),transparent_65%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
          {showBuilder && (
            <GuestCompareBuilder
              key={builderKey}
              initialIds={seedIds.length ? seedIds : compareIds}
              onCompare={() => setEditing(false)}
            />
          )}

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

              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
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
                <button
                  type="button"
                  onClick={() => openBuilder(selectedIds)}
                  className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:border-primary/30 hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                >
                  Boshqa OTM lar
                </button>
              </div>
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
              description="Ushbu taqqoslash havolasi faqat 2 kun amal qiladi. Yangi taqqoslash yaratish uchun MyUni.uz ga qo'shiling yoki pastdan qayta tanlang."
              action={
                <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                  <Link
                    to="/taqqoslash"
                    className="inline-flex rounded-full bg-gradient-to-r from-primary to-violet-600 px-5 py-2.5 text-xs font-black text-white"
                  >
                    Yangi taqqoslash
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex rounded-full border border-slate-200 px-5 py-2.5 text-xs font-black text-slate-700 dark:border-white/15 dark:text-slate-200"
                  >
                    Ro&apos;yxatdan o&apos;tish
                  </Link>
                </div>
              }
            />
          )}

          {state.status === "error" && (
            <StatusCard
              icon="!"
              title="Taqqoslash topilmadi"
              description={
                compareIds.length > 0 && !isValidCompareCount(compareIds.length)
                  ? `Taqqoslash uchun ${MIN_COMPARE}–${MAX_COMPARE} ta universitet ID kerak (?ids=1,2 yoki 1,2,3,4).`
                  : "Havola noto'g'ri yoki muddati tugagan bo'lishi mumkin."
              }
              action={
                <Link
                  to="/taqqoslash"
                  className="mt-5 inline-flex rounded-full bg-gradient-to-r from-primary to-violet-600 px-5 py-2.5 text-xs font-black text-white"
                >
                  Taqqoslashni boshlash
                </Link>
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
