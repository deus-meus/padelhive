import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

const env = ((typeof import.meta !== "undefined" && import.meta.env) ||
  {}) as Record<string, string | undefined>;

const firebaseConfig = {
  apiKey:
    env.VITE_FIREBASE_API_KEY ||
    env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDM1E7HgH5WQjdHiUGAr04FJLnLsKoDBtE",
  authDomain:
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "padelhive-89c92.firebaseapp.com",
  projectId:
    env.VITE_FIREBASE_PROJECT_ID ||
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "padelhive-89c92",
  storageBucket:
    env.VITE_FIREBASE_STORAGE_BUCKET ||
    env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "padelhive-89c92.firebasestorage.app",
  messagingSenderId:
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "1050034071060",
  appId:
    env.VITE_FIREBASE_APP_ID ||
    env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:1050034071060:web:bf38e90b5139499d6d2901",
};

const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
