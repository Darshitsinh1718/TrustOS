// src/lib/firestore.js
// Firestore user profile management — create-on-first-login, update-on-return
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Create or update a user document in Firestore.
 *
 * - First-time users: creates the full document with createdAt
 * - Returning users: updates only lastLoginAt (never overwrites existing data)
 *
 * Uses setDoc with merge:true so it never destroys fields added by other
 * parts of the app (e.g., future role, subscription, preferences).
 *
 * @param {import("firebase/auth").User} firebaseUser
 * @returns {Promise<void>}
 */
export async function createOrUpdateUser(firebaseUser) {
  if (!firebaseUser) return;

  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // Returning user — only update lastLoginAt
    await setDoc(
      userRef,
      { lastLoginAt: serverTimestamp() },
      { merge: true }
    );
  } else {
    // New user — create the full document
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  }
}

/**
 * Fetch a user's Firestore profile.
 *
 * @param {string} uid
 * @returns {Promise<object|null>} User data or null if not found
 */
export async function getUserProfile(uid) {
  if (!uid) return null;

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }

  return null;
}
