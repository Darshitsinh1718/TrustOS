// Shared nav + page wrapper used by every authenticated page
import { useNavigate, useLocation } from "react-router-dom";
import UserDropdown from "./UserDropdown";
import { useAuth } from "../hooks/useAuth";

const NAV = [
  { label: "Session", path: "/dashboard" },
  { label: "Transaction", path: "/transaction" },
  { label: "Admin", path: "/admin" },
];

export default function AppShell({ children }) {
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login",{ replace: true });
  };

  return (
    <div className="min-h-screen bg-[#060B14] flex flex-col">
      {/* ── Top nav ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-[#060B14]/90 backdrop-blur border-b border-slate-800 flex items-center px-6 gap-6">
        {/* Logo */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2 mr-4">
          <span className="w-7 h-7 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm font-mono">◎</span>
          <span className="font-mono font-bold text-white text-sm tracking-wide">TrustOS</span>
        </button>

        {/* Nav links */}
        {NAV.map(n => (
          <button
            key={n.path}
            onClick={() => navigate(n.path)}
            className={`text-sm font-medium transition-colors ${
              pathname === n.path
                ? "text-cyan-400 border-b-2 border-cyan-400 pb-0.5"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {n.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse inline-block" />
            LIVE
          </span>

          {/* Show UserDropdown for Google-authenticated users, fallback to simple logout */}
          {isAuthenticated ? (
            <UserDropdown />
          ) : (
            <button onClick={logout}
              className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-md transition-colors font-mono">
              Logout
            </button>
          )}
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 pt-14">
        {children}
      </main>
    </div>
  );
}