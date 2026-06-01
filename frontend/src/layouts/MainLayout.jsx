import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useDarkMode } from "../hooks/useDarkMode.js";

export default function MainLayout({ children }) {
  const { isDark, setIsDark } = useDarkMode();

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-950 transition-colors duration-500 dark:bg-slateNight dark:text-white">
      <Navbar isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
