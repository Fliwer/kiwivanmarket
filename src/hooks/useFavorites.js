import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/ToastProvider';

/**
 * Hook custom pour gérer les favoris avec Firebase
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, loading: authLoading } = useAuth();
  const toast = useToast();

  // 📡 Charger les favoris depuis Firebase au montage
  useEffect(() => {
    // Attendre que l'auth soit terminée
    if (authLoading) {
      return;
    }

    if (!currentUser) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    // ⚡ Écouter les changements en temps réel
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favs = snapshot.docs.map(doc => doc.data().vanId);
      setFavorites(favs);
      setLoading(false);
      console.log('❤️ Favoris chargés:', favs.length);
    }, (error) => {
      console.error('❌ Erreur lors du chargement des favoris:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, authLoading]);

  /**
   * Ajouter/Retirer un van des favoris
   * @param {string} vanId - ID du van
   */
  const toggleFavorite = async (vanId) => {
    if (!currentUser) {
      toast.info('Please sign in to save favorites');
      return;
    }

    try {
      const favoriteId = `${currentUser.uid}_${vanId}`;
      const favoriteRef = doc(db, 'favorites', favoriteId);

      if (favorites.includes(vanId)) {
        await deleteDoc(favoriteRef);
        toast.success('Removed from favorites');
      } else {
        await setDoc(favoriteRef, {
          userId: currentUser.uid,
          vanId: vanId,
          createdAt: new Date()
        });
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la modification des favoris:', error);
      toast.error('Error updating favorites. Please try again.');
    }
  };

  /**
   * Vérifier si un van est dans les favoris
   * @param {string} vanId - ID du van
   * @returns {boolean}
   */
  const isFavorite = (vanId) => {
    return favorites.includes(vanId);
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    count: favorites.length
  };
};