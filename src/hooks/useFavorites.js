import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

/**
 * Hook custom pour gérer les favoris avec Firebase
 * - Sauvegarde automatique dans Firebase
 * - Synchronisation en temps réel
 * - Persistant entre sessions
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, authLoading } = useAuth();

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
      alert('Please sign in to save favorites');
      return;
    }

    try {
      const favoriteId = `${currentUser.uid}_${vanId}`;
      const favoriteRef = doc(db, 'favorites', favoriteId);

      if (favorites.includes(vanId)) {
        // Retirer des favoris
        await deleteDoc(favoriteRef);
        console.log('💔 Retiré des favoris:', vanId);
      } else {
        // Ajouter aux favoris
        await setDoc(favoriteRef, {
          userId: currentUser.uid,
          vanId: vanId,
          addedAt: new Date().toISOString()
        });
        console.log('❤️ Ajouté aux favoris:', vanId);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la modification des favoris:', error);
      alert('Error updating favorites. Please try again.');
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