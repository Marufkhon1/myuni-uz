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

  return (
    <header className="page-top-safe sticky top-0 z-40 border-b border-slate-200 bg-[#f5f7fb]/90 px-3 py-2.5 backdrop-blur-xl sm:px-6 sm:py-4 lg:px-8 dark:border-white/10 dark:bg-slateNight/85">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <Link to="/" className="grid shrink-0 lg:hidden" aria-label="MyUni.uz bosh sahifa">
            <img src={logo} alt="" className="h-9 w-9 rounded-xl object-cover shadow-glow sm:h-11 sm:w-11" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-primary sm:text-xs">
              {cabinetEyebrow} · {activeSectionLabel}
            </p>
            <h1 className="truncate text-base font-black text-slate-950 sm:text-2xl lg:text-3xl dark:text-white">
              Salom, {displayName}
            </h1>
            <p className="mt-0.5 hidden truncate text-xs font-semibold text-slate-500 sm:block dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => notifications.setIsOpen((value) => !value)}
              className="dashboard-toolbar-btn relative"
              aria-label="Bildirishnomalar"
              aria-expanded={notifications.isOpen}
            >
              <DashboardIcon name="bell" />
              {notifications.unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1">
                  <UnreadBadge count={notifications.unreadCount} />
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

          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} className="!h-11 !w-11 !shadow-soft" />
          <button
            type="button"
            onClick={() => void onLogout?.()}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
            className="dashboard-toolbar-btn !min-w-0 px-3 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
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
