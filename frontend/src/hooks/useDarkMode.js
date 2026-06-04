import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "myuni-theme";

export function readInitialDarkMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const root = document.documentElement;
  if (root.classList.contains("dark")) {
    return true;
  }
  if (root.classList.contains("light")) {
    return false;
  }

  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === "dark") {
      return true;
    }
    if (savedTheme === "light") {
      return false;
    }
  } catch {
    /* ignore */
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyDarkMode(isDark) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.classList.remove("light");
  root.style.colorScheme = isDark ? "dark" : "light";
  try {
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  } catch {
    /* ignore */
  }
}

let sharedIsDark = typeof window !== "undefined" ? readInitialDarkMode() : false;
const listeners = new Set();

function notifyThemeListeners(next) {
  listeners.forEach((listener) => listener(next));
}

function setSharedDarkMode(value) {
  const next = typeof value === "function" ? value(sharedIsDark) : value;
  if (next === sharedIsDark) {
    return;
  }
  sharedIsDark = next;
  applyDarkMode(next);
  notifyThemeListeners(next);
}

if (typeof window !== "undefined") {
  applyDarkMode(sharedIsDark);
}

export function useDarkMode() {
  const [isDark, setLocalDark] = useState(sharedIsDark);

  useEffect(() => {
    function handleChange(next) {
      setLocalDark(next);
    }

    listeners.add(handleChange);
    setLocalDark(sharedIsDark);

    function handleStorage(event) {
      if (event.key !== STORAGE_KEY || event.newValue == null) {
        return;
      }
      const next = event.newValue === "dark";
      if (next !== sharedIsDark) {
        sharedIsDark = next;
        applyDarkMode(next);
        notifyThemeListeners(next);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      listeners.delete(handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setIsDark = useCallback((value) => {
    setSharedDarkMode(value);
  }, []);

  return { isDark, setIsDark };
}
