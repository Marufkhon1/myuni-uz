import { Link, useLocation } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import { legalDocuments } from "../content/legalContent.js";
import { usePageMeta } from "../hooks/usePageMeta.js";

const pathToDoc = {
  "/foydalanish-shartlari": legalDocuments.terms,
  "/maxfiylik-siyosati": legalDocuments.privacy,
  "/sharh-qoidalari": legalDocuments.reviews,
};

export default function LegalDocumentPage() {
  const { pathname } = useLocation();
  const doc = pathToDoc[pathname];

  usePageMeta(
    doc
      ? { title: `${doc.title} | MyUni.uz`, description: doc.description }
      : undefined
  );

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] dark:bg-slateNight">
        <Navbar />
        <main className="container-shell py-16 text-center">
          <h1 className="text-2xl font-black">Sahifa topilmadi</h1>
          <Link to="/" className="mt-4 inline-block font-bold text-primary">
            Bosh sahifaga
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950 dark:bg-slateNight dark:text-white">
      <Navbar />
      <main className="container-shell py-10 sm:py-14">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Huquqiy hujjat</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{doc.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          {doc.description}
        </p>
        <p className="mt-2 text-xs text-slate-400">Oxirgi yangilanish: 2026-yil</p>

        <div className="mt-10 max-w-3xl space-y-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 dark:border-white/10 dark:bg-white/[0.06]">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{section.heading}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold">
          <Link to="/foydalanish-shartlari" className="text-primary hover:underline">
            Foydalanish shartlari
          </Link>
          <Link to="/maxfiylik-siyosati" className="text-primary hover:underline">
            Maxfiylik
          </Link>
          <Link to="/sharh-qoidalari" className="text-primary hover:underline">
            Sharh qoidalari
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
