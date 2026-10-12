'use strict';

const PRODUCTION_ORIGINS = new Set([
  'https://kiwivanmarket.com',
  'https://www.kiwivanmarket.com',
]);

function isSafeReturnUrl(value, emulator = false) {
  try {
    const url = new URL(value);
    return !url.username && !url.password && (
      PRODUCTION_ORIGINS.has(url.origin) ||
      (emulator && ['http://localhost:3000', 'http://localhost:5173'].includes(url.origin))
    );
  } catch {
    return false;
  }
}

// Real charges remain disabled until the payment lifecycle passes integration tests.
function isTestPaymentKey(key) {
  return typeof key === 'string' && /^(sk|rk)_test_/.test(key);
}

function sessionMatchesReservation(session, reservation, reservationId) {
  return session.payment_status === 'paid' &&
    session.mode === 'payment' &&
    session.id === reservation.checkoutSessionId &&
    typeof session.payment_intent === 'string' &&
    session.metadata?.reservationId === reservationId &&
    session.metadata?.vanId === reservation.vanId &&
    session.metadata?.buyerId === reservation.buyerId &&
    session.metadata?.sellerId === reservation.sellerId &&
    session.currency === 'nzd' &&
    Number.isSafeInteger(session.amount_total) &&
    session.amount_total > 0 &&
    session.amount_total === Math.round(reservation.depositAmount * 100);
}

function refundParameters(reservation, reservationId, uid) {
  return {
    payment_intent: reservation.paymentIntentId,
    reason: 'requested_by_customer',
    reverse_transfer: true,
    refund_application_fee: true,
    metadata: { reservationId, cancelledBy: uid },
  };
}

module.exports = { isSafeReturnUrl, isTestPaymentKey, sessionMatchesReservation, refundParameters };
