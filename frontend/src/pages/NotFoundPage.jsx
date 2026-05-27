import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 dark:bg-slate-950">
      <div className="max-w-md text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">404</p>
        <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">Sahifa topilmadi</h1>
        <p className="mt-4 font-semibold text-slate-600 dark:text-slate-300">
          Havola noto'g'ri yoki sahifa o'chirilgan bo'lishi mumkin.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-premium-gradient px-7 py-4 font-black text-white shadow-glow"
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    </main>
  );
}
