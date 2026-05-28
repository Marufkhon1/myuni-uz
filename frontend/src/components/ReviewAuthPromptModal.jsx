import { createPortal } from "react-dom";
import { PublicLoginButton, PublicSignupButton } from "./PublicPageButtons.jsx";

export default function ReviewAuthPromptModal({ open, onClose, signupTo, loginTo, universityName }) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  const title = universityName ? `${universityName} haqida sharh` : "Sharh yozish";

  return createPortal(
    <div
      className="fixed inset-0 z-[250] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-auth-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Hisob kerak</p>
        <h2 id="review-auth-modal-title" className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Sharh yozish faqat talabalarga ochiq. Davom etish uchun ro&apos;yxatdan o&apos;ting yoki akkauntingizga
          kiring — keyin shu universitet bo&apos;yicha sharh qoldirasiz.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <PublicSignupButton to={signupTo} className="w-full !min-h-12" onClick={onClose} />
          <PublicLoginButton to={loginTo} className="w-full !min-h-12" onClick={onClose} />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-slate-500 transition hover:text-slate-800 dark:hover:text-slate-200"
        >
          Keyinroq
        </button>
      </div>
    </div>,
    document.body
  );
}
