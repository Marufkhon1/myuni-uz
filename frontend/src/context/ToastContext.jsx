import { useCallback, useMemo, useState } from "react";
import ToastContainer from "@/components/ui/ToastContainer.jsx";
import { ToastContext } from "./toastContext.js";

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (message, options = {}) => {
      if (!message) {
        return null;
      }

      const id = ++toastIdCounter;
      const duration = options.duration ?? 5000;
      const toast = {
        id,
        message,
        tone: options.tone ?? "info",
      };

      setToasts((current) => [...current, toast]);

      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }

      return id;
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      show: push,
      success: (message, options) => push(message, { ...options, tone: "success" }),
      error: (message, options) =>
        push(message, { ...options, tone: "error", duration: options?.duration ?? 8000 }),
      warning: (message, options) =>
        push(message, { ...options, tone: "warning", duration: options?.duration ?? 8000 }),
      info: (message, options) => push(message, { ...options, tone: "info" }),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
