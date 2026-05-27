import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("UI xatosi:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-slate-50 px-6 dark:bg-slate-950">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-black text-slate-950 dark:text-white">Kutilmagan xatolik</h1>
            <p className="mt-4 font-semibold text-slate-600 dark:text-slate-300">
              Sahifani yangilang yoki bosh sahifaga qayting.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full bg-primary px-6 py-3 font-black text-white"
              >
                Yangilash
              </button>
              <Link
                to="/"
                className="rounded-full border border-slate-200 px-6 py-3 font-black dark:border-white/20"
              >
                Bosh sahifa
              </Link>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
