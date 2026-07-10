export default function ChatGroupJoinBar({ onJoin, isJoining, className = "" }) {
  return (
    <div
      className={`shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4 dark:border-white/10 dark:bg-slate-900/90 ${className}`.trim()}
    >
      <button
        type="button"
        onClick={onJoin}
        disabled={isJoining}
        className="btn-modal-gradient flex min-h-11 w-full items-center justify-center px-5 py-2.5 text-base"
      >
        {isJoining ? "Qo'shilmoqda..." : "Qo'shilish"}
      </button>
    </div>
  );
}
