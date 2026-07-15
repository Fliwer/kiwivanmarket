import { lazy } from 'react';

// ============================================
// lazyWithReload — React.lazy avec auto-récupération
// ============================================
// Problème résolu : après CHAQUE déploiement, les chunks JS changent de hash
// et les anciens fichiers disparaissent du serveur. Un visiteur dont le HTML
// est périmé (cache CDN/navigateur, onglet resté ouvert) demande l'ancien
// chunk → 404 → ChunkLoadError → écran "Something went wrong". Concrètement :
// clic sur "Sell" = page morte pour tous ces visiteurs (vécu en prod).
//
// Solution : si un import lazy échoue, on recharge UNE fois la page avec un
// cache-buster (?cb=...) pour forcer un HTML frais, puis on réessaie. Un
// garde-fou sessionStorage évite toute boucle infinie.

const RELOAD_FLAG = 'kvm_chunk_reloaded';

export default function lazyWithReload(importer) {
  return lazy(() =>
    importer()
      .then((mod) => {
        // Import OK : on réarme le garde-fou pour les futurs déploiements.
        try { sessionStorage.removeItem(RELOAD_FLAG); } catch (_) { /* no-op */ }
        return mod;
      })
      .catch((error) => {
        let alreadyReloaded = true;
        try {
          alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === '1';
          if (!alreadyReloaded) sessionStorage.setItem(RELOAD_FLAG, '1');
        } catch (_) { /* stockage indisponible : on retente quand même une fois */ alreadyReloaded = false; }

        if (!alreadyReloaded && typeof window !== 'undefined') {
          const { pathname, search } = window.location;
          const sep = search ? '&' : '?';
          // replace() (pas assign) : pas d'entrée d'historique parasite.
          window.location.replace(pathname + search + sep + 'cb=' + Date.now());
          return new Promise(() => { /* la page se recharge, on ne résout jamais */ });
        }
        throw error;
      })
  );
}
