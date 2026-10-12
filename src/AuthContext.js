// Import des fonctions Firebase necessaires
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { auth, db } from './firebase';

// GA — event d'inscription (métrique funnel). Garde gtag pour ne jamais casser
// l'auth si l'analytics n'est pas chargé (adblock, etc.).
const trackSignUp = (method) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'sign_up', { method });
  }
};

// Creation du contexte
const AuthContext = createContext();
const GOOGLE_REDIRECT_KEY = 'kiwivan.googleRedirect';

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
  const googleSignInRef = useRef(null);
  const redirectResultRef = useRef(null);
  const [googleSignInError, setGoogleSignInError] = useState(null);

  const finishGoogleSignIn = async (result) => {
    const user = result?.user;
    if (!user) {
      const error = new Error('Google did not return a user');
      error.code = 'auth/redirect-incomplete';
      throw error;
    }
    try {
      await saveUserProfile(user);
    } catch (cause) {
      console.error('Google profile persistence failed:', cause?.code || 'unknown');
      const error = new Error('Could not complete the account profile', { cause });
      error.code = cause?.code === 'permission-denied' ? 'auth/profile-access-denied' : 'auth/profile-unavailable';
      throw error;
    }
    if (auth.currentUser?.uid !== user.uid) {
      const error = new Error('Google session changed before sign-in completed');
      error.code = 'auth/session-changed';
      throw error;
    }
    setCurrentUser((previous) => previous?.uid === user.uid
      ? { ...previous, email: user.email, emailVerified: user.emailVerified }
      : user);
    try {
      if (getAdditionalUserInfo(result)?.isNewUser) trackSignUp('google');
    } catch (_) {}
    return user;
  };

  // Connexion avec Google (email automatiquement vérifié par Google)
  const signInWithGoogle = () => {
    if (googleSignInRef.current) return googleSignInRef.current;
    setGoogleSignInError(null);
    const provider = new GoogleAuthProvider();
    
    // Forcer Google a TOUJOURS afficher le selecteur de compte
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    // Use the same full-page flow on every device when helpers share the app
    // origin. Retain popup sign-in for local/preview configurations only.
    if (auth.config.authDomain === window.location.hostname) {
      sessionStorage.setItem(GOOGLE_REDIRECT_KEY, 'pending');
      const redirect = signInWithRedirect(auth, provider)
        .then(() => ({ redirecting: true }))
        .catch((error) => { sessionStorage.removeItem(GOOGLE_REDIRECT_KEY); throw error; })
        .finally(() => { googleSignInRef.current = null; });
      googleSignInRef.current = redirect;
      return redirect;
    }

    // Firebase creates a Google account on first sign-in. Complete the app
    // profile before reporting success, without replacing an existing profile.
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new Error('Google sign-in timed out');
        error.code = 'auth/timeout';
        reject(error);
      }, 90000);
    });
    const completeSignIn = signInWithPopup(auth, provider).then(finishGoogleSignIn);
    const attempt = Promise.race([completeSignIn, timeout]).finally(() => {
      clearTimeout(timeoutId);
      googleSignInRef.current = null;
    });
    googleSignInRef.current = attempt;
    return attempt;
  };

  useEffect(() => {
    // A browser Back action can restore the pre-login page from bfcache with
    // its old pending promise. Reload once to process/cancel the stored return.
    const resume = (event) => {
      try {
        if (event.persisted && sessionStorage.getItem(GOOGLE_REDIRECT_KEY)) window.location.reload();
      } catch (_) {}
    };
    window.addEventListener('pageshow', resume);
    let pending = false;
    try {
      pending = !!sessionStorage.getItem(GOOGLE_REDIRECT_KEY);
    } catch (_) {}
    let active = true;
    if (pending) {
      if (!redirectResultRef.current) redirectResultRef.current = getRedirectResult(auth);
      redirectResultRef.current.then(async (result) => {
        if (!active) return;
        await finishGoogleSignIn(result);
      }).catch((error) => {
        if (active) setGoogleSignInError(error.code || 'auth/redirect-incomplete');
      }).finally(() => {
        if (active) sessionStorage.removeItem(GOOGLE_REDIRECT_KEY);
      });
    }
    return () => { active = false; window.removeEventListener('pageshow', resume); };
    // Process the redirect once, including React StrictMode's effect replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // GA — nouveau compte email
      trackSignUp('email');

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

  // ✅ MOT DE PASSE OUBLIÉ - Envoyer un lien de réinitialisation
  const resetPassword = async (email) => {
    if (!email || !email.trim()) {
      throw new Error('Please enter your email address first');
    }
    await sendPasswordResetEmail(auth, email.trim(), {
      url: window.location.origin
    });
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

      if (isVerified) {
        // ✅ Forcer le rafraîchissement du token : reload() met à jour la
        // propriété JS emailVerified mais PAS le claim `email_verified` du token
        // ID. Sans ce force-refresh, les règles Firestore (hasVerifiedEmail)
        // continuent de voir email_verified=false et refusent la publication.
        // (Pas d'écriture users.emailVerified : refusée par les règles.)
        await auth.currentUser.getIdToken(true);
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
    
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        transaction.set(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: (displayName || user.displayName || 'Anonymous').slice(0, 100),
          photoURL: user.photoURL || null,
          emailVerified: user.emailVerified || false,
          createdAt: new Date(),
          lastLogin: new Date()
        });
      } else {
        // Preserve existing profile fields; verification remains sourced from Auth.
        transaction.set(userRef, { lastLogin: new Date() }, { merge: true });
      }
    });
  };

  // Ecouter les changements d'etat d'authentification
  useEffect(() => {
    let active = true;
    let revision = 0;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const currentRevision = ++revision;
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
          if (!active || currentRevision !== revision || auth.currentUser?.uid !== user.uid) return;

          if (userSnap.exists()) {
            // Fusionner les donnees Firestore avec l'user Firebase Auth
            setCurrentUser(prev => prev?.uid === user.uid ? ({
              ...prev,
              ...userSnap.data(),
              uid: user.uid,
              email: user.email,
              // ✅ S'assurer que emailVerified vient de Firebase Auth (source de vérité)
              emailVerified: user.emailVerified,
              isAdmin
            }) : prev);
          } else {
            setCurrentUser(prev => prev?.uid === user.uid ? ({
              ...prev,
              isAdmin
            }) : prev);
          }
        } catch (error) {
          console.error('Erreur chargement profil Firestore:', error);
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => { active = false; ++revision; unsubscribe(); };
  }, []);

  // ✅ Détection AUTOMATIQUE de la vérification e-mail.
  // refreshEmailVerification() existait mais n'était appelé nulle part : un
  // utilisateur email/mot de passe qui cliquait le lien de vérification restait
  // bloqué à emailVerified=false pour toute sa session → publication refusée
  // (SellPage l.193) même après avoir vérifié. C'est pire sur mobile, où le lien
  // s'ouvre dans une autre app puis on revient sur l'onglet sans rechargement.
  // On sonde tant que non vérifié + on re-vérifie au retour sur l'onglet, et on
  // force le refresh du token pour propager le claim email_verified aux règles.
  useEffect(() => {
    if (!currentUser || currentUser.emailVerified) return;

    let cancelled = false;

    const checkVerified = async () => {
      if (cancelled || !auth.currentUser) return;
      try {
        await auth.currentUser.reload();
        if (!cancelled && auth.currentUser.emailVerified) {
          await auth.currentUser.getIdToken(true);
          setCurrentUser(prev => (prev ? { ...prev, emailVerified: true } : prev));
          // NB : pas d'écriture users.emailVerified ici — les règles Firestore
          // la refusent (onlyUpdating) ; la source de vérité est le token Auth.
        }
      } catch (_) { /* réseau indisponible : on réessaiera au prochain tick */ }
    };

    const intervalId = setInterval(checkVerified, 4000);
    const onVisible = () => { if (document.visibilityState === 'visible') checkVerified(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    checkVerified(); // vérification immédiate au montage

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
    // On dépend volontairement des primitives (uid + emailVerified) et non de
    // l'objet currentUser, qui change d'identité à chaque ré-enrichissement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, currentUser?.emailVerified]);

  // Valeurs exposees par le contexte
  const value = {
    currentUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    loading,
    googleSignInError,
    clearGoogleSignInError: () => setGoogleSignInError(null),
    // ✅ Nouvelles fonctions pour la vérification email
    resendVerificationEmail,
    refreshEmailVerification,
    canPerformActions,
    // ✅ Mot de passe oublié
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
