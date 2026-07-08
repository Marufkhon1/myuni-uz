import { resolveTuitionHonestyDisplay } from "@/utils/tuitionHonesty.js";

export default function UniversityPublicContact({ detail }) {
  const websiteUrl = normalizeWebsiteUrl(detail.website);
  const tuition = resolveTuitionHonestyDisplay(detail);

  const contactItems = [
    { label: "Manzil", value: detail.address || detail.location, href: null },
    {
      label: "Telefon",
      value: detail.phone,
      href: detail.phone ? `tel:${detail.phone.replace(/\s/g, "")}` : null,
    },
    { label: "Email", value: detail.email, href: detail.email ? `mailto:${detail.email}` : null },
    {
      label: "Veb-sayt",
      value: websiteUrl ? displayWebsite(detail.website) : "",
      href: websiteUrl,
      external: true,
    },
  ].filter((item) => item.value);

  const socialLinks = [
    detail.telegram_url && { label: "Telegram", href: detail.telegram_url },
    detail.instagram_url && { label: "Instagram", href: detail.instagram_url },
  ].filter(Boolean);

  if (!contactItems.length && !tuition.available && !socialLinks.length) {
    return null;
  }

  return (
    <>
      {(contactItems.length > 0 || socialLinks.length > 0) && (
        <section
          id="contact"
          className="border-b border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6"
          aria-labelledby="university-contact-heading"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p
                id="university-contact-heading"
                className="text-xs font-black uppercase tracking-wide text-primary"
              >
                Aloqa
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Rasmiy manzil, telefon va ijtimoiy tarmoqlar
              </p>
            </div>
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-primary px-4 py-2 text-xs font-black text-white shadow-glow transition hover:-translate-y-0.5"
              >
                Rasmiy saytga o&apos;tish
              </a>
            )}
          </div>

          {contactItems.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {contactItems.map((item) => (
                <ContactCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  href={item.href}
                  external={item.external}
                />
              ))}
            </div>
          )}

          {socialLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <SocialButton
                  key={link.label}
                  label={link.label}
                  href={link.href}
                  tone={
                    link.label === "Telegram"
                      ? "bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300"
                      : "bg-pink-500/10 text-pink-700 dark:bg-pink-400/10 dark:text-pink-300"
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}

      {(tuition.available || tuition.disclaimerKind === "unavailable") && (
        <section
          id="kontrakt-narxlari"
          className="border-b border-slate-100 px-5 py-6 dark:border-white/10 sm:px-6"
          aria-labelledby="university-tuition-heading"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p
                id="university-tuition-heading"
                className="text-xs font-black uppercase tracking-wide text-primary"
              >
                Kontrakt narxlari
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {tuition.available
                  ? `O'rtacha kontrakt — ta'lim shakli bo'yicha (${tuition.academicYear})`
                  : "Ochiq kontrakt summasi hozircha yo'q"}
              </p>
            </div>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                tuition.tone === "emerald"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200"
                  : tuition.tone === "slate"
                    ? "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                    : "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-100"
              }`}
            >
              {tuition.badgeLabel}
            </span>
          </div>

          {tuition.available ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {tuition.forms.map((line) => (
                <div
                  key={line.code || line.label}
                  className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-4 dark:border-emerald-400/20 dark:bg-emerald-400/10"
                >
                  <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700/80 dark:text-emerald-300/80">
                    {line.label}
                  </p>
                  <p className="mt-2 text-lg font-black text-emerald-900 dark:text-emerald-100">
                    {line.averageLabel}
                  </p>
                  {line.rangeLabel ? (
                    <p className="mt-1 text-[11px] font-semibold text-emerald-800/80 dark:text-emerald-200/80">
                      Diapazon: {line.rangeLabel}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <p className="mt-4 border-t border-slate-200/80 bg-slate-50/90 px-3 py-2.5 text-[11px] font-semibold leading-5 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            {tuition.honestyFooter}{" "}
            {tuition.sourceUrl ? (
              <>
                <a
                  href={tuition.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-black text-primary underline-offset-2 hover:underline"
                >
                  Manba
                </a>
                {tuition.publishedAt ? ` (${tuition.publishedAt})` : ""}
                {" · "}
              </>
            ) : null}
            <a
              href={tuition.methodologyHref}
              className="font-black text-primary underline-offset-2 hover:underline"
            >
              Metodologiya
            </a>
          </p>
        </section>
      )}
    </>
  );
}

function normalizeWebsiteUrl(value) {
  if (!value) {
    return null;
  }
  const trimmed = String(value).trim();
  if (!trimmed) {
    return null;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function displayWebsite(value) {
  if (!value) {
    return "";
  }
  return String(value).replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function ContactCard({ label, value, href, external }) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-4 transition hover:border-primary/30 hover:shadow-sm dark:border-white/10 dark:from-white/[0.05] dark:to-white/[0.02] dark:hover:border-primary/40">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      {href ? (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="mt-2 block text-sm font-bold leading-6 text-primary transition group-hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">{value}</p>
      )}
    </div>
  );
}

function SocialButton({ label, href, tone }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 ${tone}`}
    >
      {label}
    </a>
  );
}

export function UniversityMapEmbed({
  latitude,
  longitude,
  name,
  showMarker = false,
  honestyLabel = "",
  cityLabel = "",
}) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const pad = showMarker ? 0.02 : 0.045;
  const bbox = `${lng - pad}%2C${lat - pad * 0.75}%2C${lng + pad}%2C${lat + pad * 0.75}`;
  const markerParam = showMarker ? `&marker=${lat}%2C${lng}` : "";
  const title = showMarker
    ? `${name} — taxminiy manzil xaritasi`
    : `${name} — ${cityLabel || "shahar"} atrofi (pin yo'q)`;

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 dark:border-white/10">
      <iframe
        title={title}
        className="h-56 w-full border-0 sm:h-64"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markerParam}`}
      />
      {honestyLabel ? (
        <p className="border-t border-slate-200/80 bg-slate-50/90 px-3 py-2 text-[11px] font-semibold leading-5 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
          {honestyLabel}
        </p>
      ) : null}
    </section>
  );
}
