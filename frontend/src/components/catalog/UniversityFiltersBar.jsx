import { Link } from "react-router-dom";
import UniversityRatingStars from "../dashboard/UniversityRatingStars.jsx";
import { OWNERSHIP_LABELS } from "../../utils/universityCatalog.js";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-400/25";

const selectClass = inputClass;

export default function UniversityFiltersBar({
  filters,
  filterOptions,
  onChange,
  onReset,
  activeCount = 0,
  showSort = true,
}) {
  const cities = filterOptions?.cities ?? [];
  const ownershipTypes = filterOptions?.ownership_types ?? [];
  const sortOptions = filterOptions?.sort_options ?? [];

  function updateField(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/[0.06] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Filtr</p>
          <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">Qidiruv va saralash</h2>
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-primary hover:text-primary dark:border-white/15 dark:text-slate-300"
          >
            Filtrlarni tozalash ({activeCount})
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="block sm:col-span-2 xl:col-span-2">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">Qidiruv</span>
          <input
            type="search"
            value={filters.q}
            onChange={(event) => updateField("q", event.target.value)}
            placeholder="Universitet nomi yoki shahar..."
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">Shahar</span>
          <select
            value={filters.city}
            onChange={(event) => updateField("city", event.target.value)}
            className={selectClass}
          >
            <option value="">Barcha shaharlar</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">Turi</span>
          <select
            value={filters.ownership}
            onChange={(event) => updateField("ownership", event.target.value)}
            className={selectClass}
          >
            <option value="">Barcha turlar</option>
            {ownershipTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">Min. reyting</span>
          <select
            value={filters.min_rating}
            onChange={(event) => updateField("min_rating", event.target.value)}
            className={selectClass}
          >
            <option value="">Har qanday</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating}+ / 5
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">Min. sharhlar</span>
          <select
            value={filters.min_reviews}
            onChange={(event) => updateField("min_reviews", event.target.value)}
            className={selectClass}
          >
            <option value="">Har qanday</option>
            {[1, 3, 5, 10, 20].map((count) => (
              <option key={count} value={count}>
                {count}+ sharh
              </option>
            ))}
          </select>
        </label>

        {showSort && (
          <label className="block sm:col-span-2 xl:col-span-1">
            <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">Saralash</span>
            <select
              value={filters.sort}
              onChange={(event) => updateField("sort", event.target.value)}
              className={selectClass}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </section>
  );
}

export function UniversityDirectoryCard({ university }) {
  const ownershipLabel =
    university.ownership_type_label || OWNERSHIP_LABELS[university.ownership_type] || university.institution_type;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30 dark:border-white/10 dark:bg-white/[0.06]">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-950 dark:text-white">
              {university.short_name || university.name}
            </h3>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
              {university.city || university.location}
            </p>
          </div>
          {ownershipLabel && (
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-primary dark:bg-blue-400/10">
              {ownershipLabel}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <UniversityRatingStars rating={university.average_rating} />
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {university.review_count ?? 0} sharh
          </span>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 px-5 py-4">
        <Link
          to={`/universitet/${university.slug}`}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white transition hover:bg-primary dark:bg-white dark:text-slate-950"
        >
          Batafsil
        </Link>
      </div>
    </article>
  );
}
