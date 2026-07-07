import { useContext } from "react";
import { ToastContext } from "@/context/toastContext.js";

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast ToastProvider ichida ishlatilishi kerak.");
  }
  return context;
}
