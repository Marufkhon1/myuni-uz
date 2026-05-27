import { useEffect, useState } from "react";

const STORAGE_KEY = "myuni-theme";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  return { isDark, setIsDark };
}
