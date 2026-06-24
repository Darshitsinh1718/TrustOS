// src/components/UserDropdown.jsx
// Glassmorphism dropdown showing user info and logout — click-outside to close
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import UserAvatar from "./UserAvatar";

export default function UserDropdown() {
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    setOpen(false);
    // Also clear the existing JWT token so both auth systems log out
    localStorage.removeItem("token");
    await logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg
                   hover:bg-slate-800 transition-colors focus:outline-none
                   focus:ring-2 focus:ring-cyan-500/30"
        aria-expanded={open}
        aria-haspopup="true"
        id="user-dropdown-trigger"
      >
        <UserAvatar user={user} size="sm" />
        <span className="hidden sm:block text-sm text-slate-300 font-medium max-w-[120px] truncate">
          {user?.displayName || user?.email?.split("@")[0] || "User"}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={`text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden
                     bg-slate-900/95 backdrop-blur-xl border border-slate-700/60
                     shadow-2xl shadow-black/40
                     animate-in fade-in slide-in-from-top-2 z-50"
          role="menu"
          id="user-dropdown-menu"
        >
          {/* User info header */}
          <div className="px-4 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.displayName || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || ""}
                </p>
                <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-mono
                               bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                               px-2 py-0.5 rounded">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" />
                  VERIFIED
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="py-1.5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300
                         hover:bg-red-500/10 hover:text-red-400 transition-colors text-left"
              role="menuitem"
              id="logout-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
