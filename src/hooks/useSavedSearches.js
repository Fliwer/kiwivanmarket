import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, deleteDoc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/ToastProvider';

/**
 * Hook custom pour gérer les recherches sauvegardées (alertes acheteur) avec Firebase.
 * Calqué sur useFavorites : écoute temps réel + CRUD.
 */
export const useSavedSearches = () => {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, loading: authLoading } = useAuth();
  const toast = useToast();

  // 📡 Charger les recherches sauvegardées en temps réel
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setSearches([]);
      setLoading(false);
      return;
    }

    const searchesRef = collection(db, 'savedSearches');
    const q = query(searchesRef, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setSearches(list);
      setLoading(false);
    }, (error) => {
      console.error('❌ Erreur chargement recherches sauvegardées:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, authLoading]);

  /**
   * Sauvegarder une nouvelle recherche (= créer une alerte).
   * @param {object} criteria - les filtres actuels
   * @param {string} label - libellé lisible
   * @param {function} showAuth - callback pour ouvrir la modale de connexion
   */
  const addSearch = async (criteria, label, showAuth = null) => {
    if (!currentUser) {
      toast.info('Please sign in to create an alert');
      if (showAuth) showAuth(true);
      return false;
    }

    try {
      await addDoc(collection(db, 'savedSearches'), {
        userId: currentUser.uid,
        criteria: criteria || {},
        label: (label || 'My search').slice(0, 200),
        active: true,
        createdAt: new Date(),
        lastNotifiedAt: null
      });
      toast.success('Alert created — we\'ll email you new matches');
      return true;
    } catch (error) {
      console.error('❌ Erreur création alerte:', error);
      toast.error('Could not create alert. Please try again.');
      return false;
    }
  };

  const removeSearch = async (searchId) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'savedSearches', searchId));
      toast.success('Alert removed');
    } catch (error) {
      console.error('❌ Erreur suppression alerte:', error);
      toast.error('Could not remove alert.');
    }
  };

  const toggleActive = async (searchId, active) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'savedSearches', searchId), {
        active: !active,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('❌ Erreur mise à jour alerte:', error);
      toast.error('Could not update alert.');
    }
  };

  return {
    searches,
    loading,
    addSearch,
    removeSearch,
    toggleActive,
    count: searches.length
  };
};
