import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { sendSupportMessage } from "../../services/supportService.js";
import { getSupportBotReply } from "./supportBot.js";

export default function SupportChatModal({
  isOpen,
  onClose,
  messages,
  onMessagesChange,
  draft,
  onDraftChange,
  isStudent = false,
}) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }

    const botReply = getSupportBotReply(text, { isStudent });
    onMessagesChange((current) => [
      ...current,
      { id: `u-${Date.now()}`, from: "user", text },
      { id: `b-${Date.now()}`, from: "bot", text: botReply },
    ]);
    onDraftChange("");
    sendSupportMessage(text).catch(() => {
      /* Bot javobi lokal; operatorga yuborish ixtiyoriy */
    });
  }

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-chat-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Yopish"
        onClick={onClose}
      />

      <div className="relative flex max-h-[min(92dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] border border-slate-200 bg-white shadow-2xl sm:rounded-[1.75rem] dark:border-white/10 dark:bg-slate-900">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-lg font-black text-white">
              M
            </span>
            <div>
              <p id="support-chat-title" className="font-black text-slate-950 dark:text-white">
                MyUni yordamchi
              </p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Onlayn</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-lg font-black text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Chatni yopish"
          >
            ×
          </button>
        </div>

        <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                message.from === "user"
                  ? "ml-auto bg-slate-950 text-white dark:bg-primary dark:text-white"
                  : "mr-auto bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-100"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <form
          onSubmit={sendMessage}
          className="shrink-0 flex gap-2 border-t border-slate-100 bg-white p-3 dark:border-white/10 dark:bg-slate-900"
        >
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Savolingizni yozing..."
            autoFocus
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-400/25"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="shrink-0 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-white transition hover:bg-primary/90 disabled:opacity-50"
          >
            Yuborish
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
