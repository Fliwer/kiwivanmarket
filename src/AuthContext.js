// Import des fonctions Firebase necessaires
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

// Creation du contexte
const AuthContext = createContext();

// Hook personnalise pour utiliser le contexte facilement
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
    
    // Forcer Google a TOUJOURS afficher le selecteur de compte
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      // Deconnecter l'utilisateur actuel AVANT de connecter le nouveau
      if (auth.currentUser) {
        await signOut(auth);
      }
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Sauvegarder le profil en arriere-plan (ne pas attendre)
      // Le modal se ferme immediatement apres la connexion Google
      saveUserProfile(user).catch(err => console.error('Erreur sauvegarde profil:', err));
      
      return user;
    } catch (error) {
      console.error('Erreur connexion Google:', error);
      throw error;
    }
  };

  // Connexion avec Email/Password
  const signInWithEmail = async (email, password) => {
    try {
      // Deconnecter l'utilisateur actuel AVANT de connecter le nouveau
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
      // Deconnecter l'utilisateur actuel AVANT de creer le nouveau compte
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

  // Deconnexion
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur deconnexion:', error);
      throw error;
    }
  };

  // Sauvegarder le profil utilisateur dans Firestore
  const saveUserProfile = async (user, displayName = null) => {
    const userRef = doc(db, 'users', user.uid);
    
    // Verifier si le profil existe deja
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Creer un nouveau profil
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName || 'Anonymous',
        photoURL: user.photoURL || null,
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } else {
      // Mettre a jour la derniere connexion
      await setDoc(userRef, {
        lastLogin: new Date()
      }, { merge: true });
    }
  };

  // Ecouter les changements d'etat d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // L'utilisateur est connecte
        // Recuperer les infos depuis Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setCurrentUser({ ...user, ...userSnap.data() });
        } else {
          setCurrentUser(user);
        }
      } else {
        // L'utilisateur est deconnecte
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup
    return unsubscribe;
  }, []);

  // Valeurs exposees par le contexte
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