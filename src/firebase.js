// Import des fonctions Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase - Utilise les variables d'environnement
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD5AZEcz4wr4VebmwKASBMT_1kTyJGWzhI",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "kiwivanmarket.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "kiwivanmarket",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "kiwivanmarket.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "658498951752",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:658498951752:web:930cf7d8ccf19c68c0967d"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Export des services pour utilisation dans l'app
export const auth = getAuth(app);        // Pour l'authentification
export const db = getFirestore(app);     // Pour la base de données
export const storage = getStorage(app);  // Pour le stockage d'images