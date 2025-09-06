import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "topvan-manager",
  appId: "1:200978356997:web:1dd5b64930451dbf63356c",
  storageBucket: "topvan-manager.firebasestorage.app",
  apiKey: "AIzaSyBcuVrxnr1ZkMfXdfa2tQM6Kh_BzUT9VlQ",
  authDomain: "topvan-manager.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "200978356997"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
