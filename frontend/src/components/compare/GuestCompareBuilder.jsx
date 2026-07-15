import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UniversityAvatar from "@/components/UniversityAvatar.jsx";
import CompareSearchInput from "@/components/dashboard/compare/CompareSearchInput.jsx";
import { getPublicUniversities } from "@/services/publicService.js";
import {
  compareSlotGridClass,
  isValidCompareCount,
  MAX_COMPARE,
  MIN_COMPARE,
} from "@/utils/compareMath.js";
import { COMPARE_SLOT_THEMES } from "@/components/dashboard/compare/compareTheme.js";

function filterUniversities(universities, query, disabledIds) {
  const disabled = new Set(disabledIds.map(String));
  const available = universities.filter((university) => !disabled.has(String(university.id)));
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return available;
  }
  return available.filter(
    (university) =>
      university.name?.toLowerCase().includes(normalized) ||
      university.short_name?.toLowerCase().includes(normalized) ||
      university.location?.toLowerCase().includes(normalized) ||
      university.city?.toLowerCase().includes(normalized)
  );
}

export default function GuestCompareBuilder({ initialIds = [], onCompare }) {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() =>
    initialIds.map(String).filter(Boolean).slice(0, MAX_COMPARE)
  );
  const [search, setSearch] = useState("");
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadCatalog() {
      setIsLoadingCatalog(true);
      setCatalogError(false);
      try {
        const data = await getPublicUniversities({ page_size: 200, ordering: "-member_count" });
        if (mounted) {
          setUniversities(data.results ?? []);
        }
      } catch {
        if (mounted) {
          setCatalogError(true);
          setUniversities([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingCatalog(false);
        }
      }
    }
    loadCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  const universitiesById = useMemo(() => {
    const map = new Map();
    universities.forEach((university) => map.set(String(university.id), university));
    return map;
  }, [universities]);

  const list = useMemo(
    () => filterUniversities(universities, search, selectedIds),
    [universities, search, selectedIds]
  );

  const canCompare = isValidCompareCount(selectedIds.length);
  const isFull = selectedIds.length >= MAX_COMPARE;
  const remainingToMin = Math.max(0, MIN_COMPARE - selectedIds.length);

  function addUniversity(id) {
    const sid = String(id);
    if (selectedIds.includes(sid) || selectedIds.length >= MAX_COMPARE) {
      return;
    }
    setSelectedIds((current) => [...current, sid]);
    setSearch("");
  }

  function removeUniversity(id) {
    setSelectedIds((current) => current.filter((item) => item !== String(id)));
  }

  function clearSelection() {
    setSelectedIds([]);
    setSearch("");
  }

  function runCompare() {
    if (!canCompare) {
      return;
    }
    const path = `/taqqoslash?ids=${selectedIds.join(",")}`;
    navigate(path, { replace: true });
    onCompare?.(selectedIds);
  }

  const visibleSlotCount = Math.min(
    MAX_COMPARE,
    Math.max(MIN_COMPARE, selectedIds.length + (isFull ? 0 : 1))
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="rounded-3xl bg-white/90 p-5 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/80 backdrop-blur dark:bg-[#0b1220]/90 dark:ring-white/10 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Mehmon taqqoslash</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
              2–4 ta OTM ni solishtiring
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Login shart emas. Natijani havola orqali ulashing yoki MyUni hisobiga qo&apos;shilib sevimlilarga saqlang.
            </p>
          </div>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-xl border border-slate-200/80 px-3 py-1.5 text-[11px] font-bold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:hover:border-red-400/30 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            >
              Tozalash
            </button>
          )}
        </div>

        <div className={`mt-5 grid gap-3 ${compareSlotGridClass(visibleSlotCount)}`}>
          {Array.from({ length: visibleSlotCount }, (_, index) => {
            const id = selectedIds[index];
            const university = id ? universitiesById.get(String(id)) : null;
            const theme = COMPARE_SLOT_THEMES[index % COMPARE_SLOT_THEMES.length];

            if (!university) {
              return (
                <div
                  key={`empty-${index}`}
                  className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200/90 bg-slate-50/50 dark:border-white/10 dark:bg-white/[0.02]"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-black text-slate-300 ring-1 ring-slate-200/80 dark:bg-white/[0.04] dark:text-slate-500">
                    {index + 1}
                  </span>
                  <span className="mt-2 text-[11px] font-bold text-slate-400">Bo&apos;sh slot</span>
                </div>
              );
            }

            return (
              <div
                key={university.id}
                className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-white/[0.02] ${theme.accent} ${theme.ring} ring-1`}
              >
                <div className={`h-1 w-full ${theme.bar}`} aria-hidden="true" />
                <div className={`flex items-start gap-3 p-3 ${theme.bg}`}>
                  <UniversityAvatar university={university} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate pr-6 text-sm font-black text-slate-900 dark:text-white">
                      {university.short_name || university.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {university.city || university.location || "—"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUniversity(university.id)}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-white/80 text-slate-400 ring-1 ring-slate-200/70 transition hover:bg-red-50 hover:text-red-600 dark:bg-white/[0.06] dark:ring-white/10"
                    aria-label="Olib tashlash"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {canCompare
              ? isFull
                ? "To'liq — taqqoslashni boshlashingiz mumkin"
                : `Tayyor · yana ${MAX_COMPARE - selectedIds.length} ta qo'shish mumkin`
              : `Kamida yana ${remainingToMin} ta OTM tanlang`}
          </p>
          <button
            type="button"
            disabled={!canCompare}
            onClick={runCompare}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-violet-600 px-6 py-2.5 text-xs font-black text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.55)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Taqqoslashni ko&apos;rish
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-200/80 backdrop-blur dark:bg-[#0b1220]/90 dark:ring-white/10 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">OTM qo&apos;shish</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Qidiruvdan tanlang — bir xil OTM ikki marta qo&apos;shilmaydi
        </p>

        {isLoadingCatalog ? (
          <p className="mt-6 text-center text-sm font-semibold text-slate-500">Katalog yuklanmoqda...</p>
        ) : catalogError ? (
          <p className="mt-6 text-center text-sm font-semibold text-red-600 dark:text-red-300">
            Katalogni yuklab bo&apos;lmadi. Keyinroq qayta urinib ko&apos;ring.
          </p>
        ) : isFull ? (
          <div className="mt-4 rounded-2xl border border-amber-200/60 bg-amber-50/70 px-4 py-4 dark:border-amber-400/20 dark:bg-amber-500/10">
            <p className="text-sm font-black text-amber-950 dark:text-amber-100">
              Maksimal {MAX_COMPARE} ta OTM tanlandi
            </p>
            <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
              Boshqasini qo&apos;shish uchun yuqoridagi kartadan birini olib tashlang.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <CompareSearchInput value={search} onChange={setSearch} />
            </div>
            <div className="mt-3 max-h-64 space-y-1 overflow-y-auto overscroll-contain rounded-xl border border-slate-200/60 bg-slate-50/40 p-1 dark:border-white/10 dark:bg-white/[0.02]">
              {list.length === 0 ? (
                <p className="py-8 text-center text-sm font-semibold text-slate-500">Topilmadi</p>
              ) : (
                list.slice(0, 50).map((university) => (
                  <button
                    key={university.id}
                    type="button"
                    onClick={() => addUniversity(university.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-white hover:shadow-sm dark:hover:bg-white/[0.05]"
                  >
                    <UniversityAvatar university={university} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                        {university.short_name || university.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {university.name}
                        {university.city || university.location
                          ? ` · ${university.city || university.location}`
                          : ""}
                      </p>
                    </div>
                    <span className="text-xs font-black text-primary">+</span>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
