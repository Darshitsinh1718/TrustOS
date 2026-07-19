// src/lib/firebase.js
// Centralized Firebase initialization — single source of truth
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBGql0hLdkIuSoEFsI2hf3ELHSTbfX4zY0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "trustos-a42e3.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "trustos-a42e3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "trustos-a42e3.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "908164131588",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:908164131588:web:61da8037e5f5d3c67fbe51",
};

// Validate that all required env vars are present
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(
    `[Firebase] Missing environment variables: ${missingKeys.join(", ")}. ` +
    `Make sure your .env file has all VITE_FIREBASE_* variables set.`
  );
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
