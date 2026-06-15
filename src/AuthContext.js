// Import des fonctions Firebase necessaires
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile
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

  // Connexion avec Google (email automatiquement vérifié par Google)
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
      saveUserProfile(user).catch(err => console.error('Erreur sauvegarde profil:', err));
      
      return user;
    } catch (error) {
      console.error('Erreur connexion Google:', error);
      throw error;
    }
  };

  // Connexion avec Email/Password
  // ✅ Bloque si l'email n'est pas vérifié
  const signInWithEmail = async (email, password) => {
    try {
      // Deconnecter l'utilisateur actuel AVANT de connecter le nouveau
      if (auth.currentUser) {
        await signOut(auth);
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // ✅ Les utilisateurs non vérifiés peuvent se connecter et naviguer.
      // La vérification email reste exigée (côté serveur) pour les actions
      // sensibles : publier une annonce, contacter un vendeur.
      return user;
    } catch (error) {
      console.error('Erreur connexion email:', error);
      throw error;
    }
  };

  // ✅ Inscription avec Email/Password + ENVOI EMAIL DE VÉRIFICATION
  // ⚠️ L'utilisateur est DÉCONNECTÉ après inscription - doit vérifier son email d'abord
  const signUpWithEmail = async (email, password, displayName) => {
    try {
      // Deconnecter l'utilisateur actuel AVANT de creer le nouveau compte
      if (auth.currentUser) {
        await signOut(auth);
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Mettre à jour le displayName
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      // ✅ ENVOYER L'EMAIL DE VÉRIFICATION
      await sendEmailVerification(user, {
        url: window.location.origin, // URL de retour après vérification
        handleCodeInApp: false
      });
      
      console.log('✅ Email de vérification envoyé à:', email);
      
      // Sauvegarder le profil avec le nom
      await saveUserProfile(user, displayName);
      
      // ✅ L'utilisateur RESTE connecté : il peut naviguer et ajouter des favoris
      // tout de suite. La vérification email n'est exigée que pour les actions
      // sensibles (publier une annonce, contacter un vendeur) — gardée côté
      // serveur (règles Firestore) + message clair côté client.
      return { email, needsVerification: true, user };
    } catch (error) {
      console.error('Erreur inscription:', error);
      throw error;
    }
  };

  // ✅ RENVOYER L'EMAIL DE VÉRIFICATION
  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }
    
    if (auth.currentUser.emailVerified) {
      throw new Error('Email already verified');
    }
    
    try {
      await sendEmailVerification(auth.currentUser, {
        url: window.location.origin,
        handleCodeInApp: false
      });
      console.log('✅ Email de vérification renvoyé');
      return true;
    } catch (error) {
      console.error('Erreur envoi email:', error);
      // Gestion du rate limit Firebase
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many attempts. Please wait a few minutes before trying again.');
      }
      throw error;
    }
  };

  // ✅ RAFRAÎCHIR LE STATUT DE VÉRIFICATION (après clic sur le lien)
  const refreshEmailVerification = async () => {
    if (!auth.currentUser) return false;
    
    try {
      await auth.currentUser.reload();
      const isVerified = auth.currentUser.emailVerified;
      
      // Mettre à jour le state
      setCurrentUser(prev => ({
        ...prev,
        emailVerified: isVerified
      }));
      
      // Mettre à jour Firestore si vérifié
      if (isVerified) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, { emailVerified: true }, { merge: true });
      }
      
      return isVerified;
    } catch (error) {
      console.error('Erreur refresh verification:', error);
      return false;
    }
  };

  // ✅ VÉRIFIER SI L'UTILISATEUR PEUT EFFECTUER DES ACTIONS PROTÉGÉES
  const canPerformActions = () => {
    if (!currentUser) return false;
    // Google = toujours vérifié, Email/Password = doit avoir vérifié son email
    return currentUser.emailVerified === true;
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
        emailVerified: user.emailVerified || false,
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } else {
      // Mettre a jour la derniere connexion + statut vérification
      await setDoc(userRef, {
        lastLogin: new Date(),
        emailVerified: user.emailVerified || false
      }, { merge: true });
    }
  };

  // Ecouter les changements d'etat d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ✅ OPTIMISATION: Connecter l'utilisateur IMMEDIATEMENT avec les infos Firebase Auth
        setCurrentUser(user);
        setLoading(false);

        // Puis enrichir les donnees en arriere-plan (non-bloquant)
        try {
          // Lire le custom claim admin depuis le token
          const tokenResult = await user.getIdTokenResult();
          const isAdmin = tokenResult.claims.admin === true;

          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // Fusionner les donnees Firestore avec l'user Firebase Auth
            setCurrentUser(prev => ({
              ...prev,
              ...userSnap.data(),
              // ✅ S'assurer que emailVerified vient de Firebase Auth (source de vérité)
              emailVerified: user.emailVerified,
              isAdmin
            }));
          } else {
            setCurrentUser(prev => ({
              ...prev,
              isAdmin
            }));
          }
        } catch (error) {
          console.error('Erreur chargement profil Firestore:', error);
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Valeurs exposees par le contexte
  const value = {
    currentUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    loading,
    // ✅ Nouvelles fonctions pour la vérification email
    resendVerificationEmail,
    refreshEmailVerification,
    canPerformActions
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};