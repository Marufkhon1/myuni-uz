import { Link } from "react-router-dom";
import OfficeMapEmbed from "@/components/OfficeMapEmbed.jsx";
import JsonLd from "@/components/seo/JsonLd.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import {
  OFFICE_ADDRESS,
  OFFICE_LATITUDE,
  OFFICE_LONGITUDE,
  OFFICE_NAME,
  SHOW_SUPPORT_PHONE,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_DISPLAY,
} from "@/config/siteContact.js";
import { PAGE_META } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import {
  buildBreadcrumbSchema,
  buildContactPageSchema,
} from "@/utils/structuredData.js";

const path = "/aloqa";

export default function ContactPage() {
  const breadcrumbItems = [
    { name: "Bosh sahifa", path: "/" },
    { name: "Aloqa", path },
  ];

  usePageMeta({
    ...PAGE_META.contact,
    path,
  });

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const contactSchema = buildContactPageSchema({
    title: PAGE_META.contact.title,
    description: PAGE_META.contact.description,
    path,
    email: SUPPORT_EMAIL,
    telephone: SHOW_SUPPORT_PHONE ? SUPPORT_PHONE : undefined,
    address: OFFICE_ADDRESS,
  });

  return (
    <PublicDocumentLayout>
      <JsonLd
        id="contact-json-ld"
        schemas={[breadcrumbSchema, contactSchema].filter(Boolean)}
      />
      <div className="max-w-3xl">
        <PageBreadcrumbs items={breadcrumbItems} />

        <header className="space-y-4 sm:space-y-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary sm:text-sm">
            Bog&apos;lanish
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-[2.75rem]">
            Aloqa
          </h1>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Savol, taklif yoki xato haqida xabar berish uchun biz bilan bog&apos;laning. Ofis
            manzili va xarita quyida.
          </p>
        </header>

        <div
          className={
            "mt-10 grid gap-6 " + (SHOW_SUPPORT_PHONE ? "sm:grid-cols-2" : "sm:grid-cols-1")
          }
        >
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Email</h2>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-3 block text-base font-bold text-primary hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Ish vaqti ichida odatda 1–2 ish kuni ichida javob beramiz.
            </p>
          </section>

          {SHOW_SUPPORT_PHONE ? (
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Telefon</h2>
              <a
                href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}
                className="mt-3 block text-base font-bold text-primary hover:underline"
              >
                {SUPPORT_PHONE_DISPLAY || SUPPORT_PHONE}
              </a>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Qo&apos;ng&apos;iroqlar ish kunlari qabul qilinadi.
              </p>
            </section>
          ) : null}
        </div>

        <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Ofis</h2>
          <p className="mt-2 text-base font-semibold text-slate-700 dark:text-slate-200">
            {OFFICE_NAME}
          </p>
          <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{OFFICE_ADDRESS}</p>
          <div className="mt-5">
            <OfficeMapEmbed
              latitude={OFFICE_LATITUDE}
              longitude={OFFICE_LONGITUDE}
              title={OFFICE_NAME}
            />
          </div>
        </section>

        <nav
          aria-label="Tegishli sahifalar"
          className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3 text-sm font-bold"
        >
          <Link to="/haqida" className="text-primary hover:underline">
            Biz haqimizda
          </Link>
          <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
            ·
          </span>
          <Link to="/savollar-javob" className="text-primary hover:underline">
            Savollar
          </Link>
          <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
            ·
          </span>
          <Link to="/ishonch-xavfsizlik" className="text-primary hover:underline">
            Ishonch va xavfsizlik
          </Link>
        </nav>
      </div>
    </PublicDocumentLayout>
  );
}
