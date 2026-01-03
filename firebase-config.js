// js/firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// SUAS CONFIGURAÇÕES (pegar no Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "seu-projeto-gurps.firebaseapp.com",
  projectId: "seu-projeto-gurps",
  storageBucket: "seu-projeto-gurps.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Inicializar Firebase UMA VEZ no projeto
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Exportar para usar em outros arquivos
export { db, auth };