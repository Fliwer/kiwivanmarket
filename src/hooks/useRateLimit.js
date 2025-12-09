// ============================================
// useRateLimit.js - Hook de limitation de requêtes
// Protège contre le spam côté client via localStorage
// ============================================

import { useState, useCallback } from 'react';

// Configuration des limites par action
const RATE_LIMITS = {
  createVan: { 
    max: 5, 
    windowMs: 24 * 60 * 60 * 1000, // 24 heures
    errorMessage: "You've reached the limit of 5 van listings per day. Please try again tomorrow."
  },
  sendMessage: { 
    max: 30, 
    windowMs: 60 * 60 * 1000, // 1 heure (30 msg/h)
    errorMessage: "You're sending messages too fast. Please wait a few minutes before sending more."
  },
  createConversation: { 
    max: 10, 
    windowMs: 60 * 60 * 1000, // 1 heure
    errorMessage: "You've started too many conversations. Please wait a bit."
  },
  addFavorite: { 
    max: 50, 
    windowMs: 60 * 60 * 1000, // 1 heure
    errorMessage: "You're adding favorites too fast. Please slow down."
  }
};

/**
 * Hook personnalisé pour le rate limiting côté client
 * @param {string} userId - L'ID de l'utilisateur (pour isoler les limites)
 * @returns {object} - Fonctions de vérification et d'enregistrement
 */
export function useRateLimit(userId) {
  const [, forceUpdate] = useState(0);

  /**
   * Récupère la clé localStorage pour une action
   */
  const getStorageKey = useCallback((actionType) => {
    return `rateLimit_${userId}_${actionType}`;
  }, [userId]);

  /**
   * Récupère les timestamps des actions précédentes
   */
  const getActionTimestamps = useCallback((actionType) => {
    if (!userId) return [];
    
    try {
      const key = getStorageKey(actionType);
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      
      const timestamps = JSON.parse(stored);
      const limit = RATE_LIMITS[actionType];
      const now = Date.now();
      
      // Filtrer les timestamps expirés
      return timestamps.filter(ts => now - ts < limit.windowMs);
    } catch (error) {
      console.error('Erreur lecture rate limit:', error);
      return [];
    }
  }, [userId, getStorageKey]);

  /**
   * Vérifie si l'action est autorisée
   */
  const checkRateLimit = useCallback((actionType) => {
    if (!userId) {
      return { allowed: true, remaining: RATE_LIMITS[actionType]?.max || 0 };
    }
    
    const limit = RATE_LIMITS[actionType];
    if (!limit) {
      console.warn(`Rate limit non défini pour: ${actionType}`);
      return { allowed: true, remaining: 999 };
    }
    
    const timestamps = getActionTimestamps(actionType);
    const remaining = limit.max - timestamps.length;
    
    return {
      allowed: timestamps.length < limit.max,
      remaining: Math.max(0, remaining),
      total: limit.max,
      error: timestamps.length >= limit.max ? limit.errorMessage : null
    };
  }, [userId, getActionTimestamps]);

  /**
   * Enregistre une action effectuée
   */
  const recordAction = useCallback((actionType) => {
    if (!userId) return;
    
    try {
      const key = getStorageKey(actionType);
      const timestamps = getActionTimestamps(actionType);
      timestamps.push(Date.now());
      localStorage.setItem(key, JSON.stringify(timestamps));
      
      // Force re-render pour mettre à jour le compteur
      forceUpdate(n => n + 1);
    } catch (error) {
      console.error('Erreur enregistrement rate limit:', error);
    }
  }, [userId, getStorageKey, getActionTimestamps]);

  /**
   * Vérifie ET enregistre en une seule opération
   */
  const checkAndRecord = useCallback((actionType) => {
    const check = checkRateLimit(actionType);
    
    if (check.allowed) {
      recordAction(actionType);
      return { 
        allowed: true, 
        remaining: check.remaining - 1,
        total: check.total
      };
    }
    
    return check;
  }, [checkRateLimit, recordAction]);

  /**
   * Récupère le nombre d'actions restantes (sans enregistrer)
   */
  const getRemainingActions = useCallback((actionType) => {
    const check = checkRateLimit(actionType);
    return {
      remaining: check.remaining,
      total: check.total || RATE_LIMITS[actionType]?.max || 0,
      allowed: check.allowed
    };
  }, [checkRateLimit]);

  /**
   * Réinitialise le compteur d'une action (utile pour tests)
   */
  const resetLimit = useCallback((actionType) => {
    if (!userId) return;
    
    try {
      const key = getStorageKey(actionType);
      localStorage.removeItem(key);
      forceUpdate(n => n + 1);
    } catch (error) {
      console.error('Erreur reset rate limit:', error);
    }
  }, [userId, getStorageKey]);

  return {
    checkRateLimit,
    recordAction,
    checkAndRecord,
    getRemainingActions,
    resetLimit,
    RATE_LIMITS
  };
}

export default useRateLimit;