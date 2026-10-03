import { useEffect } from 'react';

/**
 * Hook pour masquer le loader initial app-loader au montage du composant
 * Élimine la duplication de code dans 11 fichiers
 */
export const useHideLoader = () => {
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
    // Pas de window.scrollTo(0, 0) ici : ce hook ne doit que masquer le loader.
    // MainApp le rappelle a chaque retour sur '/', ce qui ecrasait la position
    // restauree par Listings. Le scroll de navigation est gere par ScrollToTop
    // (App.js), qui lui respecte les retours arriere (POP).
  }, []);
};
