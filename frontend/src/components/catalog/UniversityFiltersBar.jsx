import { Link } from "react-router-dom";
import UniversityRatingStars from "../dashboard/UniversityRatingStars.jsx";
import FilterSelect from "../ui/FilterSelect.jsx";
import { OWNERSHIP_LABELS } from "../../utils/universityCatalog.js";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:shadow-md focus:border-primary/50 focus:ring-4 focus:ring-blue-100/80 dark:border-white/12 dark:bg-slate-900/80 dark:text-white dark:placeholder:text-slate-400 dark:hover:border-white/20 dark:focus:ring-blue-400/15";

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
  const sortOptions = filterOptions?.sort_options ?? [
    { value: "name", label: "Nom bo'yicha" },
    { value: "rating", label: "Reyting (yuqoridan)" },
    { value: "reviews", label: "Sharh soni (ko'p)" },
    { value: "reviews_asc", label: "Sharh soni (kam)" },
  ];

  const cityOptions = [
    { value: "", label: "Barcha shaharlar" },
    ...cities.map((city) => ({ value: city, label: city })),
  ];

  const ownershipOptions = [
    { value: "", label: "Barcha turlar" },
    ...ownershipTypes.map((option) => ({ value: option.value, label: option.label })),
  ];

  const minRatingOptions = [
    { value: "", label: "Har qanday" },
    ...[5, 4, 3, 2, 1].map((rating) => ({ value: String(rating), label: `${rating}+ / 5` })),
  ];

  const minReviewsOptions = [
    { value: "", label: "Har qanday" },
    ...[1, 3, 5, 10, 20].map((count) => ({ value: String(count), label: `${count}+ sharh` })),
  ];

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

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="block sm:col-span-2 xl:col-span-2">
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            Qidiruv
          </span>
          <input
            type="search"
            value={filters.q}
            onChange={(event) => updateField("q", event.target.value)}
            placeholder="Universitet nomi yoki shahar..."
            className={inputClass}
          />
        </label>

        <FilterSelect
          label="Shahar"
          icon="city"
          value={filters.city}
          onChange={(city) => updateField("city", city)}
          options={cityOptions}
        />

        <FilterSelect
          label="Turi"
          icon="ownership"
          value={filters.ownership}
          onChange={(ownership) => updateField("ownership", ownership)}
          options={ownershipOptions}
        />

        <FilterSelect
          label="Min. reyting"
          icon="rating"
          value={filters.min_rating}
          onChange={(min_rating) => updateField("min_rating", min_rating)}
          options={minRatingOptions}
        />

        <FilterSelect
          label="Min. sharhlar"
          icon="reviews"
          value={filters.min_reviews}
          onChange={(min_reviews) => updateField("min_reviews", min_reviews)}
          options={minReviewsOptions}
        />

        {showSort && (
          <FilterSelect
            className="sm:col-span-2 xl:col-span-1"
            label="Saralash"
            icon="sort"
            value={filters.sort}
            defaultValue="name"
            onChange={(sort) => updateField("sort", sort)}
            options={sortOptions}
          />
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
