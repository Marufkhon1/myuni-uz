import { useEffect, useState } from "react";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_DISPLAY,
} from "../../config/siteContact.js";
import { getSupportBotWelcome } from "./supportBot.js";
import SupportChatModal from "./SupportChatModal.jsx";

const rowClass =
  "flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-white/15 dark:bg-white/10";

export default function SupportPanel({ isStudent = false }) {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(() => [getSupportBotWelcome(isStudent)]);

  useEffect(() => {
    setMessages([getSupportBotWelcome(isStudent)]);
    setDraft("");
  }, [isStudent]);

  return (
    <>
      <div className="mt-6 shrink-0 rounded-3xl border border-slate-200/80 bg-gradient-to-br from-blue-50 to-violet-50 p-4 dark:border-white/10 dark:from-blue-400/10 dark:to-violet-500/10">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
          Qo&apos;llab-quvvatlash
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
          Avval chat-bot, keyin email yoki telefon.
        </p>

        <button
          type="button"
          onClick={() => setIsChatModalOpen(true)}
          className={`mt-3 ${rowClass}`}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-sm font-black text-white">
            AI
          </span>
          <span className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-wide text-primary">Chat-bot</p>
            <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">Yordamchi bilan yozing</p>
            <p className="mt-0.5 text-xs text-slate-500">Tezkor javoblar · alohida oyna</p>
          </span>
          <span className="shrink-0 text-lg font-black text-slate-400" aria-hidden="true">
            ›
          </span>
        </button>

        <div className="mt-2 space-y-2">
          <a href={`mailto:${SUPPORT_EMAIL}`} className={rowClass}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-base dark:bg-white/10">
              ✉
            </span>
            <span className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Email</p>
              <p className="mt-0.5 truncate text-sm font-black text-slate-900 dark:text-white">
                {SUPPORT_EMAIL}
              </p>
            </span>
          </a>
          <a href={`tel:${SUPPORT_PHONE}`} className={rowClass}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-base dark:bg-white/10">
              📞
            </span>
            <span className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Telefon</p>
              <p className="mt-0.5 text-sm font-black tabular-nums text-slate-900 dark:text-white">
                {SUPPORT_PHONE_DISPLAY}
              </p>
            </span>
          </a>
        </div>

        <p className="mt-3 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {isStudent
            ? "MyUni.uz — talaba tajribasini bo'lishish"
            : "MyUni.uz — abituriyentlar uchun tanlov yordami"}
        </p>
      </div>

      <SupportChatModal
        isOpen={isChatModalOpen}
        isStudent={isStudent}
        onClose={() => setIsChatModalOpen(false)}
        messages={messages}
        onMessagesChange={setMessages}
        draft={draft}
        onDraftChange={setDraft}
      />
    </>
  );
}
