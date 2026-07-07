import { useCallback, useEffect, useRef, useState } from "react";
import { trackPwaInstall } from "@/lib/analytics.js";
import useFocusTrap from "@/hooks/useFocusTrap.js";

const DISMISS_KEY = "myuni-pwa-install-dismissed";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const trapRef = useRef(null);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    trackPwaInstall("dismissed");
  }, []);

  useFocusTrap(visible, trapRef, { onEscape: dismiss, lockScroll: false });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return undefined;
    }

    if (localStorage.getItem(DISMISS_KEY) === "1") {
      return undefined;
    }

    function handleBeforeInstall(event) {
      event.preventDefault();
      setDeferredPrompt(event);
      setVisible(true);
    }

    function handleInstalled() {
      setInstalled(true);
      setVisible(false);
      setDeferredPrompt(null);
      trackPwaInstall("installed");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    trackPwaInstall(outcome);
    setDeferredPrompt(null);
    setVisible(false);
    if (outcome === "dismissed") {
      localStorage.setItem(DISMISS_KEY, "1");
    }
  }

  if (!visible || installed || !deferredPrompt) {
    return null;
  }

  return (
    <div ref={trapRef} className="fixed bottom-4 left-4 right-4 z-[120] sm:bottom-6 sm:left-6 sm:right-auto">
      <div
        className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label="Ilovani o'rnatish"
        tabIndex={-1}
      >
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-xl" aria-hidden="true">
            📲
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-slate-950 dark:text-white">MyUni.uz ni telefonga o&apos;rnatish</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Tezroq kirish va bildirishnomalar uchun ilovani bosh ekranga qo&apos;shing.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleInstall}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-black text-white shadow-glow"
              >
                O&apos;rnatish
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                Keyinroq
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
