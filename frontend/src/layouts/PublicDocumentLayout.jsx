import Footer from "@/components/Footer.jsx";
import Navbar from "@/components/Navbar.jsx";
import { useDarkMode } from "@/hooks/useDarkMode.js";
import { mainContentProps } from "@/utils/mainContent.js";

/**
 * Statik ochiq sahifalar shell — theme-aware Navbar + Footer.
 * About/Contact/Methodology kabi page'lar MainLayout o'rniga shuni ishlatadi
 * (ichida o'z `main` paddinglari bor).
 */
export default function PublicDocumentLayout({ children, seoReady = true, className = "" }) {
  const { isDark, setIsDark } = useDarkMode();

  return (
    <div
      className={
        "min-h-screen bg-[#f5f7fb] text-slate-950 transition-colors dark:bg-slateNight dark:text-white " +
        className
      }
      data-seo-ready={seoReady ? "true" : undefined}
    >
      <Navbar isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)} />
      <main {...mainContentProps} className="container-shell pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
        {children}
      </main>
      <Footer />
    </div>
  );
}
