import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_DISPLAY,
} from "@/config/siteContact.js";
import { useSupportChat } from "@/hooks/useSupportChat.js";
import SupportChatModal from "./SupportChatModal.jsx";

function SupportIcon({ children, className = "" }) {
  return (
    <span
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm ${className}`}
    >
      {children}
    </span>
  );
}

function ContactLink({ href, label, value, icon }) {
  return (
    <a
      href={href}
      className="group flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-white/60 px-2.5 py-2 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.08]"
    >
      <SupportIcon className="bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
        {icon}
      </SupportIcon>
      <span className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-xs font-black text-slate-900 dark:text-white">{value}</p>
      </span>
      <span className="shrink-0 text-sm text-slate-300 transition group-hover:text-primary dark:text-slate-600">
        ›
      </span>
    </a>
  );
}

export default function SupportPanel({ isStudent = false }) {
  const {
    isChatModalOpen,
    openChatModal,
    closeChatModal,
    draft,
    setDraft,
    messages,
    setMessages,
  } = useSupportChat(isStudent);

  return (
    <>
      <div className="mt-5 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.04]">
        <div className="border-b border-slate-100 px-3.5 py-2.5 dark:border-white/10">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            Qo&apos;llab-quvvatlash
          </p>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
            {isStudent
              ? "Savolingiz bormi? Yordamchi 24/7 javob beradi."
              : "Tanlov va platforma bo'yicha yordam oling."}
          </p>
        </div>

        <div className="space-y-2 p-3">
          <button
            type="button"
            onClick={openChatModal}
            className="group relative w-full overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-white to-violet-500/10 p-3 text-left transition hover:border-primary/40 hover:shadow-md dark:border-primary/30 dark:from-primary/15 dark:via-white/[0.04] dark:to-violet-500/10"
          >
            <div className="flex items-center gap-3">
              <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-violet-500 text-xs font-black text-white shadow-glow">
                AI
                <span className="absolute inset-0 bg-white/20 opacity-0 transition group-hover:opacity-100" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wide text-primary">Chat-bot</span>
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                    Tez
                  </span>
                </span>
                <p className="mt-0.5 text-sm font-black text-slate-950 dark:text-white">
                  Yordamchi bilan yozing
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  Alohida oynada · darhol javob
                </p>
              </span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/80 text-sm font-black text-primary shadow-sm transition group-hover:scale-105 dark:bg-white/10">
                ›
              </span>
            </div>
          </button>

          <div className="grid gap-1.5">
            <ContactLink
              href={`mailto:${SUPPORT_EMAIL}`}
              label="Email"
              value={SUPPORT_EMAIL}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 6.5h16v11H4V6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m4 7 8 6 8-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <ContactLink
              href={`tel:${SUPPORT_PHONE}`}
              label="Telefon"
              value={SUPPORT_PHONE_DISPLAY}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M8.5 4.5h2l1.2 3.6a1 1 0 0 1-.3 1l-1.4 1.2a12 12 0 0 0 5.4 5.4l1.2-1.4a1 1 0 0 1 1-.3l3.6 1.2v2a2 2 0 0 1-2 2h-.5C9.8 19.2 4.8 14.2 4.5 7.5V7a2 2 0 0 1 2-2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <p className="text-[10px] font-semibold text-slate-400">
            {isStudent ? "MyUni.uz · talaba hamjamiyati" : "MyUni.uz · abituriyent yordami"}
          </p>
        </div>
      </div>

      <SupportChatModal
        isOpen={isChatModalOpen}
        isStudent={isStudent}
        onClose={closeChatModal}
        messages={messages}
        onMessagesChange={setMessages}
        draft={draft}
        onDraftChange={setDraft}
      />
    </>
  );
}
