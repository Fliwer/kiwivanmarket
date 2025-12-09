// ============================================
// 💳 STRIPE CONFIG - Configuration Stripe
// ============================================
// 
// 🛡️ VERSION 2.0 - SYSTÈME ANTI-FRAUDE
//
// IMPORTANT: Ne jamais exposer la clé secrète côté client !
// Seule la clé publique (pk_) est utilisée ici.
// La clé secrète (sk_) reste côté Firebase Functions.
//
// ============================================

import { loadStripe } from '@stripe/stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';

// ============================================
// 🔧 CONFIGURATION
// ============================================

// Clé publique Stripe (safe to expose)
const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX';

// Initialiser Stripe (singleton)
let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

// ============================================
// 💰 PRICING CONFIG
// ============================================

export const PAYMENT_CONFIG = {
  // Montant minimum de l'acompte
  MIN_DEPOSIT: 500, // NZD
  
  // Pourcentage de l'acompte si prix > seuil
  DEPOSIT_PERCENTAGE: 5, // 5%
  
  // Seuil au-dessus duquel on utilise le pourcentage
  PERCENTAGE_THRESHOLD: 10000, // NZD
  
  // Commission de la plateforme sur l'acompte
  PLATFORM_FEE_PERCENTAGE: 5, // 5% de l'acompte
  
  // Devise
  CURRENCY: 'nzd',
  
  // 🛡️ ANTI-FRAUDE: Délais de sécurité
  SELLER_RESPONSE_DEADLINE_HOURS: 48,    // Vendeur doit répondre en 48h
  BUYER_CONFIRMATION_DEADLINE_HOURS: 72, // Acheteur confirme rencontre en 72h
  RESERVATION_EXPIRY_HOURS: 24,          // Réservation expire si pas payée en 24h
};

// ============================================
// 🧮 HELPERS - Calcul des montants
// ============================================

/**
 * Calcule le montant de l'acompte requis
 * @param {number} vanPrice - Prix du van en NZD
 * @returns {number} Montant de l'acompte en NZD
 */
export const calculateDeposit = (vanPrice) => {
  if (!vanPrice || vanPrice <= 0) return PAYMENT_CONFIG.MIN_DEPOSIT;
  
  if (vanPrice >= PAYMENT_CONFIG.PERCENTAGE_THRESHOLD) {
    // Pour les vans chers, utiliser le pourcentage
    const percentageDeposit = Math.round(vanPrice * (PAYMENT_CONFIG.DEPOSIT_PERCENTAGE / 100));
    return Math.max(percentageDeposit, PAYMENT_CONFIG.MIN_DEPOSIT);
  }
  
  // Pour les vans moins chers, montant fixe
  return PAYMENT_CONFIG.MIN_DEPOSIT;
};

/**
 * Calcule la commission de la plateforme
 * @param {number} depositAmount - Montant de l'acompte
 * @returns {number} Commission en NZD
 */
export const calculatePlatformFee = (depositAmount) => {
  return Math.round(depositAmount * (PAYMENT_CONFIG.PLATFORM_FEE_PERCENTAGE / 100));
};

/**
 * Calcule le montant que le vendeur recevra
 * @param {number} depositAmount - Montant de l'acompte
 * @returns {number} Montant pour le vendeur en NZD
 */
export const calculateSellerPayout = (depositAmount) => {
  const platformFee = calculatePlatformFee(depositAmount);
  return depositAmount - platformFee;
};

/**
 * Obtenir un résumé complet des frais
 * @param {number} vanPrice - Prix du van
 * @returns {Object} Résumé des frais
 */
