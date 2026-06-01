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
    </div>
  );
}
