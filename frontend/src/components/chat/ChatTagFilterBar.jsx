export default function ChatTagFilterBar({ tags = [], activeTag = "", onSelectTag, onClearTag }) {
  if (!tags.length) {
    return null;
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-white/10">
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        Mavzular
      </span>
      {tags.map((item) => {
        const tag = item.tag || item;
        const count = item.count;
        const isActive = activeTag === tag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onSelectTag(isActive ? "" : tag)}
            className={`rounded-full px-2.5 py-1 text-xs font-black transition ${
              isActive
                ? "bg-primary text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
            }`}
          >
            #{tag}
            {typeof count === "number" && count > 0 ? (
              <span className="ml-1 opacity-70">{count}</span>
            ) : null}
          </button>
        );
      })}
      {activeTag ? (
        <button
          type="button"
          onClick={onClearTag}
          className="text-xs font-bold text-slate-500 underline transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
        >
          Tozalash
        </button>
      ) : null}
    </div>
  );
}
