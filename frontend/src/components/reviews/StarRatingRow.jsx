import { useState } from "react";



const STAR_SIZE = {

  sm: { btn: "h-8 w-8 text-xl", gap: "gap-0.5" },

  md: { btn: "h-10 w-10 text-2xl", gap: "gap-1" },

  lg: { btn: "h-12 w-12 text-3xl sm:h-14 sm:w-14 sm:text-4xl", gap: "gap-1.5 sm:gap-2" },

};



export const RATING_HINTS = {

  1: "Juda yomon",

  2: "Yomon",

  3: "O'rtacha",

  4: "Yaxshi",

  5: "A'lo!",

};



export function getRatingHint(value) {

  return RATING_HINTS[value] ?? null;

}



export default function StarRatingRow({

  value = 0,

  onChange,

  size = "md",

  label,

  id,

  showHint = false,

  centered = false,

  variant = "default",

}) {

  const [hover, setHover] = useState(0);

  const active = hover || value;

  const hint = showHint && active ? RATING_HINTS[active] : null;

  const sizing = STAR_SIZE[size] ?? STAR_SIZE.md;

  const isMinimal = variant === "minimal";

  function handleKeyDown(event) {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(event.key)) {
      return;
    }

    event.preventDefault();
    let next = value || 1;

    if (event.key === "Home") {
      next = 1;
    } else if (event.key === "End") {
      next = 5;
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      next = value >= 5 ? 5 : Math.max(1, (value || 0) + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      if (!value || value <= 1) {
        next = 0;
      } else {
        next = value - 1;
      }
    }

    onChange(next);
  }

  function handleStarKeyDown(event, star) {
    if (event.key !== " " && event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    onChange(star === value ? 0 : star);
  }



  return (

    <div className={centered ? "text-center" : "min-w-0"}>

      {label && (

        <p

          className={`font-semibold text-slate-800 dark:text-slate-100 ${

            centered ? "mb-5 text-lg sm:text-xl" : "mb-2.5 text-sm"

          }`}

        >

          {label}

        </p>

      )}

      <div

        className={`flex flex-nowrap ${sizing.gap} ${centered ? "justify-center" : ""}`}

        role="radiogroup"

        aria-label={label || "Baho"}

        aria-describedby={hint ? `${id || "rating"}-hint` : undefined}

        onKeyDown={handleKeyDown}

        onMouseLeave={() => setHover(0)}

      >

        {[1, 2, 3, 4, 5].map((star) => {

          const filled = star <= active;

          return (

            <button

              key={star}

              id={id && star === 1 ? id : undefined}

              type="button"

              role="radio"

              aria-checked={star === value}

              onClick={() => onChange(star === value ? 0 : star)}

              onKeyDown={(event) => handleStarKeyDown(event, star)}

              onMouseEnter={() => setHover(star)}

              className={`grid shrink-0 place-items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${sizing.btn} ${
                isMinimal
                  ? filled
                    ? "scale-110 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                    : "rounded-xl text-slate-300 hover:scale-105 hover:text-amber-300 dark:text-slate-500 dark:hover:text-amber-300"
                  : filled
                    ? "scale-105 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-500 shadow-[0_4px_14px_-4px_rgba(251,191,36,0.55)] ring-1 ring-amber-200/90 dark:from-amber-400/20 dark:to-amber-500/10 dark:text-amber-400 dark:ring-amber-400/35"
                    : "rounded-xl bg-slate-50 text-slate-300 ring-1 ring-slate-200/70 hover:-translate-y-0.5 hover:bg-amber-50/50 hover:text-amber-300 hover:ring-amber-200/60 dark:bg-white/[0.04] dark:text-slate-500 dark:ring-white/10 dark:hover:bg-amber-400/10 dark:hover:text-amber-300"
              }`}

              aria-label={`${star} yulduz`}

            >

              {filled ? "★" : "☆"}

            </button>

          );

        })}

      </div>

      {hint && (

        <p

          id={`${id || "rating"}-hint`}

          className={`mt-3 font-semibold text-amber-600 dark:text-amber-400 ${

            centered ? "text-base" : "min-h-[1.25rem] text-sm"

          }`}

        >

          {hint}

        </p>

      )}

      {showHint && !hint && centered && (

        <p className="mt-3 text-sm text-slate-400">Yulduzni tanlang</p>

      )}

    </div>

  );

}