export const getPaymentSummary = (vanPrice) => {
  const deposit = calculateDeposit(vanPrice);
  const platformFee = calculatePlatformFee(deposit);
  const sellerPayout = calculateSellerPayout(deposit);
  const remainingBalance = vanPrice - deposit;
  
  return {
    vanPrice,
    deposit,
    platformFee,
    sellerPayout,
    remainingBalance,
    currency: PAYMENT_CONFIG.CURRENCY.toUpperCase(),
    formattedDeposit: `$${deposit.toLocaleString()} NZD`,
    formattedRemaining: `$${remainingBalance.toLocaleString()} NZD`,
    formattedFee: `$${platformFee.toLocaleString()} NZD`,
    formattedSellerPayout: `$${sellerPayout.toLocaleString()} NZD`,
  };
};

// ============================================
// 📊 RESERVATION STATUS
// ============================================

export const RESERVATION_STATUS = {
  PENDING: 'pending',           // En attente de paiement
  PAID: 'paid',                 // Payé, attente confirmation vendeur
  CONFIRMED: 'confirmed',       // Vendeur a confirmé
  COMPLETED: 'completed',       // Transaction finalisée (double confirmation)
  CANCELLED: 'cancelled',       // Annulée
  REFUNDED: 'refunded',         // Remboursée
  EXPIRED: 'expired',           // Expirée (vendeur n'a pas répondu 48h)
};

export const RESERVATION_STATUS_LABELS = {
  [RESERVATION_STATUS.PENDING]: { 
    label: 'Pending Payment', 
    color: 'yellow', 
    icon: '⏳',
    description: 'Waiting for payment'
  },
  [RESERVATION_STATUS.PAID]: { 
    label: 'Deposit Paid - Awaiting Seller', 
    color: 'blue', 
    icon: '💳',
    description: 'Your deposit is secure. Seller has 48h to respond.'
  },
  [RESERVATION_STATUS.CONFIRMED]: { 
    label: 'Seller Confirmed', 
    color: 'teal', 
    icon: '✅',
    description: 'Seller confirmed! Arrange a meeting to view the van.'
  },
  [RESERVATION_STATUS.COMPLETED]: { 
    label: 'Completed', 
    color: 'green', 
    icon: '🎉',
    description: 'Transaction complete! Funds released to seller.'
  },
  [RESERVATION_STATUS.CANCELLED]: { 
    label: 'Cancelled', 
    color: 'red', 
    icon: '❌',
    description: 'Reservation cancelled.'
  },
  [RESERVATION_STATUS.REFUNDED]: { 
    label: 'Refunded', 
    color: 'purple', 
    icon: '↩️',
    description: 'Deposit refunded to your account.'
  },
  [RESERVATION_STATUS.EXPIRED]: { 
    label: 'Expired - Auto Refunded', 
    color: 'gray', 
    icon: '⌛',
    description: 'Seller did not respond in time. You have been refunded.'
  },
};

// 🛡️ Statuts où l'argent est retenu par Stripe
export const FUNDS_HELD_STATUSES = [
  RESERVATION_STATUS.PAID,
  RESERVATION_STATUS.CONFIRMED,
];

// 🛡️ Statuts considérés comme "actifs" (van réservé)
export const ACTIVE_RESERVATION_STATUSES = [
  RESERVATION_STATUS.PENDING,
  RESERVATION_STATUS.PAID,
  RESERVATION_STATUS.CONFIRMED,
];

// 🛡️ Statuts où l'acheteur peut annuler avec remboursement
export const CANCELLABLE_WITH_REFUND_STATUSES = [
  RESERVATION_STATUS.PENDING,
  RESERVATION_STATUS.PAID,
];

// ============================================
// 🔗 CLOUD FUNCTIONS - Callable Functions
// ============================================

// URL de base pour les HTTP functions
const FUNCTIONS_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || 'https://us-central1-kiwivanmarket.cloudfunctions.net';

// Pour les fonctions HTTP (onRequest)
export const API_ENDPOINTS = {
  CREATE_CHECKOUT_SESSION: `${FUNCTIONS_BASE_URL}/createCheckoutSession`,
  WEBHOOK: `${FUNCTIONS_BASE_URL}/stripeWebhook`,
};

