import React, { useState, useEffect } from "react";
import { Search, Bell, User, LogOut, Moon, Sun } from "lucide-react";
import '../styles/TopPanel.css';

export default function TopPanel({ user, onLogout }) {
  const [theme, setTheme] = useState(() => {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return localStorage.getItem("theme") || (prefersDark ? "dark" : "light");
  });

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

  if (!user) return null;

  return (
    <div className="top-panel">
      {/* Search Box */}
      <div className="search-box">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search comics, authors..."
        />
      </div>

      {/* Right Controls */}
      <div className="right-controls">
        {/* Theme Toggle */}
        <button
          aria-label="Toggle theme"
          onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
          className="icon-btn"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications */}
        <button className="icon-btn" title="Notifications">
          <Bell size={20} />
        </button>

        {/* User Icon with Tooltip */}
        <div className="user-info group relative cursor-pointer">
            <button className="icon-btn" title="User" >
          <User size={20} />
          </button>
          <div className="user-tooltip absolute left-1/2 top-full -translate-x-1/2 mt-2 p-2 bg-white/90 dark:bg-black/80 rounded-xl shadow-lg opacity-0
                          pointer-events-none transition-opacity group-hover:opacity-100 z-50">
            <div className="text flex flex-col items-center">
              <span className="name font-semibold text-sm">{user?.name}</span>
              <span className="email text-xs opacity-70">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button className="icon-btn" title="Logout" onClick={onLogout}>
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}
