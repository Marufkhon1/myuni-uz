import { useMemo, useState } from "react";
import { resolveAbsoluteUrl } from "../../config/siteMeta.js";

export default function UniversityPublicGallery({ urls = [], name = "Universitet" }) {
  const images = useMemo(() => (urls.length > 0 ? urls : []), [urls]);
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <section className="border-b border-slate-100 px-5 py-5 dark:border-white/10 sm:px-6">
      <p className="text-xs font-black uppercase tracking-wide text-primary">Galereya</p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
        <img
          src={resolveAbsoluteUrl(activeImage)}
          alt={`${name} — kampus ${activeIndex + 1}`}
          className="h-56 w-full object-cover sm:h-72"
          loading="lazy"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${
                index === activeIndex
                  ? "border-primary shadow-sm"
                  : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <img
                src={resolveAbsoluteUrl(url)}
                alt={`${name} miniatyura ${index + 1}`}
                className="h-16 w-24 object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