// ============================================
// 🚀 CLOUD FUNCTIONS HELPERS
// ============================================

/**
 * Appelle une Cloud Function callable
 * @param {string} functionName - Nom de la fonction
 * @param {Object} data - Données à envoyer
 * @returns {Promise} Résultat de la fonction
 */
export const callCloudFunction = async (functionName, data = {}) => {
  const functions = getFunctions();
  const callable = httpsCallable(functions, functionName);
  const result = await callable(data);
  return result.data;
};

/**
 * Confirmer une réservation (vendeur)
 */
export const confirmReservation = async (reservationId) => {
  return callCloudFunction('confirmReservation', { reservationId });
};

/**
 * Annuler une réservation
 */
export const cancelReservation = async (reservationId, reason = '') => {
  return callCloudFunction('cancelReservation', { reservationId, reason });
};

/**
 * Obtenir les détails d'une réservation
 */
export const getReservation = async (reservationId) => {
  return callCloudFunction('getReservation', { reservationId });
};

/**
 * Créer un compte Stripe Connect (vendeur)
 */
export const createStripeConnectAccount = async () => {
  const baseUrl = window.location.origin;
  return callCloudFunction('createStripeConnectAccount', { baseUrl });
};

/**
 * Obtenir le lien vers le dashboard Stripe (vendeur)
 */
export const getStripeDashboardLink = async () => {
  return callCloudFunction('getStripeDashboardLink', {});
};

/**
 * Vérifier le statut Stripe Connect du vendeur
 */
export const checkSellerStripeStatus = async () => {
  return callCloudFunction('checkSellerStripeStatus', {});
};

/**
 * Créer une session de paiement Checkout
 */
export const createCheckoutSession = async (reservationId, vanId, successUrl, cancelUrl, authToken) => {
  const response = await fetch(API_ENDPOINTS.CREATE_CHECKOUT_SESSION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      reservationId,
      vanId,
      successUrl,
      cancelUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return response.json();
};

// ============================================
// 🛡️ HELPERS ANTI-FRAUDE
// ============================================

/**
 * Vérifie si une réservation peut être annulée avec remboursement
 */
export const canCancelWithRefund = (status) => {
  return CANCELLABLE_WITH_REFUND_STATUSES.includes(status);
};

/**
 * Vérifie si les fonds sont retenus
 */
export const areFundsHeld = (status) => {
  return FUNDS_HELD_STATUSES.includes(status);
};

/**
 * Vérifie si la réservation est active
 */
export const isReservationActive = (status) => {
  return ACTIVE_RESERVATION_STATUSES.includes(status);
};

/**
 * Calcule le temps restant avant une deadline
 */
export const getTimeRemaining = (deadline) => {
  if (!deadline) return null;
  
  const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
  const now = new Date();
  const diff = deadlineDate - now;
  
  if (diff <= 0) return { expired: true, text: 'Expired' };
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return { expired: false, text: `${days} day${days > 1 ? 's' : ''} remaining` };
  }
  
  return { expired: false, text: `${hours}h ${minutes}m remaining` };
};

// ============================================
// EXPORT
// ============================================

export default {
  getStripe,
  PAYMENT_CONFIG,
  calculateDeposit,
  calculatePlatformFee,
  calculateSellerPayout,
  getPaymentSummary,
  RESERVATION_STATUS,
  RESERVATION_STATUS_LABELS,
  FUNDS_HELD_STATUSES,
  ACTIVE_RESERVATION_STATUSES,
  API_ENDPOINTS,
  canCancelWithRefund,
  areFundsHeld,
  isReservationActive,
  getTimeRemaining,
  // Cloud Functions
  callCloudFunction,
  confirmReservation,
  cancelReservation,
  getReservation,
  createStripeConnectAccount,
  getStripeDashboardLink,
  checkSellerStripeStatus,
  createCheckoutSession,
};