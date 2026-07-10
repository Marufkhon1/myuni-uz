import { useRef } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/myuni-logo.png";
import ThemeToggle from "@/components/ThemeToggle.jsx";
import DashboardIcon from "@/components/dashboard/DashboardIcon.jsx";
import UnreadBadge from "@/components/UnreadBadge.jsx";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel.jsx";

export default function DashboardHeader({
  cabinetEyebrow,
  activeSectionLabel,
  displayName,
  subtitle,
  isDark,
  onToggleTheme,
  onLogout,
  isLoggingOut = false,
  notifications,
}) {
  const notificationsRef = useRef(null);
  const shortName = String(displayName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)[0] || displayName;

  return (
    <header className="page-top-safe sticky top-0 z-40 border-b border-slate-200 bg-[#f5f7fb]/90 px-3 pb-2.5 pt-[max(0.5rem,env(safe-area-inset-top,0px))] backdrop-blur-xl sm:px-6 sm:pb-4 lg:px-8 dark:border-white/10 dark:bg-slateNight/85">
      <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link to="/" className="grid shrink-0 lg:hidden" aria-label="MyUni.uz bosh sahifa">
            <img src={logo} alt="" className="h-8 w-8 rounded-xl object-cover shadow-glow sm:h-11 sm:w-11" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-primary sm:text-xs sm:tracking-[0.16em]">
              <span className="sm:hidden">{activeSectionLabel || cabinetEyebrow}</span>
              <span className="hidden sm:inline">
                {cabinetEyebrow} · {activeSectionLabel}
              </span>
            </p>
            <h1 className="truncate text-base font-black text-slate-950 sm:text-2xl lg:text-3xl dark:text-white">
              <span className="sm:hidden">Salom, {shortName}</span>
              <span className="hidden sm:inline">Salom, {displayName}</span>
            </h1>
            <p className="mt-0.5 hidden truncate text-xs font-semibold text-slate-500 sm:block dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => notifications.setIsOpen((value) => !value)}
              className="dashboard-toolbar-btn relative !h-10 !w-10 sm:!h-11 sm:!w-11"
              aria-label="Bildirishnomalar"
              aria-expanded={notifications.isOpen}
            >
              <DashboardIcon name="bell" />
              {notifications.unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1">
                  <UnreadBadge count={notifications.unreadCount} size="sm" />
                </span>
              ) : null}
            </button>
            <NotificationsPanel
              containerRef={notificationsRef}
              open={notifications.isOpen}
              onClose={() => notifications.setIsOpen(false)}
              items={notifications.items}
              unreadCount={notifications.unreadCount}
              apiUnreadCount={notifications.apiUnreadCount}
              chatUnreadTotal={notifications.chatUnreadTotal}
              isLoading={notifications.isLoading}
              onMarkAllRead={notifications.markAllRead}
              onMarkOneRead={notifications.markOneRead}
            />
          </div>

          <ThemeToggle
            isDark={isDark}
            onToggle={onToggleTheme}
            className="!h-10 !w-10 !shadow-soft sm:!h-11 sm:!w-11"
          />
          <button
            type="button"
            onClick={() => void onLogout?.()}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
            className="dashboard-toolbar-btn !h-10 !min-w-0 !w-10 px-0 disabled:cursor-not-allowed disabled:opacity-60 sm:!h-11 sm:!w-auto sm:px-5"
            aria-label="Chiqish"
          >
            <span className="hidden sm:inline">{isLoggingOut ? "Chiqilmoqda..." : "Chiqish"}</span>
            <span className="sm:hidden" aria-hidden="true">
              {isLoggingOut ? "…" : "⎋"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
