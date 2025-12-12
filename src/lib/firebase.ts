import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- PASTE YOUR FIREBASE KEYS BELOW ---
// (You copied these from the Firebase Console earlier)
const firebaseConfig = {
  apiKey: "AIzaSyBsh7YTH_rvjygHhODCJjmHgHMF7zDU5SA",
  authDomain: "vishwaas-academy.firebaseapp.com",
  projectId: "vishwaas-academy",
  storageBucket: "vishwaas-academy.firebasestorage.app",
  messagingSenderId: "430633643742",
  appId: "1:430633643742:web:a97bb0f235ed151d685c4f",
  measurementId: "G-QDMWG7J6X9"
};
// Initialize Firebase (Prevents errors if it's already running)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);