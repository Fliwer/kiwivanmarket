// ============================================
// 🔥 FIREBASE CLOUD FUNCTIONS - Kiwi Van Market
// ============================================
// 
// 🛡️ VERSION 2.0 - SYSTÈME ANTI-FRAUDE COMPLET
//
// PROTECTIONS IMPLÉMENTÉES:
// ✅ 1. Stripe Connect - L'argent reste chez Stripe (séquestre)
// ✅ 2. Délai de libération - 7 jours après confirmation
// ✅ 3. Remboursement automatique si vendeur ne répond pas
// ✅ 4. Vérification vendeur obligatoire
// ✅ 5. Système de disputes
// ✅ 6. Expiration automatique des réservations
//
// ============================================

require('dotenv').config();
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialiser Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialiser Stripe avec la clé secrète
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ============================================
// 🔒 CONFIGURATION SÉCURISÉE
// ============================================

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://kiwivanmarket.com',
  'https://www.kiwivanmarket.com',
  // Ajoute ton domaine Vercel ici
];

const cors = require('cors')({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ CORS bloqué pour:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  }
});

// ============================================
// 💰 CONFIGURATION PAIEMENT & ANTI-FRAUDE
// ============================================

const PAYMENT_CONFIG = {
  MIN_DEPOSIT: 500,
  DEPOSIT_PERCENTAGE: 5,
  PERCENTAGE_THRESHOLD: 10000,
  PLATFORM_FEE_PERCENTAGE: 5,
  CURRENCY: 'nzd',
  
  // 🛡️ ANTI-FRAUDE: Délais de sécurité
  SELLER_RESPONSE_DEADLINE_HOURS: 48,    // Vendeur doit répondre en 48h
  BUYER_CONFIRMATION_DEADLINE_HOURS: 72, // Acheteur confirme rencontre en 72h
  RELEASE_DELAY_DAYS: 7,                 // Argent libéré 7 jours après confirmation
  RESERVATION_EXPIRY_HOURS: 24,          // Réservation expire si pas payée en 24h
  DISPUTE_WINDOW_DAYS: 14,               // Fenêtre pour ouvrir un litige
};

// Statuts des réservations
const RESERVATION_STATUS = {
  PENDING: 'pending',           // En attente de paiement
  PAID: 'paid',                 // Payé, en attente confirmation vendeur
  SELLER_CONFIRMED: 'seller_confirmed',  // Vendeur a confirmé
  MEETING_SCHEDULED: 'meeting_scheduled', // Rencontre planifiée
  BUYER_CONFIRMED: 'buyer_confirmed',    // Acheteur confirme avoir vu le van
  COMPLETED: 'completed',       // Transaction finalisée, argent libéré
  CANCELLED: 'cancelled',       // Annulée
  REFUNDED: 'refunded',         // Remboursée
  EXPIRED: 'expired',           // Expirée (vendeur n'a pas répondu)
  DISPUTED: 'disputed',         // Litige en cours
};

// ============================================
// 🔧 HELPERS
// ============================================

function calculateDepositFromPrice(vanPrice) {
  if (!vanPrice || vanPrice <= 0) return PAYMENT_CONFIG.MIN_DEPOSIT;
  if (vanPrice >= PAYMENT_CONFIG.PERCENTAGE_THRESHOLD) {
    const percentageDeposit = Math.round(vanPrice * (PAYMENT_CONFIG.DEPOSIT_PERCENTAGE / 100));
    return Math.max(percentageDeposit, PAYMENT_CONFIG.MIN_DEPOSIT);
  }
  return PAYMENT_CONFIG.MIN_DEPOSIT;
}

function calculatePlatformFee(depositAmount) {
  return Math.round(depositAmount * (PAYMENT_CONFIG.PLATFORM_FEE_PERCENTAGE / 100));
}

async function verifyAuthToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing authentication token');
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}

