import { useCallback, useEffect, useId, useRef, useState } from "react";
import useFocusTrap from "@/hooks/useFocusTrap.js";
import {
  isDashboardBottomNavMoreActive,
  splitDashboardBottomNavItems,
} from "@/utils/dashboardBottomNav.js";

function NavIcon({ name }) {
  const common = "h-5 w-5";

  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    );
  }
  if (name === "reviews") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
      </svg>
    );
  }
  if (name === "popular") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  if (name === "profile") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (name === "compare") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 6h7M4 12h11M4 18h7M14 6h6M14 12h6M14 18h6" />
      </svg>
    );
  }
  if (name === "favorites") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    );
  }
  if (name === "more") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden="true">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
    </svg>
  );
}

const TAB_BASE =
  "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 md:min-h-12 md:gap-1.5 md:px-2.5";
const TAB_ACTIVE = "bg-slate-950 text-white dark:bg-white dark:text-slate-950";
const TAB_IDLE =
  "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10";

export default function DashboardBottomNav({ items, activeSection, onSelect }) {
  const { barItems, moreItems } = splitDashboardBottomNavItems(items);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const sheetRef = useRef(null);
  const closeButtonRef = useRef(null);
  const titleId = useId();
  const moreActive = isDashboardBottomNavMoreActive(activeSection, moreItems);

  const closeMore = useCallback(() => setIsMoreOpen(false), []);

  useFocusTrap(isMoreOpen, sheetRef, {
    onEscape: closeMore,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (!moreActive) {
      setIsMoreOpen(false);
    }
  }, [activeSection, moreActive]);

  function handlePrimarySelect(sectionId) {
    setIsMoreOpen(false);
    onSelect(sectionId);
  }

  function handleMoreSelect(sectionId) {
    setIsMoreOpen(false);
    onSelect(sectionId);
  }

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-safe backdrop-blur-xl md:pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden dark:border-white/15 dark:bg-slate-950/95"
        aria-label="Asosiy menyu"
        data-testid="dashboard-bottom-nav"
        data-nav-count={barItems.length}
      >
        <div className="mx-auto flex max-w-2xl items-stretch justify-around gap-0.5 px-1 py-1.5 md:max-w-3xl md:gap-1 md:px-3 md:py-2">
          {barItems.map((item) => {
            const isMoreTab = item.id === "more";
            const isActive = isMoreTab ? moreActive : activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (isMoreTab) {
                    setIsMoreOpen((open) => !open);
                    return;
                  }
                  handlePrimarySelect(item.id);
                }}
                aria-current={isActive && !isMoreTab ? "page" : undefined}
                aria-expanded={isMoreTab ? isMoreOpen : undefined}
                aria-haspopup={isMoreTab ? "dialog" : undefined}
                aria-label={item.label}
                data-nav-id={item.id}
                className={`${TAB_BASE} ${isActive ? TAB_ACTIVE : TAB_IDLE}`}
              >
                <NavIcon name={item.id} />
                <span className="w-full truncate text-center text-[11px] font-black leading-tight md:text-xs">
                  {item.shortLabel ?? item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {isMoreOpen ? (
        <div
          ref={sheetRef}
          className="fixed inset-0 z-[60] lg:hidden"
          data-testid="dashboard-bottom-nav-more"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] dark:bg-black/55"
            aria-label="Menyuni yopish"
            onClick={closeMore}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-slate-200 bg-white pb-[calc(1rem+env(safe-area-inset-bottom,0px))] shadow-soft outline-none dark:border-white/15 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10">
              <h2 id={titleId} className="text-sm font-black text-slate-900 dark:text-white">
                Yana
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMore}
                className="touch-target inline-flex items-center justify-center rounded-xl px-3 text-sm font-bold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Yopish
              </button>
            </div>
            <ul className="space-y-1 px-2 py-2">
              {moreItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleMoreSelect(item.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                        isActive
                          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                          : "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10"
                      }`}
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-white/10">
                        <NavIcon name={item.id} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black">{item.label}</span>
                        {item.helper ? (
                          <span
                            className={`mt-0.5 block text-xs font-semibold ${
                              isActive
                                ? "text-white/80 dark:text-slate-700"
                                : "text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {item.helper}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
