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
    window.scrollTo(0, 0);
  }, []);
};
