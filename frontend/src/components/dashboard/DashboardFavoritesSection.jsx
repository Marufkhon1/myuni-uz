import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UniversityRatingStars from "./UniversityRatingStars.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import {
  getFavoriteUniversities,
  removeFavoriteUniversity,
} from "@/services/favoriteService.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";
import { useToast } from "@/hooks/useToast.js";

export default function DashboardFavoritesSection({ onOpenCompare }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getFavoriteUniversities();
      setItems(Array.isArray(data) ? data : data?.results ?? []);
    } catch (requestError) {
      setItems([]);
      setError(getApiErrorMessage(requestError, "Sevimlilar yuklanmadi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  async function handleRemove(universityId) {
    try {
      await removeFavoriteUniversity(universityId);
      setItems((current) => current.filter((item) => item.university?.id !== universityId));
      toast.success("Sevimlilardan olib tashlandi.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "O'chirib bo'lmadi."));
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page-shell p-6">
        <p className="text-sm font-semibold text-slate-500">Sevimlilar yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        variant="university"
        title="Xatolik"
        description={error}
        action={{ label: "Qayta urinish", onClick: loadFavorites }}
        className="m-6"
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        variant="university"
        title="Sevimli universitetlar yo'q"
        description="Taqqoslash yoki universitet sahifasida yulduzcha bosib saqlang."
        action={{ label: "Katalogga o'tish", to: "/universitetlar" }}
        className="m-6"
      />
    );
  }

  return (
    <div className="dashboard-page-shell space-y-4 p-4 sm:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Sevimlilar</p>
        <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
          Saqlangan universitetlar
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {items.length} ta universitet saqlangan
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const university = item.university ?? item;
          const rating =
            university.display_rating ?? university.bayesian_rating ?? university.average_rating;

          return (
            <li
              key={university.id}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/[0.06]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-black text-slate-950 dark:text-white">
                    {university.short_name || university.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                    {university.city || university.location}
                  </p>
                </div>
                <UniversityRatingStars rating={rating} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/universitet/${university.slug}`}
                  className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-950"
                >
                  Batafsil
                </Link>
                <button
                  type="button"
                  onClick={() => onOpenCompare?.(university.id)}
                  className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-black text-primary"
                >
                  Taqqoslash
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(university.id)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 dark:border-white/15 dark:text-slate-300"
                >
                  Olib tashlash
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
