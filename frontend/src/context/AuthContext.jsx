// src/context/AuthContext.jsx
// Global authentication context — wraps the entire app to provide
// Firebase auth state, Google login, Email/Password login, logout, and Firestore sync.
import { createContext, useState, useEffect, useCallback } from "react";
import { 
  signInWithGoogle, 
  logOut, 
  onAuthChanged, 
  handleRedirectResult,
  signUpWithEmail as firebaseSignUpWithEmail,
  signInWithEmail as firebaseSignInWithEmail
} from "../lib/auth";
import { authAPI, sessionAPI } from "../api";

/**
 * @typedef {Object} AuthContextValue
 * @property {import("firebase/auth").User|null} user - Firebase user object
 * @property {boolean} loading - True while auth state is being resolved
 * @property {string|null} error - Last auth error message
 * @property {boolean} isAuthenticated - Whether a Firebase user is logged in
 * @property {function} loginWithGoogle - Triggers Google sign-in flow
 * @property {function} logout - Signs out the current Firebase user
 * @property {function} clearError - Clears the error state
 */

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to Firebase auth state changes (persists across refreshes)
  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // If user just logged in via redirect, sync to Firestore
      if (firebaseUser) {
        try {
          // Sync with TrustOS backend to get JWT token if we don't have one
          const currentToken = localStorage.getItem("token");
          if (!currentToken) {
            const res = await authAPI.googleLogin({
              email: firebaseUser.email,
              username: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              uid: firebaseUser.uid
            });
            localStorage.setItem("token", res.data.access_token);
            try { await sessionAPI.start(); } catch (e) { console.error("Session start error", e); }
            window.location.href = "/dashboard";
          }
        } catch (err) {
          console.error("[AuthContext] Backend sync error:", err);
        }
      }
    });

    // Handle redirect result (for signInWithRedirect fallback)
    handleRedirectResult().catch((err) => {
      console.error("[AuthContext] Redirect result error:", err);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      // If result is null, redirect was used — the onAuthChanged listener
      // will pick up the user on the next page load
      if (result?.user) {
        // Sync with TrustOS backend to get JWT token
        const res = await authAPI.googleLogin({
          email: result.user.email,
          username: result.user.displayName || result.user.email.split("@")[0],
          uid: result.user.uid
        });
        localStorage.setItem("token", res.data.access_token);
        try { await sessionAPI.start(); } catch (e) { console.error("Session start error", e); }
      }
    } catch (err) {
      console.error("[AuthContext] Login error:", err);

      // Map Firebase error codes to user-friendly messages
      const messages = {
        "auth/account-exists-with-different-credential":
          "An account already exists with this email using a different sign-in method.",
        "auth/cancelled-popup-request": null, // Silent — user clicked multiple times
        "auth/popup-closed-by-user": null, // Silent — user closed the popup
        "auth/network-request-failed":
          "Network error. Please check your connection and try again.",
        "auth/too-many-requests":
          "Too many login attempts. Please wait a moment and try again.",
        "auth/user-disabled":
          "This account has been disabled. Please contact support.",
      };

      const friendlyMessage = messages[err.code];
      if (friendlyMessage === null) {
        // Silent error — don't show anything
        setLoading(false);
        return;
      }

      setError(friendlyMessage || "Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await logOut();
      setUser(null);
    } catch (err) {
      console.error("[AuthContext] Logout error:", err);
      setError("Failed to sign out. Please try again.");
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const signUpWithEmail = useCallback(async (email, password, username) => {
    setError(null);
    setLoading(true);
    try {
      await firebaseSignUpWithEmail(email, password, username);
      // Wait for user to verify email, do not auto-login and set token yet.
    } catch (err) {
      console.error("[AuthContext] Signup error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email is already registered. Please sign in.");
      } else {
        setError(err.message || "Failed to create account.");
      }
      throw err; // Re-throw to let the UI know it failed
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const result = await firebaseSignInWithEmail(email, password);
      if (result?.user) {
        // Sync with TrustOS backend to get JWT token
        const res = await authAPI.googleLogin({
          email: result.user.email,
          username: result.user.displayName || result.user.email.split("@")[0],
          uid: result.user.uid
        });
        localStorage.setItem("token", res.data.access_token);
        try { await sessionAPI.start(); } catch (e) { console.error("Session start error", e); }
      }
    } catch (err) {
      console.error("[AuthContext] Login error:", err);
      if (err.message === "auth/email-not-verified") {
        setError("Please verify your email address before signing in.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else {
        setError("Failed to sign in: " + (err.message || err.toString()));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    loginWithGoogle,
    signUpWithEmail,
    loginWithEmail,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
