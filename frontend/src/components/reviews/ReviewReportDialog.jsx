import { useState } from "react";
import ModalOverlay from "../ui/ModalOverlay.jsx";

const REASONS = [
  {
    id: "spam",
    label: "Spam / reklama",
    hint: "Takroriy yoki reklama maqsadidagi matn",
    icon: "📢",
  },
  {
    id: "fake",
    label: "Yolg'on yoki chalg'ituvchi",
    hint: "Haqiqatga zid yoki adolatsiz ma'lumot",
    icon: "⚠️",
  },
  {
    id: "insult",
    label: "Haqorat",
    hint: "Haqorat, tahdid yoki nfrat so'zi",
    icon: "🚫",
  },
  {
    id: "other",
    label: "Boshqa",
    hint: "Boshqa sabab — qisqacha izoh qoldiring",
    icon: "✏️",
  },
];

function ReasonOption({ item, checked, onSelect }) {
  return (
    <label
      className={`group flex cursor-pointer items-start gap-3 rounded-2xl border px-3.5 py-3 transition-all duration-200 ${
        checked
          ? "border-primary/40 bg-gradient-to-r from-primary/[0.08] to-violet-500/[0.05] shadow-[0_8px_24px_-16px_rgba(37,99,235,0.45)] ring-1 ring-primary/20 dark:border-primary/35 dark:from-primary/15 dark:to-violet-500/10 dark:ring-primary/25"
          : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/15 dark:hover:bg-white/[0.04]"
      }`}
    >
      <input
        type="radio"
        name="review-report-reason"
        value={item.id}
        checked={checked}
        onChange={() => onSelect(item.id)}
        className="sr-only"
      />
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ring-1 transition-colors ${
          checked
            ? "bg-primary/10 ring-primary/20 dark:bg-primary/20 dark:ring-primary/30"
            : "bg-slate-100 ring-slate-200/70 group-hover:bg-slate-50 dark:bg-white/[0.06] dark:ring-white/10"
        }`}
        aria-hidden="true"
      >
        {item.icon}
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="block text-sm font-black text-slate-900 dark:text-white">{item.label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {item.hint}
        </span>
      </span>
      <span
        className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-all ${
          checked
            ? "border-primary bg-primary text-white dark:border-blue-400 dark:bg-blue-400"
            : "border-slate-300 bg-transparent dark:border-white/20"
        }`}
        aria-hidden="true"
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </label>
  );
}

export default function ReviewReportDialog({ open, onClose, onSubmit, isSubmitting }) {
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");

  if (!open) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (reason === "other" && details.trim().length < 5) {
      return;
    }
    await onSubmit({
      reason,
      details: reason === "other" ? details.trim() : "",
    });
    setDetails("");
    setReason("spam");
  }

  const canSubmit = !isSubmitting && (reason !== "other" || details.trim().length >= 5);

  return (
    <ModalOverlay onClose={onClose} labelledBy="review-report-title">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_28px_80px_-20px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-[#0b1220] dark:shadow-[0_28px_80px_-20px_rgba(0,0,0,0.75)]"
      >
        <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-rose-50/90 via-white to-orange-50/40 px-6 py-5 dark:border-white/10 dark:from-rose-500/10 dark:via-[#0b1220] dark:to-orange-500/5">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-400/15 blur-3xl dark:bg-rose-500/10"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white/80 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Yopish"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          <div className="relative flex items-start gap-3 pr-8">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-500/10 text-xl ring-1 ring-rose-200/70 dark:bg-rose-400/12 dark:ring-rose-400/25">
              🛡️
            </span>
            <div>
              <h2 id="review-report-title" className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
                Sharhni shikoyat qilish
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Noto&apos;g&apos;ri yoki haqoratli sharhni moderatorlarga yuboring. Har bir shikoyat
                qo&apos;lda ko&apos;rib chiqiladi.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <fieldset>
            <legend className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Sababni tanlang
            </legend>
            <div className="space-y-2">
              {REASONS.map((item) => (
                <ReasonOption
                  key={item.id}
                  item={item}
                  checked={reason === item.id}
                  onSelect={setReason}
                />
              ))}
            </div>
          </fieldset>

          {reason === "other" && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10">
              <div className="border-b border-slate-200/60 px-4 py-2 dark:border-white/10">
                <label htmlFor="review-report-details" className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Izoh (majburiy)
                </label>
              </div>
              <textarea
                id="review-report-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={3}
                maxLength={500}
                required
                className="min-h-[6.5rem] w-full resize-y border-0 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white dark:bg-white/[0.02] dark:text-white dark:focus:bg-white/[0.04]"
                placeholder="Qisqacha tushuntiring..."
              />
              <div className="border-t border-slate-200/60 px-4 py-2 text-right dark:border-white/10">
                <span className="text-[11px] font-bold tabular-nums text-slate-400">{details.length}/500</span>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2.5 text-sm font-black text-white shadow-[0_10px_28px_-10px_rgba(225,29,72,0.55)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Yuborilmoqda...
                </>
              ) : (
                "Shikoyat yuborish"
              )}
            </button>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}
