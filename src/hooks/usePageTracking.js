import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * QW2 — Envoie un événement GA `page_view` à chaque changement de route.
 * Indispensable en SPA : sans ça, Google Analytics ne compte que le
 * chargement initial (toutes les vues étaient attribuées à la home).
 *
 * Le `send_page_view: false` est posé dans public/index.html pour que
 * TOUTES les vues (y compris la première) passent par ce hook — évite le
 * double comptage de la page d'accueil.
 */
export function usePageTracking() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: pathname + search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, search]);
}

export default usePageTracking;
