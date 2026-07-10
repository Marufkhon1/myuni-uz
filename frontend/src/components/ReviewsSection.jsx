import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import UserAvatar from "./dashboard/UserAvatar.jsx";
import ReviewAspectRatings from "./reviews/ReviewAspectRatings.jsx";
import StarRatingDisplay from "./ui/StarRatingDisplay.jsx";
import { LandingReviewsSkeleton } from "./skeletons/LandingSkeletons.jsx";
import FilterSelect from "./ui/FilterSelect.jsx";
import { useToast } from "../hooks/useToast.js";
import { getPublicRecentReviews, getPublicReviewFilters } from "../services/publicService.js";
import { resolveMediaUrl } from "../utils/media.js";
import { campusAffiliationLabel, isCampusAffiliated } from "../utils/campusAffiliation.js";

const DEFAULT_FILTERS = {
  city: "",
  rating: "",
  direction_id: "",
  sort: "newest",
  limit: 6,
};

const DEFAULT_SORT_OPTIONS = [
  { value: "newest", label: "Eng yangi" },
  { value: "rating", label: "Eng yuqori baho" },
  { value: "helpful", label: "Eng foydali" },
];

export default function ReviewsSection() {
  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [reviews, setReviews] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    getPublicReviewFilters()
      .then(setFilterOptions)
      .catch(() => setFilterOptions(null));
  }, []);

  const cityOptions = useMemo(
    () => [
      { value: "", label: "Barcha shaharlar" },
      ...(filterOptions?.cities || []).map((city) => ({ value: city, label: city })),
    ],
    [filterOptions?.cities]
  );

  const ratingOptions = useMemo(
    () => [
      { value: "", label: "Har qanday baho" },
      ...[5, 4, 3, 2, 1].map((value) => ({ value: String(value), label: `${value} yulduz` })),
    ],
    []
  );

  const directionOptions = useMemo(
    () => [
      { value: "", label: "Barcha yo'nalishlar" },
      ...(filterOptions?.directions || []).map((direction) => ({
        value: String(direction.id),
        label: direction.name,
      })),
    ],
    [filterOptions?.directions]
  );

  const sortOptions = useMemo(() => {
    const fromApi = filterOptions?.sort_options;
    if (!fromApi?.length) {
      return DEFAULT_SORT_OPTIONS;
    }
    return fromApi.map((option) => ({
      value: option.id,
      label: option.label,
    }));
  }, [filterOptions?.sort_options]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city) count += 1;
    if (filters.rating) count += 1;
    if (filters.direction_id) count += 1;
    if (filters.sort !== "newest") count += 1;
    return count;
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    setIsFetching(true);

    const params = {
      limit: filters.limit,
      sort: filters.sort,
    };
    if (filters.city) params.city = filters.city;
    if (filters.rating) {
      params.min_rating = filters.rating;
      params.max_rating = filters.rating;
    }
    if (filters.direction_id) params.direction_id = filters.direction_id;

    getPublicRecentReviews(params)
      .then((data) => {
        if (!cancelled) {
          setReviews(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReviews([]);
          toastRef.current.error("Sharhlar yuklanmadi. Keyinroq qayta urinib ko'ring.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsFetching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const activeFilterLabel = useMemo(() => {
    const parts = [];
    if (filters.city) {
      parts.push(filters.city);
    }
    if (filters.rating) {
      parts.push(`${filters.rating} yulduz`);
    }
    if (filters.direction_id) {
      const direction = directionOptions.find(
        (option) => option.value === String(filters.direction_id)
      );
      if (direction) {
        parts.push(direction.label);
      }
    }
    if (filters.sort !== "newest") {
      const sort = sortOptions.find((option) => option.value === filters.sort);
      if (sort) {
        parts.push(sort.label);
      }
    }
    return parts.join(" · ");
  }, [directionOptions, filters, sortOptions]);

  return (
    <section id="reviews" className="section-padding">
      <div className="container-shell">
        <div className="max-w-2xl">
          <span className="eyebrow">Talabalar sharhlari</span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Haqiqiy talaba tajribalari.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            O&apos;qituvchilar, yotoqxona va infratuzilma bo&apos;yicha baholar. «Kampus ovozi»
            chat a&apos;zoligini bildiradi; haqoratli matn avto-filterdan o&apos;tmaydi, odobli
            sharhlar tez tasdiqlanadi.
          </p>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-white/10 sm:px-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Filtr</p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Sharhlarni shahar, baho va yo&apos;nalish bo&apos;yicha toping
              </p>
            </div>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 transition hover:border-primary hover:text-primary dark:border-white/15 dark:text-slate-300"
              >
                Tozalash ({activeFilterCount})
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            <FilterSelect
              label="Shahar"
              icon="city"
              value={filters.city}
              onChange={(city) => setFilters((current) => ({ ...current, city }))}
              options={cityOptions}
            />

            <FilterSelect
              label="Baho"
              icon="rating"
              value={filters.rating}
              onChange={(rating) => setFilters((current) => ({ ...current, rating }))}
              options={ratingOptions}
            />

            <FilterSelect
              label="Yo'nalish"
              icon="direction"
              value={filters.direction_id}
              onChange={(direction_id) => setFilters((current) => ({ ...current, direction_id }))}
              options={directionOptions}
            />

            <FilterSelect
              label="Saralash"
              icon="sort"
              value={filters.sort}
              defaultValue="newest"
              onChange={(sort) => setFilters((current) => ({ ...current, sort }))}
              options={sortOptions}
            />
          </div>

          {!isFetching && (
            <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 sm:px-5">
              {activeFilterLabel ? (
                <span>
                  Filtr: <span className="font-bold text-slate-700 dark:text-slate-200">{activeFilterLabel}</span>
                  {" · "}
                </span>
              ) : null}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {reviews.length} ta sharh ko&apos;rsatilmoqda
              </span>
            </div>
          )}
        </div>

        {isFetching && <LandingReviewsSkeleton />}

        {!isFetching && reviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-white/[0.06]"
          >
            <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
              Tanlangan filtr bo&apos;yicha sharh topilmadi. Filtrlarni o&apos;zgartirib ko&apos;ring.
            </p>
          </motion.div>
        )}

        {!isFetching && reviews.length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="flex h-full min-w-0 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.06]"
              >
                <div className="flex shrink-0 items-start gap-3">
                  <UserAvatar
                    name={review.author}
                    avatarUrl={resolveMediaUrl(review.author_avatar_url || "")}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-black">
                      <span>{review.author}</span>
                      {isCampusAffiliated(review) && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200">
                          {campusAffiliationLabel(review)}
                        </span>
                      )}
                    </p>
                    {(review.university?.short_name || review.university?.name) && (
                      <p className="mt-1 text-sm font-bold text-primary">
                        {review.university.short_name || review.university.name}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-5 flex-1 text-sm leading-7 text-slate-700 dark:text-slate-200">
                  {review.text}
                </p>
                <div className="mt-4 min-w-0">
                  <ReviewAspectRatings item={review} variant="chip" />
                </div>
                <div className="mt-5 flex shrink-0 items-center justify-between gap-3">
                  <StarRatingDisplay
                    rating={review.rating}
                    starClassName="text-base leading-none tracking-tight"
                    numericClassName="ml-2 text-xs font-black text-slate-500 dark:text-slate-400"
                  />
                  <p className="text-xs font-bold text-slate-500">
                    Foydali: {review.helpful_count ?? review.like_count ?? 0}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
