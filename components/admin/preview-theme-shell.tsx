"use client";

import { Moon, Sun } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";

const THEME_STORAGE_KEY = "crisman-reader-theme";
const PreviewThemeContext = createContext<{ darkMode: boolean; toggleTheme: () => void } | null>(null);

export default function PreviewThemeShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [darkMode, setDarkMode] = useState(true);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    setDarkMode(window.localStorage.getItem(THEME_STORAGE_KEY) !== "light");
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (themeLoaded) {
      window.localStorage.setItem(THEME_STORAGE_KEY, darkMode ? "dark" : "light");
    }
  }, [darkMode, themeLoaded]);

  return (
    <PreviewThemeContext.Provider value={{ darkMode, toggleTheme: () => setDarkMode((current) => !current) }}>
      <div className={`reader-shell ${darkMode ? "reader-shell-dark" : ""} ${className}`}>{children}</div>
    </PreviewThemeContext.Provider>
  );
}

export function PreviewThemeToggle({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const theme = useContext(PreviewThemeContext);
  if (!theme) return null;

  const label = theme.darkMode ? "Gunakan mode terang" : "Gunakan mode malam";
  return (
    <button
      type="button"
      onClick={theme.toggleTheme}
      className={`reader-button-secondary inline-flex shrink-0 items-center justify-center border font-semibold shadow-sm ${compact ? "h-9 w-9 rounded-lg" : "h-10 gap-2 rounded-xl px-3 text-xs sm:text-sm"} ${className}`}
      aria-label={label}
      title={label}
    >
      {theme.darkMode ? <Sun size={compact ? 16 : 17} /> : <Moon size={compact ? 16 : 17} />}
      {!compact ? <span>{theme.darkMode ? "Mode terang" : "Mode malam"}</span> : null}
    </button>
  );
}
