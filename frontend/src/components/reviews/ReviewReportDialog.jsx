import { useState } from "react";
import ModalOverlay from "../ui/ModalOverlay.jsx";

const REASONS = [
  { id: "spam", label: "Spam / reklama" },
  { id: "fake", label: "Yolg'on yoki chalg'ituvchi" },
  { id: "insult", label: "Haqorat" },
  { id: "other", label: "Boshqa" },
];

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

  return (
    <ModalOverlay onClose={onClose} labelledBy="review-report-title">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-900"
      >
        <h2 id="review-report-title" className="text-lg font-black text-slate-950 dark:text-white">
          Sharhni shikoyat qilish
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Noto&apos;g&apos;ri yoki haqoratli sharhni moderatorlarga yuboring. Har bir shikoyat
          qo&apos;lda ko&apos;rib chiqiladi.
        </p>

        <fieldset className="mt-4 space-y-2">
          {REASONS.map((item) => (
            <label
              key={item.id}
              className={`report-reason-option ${
                reason === item.id ? "report-reason-option--active" : "report-reason-option--idle"
              }`}
            >
              <input
                type="radio"
                name="review-report-reason"
                value={item.id}
                checked={reason === item.id}
                onChange={() => setReason(item.id)}
              />
              {item.label}
            </label>
          ))}
        </fieldset>

        {reason === "other" && (
          <label className="mt-4 block text-xs font-black uppercase text-slate-400">
            Izoh (majburiy)
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={3}
              maxLength={500}
              required
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary dark:border-white/15 dark:bg-slate-800"
              placeholder="Qisqacha tushuntiring..."
            />
          </label>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-modal-secondary">
            Bekor qilish
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (reason === "other" && details.trim().length < 5)}
            className="btn-modal-primary"
          >
            {isSubmitting ? "Yuborilmoqda..." : "Shikoyat yuborish"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
