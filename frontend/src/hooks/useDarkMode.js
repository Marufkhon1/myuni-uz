import { useEffect, useState } from "react";

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
  root.style.colorScheme = isDark ? "dark" : "light";
  try {
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  } catch {
    /* ignore */
  }
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => readInitialDarkMode());

  useEffect(() => {
    applyDarkMode(isDark);
  }, [isDark]);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== STORAGE_KEY) {
        return;
      }
      setIsDark(event.newValue === "dark");
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return { isDark, setIsDark };
}
