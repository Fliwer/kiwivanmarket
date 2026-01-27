// ============================================
// 👑 ADMIN HELPER - Fonctions utilitaires admin
// ============================================

/**
 * Vérifie si un utilisateur est admin (via custom claim)
 * @param {Object} user - L'objet utilisateur (avec isAdmin du AuthContext)
 * @returns {boolean} - true si l'utilisateur est admin
 */
export const isAdmin = (user) => {
  if (!user) return false;
  return user.isAdmin === true;
};

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

/**
 * Vérifie si un utilisateur peut modifier/supprimer un van
 * @param {Object} user - L'objet utilisateur de Firebase Auth
 * @param {Object} van - Le van à vérifier
 * @returns {boolean} - true si l'utilisateur peut modifier le van
 */
export const canEditVan = (user, van) => {
  if (!user) return false;

  // Les admins peuvent tout modifier
  if (isAdmin(user)) return true;

  // Les utilisateurs normaux peuvent seulement modifier leurs propres vans
  return van.seller?.uid === user.uid;
};

/**
 * Vérifie si un utilisateur peut supprimer un van
 * @param {Object} user - L'objet utilisateur de Firebase Auth
 * @param {Object} van - Le van à vérifier
 * @returns {boolean} - true si l'utilisateur peut supprimer le van
 */
export const canDeleteVan = (user, van) => {
  // Même logique que canEditVan pour l'instant
  return canEditVan(user, van);
};
