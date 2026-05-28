export default function ChatGroupJoinBar({ onJoin, isJoining }) {
  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4 dark:border-white/10 dark:bg-slate-900/90">
      <button
        type="button"
        onClick={onJoin}
        disabled={isJoining}
        className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-premium-gradient px-5 py-2.5 text-base font-black text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isJoining ? "Qo'shilmoqda..." : "Qo'shilish"}
      </button>
    </div>
  );
}
