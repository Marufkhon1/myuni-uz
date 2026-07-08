export default function OfficeMapEmbed({
  latitude,
  longitude,
  title = "Ofis joylashuvi",
  className = "",
  frameClassName = "h-44 w-full border-0 sm:h-48",
}) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const delta = 0.012;
  const bbox = [longitude - delta, latitude - delta, longitude + delta, latitude + delta].join(
    "%2C"
  );
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 ${className}`.trim()}
    >
      <iframe title={title} src={src} className={frameClassName} loading="lazy" />
      <p className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
        MyUni.uz ofis manzili — universitet kampusi emas.
      </p>
    </div>
  );
}
