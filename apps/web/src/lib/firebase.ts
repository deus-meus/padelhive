import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { env as publicEnv } from "$env/dynamic/public";

const env = {
  ...publicEnv,
  ...((typeof import.meta !== "undefined" && import.meta.env) || {}),
} as unknown as Record<string, string | undefined>;

const firebaseConfig = {
  apiKey:
    env.PUBLIC_FIREBASE_API_KEY ||
    env.VITE_FIREBASE_API_KEY ||
    env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "",
  authDomain:
    env.PUBLIC_FIREBASE_AUTH_DOMAIN ||
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "",
  projectId:
    env.PUBLIC_FIREBASE_PROJECT_ID ||
    env.VITE_FIREBASE_PROJECT_ID ||
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "",
  storageBucket:
    env.PUBLIC_FIREBASE_STORAGE_BUCKET ||
    env.VITE_FIREBASE_STORAGE_BUCKET ||
    env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "",
  messagingSenderId:
    env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "",
  appId:
    env.PUBLIC_FIREBASE_APP_ID ||
    env.VITE_FIREBASE_APP_ID ||
    env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "",
};

const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
