import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

// 🔹 Firebase конфігурація (заміни на свої дані)
const firebaseConfig = {
  apiKey: "AIzaSyBMz3Q8if8zoQC666u_PT8X2PZM7dvcAy4",
  authDomain: "telegram-bot-d8d1e.firebaseapp.com",
  projectId: "telegram-bot-d8d1e",
  storageBucket: "telegram-bot-d8d1e.appspot.com",
  messagingSenderId: "56143642693",
  appId: "1:56143642693:web:95b42268cc40b86e00632c",
  measurementId: "G-HGGW3KCFXD"
};

// 🔥 Ініціалізація Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Експортуємо функції для роботи з Firestore
export { db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc };
