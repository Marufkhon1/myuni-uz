import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import JsonLd from "@/components/seo/JsonLd.jsx";
import PageBreadcrumbs from "@/components/seo/PageBreadcrumbs.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import { SUPPORT_EMAIL } from "@/config/siteContact.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import PublicDocumentLayout from "@/layouts/PublicDocumentLayout.jsx";
import { api } from "@/services/api.js";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/utils/structuredData.js";

const path = "/xato-xabar";

function normalizeReportUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) {
    return "/";
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const parsed = new URL(value);
      return `${parsed.pathname}${parsed.search}` || "/";
    } catch {
      return "/";
    }
  }
  return value.startsWith("/") ? value : `/${value}`;
}

export default function ReportErrorPage() {
  const [searchParams] = useSearchParams();
  const initialUrl = normalizeReportUrl(searchParams.get("url"));

  const [pageUrl, setPageUrl] = useState(initialUrl);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const breadcrumbItems = [
    { name: "Bosh sahifa", path: "/" },
    { name: "Xato haqida xabar", path },
  ];

  usePageMeta({
    ...PAGE_META.reportError,
    path,
  });

  const breadcrumbSchema = useMemo(
    () => buildBreadcrumbSchema(breadcrumbItems),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const webPageSchema = useMemo(
    () =>
      buildWebPageSchema({
        title: PAGE_META.reportError.title,
        description: PAGE_META.reportError.description,
        path,
      }),
    []
  );

  async function onSubmit(event) {
    event.preventDefault();
    setError("");

    if (honeypot.trim()) {
      setDone(true);
      return;
    }

    const detail = description.trim();
    if (detail.length < 12) {
      setError("Iltimos, xatoni qisqacha yozing (kamida 12 belgi).");
      return;
    }

    const payloadMessage = [
      "[Xato haqida xabar]",
      `Sahifa: ${normalizeReportUrl(pageUrl)}`,
      "",
      detail,
    ].join("\n");

    setSubmitting(true);
    try {
      await api.post("/auth/support/message/", {
        message: payloadMessage,
        email: email.trim(),
        name: "ReportError",
        company: honeypot,
      });
      setDone(true);
    } catch {
      setError(
        `Yuborib bo'lmadi. Keyinroq urinib ko'ring yoki ${SUPPORT_EMAIL} ga yozing.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicDocumentLayout>
      <JsonLd
        id="report-error-json-ld"
        schemas={[breadcrumbSchema, webPageSchema].filter(Boolean)}
      />
      <div className="max-w-3xl">
        <PageBreadcrumbs items={breadcrumbItems} />
        <header className="space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary sm:text-sm">
            Ishonch
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">Xato haqida xabar</h1>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Ma&apos;lumot, reyting yoki sahifa matnida xato topsangiz — yuboring. Biz tekshiramiz va
            kerak bo&apos;lsa tuzatamiz.
          </p>
        </header>

        {done ? (
          <div className="mt-10 rounded-[1.75rem] border border-emerald-200 bg-emerald-50/90 p-6 dark:border-emerald-400/25 dark:bg-emerald-500/10">
            <h2 className="text-lg font-black text-emerald-950 dark:text-emerald-100">
              Xabaringiz qabul qilindi
            </h2>
            <p className="mt-2 text-sm leading-6 text-emerald-900/90 dark:text-emerald-100/90">
              Rahmat. Tez orada ko&apos;rib chiqamiz.
            </p>
            <Link to="/" className="mt-5 inline-flex text-sm font-bold text-primary hover:underline">
              Bosh sahifaga
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 space-y-5" noValidate>
            <div className="hidden" aria-hidden="true">
              <label htmlFor="report-company">Company</label>
              <input
                id="report-company"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="report-url" className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Sahifa manzili
              </label>
              <input
                id="report-url"
                value={pageUrl}
                onChange={(event) => setPageUrl(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-white/[0.04]"
              />
            </div>

            <div>
              <label
                htmlFor="report-description"
                className="text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                Xato tavsifi
              </label>
              <textarea
                id="report-description"
                required
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-white/[0.04]"
                placeholder="Nima noto'g'ri? Qayerda ko'rdingiz?"
              />
            </div>

            <div>
              <label
                htmlFor="report-email"
                className="text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                Email (ixtiyoriy)
              </label>
              <input
                id="report-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-white/[0.04]"
                placeholder={SUPPORT_EMAIL}
              />
            </div>

            {error ? (
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-300" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Yuborilmoqda…" : "Yuborish"}
            </button>
          </form>
        )}

        <nav aria-label="Tegishli sahifalar" className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold">
          <Link to="/aloqa" className="text-primary hover:underline">
            Aloqa
          </Link>
          <Link to="/metodologiya" className="text-primary hover:underline">
            Metodologiya
          </Link>
          <Link to="/ishonch-xavfsizlik" className="text-primary hover:underline">
            Ishonch va xavfsizlik
          </Link>
        </nav>
      </div>
    </PublicDocumentLayout>
  );
}
