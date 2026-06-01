import OfficeMapEmbed from "../OfficeMapEmbed.jsx";

export default function UniversityPublicContact({ detail }) {
  const items = [
    { label: "Manzil", value: detail.address || detail.location, href: null },
    { label: "Telefon", value: detail.phone, href: detail.phone ? `tel:${detail.phone.replace(/\s/g, "")}` : null },
    { label: "Email", value: detail.email, href: detail.email ? `mailto:${detail.email}` : null },
    { label: "Veb-sayt", value: detail.website, href: detail.website || null },
    { label: "Telegram", value: detail.telegram_url ? "Telegram kanali" : "", href: detail.telegram_url || null },
    { label: "Instagram", value: detail.instagram_url ? "Instagram sahifasi" : "", href: detail.instagram_url || null },
  ].filter((item) => item.value);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-slate-100 px-5 py-5 dark:border-white/10 sm:px-6">
      <p className="text-xs font-black uppercase tracking-wide text-primary">Aloqa</p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.label}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{item.label}</p>
            {item.href ? (
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="mt-1 block text-sm font-bold text-primary hover:underline"
              >
                {item.value}
              </a>
            ) : (
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{item.value}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function UniversityMapEmbed({ latitude, longitude, name }) {
  return (
    <section className="border-b border-slate-100 px-5 py-5 dark:border-white/10 sm:px-6">
      <p className="text-xs font-black uppercase tracking-wide text-primary">Xarita</p>
      <OfficeMapEmbed
        latitude={latitude}
        longitude={longitude}
        title={`${name} joylashuvi`}
        className="mt-3"
        frameClassName="h-64 w-full border-0 sm:h-80"
      />
    </section>
  );
}
