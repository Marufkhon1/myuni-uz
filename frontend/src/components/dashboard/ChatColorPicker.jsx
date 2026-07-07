import UserAvatar from "./UserAvatar.jsx";
import ChatAuthorName from "../chat/ChatAuthorName.jsx";
import {
  CHAT_COLOR_OPTIONS,
  getAuthorColorHex,
  getColorOption,
} from "@/utils/chatAuthorColor.js";

function ChatColorPreview({
  displayName,
  userId,
  activeColorId,
  activeHex,
  activeLabel,
  isAuto,
  avatarUrl,
}) {
  const name = displayName || "Ismingiz";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-200/50 dark:border-white/10 dark:bg-white/[0.04] dark:ring-white/5">
      <div className="border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Guruh chat</p>
            <p className="mt-0.5 text-sm font-black text-slate-950 dark:text-white">Jonli preview</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/20">
            Live
          </span>
        </div>
      </div>

      <div className="bg-[#e8ecf4] px-4 py-4 dark:bg-slate-950/70">
        <div className="mb-4 flex items-end gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-500 text-xs font-black text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
            B
          </div>
          <div className="min-w-0 max-w-[88%]">
            <p className="text-[11px] font-bold tracking-wide text-violet-600 dark:text-violet-300">Boshqa talaba</p>
            <div className="mt-0.5 w-fit rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[15px] leading-snug text-slate-900 shadow-sm dark:bg-white/10 dark:text-white">
              Salom! Qandaysiz?
            </div>
            <time className="mt-1 block text-[10px] font-semibold text-slate-500 dark:text-slate-400">14:32</time>
          </div>
        </div>

        <div className="flex items-end gap-2.5">
          <UserAvatar
            name={displayName}
            avatarUrl={avatarUrl}
            size="sm"
            colorKey={activeColorId}
            userId={userId}
          />
          <div className="min-w-0 max-w-[88%]">
            <ChatAuthorName
              name={name}
              userId={userId}
              colorKey={activeColorId}
              className="block truncate text-xs"
            />
            <div className="mt-0.5 w-fit rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[15px] leading-snug text-slate-900 shadow-sm dark:bg-white/10 dark:text-white">
              Rasm bo&apos;lsa ham ism shu rangda ko&apos;rinadi
            </div>
            <time className="mt-1 block text-[10px] font-semibold text-slate-500 dark:text-slate-400">14:33</time>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-200/70 bg-white/80 px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Ism rangi chatda ko&apos;rinadi</p>
        {activeLabel ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ring-1"
            style={{
              backgroundColor: `${activeHex}18`,
              color: activeHex,
              borderColor: `${activeHex}33`,
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeHex }} />
            {isAuto ? `Avto · ${activeLabel}` : activeLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ColorSwatch({ option, isManualActive, isAutoMatch, isSaving, onSelect }) {
  const isHighlighted = isManualActive || isAutoMatch;

  return (
    <button
      type="button"
      disabled={isSaving}
      title={option.label}
      aria-pressed={isManualActive}
      onClick={() => onSelect(option.id)}
      className={`group flex flex-col items-center gap-2 rounded-2xl border p-2.5 transition disabled:opacity-50 ${
        isManualActive
          ? "border-primary/40 bg-gradient-to-b from-primary/10 to-white shadow-sm ring-2 ring-primary/20 dark:from-primary/15 dark:to-white/[0.03] dark:ring-primary/25"
          : isAutoMatch
            ? "border-slate-300/80 bg-slate-50/80 dark:border-white/15 dark:bg-white/[0.04]"
            : "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-white/10 dark:hover:bg-white/[0.04]"
      }`}
    >
      <span className="relative">
        <span
          className={`block h-10 w-10 rounded-full shadow-md ring-2 ring-white transition duration-200 group-hover:scale-105 dark:ring-slate-900 ${
            isHighlighted ? "scale-105" : ""
          } ${isManualActive ? "ring-offset-2 ring-offset-white dark:ring-offset-slate-900" : ""}`}
          style={{
            backgroundColor: option.hex,
            boxShadow: isManualActive ? `0 8px 20px -8px ${option.hex}99` : undefined,
            outline: isManualActive ? `2px solid ${option.hex}55` : undefined,
          }}
        />
        {isManualActive ? (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-black/20 text-sm font-black text-white">
            ✓
          </span>
        ) : null}
        {isAutoMatch && !isManualActive ? (
          <span
            className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full ring-2 ring-white dark:ring-slate-900"
            style={{ backgroundColor: option.hex }}
          />
        ) : null}
      </span>
      <span
        className={`max-w-full truncate text-[10px] font-bold sm:text-[11px] ${
          isManualActive ? "text-primary" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {option.label}
      </span>
    </button>
  );
}

export default function ChatColorPicker({
  displayName,
  userId,
  avatarUrl,
  selectedColor,
  resolvedColor,
  isSaving,
  onSelect,
}) {
  const activeColorId = selectedColor || resolvedColor;
  const activeOption = getColorOption(activeColorId);
  const activeHex = activeOption?.hex || getAuthorColorHex(userId, activeColorId);
  const isAuto = !selectedColor;

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white shadow-soft ring-1 ring-slate-200/50 dark:border-white/10 dark:bg-white/[0.06] dark:ring-white/5">
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/90 via-white to-violet-50/50 px-4 py-4 dark:border-white/10 dark:from-blue-400/10 dark:via-white/[0.04] dark:to-violet-400/5 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg ring-1 ring-primary/15 dark:bg-primary/15 dark:ring-primary/25">
            🎨
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black tracking-tight text-slate-950 dark:text-white">Chat rangi</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Ismingiz guruh chatda qanday rangda ko&apos;rinishini tanlang — preview real chatga o&apos;xshaydi.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-4 py-4 sm:px-5 sm:py-5">
        <ChatColorPreview
          displayName={displayName}
          userId={userId}
          activeColorId={activeColorId}
          activeHex={activeHex}
          activeLabel={activeOption?.label}
          isAuto={isAuto}
          avatarUrl={avatarUrl}
        />

        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
              Rang tanlash
            </p>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {isAuto ? "Avtomatik rejim" : "Qo'lda tanlangan"}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
            {CHAT_COLOR_OPTIONS.map((option) => (
              <ColorSwatch
                key={option.id}
                option={option}
                isManualActive={selectedColor === option.id}
                isAutoMatch={isAuto && resolvedColor === option.id}
                isSaving={isSaving}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.04]">
          {isSaving ? (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-primary">
              <span
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
                aria-hidden="true"
              />
              Saqlanmoqda...
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Rangni bosish — darhol saqlanadi
            </span>
          )}

          {selectedColor ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onSelect("")}
              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:text-primary"
            >
              Avtomatik rejimga qaytish
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Avto rejim faol
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
