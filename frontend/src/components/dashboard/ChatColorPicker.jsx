import { CHAT_COLOR_OPTIONS, getAuthorColorClass } from "../../utils/chatAuthorColor.js";

export default function ChatColorPicker({
  displayName,
  userId,
  selectedColor,
  resolvedColor,
  isSaving,
  onSelect,
}) {
  const previewColor = selectedColor || resolvedColor;
  const previewClass = getAuthorColorClass(userId, previewColor);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Chat rangi</p>
      <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Ismingiz qanday ko&apos;rinsin</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Guruh va shaxsiy chatda boshqalar sizni shu rangda ko&apos;radi. Tanlamasangiz, avtomatik rang beriladi.
      </p>

      <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-white/5">
        <span className="text-slate-500 dark:text-slate-400">Ko&apos;rinish: </span>
        <span className={`font-black ${previewClass}`}>{displayName || "Ismingiz"}</span>
      </p>

      <div className="mt-5 grid grid-cols-5 gap-3 sm:grid-cols-10">
        {CHAT_COLOR_OPTIONS.map((option) => {
          const isActive = (selectedColor || resolvedColor) === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={isSaving}
              title={option.label}
              onClick={() => onSelect(option.id)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border p-2 transition disabled:opacity-50 ${
                isActive
                  ? "border-primary bg-blue-50 ring-2 ring-primary/30 dark:bg-blue-400/15"
                  : "border-slate-200 hover:border-primary/40 dark:border-white/15"
              }`}
            >
              <span
                className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-slate-900"
                style={{ backgroundColor: option.hex }}
                aria-hidden
              />
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">{option.label}</span>
            </button>
          );
        })}
      </div>

      {selectedColor && (
        <button
          type="button"
          disabled={isSaving}
          onClick={() => onSelect("")}
          className="mt-4 text-sm font-black text-slate-500 hover:text-primary disabled:opacity-50"
        >
          Avtomatik rangga qaytarish
        </button>
      )}
    </div>
  );
}
