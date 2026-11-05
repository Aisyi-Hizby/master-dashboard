import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOVkeYNm2DwvWICMUr0IdlQeI8rGX2HFU",
  authDomain: "hizby-projecyt.firebaseapp.com",
  projectId: "hizby-projecyt",
  storageBucket: "hizby-projecyt.firebasestorage.app",
  messagingSenderId: "248753804460",
  appId: "1:248753804460:web:ac4a5fa251aa8cd380fb09",
  measurementId: "G-HE2CJHDY8L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);