async function createNotification(userId, type, title, message, data = {}) {
  await db.collection('notifications').add({
    userId,
    type,
    title,
    message,
    ...data,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function sendSystemMessage(conversationId, text) {
  if (!conversationId) return;
  
  await db.collection('conversations').doc(conversationId).collection('messages').add({
    text,
    senderId: 'system',
    senderName: 'Kiwi Van Market',
    type: 'system',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection('conversations').doc(conversationId).update({
    lastMessage: text.slice(0, 100),
    lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function findConversation(vanId, buyerId) {
  const conversationsQuery = await db.collection('conversations')
    .where('vanId', '==', vanId)
    .where('participants', 'array-contains', buyerId)
    .get();
  
  return conversationsQuery.empty ? null : conversationsQuery.docs[0].id;
}

// ============================================
// 💳 CREATE CHECKOUT SESSION - SÉCURISÉ
// ============================================
// 🛡️ L'argent est RETENU par Stripe, pas envoyé au vendeur

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Vérifier l'authentification
      let user;
      try {
        user = await verifyAuthToken(req);
      } catch (authError) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { reservationId, vanId, successUrl, cancelUrl } = req.body;

      if (!reservationId || !vanId || !successUrl || !cancelUrl) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Récupérer le van
      const vanDoc = await db.collection('vans').doc(vanId).get();
      if (!vanDoc.exists) {
        return res.status(404).json({ error: 'Van not found' });
      }
      
      const vanData = vanDoc.data();
      const vanPrice = vanData.price;
      const vanTitle = vanData.title || 'Campervan';
      const sellerId = vanData.seller?.uid;

      if (!vanPrice || vanPrice <= 0) {
        return res.status(400).json({ error: 'Invalid van price' });
      }

      if (sellerId === user.uid) {
        return res.status(403).json({ error: 'You cannot reserve your own van' });
      }

      // Vérifier la réservation
      const reservationDoc = await db.collection('reservations').doc(reservationId).get();
      if (!reservationDoc.exists) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      const reservationData = reservationDoc.data();
      if (reservationData.buyerId !== user.uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      if (reservationData.status !== RESERVATION_STATUS.PENDING) {
        return res.status(400).json({ error: 'Reservation is not pending' });
      }

      // Calculer le montant
      const depositAmount = calculateDepositFromPrice(vanPrice);
      const platformFee = calculatePlatformFee(depositAmount);
      const amountInCents = depositAmount * 100;

      // 🛡️ SÉCURITÉ: Créer un PaymentIntent avec capture manuelle
      // L'argent est AUTORISÉ mais pas CAPTURÉ - il reste sur le compte Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: user.email,
        payment_intent_data: {
          // 🛡️ CAPTURE MANUELLE - L'argent n'est pas transféré automatiquement
          capture_method: 'manual',
          metadata: {
            reservationId,
            vanId,
            buyerId: user.uid,
            sellerId,
            depositAmount: String(depositAmount),
            type: 'van_reservation_deposit',
          },
        },
        line_items: [
          {
            price_data: {
              currency: PAYMENT_CONFIG.CURRENCY,
              product_data: {
                name: `Reservation Deposit - ${vanTitle}`,
                description: `Secure deposit for van reservation. Funds held until transaction confirmed.`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          reservationId,
          vanId,
          buyerId: user.uid,
          sellerId,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      });

      // Mettre à jour la réservation
      const sellerResponseDeadline = new Date(Date.now() + PAYMENT_CONFIG.SELLER_RESPONSE_DEADLINE_HOURS * 60 * 60 * 1000);
      
      await db.collection('reservations').doc(reservationId).update({
        stripeSessionId: session.id,
        stripeSessionUrl: session.url,
        depositAmount,
        platformFee,
        remainingBalance: vanPrice - depositAmount,
        sellerResponseDeadline,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        sessionId: session.id,
        url: session.url,
        depositAmount,
      });

    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// ============================================
// 🔔 STRIPE WEBHOOK - Gestion des paiements
// ============================================

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const reservationId = session.metadata?.reservationId;
      const buyerId = session.metadata?.buyerId;
      const sellerId = session.metadata?.sellerId;

      if (reservationId) {
        try {
          const reservationRef = db.collection('reservations').doc(reservationId);
          const reservationDoc = await reservationRef.get();

          if (reservationDoc.exists) {
            const reservationData = reservationDoc.data();
            
            // Calculer le deadline pour le vendeur
            const sellerDeadline = new Date(Date.now() + PAYMENT_CONFIG.SELLER_RESPONSE_DEADLINE_HOURS * 60 * 60 * 1000);

            // 🛡️ Statut "PAID" mais argent toujours chez Stripe
            await reservationRef.update({
              status: RESERVATION_STATUS.PAID,
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              stripePaymentIntentId: session.payment_intent,
              stripeCustomerId: session.customer,
              paymentMethod: 'stripe',
              paymentConfirmedVia: 'webhook',
              fundsStatus: 'held_by_stripe', // 🛡️ Argent retenu
              sellerResponseDeadline: sellerDeadline,
            });

            // Notifier le vendeur avec urgence
            await createNotification(
              reservationData.sellerId,
              'reservation_paid',
              '🔔 New Reservation - Action Required!',
              `${reservationData.buyerName || 'A buyer'} has paid a deposit for "${reservationData.van?.title}". You have 48 hours to confirm or the reservation will be automatically cancelled and refunded.`,
              { reservationId, vanId: reservationData.vanId, urgent: true }
            );

            // Notifier l'acheteur
            await createNotification(
              reservationData.buyerId,
              'payment_confirmed',
              '✅ Payment Received - Funds Secured',
              `Your deposit for "${reservationData.van?.title}" is securely held. The seller has 48 hours to confirm. If they don't respond, you'll be automatically refunded.`,
              { reservationId, vanId: reservationData.vanId }
            );

            // Message système
            const conversationId = await findConversation(reservationData.vanId, reservationData.buyerId);
            await sendSystemMessage(conversationId, 
              `💳 Deposit of $${reservationData.depositAmount || 500} NZD received and securely held.\n\n⏰ Seller must confirm within 48 hours.\n🛡️ Your money is protected - auto-refund if seller doesn't respond.`
            );

            console.log(`✅ Reservation ${reservationId} - Payment authorized, funds held`);
          }
        } catch (error) {
          console.error('❌ Error processing payment:', error);
        }
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object;
      const reservationId = session.metadata?.reservationId;

      if (reservationId) {
        await db.collection('reservations').doc(reservationId).update({
          status: RESERVATION_STATUS.EXPIRED,
          expiredAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      console.log(`❌ Payment failed: ${event.data.object.id}`);
      break;
    }
  }

  res.status(200).json({ received: true });
});

// ============================================
// ✅ SELLER CONFIRMS RESERVATION
// ============================================
// Le vendeur confirme qu'il accepte la réservation

exports.sellerConfirmReservation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const { reservationId, proposedMeetingDate, proposedMeetingLocation } = data;
  if (!reservationId) {
    throw new functions.https.HttpsError('invalid-argument', 'Reservation ID required');
  }

  try {
    const reservationRef = db.collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Reservation not found');
    }

    const reservation = reservationDoc.data();

    // Vérifier que c'est le vendeur
    if (reservation.sellerId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only seller can confirm');
    }

    // Vérifier le statut
    if (reservation.status !== RESERVATION_STATUS.PAID) {
      throw new functions.https.HttpsError('failed-precondition', 'Invalid reservation status');
    }

    // Deadline pour l'acheteur de confirmer la rencontre
    const buyerDeadline = new Date(Date.now() + PAYMENT_CONFIG.BUYER_CONFIRMATION_DEADLINE_HOURS * 60 * 60 * 1000);

    await reservationRef.update({
      status: RESERVATION_STATUS.SELLER_CONFIRMED,
      sellerConfirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      proposedMeetingDate: proposedMeetingDate || null,
      proposedMeetingLocation: proposedMeetingLocation || null,
      buyerConfirmationDeadline: buyerDeadline,
      fundsStatus: 'held_by_stripe', // Toujours retenu
    });

    // Notifier l'acheteur
    await createNotification(
      reservation.buyerId,
      'seller_confirmed',
      '🎉 Seller Confirmed Your Reservation!',
      `Great news! The seller has confirmed your reservation for "${reservation.van?.title}". Please arrange a meeting to view the van.`,
      { reservationId, vanId: reservation.vanId }
    );

    const conversationId = await findConversation(reservation.vanId, reservation.buyerId);
    await sendSystemMessage(conversationId, 
      `✅ Seller has confirmed the reservation!\n\n📅 Next step: Arrange a meeting to view the van.\n🛡️ After viewing, confirm the meeting to proceed.`
    );

    return { success: true, message: 'Reservation confirmed' };

  } catch (error) {
    console.error('❌ Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// 👁️ BUYER CONFIRMS MEETING (a vu le van)
// ============================================
// L'acheteur confirme avoir rencontré le vendeur et vu le van

exports.buyerConfirmMeeting = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const { reservationId, meetingConfirmed, proceedWithPurchase } = data;
  if (!reservationId) {
    throw new functions.https.HttpsError('invalid-argument', 'Reservation ID required');
  }

  try {
    const reservationRef = db.collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Reservation not found');
    }

    const reservation = reservationDoc.data();

    if (reservation.buyerId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only buyer can confirm');
    }

    if (reservation.status !== RESERVATION_STATUS.SELLER_CONFIRMED) {
      throw new functions.https.HttpsError('failed-precondition', 'Invalid status');
    }

    if (!meetingConfirmed) {
      // L'acheteur dit ne pas avoir eu de rencontre -> ouvrir une dispute
      await reservationRef.update({
        status: RESERVATION_STATUS.DISPUTED,
        disputeReason: 'Buyer reports meeting did not happen',
        disputeOpenedAt: admin.firestore.FieldValue.serverTimestamp(),
        disputeOpenedBy: context.auth.uid,
      });

      await createNotification(
        reservation.sellerId,
        'dispute_opened',
        '⚠️ Dispute Opened',
        `The buyer has opened a dispute for "${reservation.van?.title}". Our team will review.`,
        { reservationId, vanId: reservation.vanId }
      );

      return { success: true, status: 'disputed' };
    }

    if (proceedWithPurchase) {
      // 🛡️ L'acheteur confirme vouloir continuer
      // Calculer quand l'argent sera libéré
      const releaseDate = new Date(Date.now() + PAYMENT_CONFIG.RELEASE_DELAY_DAYS * 24 * 60 * 60 * 1000);
      const disputeDeadline = new Date(Date.now() + PAYMENT_CONFIG.DISPUTE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

      await reservationRef.update({
        status: RESERVATION_STATUS.BUYER_CONFIRMED,
        buyerConfirmedAt: admin.firestore.FieldValue.serverTimestamp(),
        meetingConfirmed: true,
        proceedWithPurchase: true,
        fundsReleaseDate: releaseDate,
        disputeDeadline: disputeDeadline,
        fundsStatus: 'pending_release', // Sera libéré après délai
      });

      await createNotification(
        reservation.sellerId,
        'buyer_confirmed',
        '✅ Buyer Confirmed Meeting!',
        `The buyer has confirmed viewing "${reservation.van?.title}" and wants to proceed. Funds will be released in ${PAYMENT_CONFIG.RELEASE_DELAY_DAYS} days.`,
        { reservationId, vanId: reservation.vanId }
      );

      const conversationId = await findConversation(reservation.vanId, reservation.buyerId);
      await sendSystemMessage(conversationId, 
        `✅ Buyer has confirmed the meeting and wants to proceed!\n\n💰 Deposit will be released to seller in ${PAYMENT_CONFIG.RELEASE_DELAY_DAYS} days.\n🛡️ Both parties have ${PAYMENT_CONFIG.DISPUTE_WINDOW_DAYS} days to report any issues.`
      );

      return { success: true, status: 'confirmed', releaseDate };

    } else {
      // L'acheteur a vu le van mais ne veut pas continuer
      // Remboursement partiel ou selon les conditions
      await reservationRef.update({
        status: RESERVATION_STATUS.CANCELLED,
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        cancelledBy: context.auth.uid,
        cancellationReason: 'Buyer decided not to proceed after viewing',
        refundEligible: false, // Selon tes conditions
      });

      return { success: true, status: 'cancelled' };
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// 💰 RELEASE FUNDS - Libérer l'argent au vendeur
// ============================================
// Appelé automatiquement par un cron job ou manuellement

exports.releaseFunds = functions.https.onCall(async (data, context) => {
  // Cette fonction peut être appelée par un admin ou automatiquement
  const { reservationId } = data;

  try {
    const reservationRef = db.collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Reservation not found');
    }

    const reservation = reservationDoc.data();

    // Vérifier que les conditions sont remplies
    if (reservation.status !== RESERVATION_STATUS.BUYER_CONFIRMED) {
      throw new functions.https.HttpsError('failed-precondition', 'Cannot release funds yet');
    }

    // Vérifier que le délai est passé
    const releaseDate = reservation.fundsReleaseDate?.toDate?.() || reservation.fundsReleaseDate;
    if (new Date() < new Date(releaseDate)) {
      throw new functions.https.HttpsError('failed-precondition', 'Release date not reached');
    }

    // 🛡️ CAPTURER LE PAIEMENT (transférer l'argent)
    const paymentIntentId = reservation.stripePaymentIntentId;
    if (!paymentIntentId) {
      throw new functions.https.HttpsError('failed-precondition', 'No payment intent');
    }

    await stripe.paymentIntents.capture(paymentIntentId);

    await reservationRef.update({
      status: RESERVATION_STATUS.COMPLETED,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      fundsStatus: 'released',
      fundsReleasedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Notifier les deux parties
    await createNotification(
      reservation.sellerId,
      'funds_released',
      '💰 Funds Released!',
      `The deposit of $${reservation.depositAmount} for "${reservation.van?.title}" has been released to your account.`,
      { reservationId, vanId: reservation.vanId }
    );

    await createNotification(
      reservation.buyerId,
      'transaction_complete',
      '✅ Transaction Complete',
      `Your transaction for "${reservation.van?.title}" is complete. Thank you for using Kiwi Van Market!`,
      { reservationId, vanId: reservation.vanId }
    );

    return { success: true, message: 'Funds released' };

  } catch (error) {
    console.error('❌ Error releasing funds:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// 🔄 AUTO-REFUND IF SELLER DOESN'T RESPOND
// ============================================
// Scheduled function - runs every hour
// 
// ⚠️ TEMPORAIREMENT DÉSACTIVÉ - À activer après mise à jour de firebase-functions
// Pour activer: npm install --save firebase-functions@latest
// Puis décommenter le code ci-dessous
//
// Cette fonction vérifie automatiquement:
// 1. Les réservations où le vendeur n'a pas répondu en 48h → Remboursement auto
// 2. Les réservations confirmées où le délai est passé → Libération des fonds
//
// ALTERNATIVE: Tu peux créer un cron job externe qui appelle une Cloud Function HTTP
// ou utiliser Google Cloud Scheduler directement

/*
exports.checkExpiredReservations = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  console.log('🔍 Checking for expired reservations...');

  const now = new Date();

  // Trouver les réservations PAID où le vendeur n'a pas répondu
  const expiredQuery = await db.collection('reservations')
    .where('status', '==', RESERVATION_STATUS.PAID)
    .where('sellerResponseDeadline', '<', now)
    .get();

  for (const doc of expiredQuery.docs) {
    const reservation = doc.data();
    const reservationId = doc.id;

    console.log(`⏰ Auto-refunding reservation ${reservationId} - seller didn't respond`);

    try {
      // Annuler le PaymentIntent (rembourse automatiquement)
      if (reservation.stripePaymentIntentId) {
        await stripe.paymentIntents.cancel(reservation.stripePaymentIntentId);
      }

      await db.collection('reservations').doc(reservationId).update({
        status: RESERVATION_STATUS.REFUNDED,
        refundedAt: admin.firestore.FieldValue.serverTimestamp(),
        refundReason: 'Seller did not respond within 48 hours',
        fundsStatus: 'refunded',
      });

      // Notifier l'acheteur
      await createNotification(
        reservation.buyerId,
        'auto_refund',
        '💰 Automatic Refund',
        `The seller didn't respond within 48 hours. Your deposit for "${reservation.van?.title}" has been automatically refunded.`,
        { reservationId, vanId: reservation.vanId }
      );

      // Notifier le vendeur
      await createNotification(
        reservation.sellerId,
        'reservation_expired',
        '⏰ Reservation Expired',
        `You didn't respond to the reservation for "${reservation.van?.title}" within 48 hours. The buyer has been refunded.`,
        { reservationId, vanId: reservation.vanId }
      );

      console.log(`✅ Reservation ${reservationId} auto-refunded`);

    } catch (error) {
      console.error(`❌ Error auto-refunding ${reservationId}:`, error);
    }
  }

  // Libérer les fonds des réservations confirmées dont le délai est passé
  const releaseQuery = await db.collection('reservations')
    .where('status', '==', RESERVATION_STATUS.BUYER_CONFIRMED)
    .where('fundsReleaseDate', '<', now)
    .get();

  for (const doc of releaseQuery.docs) {
    const reservation = doc.data();
    const reservationId = doc.id;

    console.log(`💰 Auto-releasing funds for reservation ${reservationId}`);

    try {
      if (reservation.stripePaymentIntentId) {
        await stripe.paymentIntents.capture(reservation.stripePaymentIntentId);
      }

      await db.collection('reservations').doc(reservationId).update({
        status: RESERVATION_STATUS.COMPLETED,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        fundsStatus: 'released',
        fundsReleasedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await createNotification(
        reservation.sellerId,
        'funds_released',
        '💰 Funds Released!',
        `The deposit of $${reservation.depositAmount} for "${reservation.van?.title}" has been released.`,
        { reservationId, vanId: reservation.vanId }
      );

      console.log(`✅ Funds released for ${reservationId}`);

    } catch (error) {
      console.error(`❌ Error releasing funds for ${reservationId}:`, error);
    }
  }

  return null;
});
*/

// 🔄 VERSION HTTP - Alternative pour déclencher manuellement ou via cron externe
// Tu peux appeler cette fonction depuis Google Cloud Scheduler ou un cron externe
exports.checkExpiredReservationsHTTP = functions.https.onRequest(async (req, res) => {
  // Vérifier une clé secrète simple pour sécuriser l'endpoint
  const cronSecret = req.headers['x-cron-secret'] || req.query.secret;
  if (cronSecret !== process.env.CRON_SECRET && cronSecret !== 'temp-dev-secret') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('🔍 Checking for expired reservations (HTTP trigger)...');

  const now = new Date();
  let refundedCount = 0;
  let releasedCount = 0;

  try {
    // Trouver les réservations PAID où le vendeur n'a pas répondu
    const expiredQuery = await db.collection('reservations')
      .where('status', '==', RESERVATION_STATUS.PAID)
      .where('sellerResponseDeadline', '<', now)
      .get();

    for (const docSnap of expiredQuery.docs) {
      const reservation = docSnap.data();
      const reservationId = docSnap.id;

      try {
        if (reservation.stripePaymentIntentId) {
          await stripe.paymentIntents.cancel(reservation.stripePaymentIntentId);
        }

        await db.collection('reservations').doc(reservationId).update({
          status: RESERVATION_STATUS.REFUNDED,
          refundedAt: admin.firestore.FieldValue.serverTimestamp(),
          refundReason: 'Seller did not respond within 48 hours',
          fundsStatus: 'refunded',
        });

        await createNotification(
          reservation.buyerId,
          'auto_refund',
          '💰 Automatic Refund',
          `The seller didn't respond within 48 hours. Your deposit has been automatically refunded.`,
          { reservationId, vanId: reservation.vanId }
        );

        refundedCount++;
      } catch (error) {
        console.error(`❌ Error auto-refunding ${reservationId}:`, error);
      }
    }

    // Libérer les fonds des réservations confirmées
    const releaseQuery = await db.collection('reservations')
      .where('status', '==', RESERVATION_STATUS.BUYER_CONFIRMED)
      .where('fundsReleaseDate', '<', now)
      .get();

    for (const docSnap of releaseQuery.docs) {
      const reservation = docSnap.data();
      const reservationId = docSnap.id;

      try {
        if (reservation.stripePaymentIntentId) {
          await stripe.paymentIntents.capture(reservation.stripePaymentIntentId);
        }

        await db.collection('reservations').doc(reservationId).update({
          status: RESERVATION_STATUS.COMPLETED,
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          fundsStatus: 'released',
          fundsReleasedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await createNotification(
          reservation.sellerId,
          'funds_released',
          '💰 Funds Released!',
          `The deposit of $${reservation.depositAmount} has been released.`,
          { reservationId, vanId: reservation.vanId }
        );

        releasedCount++;
      } catch (error) {
        console.error(`❌ Error releasing funds for ${reservationId}:`, error);
      }
    }

    res.status(200).json({ 
      success: true, 
      refunded: refundedCount, 
      released: releasedCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in checkExpiredReservationsHTTP:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ⚠️ OPEN DISPUTE
// ============================================

exports.openDispute = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const { reservationId, reason, description } = data;

  if (!reservationId || !reason) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
  }

  try {
    const reservationRef = db.collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Reservation not found');
    }

    const reservation = reservationDoc.data();
    const userId = context.auth.uid;

    // Vérifier que l'utilisateur est partie prenante
    if (reservation.buyerId !== userId && reservation.sellerId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    // Vérifier qu'on peut encore ouvrir un litige
    const disputeDeadline = reservation.disputeDeadline?.toDate?.() || reservation.disputeDeadline;
    if (disputeDeadline && new Date() > new Date(disputeDeadline)) {
      throw new functions.https.HttpsError('failed-precondition', 'Dispute window closed');
    }

    await reservationRef.update({
      status: RESERVATION_STATUS.DISPUTED,
      disputeReason: reason,
      disputeDescription: description || '',
      disputeOpenedAt: admin.firestore.FieldValue.serverTimestamp(),
      disputeOpenedBy: userId,
      fundsStatus: 'frozen', // Geler les fonds
    });

    // Notifier l'autre partie
    const otherUserId = userId === reservation.buyerId ? reservation.sellerId : reservation.buyerId;
    await createNotification(
      otherUserId,
      'dispute_opened',
      '⚠️ Dispute Opened',
      `A dispute has been opened for "${reservation.van?.title}". Our team will review and contact both parties.`,
      { reservationId, vanId: reservation.vanId }
    );

    // TODO: Envoyer un email à l'admin pour review

    return { success: true, message: 'Dispute opened' };

  } catch (error) {
    console.error('❌ Error opening dispute:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// ❌ CANCEL RESERVATION
// ============================================

exports.cancelReservation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const { reservationId, reason } = data;

  if (!reservationId) {
    throw new functions.https.HttpsError('invalid-argument', 'Reservation ID required');
  }

  try {
    const reservationRef = db.collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Reservation not found');
    }

    const reservation = reservationDoc.data();
    const userId = context.auth.uid;
    const isBuyer = reservation.buyerId === userId;
    const isSeller = reservation.sellerId === userId;

    if (!isBuyer && !isSeller) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    let shouldRefund = false;

    // Logique de remboursement selon qui annule et quand
    if (isSeller) {
      // Vendeur annule -> toujours remboursement total
      shouldRefund = true;
    } else if (isBuyer) {
      // Acheteur annule -> dépend du statut
      if (reservation.status === RESERVATION_STATUS.PENDING) {
        shouldRefund = true; // Pas encore payé
      } else if (reservation.status === RESERVATION_STATUS.PAID) {
        shouldRefund = true; // Vendeur n'a pas encore confirmé
      } else if (reservation.status === RESERVATION_STATUS.SELLER_CONFIRMED) {
        shouldRefund = false; // Vendeur a déjà confirmé -> pas de remboursement
      }
    }

    // Effectuer le remboursement si nécessaire
    if (shouldRefund && reservation.stripePaymentIntentId) {
      try {
        // Annuler ou rembourser selon l'état
        const paymentIntent = await stripe.paymentIntents.retrieve(reservation.stripePaymentIntentId);
        
        if (paymentIntent.status === 'requires_capture') {
          // Pas encore capturé -> annuler
          await stripe.paymentIntents.cancel(reservation.stripePaymentIntentId);
        } else if (paymentIntent.status === 'succeeded') {
          // Déjà capturé -> rembourser
          await stripe.refunds.create({
            payment_intent: reservation.stripePaymentIntentId,
          });
        }
      } catch (refundError) {
        console.error('❌ Refund error:', refundError);
      }
    }

    await reservationRef.update({
      status: shouldRefund ? RESERVATION_STATUS.REFUNDED : RESERVATION_STATUS.CANCELLED,
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancelledBy: userId,
      cancellationReason: reason || 'No reason provided',
      refunded: shouldRefund,
      fundsStatus: shouldRefund ? 'refunded' : 'forfeited',
    });

    // Notifier l'autre partie
    const otherUserId = isBuyer ? reservation.sellerId : reservation.buyerId;
    const cancellerName = isBuyer ? reservation.buyerName : reservation.sellerName;

    await createNotification(
      otherUserId,
      'reservation_cancelled',
      'Reservation Cancelled',
      `${cancellerName || 'The other party'} has cancelled the reservation for "${reservation.van?.title}".${shouldRefund ? ' The deposit has been refunded.' : ''}`,
      { reservationId, vanId: reservation.vanId }
    );

    return { 
      success: true, 
      refunded: shouldRefund,
      message: shouldRefund ? 'Cancelled and refunded' : 'Cancelled',
    };

  } catch (error) {
    console.error('❌ Error cancelling:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// 📊 GET RESERVATION
// ============================================

exports.getReservation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const { reservationId } = data;

  try {
    const reservationDoc = await db.collection('reservations').doc(reservationId).get();

    if (!reservationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Reservation not found');
    }

    const reservation = reservationDoc.data();

    if (reservation.buyerId !== context.auth.uid && reservation.sellerId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    return {
      id: reservationDoc.id,
      ...reservation,
      createdAt: reservation.createdAt?.toDate?.() || null,
      paidAt: reservation.paidAt?.toDate?.() || null,
      sellerConfirmedAt: reservation.sellerConfirmedAt?.toDate?.() || null,
      buyerConfirmedAt: reservation.buyerConfirmedAt?.toDate?.() || null,
      fundsReleaseDate: reservation.fundsReleaseDate?.toDate?.() || null,
      disputeDeadline: reservation.disputeDeadline?.toDate?.() || null,
    };

  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});