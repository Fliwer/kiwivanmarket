// Import des fonctions Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase - VOS clés
const firebaseConfig = {
  apiKey: "AIzaSyD5AZEcz4wr4VebmwKASBMT_1kTyJGWzhI",
  authDomain: "kiwivanmarket.firebaseapp.com",
  projectId: "kiwivanmarket",
  storageBucket: "kiwivanmarket.firebasestorage.app",
  messagingSenderId: "658498951752",
  appId: "1:658498951752:web:930cf7d8ccf19c68c0967d"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Export des services pour utilisation dans l'app
export const auth = getAuth(app);        // Pour l'authentification
export const db = getFirestore(app);     // Pour la base de données
export const storage = getStorage(app);  // Pour le stockage d'images