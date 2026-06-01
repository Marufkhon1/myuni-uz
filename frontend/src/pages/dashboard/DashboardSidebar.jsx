import { Link } from "react-router-dom";
import DashboardIcon from "../../components/dashboard/DashboardIcon.jsx";
import SupportPanel from "../../components/dashboard/SupportPanel.jsx";
import logo from "../../assets/myuni-logo.png";

export default function DashboardSidebar({
  cabinetEyebrow,
  visibleMenuItems,
  activeSection,
  onChangeSection,
  isStudent,
}) {
  return (
    <aside className="hidden min-h-screen flex-col border-r border-slate-200 bg-white/90 p-5 backdrop-blur-xl lg:flex dark:border-white/10 dark:bg-slate-950/80">
      <Link to="/" className="flex items-center gap-3 rounded-3xl p-2">
        <img src={logo} alt="MyUni.uz logotipi" className="h-12 w-12 rounded-2xl object-cover shadow-glow" />
        <div>
          <p className="text-xl font-black">MyUni.uz</p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{cabinetEyebrow}</p>
        </div>
      </Link>

      <nav className="mt-8 flex-1 space-y-2 overflow-y-auto" aria-label="Kabinet bo'limlari">
        {visibleMenuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangeSection(item.id)}
            aria-current={activeSection === item.id ? "page" : undefined}
            aria-label={item.label}
            className={`flex min-h-[4.5rem] w-full items-center gap-4 rounded-3xl p-4 text-left transition ${
              activeSection === item.id
                ? "bg-slate-950 text-white shadow-soft dark:bg-white dark:text-slate-950"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            <span
              className={`grid h-11 w-11 place-items-center rounded-2xl ${
                activeSection === item.id ? "bg-white/10" : "bg-slate-100 dark:bg-white/10"
              }`}
            >
              <DashboardIcon name={item.id} />
            </span>
            <span>
              <span className="block font-black">{item.label}</span>
              <span className="mt-0.5 block text-xs font-semibold opacity-70">{item.helper}</span>
            </span>
          </button>
        ))}
      </nav>

      <SupportPanel key={isStudent ? "student" : "applicant"} isStudent={isStudent} />
    </aside>
  );
}
