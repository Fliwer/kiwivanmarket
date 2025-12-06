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
  
  // 🛡️ ANTI-FRAUDE: Délais de sécurité
  SELLER_RESPONSE_DEADLINE_HOURS: 48,    // Vendeur doit répondre en 48h
  BUYER_CONFIRMATION_DEADLINE_HOURS: 72, // Acheteur confirme rencontre en 72h
  RELEASE_DELAY_DAYS: 7,                 // Argent libéré 7 jours après confirmation
  RESERVATION_EXPIRY_HOURS: 24,          // Réservation expire si pas payée en 24h
  DISPUTE_WINDOW_DAYS: 14,               // Fenêtre pour ouvrir un litige
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
// 📊 RESERVATION STATUS - SYSTÈME ANTI-FRAUDE V2
// ============================================

export const RESERVATION_STATUS = {
  PENDING: 'pending',                     // En attente de paiement
  PAID: 'paid',                           // Payé, attente confirmation vendeur
  SELLER_CONFIRMED: 'seller_confirmed',   // 🆕 Vendeur a confirmé
  MEETING_SCHEDULED: 'meeting_scheduled', // 🆕 Rencontre planifiée
  BUYER_CONFIRMED: 'buyer_confirmed',     // 🆕 Acheteur confirme avoir vu le van
  COMPLETED: 'completed',                 // Transaction finalisée, argent libéré
  CANCELLED: 'cancelled',                 // Annulée
  REFUNDED: 'refunded',                   // Remboursée
  EXPIRED: 'expired',                     // Expirée (vendeur n'a pas répondu)
  DISPUTED: 'disputed',                   // 🆕 Litige en cours
  
  // Aliases pour compatibilité avec l'ancien code
  CONFIRMED: 'seller_confirmed',          // Alias
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
  [RESERVATION_STATUS.SELLER_CONFIRMED]: { 
    label: 'Seller Confirmed', 
    color: 'teal', 
    icon: '✅',
    description: 'Seller confirmed! Arrange a meeting to view the van.'
  },
  [RESERVATION_STATUS.MEETING_SCHEDULED]: { 
    label: 'Meeting Scheduled', 
    color: 'indigo', 
    icon: '📅',
    description: 'Meeting arranged. View the van and confirm.'
  },
  [RESERVATION_STATUS.BUYER_CONFIRMED]: { 
    label: 'Confirmed - Funds Pending Release', 
    color: 'emerald', 
    icon: '🔒',
    description: 'Transaction confirmed. Funds will be released in 7 days.'
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
  [RESERVATION_STATUS.DISPUTED]: { 
    label: 'Dispute In Progress', 
    color: 'orange', 
    icon: '⚠️',
    description: 'A dispute has been opened. Our team is reviewing.'
  },
};

// 🛡️ Statuts où l'argent est retenu par Stripe
export const FUNDS_HELD_STATUSES = [
  RESERVATION_STATUS.PAID,
  RESERVATION_STATUS.SELLER_CONFIRMED,
  RESERVATION_STATUS.MEETING_SCHEDULED,
  RESERVATION_STATUS.BUYER_CONFIRMED,
  RESERVATION_STATUS.DISPUTED,
];

// 🛡️ Statuts considérés comme "actifs" (van réservé)
export const ACTIVE_RESERVATION_STATUSES = [
  RESERVATION_STATUS.PENDING,
  RESERVATION_STATUS.PAID,
  RESERVATION_STATUS.SELLER_CONFIRMED,
  RESERVATION_STATUS.MEETING_SCHEDULED,
  RESERVATION_STATUS.BUYER_CONFIRMED,
];

// 🛡️ Statuts où l'acheteur peut annuler avec remboursement
export const CANCELLABLE_WITH_REFUND_STATUSES = [
  RESERVATION_STATUS.PENDING,
  RESERVATION_STATUS.PAID,
];

// 🛡️ Statuts où seul l'admin peut intervenir
export const ADMIN_ONLY_STATUSES = [
  RESERVATION_STATUS.DISPUTED,
];

// ============================================
// 🔗 API ENDPOINTS
// ============================================

// URL de base pour les Firebase Functions
const FUNCTIONS_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || 'https://us-central1-YOUR-PROJECT.cloudfunctions.net';

export const API_ENDPOINTS = {
  // Paiement
  CREATE_CHECKOUT_SESSION: `${FUNCTIONS_BASE_URL}/createCheckoutSession`,
  
  // 🆕 Actions vendeur
  SELLER_CONFIRM: `${FUNCTIONS_BASE_URL}/sellerConfirmReservation`,
  
  // 🆕 Actions acheteur
  BUYER_CONFIRM_MEETING: `${FUNCTIONS_BASE_URL}/buyerConfirmMeeting`,
  
  // Gestion
  CANCEL_RESERVATION: `${FUNCTIONS_BASE_URL}/cancelReservation`,
  GET_RESERVATION: `${FUNCTIONS_BASE_URL}/getReservation`,
  
  // 🆕 Disputes
  OPEN_DISPUTE: `${FUNCTIONS_BASE_URL}/openDispute`,
  
  // 🆕 Admin
  RELEASE_FUNDS: `${FUNCTIONS_BASE_URL}/releaseFunds`,
  
  // Webhook (utilisé par Stripe)
  WEBHOOK: `${FUNCTIONS_BASE_URL}/stripeWebhook`,
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
};