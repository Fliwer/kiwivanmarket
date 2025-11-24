// Import des fonctions Firebase nécessaires
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Création du contexte
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte facilement
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider qui enveloppe l'app
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Connexion avec Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    
    // ✅ FIX: Forcer Google à TOUJOURS afficher le sélecteur de compte
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      // Déconnecter l'utilisateur actuel AVANT de connecter le nouveau
      if (auth.currentUser) {
        await signOut(auth);
      }
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Sauvegarder/mettre à jour le profil dans Firestore
      await saveUserProfile(user);
      
      return user;
    } catch (error) {
      console.error('Erreur connexion Google:', error);
      throw error;
    }
  };

  // Connexion avec Email/Password
  const signInWithEmail = async (email, password) => {
    try {
      // Déconnecter l'utilisateur actuel AVANT de connecter le nouveau
      if (auth.currentUser) {
        await signOut(auth);
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Erreur connexion email:', error);
      throw error;
    }
  };

  // Inscription avec Email/Password
  const signUpWithEmail = async (email, password, displayName) => {
    try {
      // Déconnecter l'utilisateur actuel AVANT de créer le nouveau compte
      if (auth.currentUser) {
        await signOut(auth);
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Sauvegarder le profil avec le nom
      await saveUserProfile(user, displayName);
      
      return user;
    } catch (error) {
      console.error('Erreur inscription:', error);
      throw error;
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      throw error;
    }
  };

  // Sauvegarder le profil utilisateur dans Firestore
  const saveUserProfile = async (user, displayName = null) => {
    const userRef = doc(db, 'users', user.uid);
    
    // Vérifier si le profil existe déjà
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Créer un nouveau profil
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName || 'Anonymous',
        photoURL: user.photoURL || null,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      console.log('✅ Profil utilisateur créé dans Firestore');
    } else {
      // Mettre à jour la dernière connexion
      await setDoc(userRef, {
        lastLogin: new Date()
      }, { merge: true });
      console.log('✅ Dernière connexion mise à jour');
    }
  };

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // L'utilisateur est connecté
        // Récupérer les infos depuis Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setCurrentUser({ ...user, ...userSnap.data() });
        } else {
          setCurrentUser(user);
        }
      } else {
        // L'utilisateur est déconnecté
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup
    return unsubscribe;
  }, []);

  // Valeurs exposées par le contexte
  const value = {
    currentUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
