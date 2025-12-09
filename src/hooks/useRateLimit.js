// ============================================
// 🛡️ RATE LIMIT HOOK - Protection anti-spam
// ============================================
//
// Version localStorage - Simple et efficace pour MVP
// Limite le nombre d'actions par utilisateur par période
//
// ============================================

import { useCallback } from 'react';

// Configuration des limites
const RATE_LIMITS = {
  // Création de vans : max 5 par jour
  createVan: {
    maxActions: 5,
    windowMs: 24 * 60 * 60 * 1000, // 24 heures
    errorMessage: "⚠️ You've reached the limit of 5 van listings per day. Please try again tomorrow."
  },
  // Envoi de messages : max 30 par heure
  sendMessage: {
    maxActions: 30,
    windowMs: 60 * 60 * 1000, // 1 heure
    errorMessage: "⚠️ You're sending messages too fast. Please wait a few minutes."
  },
  // Création de conversations : max 10 par heure
  createConversation: {
    maxActions: 10,
    windowMs: 60 * 60 * 1000, // 1 heure
    errorMessage: "⚠️ You've started too many conversations. Please wait a bit."
  },
  // Ajout aux favoris : max 50 par heure
  addFavorite: {
    maxActions: 50,
    windowMs: 60 * 60 * 1000, // 1 heure
    errorMessage: "⚠️ You're adding favorites too fast. Please slow down."
  }
};

/**
 * Hook pour gérer le rate limiting côté client (localStorage)
 * @param {string} userId - ID de l'utilisateur (optionnel, pour distinguer les users)
 * @returns {Object} - Fonctions de rate limiting
 */
export const useRateLimit = (userId = 'anonymous') => {
  
  /**
   * Vérifie si l'utilisateur peut effectuer une action
   * @param {string} actionType - Type d'action (createVan, sendMessage, etc.)
   * @returns {{ allowed: boolean, error?: string, remaining?: number }}
   */
  const checkRateLimit = useCallback((actionType) => {
    const config = RATE_LIMITS[actionType];
    if (!config) {
      console.warn(`Unknown action type: ${actionType}`);
      return { allowed: true };
    }

    const key = `rateLimit_${userId}_${actionType}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      const stored = localStorage.getItem(key);
      const timestamps = stored ? JSON.parse(stored) : [];
      
      // Filtrer les timestamps dans la fenêtre active
      const recentTimestamps = timestamps.filter(ts => ts > windowStart);
      
      if (recentTimestamps.length >= config.maxActions) {
        // Limite atteinte - calculer quand ça reset
        const oldestTimestamp = Math.min(...recentTimestamps);
        const resetTime = new Date(oldestTimestamp + config.windowMs);
        
        return { 
          allowed: false, 
          error: config.errorMessage,
          resetAt: resetTime,
          remaining: 0
        };
      }
      
      return { 
        allowed: true, 
        remaining: config.maxActions - recentTimestamps.length
      };
      
    } catch (error) {
      console.error('Rate limit check error:', error);
      // En cas d'erreur localStorage, on autorise (fail-open)
      return { allowed: true };
    }
  }, [userId]);

  /**
   * Enregistre une action effectuée
   * @param {string} actionType - Type d'action
   */
  const recordAction = useCallback((actionType) => {
    const config = RATE_LIMITS[actionType];
    if (!config) return;

    const key = `rateLimit_${userId}_${actionType}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      const stored = localStorage.getItem(key);
      const timestamps = stored ? JSON.parse(stored) : [];
      
      // Nettoyer les vieux timestamps et ajouter le nouveau
      const recentTimestamps = timestamps.filter(ts => ts > windowStart);
      recentTimestamps.push(now);
      
      localStorage.setItem(key, JSON.stringify(recentTimestamps));
    } catch (error) {
      console.error('Rate limit record error:', error);
      // Ne pas bloquer l'action si l'enregistrement échoue
    }
  }, [userId]);

  /**
   * Vérifie ET enregistre une action en une seule fonction
   * @param {string} actionType - Type d'action
   * @returns {{ allowed: boolean, error?: string }}
   */
  const checkAndRecord = useCallback((actionType) => {
    const result = checkRateLimit(actionType);
    
    if (result.allowed) {
      recordAction(actionType);
    }
    
    return result;
  }, [checkRateLimit, recordAction]);

  /**
   * Réinitialise le compteur pour un type d'action (utile pour tests)
   * @param {string} actionType - Type d'action
   */
  const resetLimit = useCallback((actionType) => {
    const key = `rateLimit_${userId}_${actionType}`;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Rate limit reset error:', error);
    }
  }, [userId]);

  return {
    checkRateLimit,
    recordAction,
    checkAndRecord,
    resetLimit,
    limits: RATE_LIMITS
  };
};

export default useRateLimit;