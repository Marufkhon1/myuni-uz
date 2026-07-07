import { useEffect, useRef } from "react";
import useFocusTrap from "@/hooks/useFocusTrap.js";
import FilterSelect from "../ui/FilterSelect.jsx";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary/50 focus:ring-4 focus:ring-blue-100/80 dark:border-white/12 dark:bg-slate-900/80 dark:text-white dark:focus:ring-blue-400/15";

function formatOptionLabel(option) {
  if (option.count == null) {
    return option.label;
  }
  return `${option.label} (${option.count})`;
}

export default function CatalogFilterDrawer({
  open,
  onClose,
  filters,
  filterOptions,
  onChange,
  onReset,
  onApply,
  resultCount = 0,
  activeCount = 0,
}) {
  const panelRef = useRef(null);
  useFocusTrap(open, panelRef, { onEscape: onClose, lockScroll: true });

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const cities = filterOptions?.cities ?? [];
  const ownershipTypes = filterOptions?.ownership_types ?? [];
  const sortOptions = filterOptions?.sort_options ?? [];
  const minRatingOptions = filterOptions?.min_rating_options ?? [];
  const minReviewsOptions = filterOptions?.min_reviews_options ?? [];

  const cityOptions = [
    { value: "", label: "Barcha shaharlar", count: filterOptions?.total_count },
    ...cities,
  ];
  const ownershipOpts = [{ value: "", label: "Barcha turlar" }, ...ownershipTypes];

  function updateField(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="fixed inset-0 z-[70] lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        aria-label="Filtr oynasini yopish"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-filter-title"
        className="absolute inset-x-0 bottom-0 flex max-h-[min(92vh,720px)] flex-col rounded-t-[1.75rem] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <div>
            <p id="catalog-filter-title" className="text-lg font-black text-slate-950 dark:text-white">
              Filtrlar
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {resultCount} ta natija
            </p>
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl px-3 py-1.5 text-xs font-black text-primary"
            >
              Tozalash
            </button>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
              Qidiruv
            </span>
            <input
              type="search"
              value={filters.q}
              onChange={(event) => updateField("q", event.target.value)}
              placeholder="Universitet nomi..."
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
            options={ownershipOpts.map((option) => ({
              ...option,
              label: formatOptionLabel(option),
            }))}
          />

          <FilterSelect
            label="Min. reyting"
            icon="rating"
            value={filters.min_rating}
            onChange={(min_rating) => updateField("min_rating", min_rating)}
            options={(minRatingOptions.length ? minRatingOptions : [
              { value: "", label: "Har qanday" },
              ...[5, 4, 3, 2, 1].map((rating) => ({ value: String(rating), label: `${rating}+ / 5` })),
            ]).map((option) => ({
              ...option,
              label: formatOptionLabel(option),
            }))}
          />

          <FilterSelect
            label="Min. sharhlar"
            icon="reviews"
            value={filters.min_reviews}
            onChange={(min_reviews) => updateField("min_reviews", min_reviews)}
            options={(minReviewsOptions.length ? minReviewsOptions : [
              { value: "", label: "Har qanday" },
              ...[1, 3, 5, 10, 20].map((count) => ({ value: String(count), label: `${count}+ sharh` })),
            ]).map((option) => ({
              ...option,
              label: formatOptionLabel(option),
            }))}
          />

          <FilterSelect
            label="Saralash"
            icon="sort"
            value={filters.sort}
            defaultValue="name"
            onChange={(sort) => updateField("sort", sort)}
            options={sortOptions}
          />
        </div>

        <div className="border-t border-slate-100 p-4 pb-safe dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              onApply?.();
              onClose();
            }}
            className="touch-target w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white dark:bg-white dark:text-slate-950"
          >
            {resultCount} ta natijani ko&apos;rish
          </button>
        </div>
      </div>
    </div>
  );
}
