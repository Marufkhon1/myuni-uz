import DashboardBottomNav from "@/components/dashboard/DashboardBottomNav.jsx";
import DashboardMobileSupport from "@/components/dashboard/DashboardMobileSupport.jsx";
import DashboardSectionSkeleton from "@/components/skeletons/DashboardSkeletons.jsx";
import { mainContentProps } from "@/utils/mainContent.js";
import DashboardHeader from "./DashboardHeader.jsx";
import DashboardSidebar from "./DashboardSidebar.jsx";

export default function DashboardLayout({
  role,
  cabinetEyebrow,
  visibleMenuItems,
  activeSection,
  onChangeSection,
  isStudent,
  displayName,
  isDark,
  onToggleTheme,
  onLogout,
  isLoggingOut = false,
  notifications,
  isDataLoading,
  isWideChatLayout,
  children,
}) {
  const activeSectionLabel = visibleMenuItems.find((item) => item.id === activeSection)?.label;

  return (
    <main {...mainContentProps} className="min-h-screen bg-[#f5f7fb] text-slate-950 dark:bg-slateNight dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[292px_1fr]">
        <DashboardSidebar
          role={role}
          cabinetEyebrow={cabinetEyebrow}
          visibleMenuItems={visibleMenuItems}
          activeSection={activeSection}
          onChangeSection={onChangeSection}
          isStudent={isStudent}
        />

        <section className="min-w-0">
          <DashboardHeader
            cabinetEyebrow={cabinetEyebrow}
            activeSectionLabel={activeSectionLabel}
            displayName={displayName}
            subtitle={
              isStudent
                ? "Sharh yozing, chatda qatnashing va OTMlarni solishtiring."
                : "Sharhlarni o'qing, taqqoslang va chatda savol bering."
            }
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            onLogout={onLogout}
            isLoggingOut={isLoggingOut}
            notifications={notifications}
          />

          <div
            className={`dashboard-page-shell min-h-[calc(100dvh-9rem)] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-8 ${
              isWideChatLayout ? "p-3 sm:p-4 md:p-5 lg:px-6 lg:py-6" : "p-3 sm:p-5 md:p-6 lg:p-8"
            }`}
          >
            {isDataLoading ? (
              <DashboardSectionSkeleton section={activeSection} />
            ) : (
              <div className="min-h-[calc(100vh-12rem)]" data-dashboard-ready="true">
                {children}
              </div>
            )}
          </div>
        </section>
      </div>

      <DashboardBottomNav
        items={visibleMenuItems}
        activeSection={activeSection}
        onSelect={onChangeSection}
      />

      <DashboardMobileSupport isStudent={isStudent} />
    </main>
  );
}
