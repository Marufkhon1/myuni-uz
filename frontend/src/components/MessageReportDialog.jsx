import { useState } from "react";
import ModalOverlay from "./ui/ModalOverlay.jsx";

const REASONS = [
  { id: "insult", label: "Haqorat" },
  { id: "abuse", label: "Zo'ravonlik" },
  { id: "other", label: "Boshqa" },
];

export default function MessageReportDialog({ open, onClose, onSubmit, isSubmitting }) {
  const [reason, setReason] = useState("insult");
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
    setReason("insult");
  }

  return (
    <ModalOverlay onClose={onClose} labelledBy="report-dialog-title">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-900"
      >
        <h2 id="report-dialog-title" className="text-lg font-black text-slate-950 dark:text-white">
          Shikoyat qilish
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sababni tanlang. &quot;Boshqa&quot; bo&apos;lsa, qisqacha yozing — moderatorlar ko&apos;rib chiqadi.
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
                name="report-reason"
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
              rows={4}
              maxLength={500}
              required
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-primary dark:border-white/15 dark:bg-slate-800"
              placeholder="Nima uchun shikoyat qilyapsiz?"
            />
          </label>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-modal-secondary">
            Bekor qilish
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (reason === "other" && details.trim().length < 5)}
            className="btn-modal-primary"
          >
            {isSubmitting ? "Yuborilmoqda..." : "Yuborish"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
