import UniversityAvatar from "../../UniversityAvatar.jsx";
import { resolveCompareHighlight } from "../../../utils/compareMath.js";
import { COMPARE_SLOT_THEMES, HIGHLIGHT_ICONS } from "./compareTheme.js";

const ITEMS = [
  { key: "rating", label: "Eng yuqori reyting", suffix: "/5" },
  { key: "reviews", label: "Eng ko'p sharh", suffix: "" },
  { key: "chat_activity", label: "Eng faol chat", suffix: " a'zo" },
];

function formatHighlightValue(item, resolved) {
  if (resolved.state === "empty") {
    return "—";
  }
  if (item.key === "rating" && resolved.value != null) {
    return `${resolved.value}${item.suffix}`;
  }
  return `${resolved.value ?? "—"}${item.suffix}`;
}

export default function CompareHighlightsRow({ highlights, universities, universitiesById }) {
  if (!universities?.length) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {ITEMS.map((item, index) => {
        const resolved = resolveCompareHighlight(universities, highlights, item.key);
        const university =
          resolved.state !== "empty"
            ? universitiesById.get(String(resolved.university_id))
            : null;
        const name =
          resolved.state === "tie"
            ? "Durang"
            : university?.short_name || resolved.short_name || "—";
        const value = formatHighlightValue(item, resolved);
        const theme = COMPARE_SLOT_THEMES[index % COMPARE_SLOT_THEMES.length];
        const subline =
          resolved.state === "tie"
            ? resolved.short_name
            : resolved.state === "empty"
              ? "Ma'lumot yetarli emas"
              : null;

        return (
          <div
            key={item.key}
            className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 dark:bg-white/[0.03] dark:ring-white/10"
          >
            <div className={`h-1 ${theme.bar}`} />
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg ${theme.statIcon}`}
                aria-hidden="true"
              >
                {HIGHLIGHT_ICONS[item.key]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
                <div className="mt-1 flex items-center gap-2">
                  {university && resolved.state === "winner" && (
                    <span className="shrink-0 ring-2 ring-white dark:ring-[#0b1220]">
                      <UniversityAvatar university={university} size="xs" />
                    </span>
                  )}
                  <p className="truncate text-sm font-black text-slate-900 dark:text-white">{name}</p>
                </div>
                <p className="mt-0.5 text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">{value}</p>
                {subline && (
                  <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {subline}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
