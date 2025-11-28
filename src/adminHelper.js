// ============================================
// 🔐 ADMIN HELPER - Fonctions utilitaires admin SÉCURISÉES
// ============================================
// 
// IMPORTANT: La vérification admin côté client est INDICATIVE seulement.
// La vraie sécurité est assurée par les Firestore Security Rules.
// Un utilisateur malveillant peut contourner le code client,
// mais sera bloqué par Firestore.
//
// ============================================

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// 🔧 CONFIGURATION
// ============================================

// Liste des emails admin (fallback - la vraie vérif est côté Firestore)
// NE PAS exposer d'infos sensibles ici
const ADMIN_EMAILS = [
  'p.morthier@gmail.com',
];

// Cache pour éviter les requêtes répétées
const adminCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============================================
// 🔐 FONCTIONS DE VÉRIFICATION
// ============================================

/**
 * Vérifie si un utilisateur est admin
 * Utilise les custom claims Firebase si disponibles,
 * sinon vérifie dans Firestore, sinon fallback sur email
 * 
 * @param {Object} user - L'objet utilisateur de Firebase Auth
 * @returns {Promise<boolean>} - true si l'utilisateur est admin
 */
export const isAdmin = async (user) => {
  if (!user || !user.uid) return false;

  // 1. Vérifier le cache
  const cached = adminCache.get(user.uid);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.isAdmin;
  }

  try {
    // 2. Vérifier les custom claims (méthode recommandée)
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult.claims.admin === true) {
      adminCache.set(user.uid, { isAdmin: true, timestamp: Date.now() });
      return true;
    }

    // 3. Vérifier dans Firestore (collection admins ou champ dans users)
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (adminDoc.exists() && adminDoc.data().active === true) {
      adminCache.set(user.uid, { isAdmin: true, timestamp: Date.now() });
      return true;
    }

    // 4. Fallback sur email (temporaire - à supprimer en prod)
    const isEmailAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase());
    adminCache.set(user.uid, { isAdmin: isEmailAdmin, timestamp: Date.now() });
    return isEmailAdmin;

  } catch (error) {
    // En cas d'erreur, fallback sécurisé sur email
    console.warn('Admin check error, using fallback:', error.message);
    return ADMIN_EMAILS.includes(user.email?.toLowerCase());
  }
};

/**
 * Version synchrone pour l'UI (utilise le cache ou email)
 * NE PAS utiliser pour des décisions de sécurité critiques
 */
export const isAdminSync = (user) => {
  if (!user || !user.uid) return false;
  
  // Vérifier le cache
  const cached = adminCache.get(user.uid);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.isAdmin;
  }
  
  // Fallback sur email (indicatif seulement)
  return ADMIN_EMAILS.includes(user.email?.toLowerCase());
};

/**
 * Invalide le cache admin (à appeler après changement de rôle)
 */
export const clearAdminCache = (userId) => {
  if (userId) {
    adminCache.delete(userId);
  } else {
    adminCache.clear();
  }
};

// ============================================
// 🎨 COMPOSANTS UI
// ============================================

/**
 * Composant Badge Admin
 * Affiche un badge "ADMIN" si l'utilisateur est admin
 */
export const AdminBadge = ({ user }) => {
  if (!isAdminSync(user)) return null;
  
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
      <span>👑</span>
      ADMIN
    </span>
  );
};

// ============================================
// 🔒 FONCTIONS D'AUTORISATION
// ============================================

/**
 * Vérifie si un utilisateur peut modifier un van
 * RAPPEL: La vraie sécurité est dans Firestore Rules
 * 
 * @param {Object} user - L'objet utilisateur
 * @param {Object} van - Le van à vérifier
 * @returns {boolean}
 */
export const canEditVan = (user, van) => {
  if (!user) return false;
  
  // Propriétaire du van
  if (van.seller?.uid === user.uid) return true;
  
  // Admin (vérification synchrone pour l'UI)
  return isAdminSync(user);
};

/**
 * Vérifie si un utilisateur peut supprimer un van
 */
export const canDeleteVan = (user, van) => {
  return canEditVan(user, van);
};

/**
 * Vérifie si un utilisateur peut accéder au dashboard admin
 */
export const canAccessAdminDashboard = (user) => {
  return isAdminSync(user);
};

// ============================================
// 📝 NOTES DE SÉCURITÉ
// ============================================
// 
// 1. Ce fichier fournit des vérifications CÔTÉ CLIENT
//    qui sont facilement contournables par un attaquant.
// 
// 2. La VRAIE sécurité est assurée par:
//    - Firestore Security Rules (firestore.rules)
//    - Firebase Custom Claims (configurés via Admin SDK)
// 
// 3. Les fonctions ici servent à:
//    - Améliorer l'UX (masquer boutons non autorisés)
//    - Éviter des erreurs Firestore inutiles
// 
// 4. Un attaquant peut modifier ce code, mais sera
//    bloqué par Firestore quand il tentera l'action.
//
// ============================================
