import { Link } from "react-router-dom";
import UniversityRatingStars from "../dashboard/UniversityRatingStars.jsx";
import FilterSelect from "../ui/FilterSelect.jsx";
import { OWNERSHIP_LABELS } from "@/utils/universityCatalog.js";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:shadow-md focus:border-primary/50 focus:ring-4 focus:ring-blue-100/80 dark:border-white/12 dark:bg-slate-900/80 dark:text-white dark:placeholder:text-slate-400 dark:hover:border-white/20 dark:focus:ring-blue-400/15";

function formatOptionLabel(option) {
  if (option.count == null) {
    return option.label;
  }
  return `${option.label} (${option.count})`;
}

function normalizeCities(cities) {
  if (!cities?.length) {
    return [];
  }
  if (typeof cities[0] === "string") {
    return cities.map((city) => ({ value: city, label: city }));
  }
  return cities;
}

function ActiveFilterChips({ filters, filterOptions, onChange, onReset }) {
  const chips = [];
  if (filters.q) {
    chips.push({ key: "q", label: `Qidiruv: ${filters.q}` });
  }
  if (filters.city) {
    chips.push({ key: "city", label: filters.city });
  }
  if (filters.ownership) {
    const match = (filterOptions?.ownership_types ?? []).find((item) => item.value === filters.ownership);
    chips.push({ key: "ownership", label: match?.label || filters.ownership });
  }
  if (filters.min_rating) {
    chips.push({ key: "min_rating", label: `${filters.min_rating}+ reyting` });
  }
  if (filters.min_reviews) {
    chips.push({ key: "min_reviews", label: `${filters.min_reviews}+ sharh` });
  }

  if (!chips.length) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Faol filtrlar">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          aria-label={`${chip.label} filtrini olib tashlash`}
          onClick={() => onChange({ ...filters, [chip.key]: "" })}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-black text-primary"
        >
          {chip.label}
          <span aria-hidden>×</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-black text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
      >
        Barchasini tozalash
      </button>
    </div>
  );
}

export default function UniversityFiltersBar({
  filters,
  filterOptions,
  onChange,
  onReset,
  activeCount = 0,
  showSort = true,
  onOpenMobileFilters,
  resultCount = 0,
  compactOnMobile = true,
}) {
  const cities = normalizeCities(filterOptions?.cities ?? []);
  const ownershipTypes = filterOptions?.ownership_types ?? [];
  const sortOptions = filterOptions?.sort_options ?? [
    { value: "name", label: "Nom bo'yicha" },
    { value: "rating", label: "Reyting (ishonchli)" },
    { value: "reviews", label: "Sharh soni (ko'p)" },
    { value: "reviews_asc", label: "Sharh soni (kam)" },
  ];

  const cityOptions = [
    { value: "", label: "Barcha shaharlar", count: filterOptions?.total_count },
    ...cities,
  ];

  const ownershipOptions = [
    { value: "", label: "Barcha turlar", count: filterOptions?.total_count },
    ...ownershipTypes,
  ];

  const minRatingOptions = filterOptions?.min_rating_options?.length
    ? filterOptions.min_rating_options
    : [
        { value: "", label: "Har qanday" },
        ...[5, 4, 3, 2, 1].map((rating) => ({ value: String(rating), label: `${rating}+ / 5` })),
      ];

  const minReviewsOptions = filterOptions?.min_reviews_options?.length
    ? filterOptions.min_reviews_options
    : [
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
          {resultCount > 0 && (
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {resultCount} ta universitet
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {compactOnMobile && onOpenMobileFilters && (
            <button
              type="button"
              onClick={onOpenMobileFilters}
              className="touch-target rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-700 lg:hidden dark:border-white/15 dark:text-slate-200"
            >
              Filtrlar{activeCount > 0 ? ` (${activeCount})` : ""}
            </button>
          )}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="hidden rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-primary hover:text-primary dark:border-white/15 dark:text-slate-300 sm:inline"
            >
              Filtrlarni tozalash ({activeCount})
            </button>
          )}
        </div>
      </div>

      <ActiveFilterChips
        filters={filters}
        filterOptions={filterOptions}
        onChange={onChange}
        onReset={onReset}
      />

      <div className="mt-4 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-3 xl:grid-cols-6">
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
          options={cityOptions.map((option) => ({
            ...option,
            label: formatOptionLabel(option),
          }))}
        />

        <FilterSelect
          label="Turi"
          icon="ownership"
          value={filters.ownership}
          onChange={(ownership) => updateField("ownership", ownership)}
          options={ownershipOptions.map((option) => ({
            ...option,
            label: formatOptionLabel(option),
          }))}
        />

        <FilterSelect
          label="Min. reyting"
          icon="rating"
          value={filters.min_rating}
          onChange={(min_rating) => updateField("min_rating", min_rating)}
          options={minRatingOptions.map((option) => ({
            ...option,
            label: formatOptionLabel(option),
          }))}
        />

        <FilterSelect
          label="Min. sharhlar"
          icon="reviews"
          value={filters.min_reviews}
          onChange={(min_reviews) => updateField("min_reviews", min_reviews)}
          options={minReviewsOptions.map((option) => ({
            ...option,
            label: formatOptionLabel(option),
          }))}
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
          <UniversityRatingStars rating={university.display_rating ?? university.bayesian_rating ?? university.average_rating} />
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
