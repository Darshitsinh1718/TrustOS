// src/lib/auth.js
// Firebase Authentication helpers — Google sign-in with popup/redirect fallback
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

// Request email and profile scopes (default, but explicit for clarity)
googleProvider.addScope("email");
googleProvider.addScope("profile");

// Force account selection on every login — prevents auto-selecting
// the last used account, which is important for multi-user devices
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Sign in with Google.
 * Tries popup first (best UX on desktop), falls back to redirect
 * if the popup is blocked by the browser.
 *
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    // popup-blocked or popup-closed-by-user — fall back to redirect
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/popup-closed-by-user"
    ) {
      await signInWithRedirect(auth, googleProvider);
      // After redirect, the result is picked up by getRedirectResult()
      // in the AuthContext on the next page load
      return null;
    }
    throw error;
  }
}

/**
 * Check for redirect result — called once on app initialization
 * to handle the case where signInWithRedirect was used.
 *
 * @returns {Promise<import("firebase/auth").UserCredential|null>}
 */
export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("[Auth] Redirect result error:", error);
    return null;
  }
}

/**
 * Sign out the current user from Firebase.
 */
export async function logOut() {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 *
 * @param {function} callback - Receives (user | null)
 * @returns {function} unsubscribe
 */
export function onAuthChanged(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Sign up with Email and Password.
 * Creates the user, sets their display name, and sends a verification email.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} username
 */
export async function signUpWithEmail(email, password, username) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  if (result.user) {
    await updateProfile(result.user, { displayName: username });
    await sendEmailVerification(result.user);
  }
  
  return result;
}

/**
 * Sign in with Email and Password.
 * Blocks login if the email is not verified.
 *
 * @param {string} email
 * @param {string} password
 */
export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  
  if (result.user && !result.user.emailVerified) {
    await signOut(auth); // Sign them out immediately
    throw new Error("auth/email-not-verified");
  }
  
  return result;
}
