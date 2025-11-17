import React, { useState, useEffect } from "react";

export default function ThemeToggle({ user, onLogout, settheme }) {
  const [theme, setTheme] = useState(() => {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return localStorage.getItem("theme") || (prefersDark ? "dark" : "light");
  });

  // ✅ Sync parent state after mount
  useEffect(() => {
    settheme(theme);
  }, [theme, settheme]);

  // Update HTML & localStorage whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      {!user && (
        <button
          aria-label="Toggle theme"
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          className="theme-toggle fixed top-4 right-4 z-50 rounded-full p-1 bg-white/60 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-black/30"
          style={{ width: 56, height: 32 }}
        >
          <div
            className="toggle-thumb w-7 h-7 rounded-full flex items-center justify-center text-sm transition-transform duration-300"
            style={{
              transform: theme === "dark" ? "translateX(22px)" : "translateX(2px)",
              background: theme === "dark" ? "#0a84ff" : "#ffffff",
              boxShadow: "0 6px 18px rgba(15,15,15,0.08)"
            }}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </div>
        </button>
      )}
    </>
  );
}
