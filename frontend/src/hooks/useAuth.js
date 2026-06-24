// src/hooks/useAuth.js
// Convenience hook for consuming AuthContext — provides a clean API
// and a helpful error message if used outside the provider.
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Access the authentication context.
 *
 * @returns {{
 *   user: import("firebase/auth").User | null,
 *   loading: boolean,
 *   error: string | null,
 *   isAuthenticated: boolean,
 *   loginWithGoogle: () => Promise<void>,
 *   signUpWithEmail: (email: string, password: string, username: string) => Promise<void>,
 *   loginWithEmail: (email: string, password: string) => Promise<void>,
 *   logout: () => Promise<void>,
 *   clearError: () => void,
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth() must be used within an <AuthProvider>. " +
      "Wrap your app with <AuthProvider> in App.jsx."
    );
  }

  return context;
}
