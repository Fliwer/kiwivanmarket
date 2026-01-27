// ============================================
// 🔐 ADMIN HELPER - Fonctions utilitaires admin SÉCURISÉES
// ============================================
//
// IMPORTANT: La vérification admin côté client est INDICATIVE seulement.
// La vraie sécurité est assurée par les Firestore Security Rules
// et les Firebase Custom Claims.
//
// ============================================

// ============================================
// 🔐 FONCTIONS DE VÉRIFICATION
// ============================================

/**
 * Vérifie si un utilisateur est admin (via custom claim exposé par AuthContext)
 *
 * @param {Object} user - L'objet utilisateur (avec isAdmin du AuthContext)
 * @returns {boolean} - true si l'utilisateur est admin
 */
export const isAdmin = (user) => {
  if (!user) return false;
  return user.isAdmin === true;
};

/**
 * Version synchrone pour l'UI (même logique, le claim est déjà dans l'objet)
 */
export const isAdminSync = (user) => {
  return isAdmin(user);
};

/**
 * Invalide le cache admin (no-op, cache is no longer used)
 */
export const clearAdminCache = () => {};

// ============================================
// 🎨 COMPOSANTS UI
// ============================================

/**
 * Composant Badge Admin
 * Affiche un badge "ADMIN" si l'utilisateur est admin
 */
export const AdminBadge = ({ user }) => {
  if (!isAdmin(user)) return null;

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
 */
export const canEditVan = (user, van) => {
  if (!user) return false;

  // Propriétaire du van
  if (van.seller?.uid === user.uid) return true;

  // Admin
  return isAdmin(user);
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
  return isAdmin(user);
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
