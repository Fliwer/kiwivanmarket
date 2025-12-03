// ============================================
// 💳 STRIPE CONFIG - Configuration Stripe
// ============================================
// 
// IMPORTANT: Ne jamais exposer la clé secrète côté client !
// Seule la clé publique (pk_) est utilisée ici.
// La clé secrète (sk_) reste côté Firebase Functions.
//
// ============================================

import { loadStripe } from '@stripe/stripe-js';

// ============================================
// 🔧 CONFIGURATION
// ============================================

// Clé publique Stripe (safe to expose)
// REMPLACE par ta vraie clé publique !
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
  
  // Durée de validité de la réservation (en jours)
  RESERVATION_VALIDITY_DAYS: 7,
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
  PENDING: 'pending',         // En attente de paiement
  PAID: 'paid',               // Acompte payé
  CONFIRMED: 'confirmed',     // Confirmé par le vendeur
  COMPLETED: 'completed',     // Transaction finalisée
  CANCELLED: 'cancelled',     // Annulée
  REFUNDED: 'refunded',       // Remboursée
  EXPIRED: 'expired',         // Expirée
};

export const RESERVATION_STATUS_LABELS = {
  [RESERVATION_STATUS.PENDING]: { label: 'Pending Payment', color: 'yellow', icon: '⏳' },
  [RESERVATION_STATUS.PAID]: { label: 'Deposit Paid', color: 'blue', icon: '💳' },
  [RESERVATION_STATUS.CONFIRMED]: { label: 'Confirmed', color: 'green', icon: '✅' },
  [RESERVATION_STATUS.COMPLETED]: { label: 'Completed', color: 'emerald', icon: '🎉' },
  [RESERVATION_STATUS.CANCELLED]: { label: 'Cancelled', color: 'red', icon: '❌' },
  [RESERVATION_STATUS.REFUNDED]: { label: 'Refunded', color: 'purple', icon: '↩️' },
  [RESERVATION_STATUS.EXPIRED]: { label: 'Expired', color: 'gray', icon: '⌛' },
};

// ============================================
// 🔗 API ENDPOINTS
// ============================================

// URL de base pour les Firebase Functions
const FUNCTIONS_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || 'https://us-central1-YOUR-PROJECT.cloudfunctions.net';

export const API_ENDPOINTS = {
  CREATE_CHECKOUT_SESSION: `${FUNCTIONS_BASE_URL}/createCheckoutSession`,
  CONFIRM_PAYMENT: `${FUNCTIONS_BASE_URL}/confirmPayment`,
  CANCEL_RESERVATION: `${FUNCTIONS_BASE_URL}/cancelReservation`,
  GET_RESERVATION: `${FUNCTIONS_BASE_URL}/getReservation`,
  WEBHOOK: `${FUNCTIONS_BASE_URL}/stripeWebhook`,
};

export default {
  getStripe,
  PAYMENT_CONFIG,
  calculateDeposit,
  calculatePlatformFee,
  calculateSellerPayout,
  getPaymentSummary,
  RESERVATION_STATUS,
  RESERVATION_STATUS_LABELS,
  API_ENDPOINTS,
};
