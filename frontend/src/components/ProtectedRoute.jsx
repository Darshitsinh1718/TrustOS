// src/components/ProtectedRoute.jsx
// Firebase-aware route guard — shows loading spinner while auth resolves,
// redirects unauthenticated users to /login
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#060B14] flex flex-col items-center justify-center gap-4">
      {/* Animated trust ring loader */}
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" className="animate-spin-slow">
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="#1E293B"
            strokeWidth="4"
          />
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="176"
            strokeDashoffset="132"
            style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.4))" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-cyan-400 text-sm font-mono">◎</span>
        </div>
      </div>
      <p className="text-sm font-mono text-slate-500 tracking-widest">
        VERIFYING IDENTITY...
      </p>
    </div>
  );
}

/**
 * Protects a route — requires Firebase authentication.
 * Shows a branded loading screen while checking auth state.
 *
 * Usage:
 * <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
