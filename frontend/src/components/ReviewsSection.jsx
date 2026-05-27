import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import UserAvatar from "./dashboard/UserAvatar.jsx";
import { getPublicRecentReviews } from "../services/publicService.js";
import { resolveMediaUrl } from "../utils/media.js";

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getPublicRecentReviews();
        if (isMounted) {
          setReviews(data);
        }
      } catch {
        if (isMounted) {
          setReviews([]);
          setLoadError("Sharhlar yuklanmadi. Keyinroq qayta urinib ko'ring.");
        }
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="reviews" className="section-padding">
      <div className="container-shell">
        <div className="max-w-2xl">
          <span className="eyebrow">Talabalar sharhlari</span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Haqiqiy talaba tajribalari.
          </h2>
        </div>

        {loadError && (
          <p className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-200">
            {loadError}
          </p>
        )}

        {isFetching && (
          <p className="mt-10 text-center font-black text-slate-500">Sharhlar yuklanmoqda...</p>
        )}

        {!isFetching && reviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-white/[0.06]"
          >
            <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
              Hozircha sharh yo'q. Birinchi sharhlar paydo bo'lgach, ular shu yerda ko'rinadi.
            </p>
          </motion.div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.article
              key={review.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.06]"
            >
              <div className="flex items-start gap-3">
                <UserAvatar
                  name={review.author}
                  avatarUrl={resolveMediaUrl(review.author_avatar_url || "")}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="font-black">{review.author}</p>
                  {review.university?.name && (
                    <p className="mt-1 text-sm font-bold text-primary">{review.university.name}</p>
                  )}
                </div>
              </div>
              <p className="mt-4 leading-7 text-slate-700 dark:text-slate-200">{review.text}</p>
              <p className="mt-3 text-amber-400">
                {"★".repeat(review.rating)}
                <span className="ml-2 text-xs font-black text-slate-500">{review.rating}/5</span>
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
