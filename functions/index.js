// ============================================
// 🔥 FIREBASE CLOUD FUNCTIONS - Kiwi Van Market
// ============================================
// 
// Backend SÉCURISÉ pour le système de paiement Stripe
// Version avec:
// ✅ Expiration automatique 48h
// ✅ Stripe Connect pour payout vendeurs
// ✅ Double confirmation + release automatique
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
// 🔒 CORS SÉCURISÉ
// ============================================

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://kiwivanmarket.com',
  'https://www.kiwivanmarket.com',
  // Ajoute ton domaine Vercel/Netlify ici
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
// 💰 CONFIG PAIEMENT
// ============================================

const PAYMENT_CONFIG = {
  MIN_DEPOSIT: 500,
  DEPOSIT_PERCENTAGE: 5,
  PERCENTAGE_THRESHOLD: 10000,
  PLATFORM_FEE_PERCENTAGE: 5, // 5% commission
  CURRENCY: 'nzd',
  SELLER_RESPONSE_HOURS: 48, // Heures pour répondre
};

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

// ============================================
// 🔒 VÉRIFICATION AUTHENTIFICATION
// ============================================

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
    console.error('❌ Token invalide:', error.message);
    throw new Error('Invalid authentication token');
  }
}

// ============================================
// 💳 CREATE CHECKOUT SESSION
// ============================================

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

      // Récupérer le van depuis Firestore
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

      if (reservationData.status !== 'pending') {
        return res.status(400).json({ error: 'Reservation is not pending' });
      }

      // Calculer le montant
      const depositAmount = calculateDepositFromPrice(vanPrice);
      const platformFee = calculatePlatformFee(depositAmount);
      const amountInCents = depositAmount * 100;

      console.log(`✅ Checkout: van=${vanId}, prix=${vanPrice}, dépôt=${depositAmount}`);

      // Créer la session Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: PAYMENT_CONFIG.CURRENCY,
              product_data: {
                name: `Reservation Deposit - ${vanTitle}`,
                description: `Deposit for van reservation`,
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
          sellerId: sellerId,
          depositAmount: String(depositAmount),
          platformFee: String(platformFee),
          type: 'van_reservation_deposit',
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      });

      // Mettre à jour la réservation
      await db.collection('reservations').doc(reservationId).update({
        stripeSessionId: session.id,
        stripeSessionUrl: session.url,
        depositAmount: depositAmount,
        platformFee: platformFee,
        remainingBalance: vanPrice - depositAmount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        sessionId: session.id,
        url: session.url,
        depositAmount: depositAmount,
      });

    } catch (error) {
      console.error('❌ Error creating checkout:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// ============================================
// 🔔 STRIPE WEBHOOK
// ============================================

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    console.log('✅ Webhook verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const reservationId = session.metadata?.reservationId;

      if (reservationId) {
        try {
          const reservationRef = db.collection('reservations').doc(reservationId);
          const reservationDoc = await reservationRef.get();

          if (reservationDoc.exists) {
            const reservationData = reservationDoc.data();

            // Marquer comme payé + définir deadline 48h
            const deadline = new Date();
            deadline.setHours(deadline.getHours() + PAYMENT_CONFIG.SELLER_RESPONSE_HOURS);

            await reservationRef.update({
              status: 'paid',
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              stripePaymentIntentId: session.payment_intent,
              stripeCustomerId: session.customer,
              paymentMethod: 'stripe',
              paymentConfirmedVia: 'webhook',
              sellerResponseDeadline: admin.firestore.Timestamp.fromDate(deadline),
            });

            // Notifications
            await db.collection('notifications').add({
              userId: reservationData.sellerId,
              type: 'reservation_paid',
              title: 'New Reservation! 🎉',
              message: `${reservationData.buyerName || 'A buyer'} has paid the deposit for "${reservationData.vanTitle || reservationData.van?.title}". You have 48 hours to respond.`,
              reservationId: reservationId,
              vanId: reservationData.vanId,
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            await db.collection('notifications').add({
              userId: reservationData.buyerId,
              type: 'payment_confirmed',
              title: 'Payment Confirmed! ✅',
              message: `Your deposit has been received. The seller has 48 hours to confirm.`,
              reservationId: reservationId,
              vanId: reservationData.vanId,
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`✅ Reservation ${reservationId} marked as paid`);
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
          status: 'expired',
          expiredAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`⏳ Reservation ${reservationId} expired`);
      }
      break;
    }

    // Webhook pour Stripe Connect
    case 'account.updated': {
      const account = event.data.object;
      console.log(`🏦 Stripe Connect account updated: ${account.id}`);
      
      // Trouver et mettre à jour le compte dans Firestore
      const accountsQuery = await db.collection('stripeAccounts')
        .where('stripeAccountId', '==', account.id)
        .get();
      
      if (!accountsQuery.empty) {
        const docId = accountsQuery.docs[0].id;
        await db.collection('stripeAccounts').doc(docId).update({
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

// ============================================
// ⏰ EXPIRATION 48H - Scheduled Function
// ============================================
// Tourne toutes les heures pour vérifier les réservations expirées

exports.checkExpiredReservations = functions.pubsub
  .schedule('every 1 hours')
  .timeZone('Pacific/Auckland')
  .onRun(async (context) => {
    console.log('⏰ Checking for expired reservations...');
    
    const now = admin.firestore.Timestamp.now();
    
    // Trouver les réservations payées dont la deadline est passée
    const expiredQuery = await db.collection('reservations')
      .where('status', '==', 'paid')
      .where('sellerResponseDeadline', '<=', now)
      .get();
    
    console.log(`Found ${expiredQuery.size} expired reservations`);
    
    for (const doc of expiredQuery.docs) {
      const reservation = doc.data();
      const reservationId = doc.id;
      
      console.log(`🔄 Processing expired reservation: ${reservationId}`);
      
      try {
        // Effectuer le remboursement
        if (reservation.stripePaymentIntentId) {
          await stripe.refunds.create({
            payment_intent: reservation.stripePaymentIntentId,
          });
          console.log(`💰 Refund processed for ${reservationId}`);
        }
        
        // Mettre à jour la réservation
        await db.collection('reservations').doc(reservationId).update({
          status: 'refunded',
          refundReason: 'seller_no_response_48h',
          refundedAt: admin.firestore.FieldValue.serverTimestamp(),
          refunded: true,
          refundAmount: reservation.depositAmount,
        });
        
        // Notifier l'acheteur
        await db.collection('notifications').add({
          userId: reservation.buyerId,
          type: 'reservation_refunded',
          title: 'Deposit Refunded 💰',
          message: `The seller didn't respond within 48 hours. Your $${reservation.depositAmount} deposit has been refunded.`,
          reservationId: reservationId,
          vanId: reservation.vanId,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // Notifier le vendeur
        await db.collection('notifications').add({
          userId: reservation.sellerId,
          type: 'reservation_expired',
          title: 'Reservation Expired ⏰',
          message: `You didn't respond to the reservation for "${reservation.vanTitle}" within 48 hours. The buyer has been refunded.`,
          reservationId: reservationId,
          vanId: reservation.vanId,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`✅ Reservation ${reservationId} refunded due to 48h expiration`);
        
      } catch (error) {
        console.error(`❌ Error processing ${reservationId}:`, error);
      }
    }
    
    return null;
  });

// ============================================
// 🏦 STRIPE CONNECT - Onboarding vendeur
// ============================================
// Crée un compte Stripe Connect pour un vendeur

exports.createStripeConnectAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;

  try {
    // Vérifier si le vendeur a déjà un compte
    const existingAccount = await db.collection('stripeAccounts').doc(userId).get();
    
    if (existingAccount.exists && existingAccount.data().stripeAccountId) {
      // Retourner le lien de connexion existant
      const accountLink = await stripe.accountLinks.create({
        account: existingAccount.data().stripeAccountId,
        refresh_url: `${data.baseUrl}/seller/stripe/refresh`,
        return_url: `${data.baseUrl}/seller/stripe/return`,
        type: 'account_onboarding',
      });
      
      return { url: accountLink.url, existing: true };
    }

    // Créer un nouveau compte Stripe Connect (Express)
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'NZ',
      email: userEmail,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        firebaseUserId: userId,
      },
    });

    // Sauvegarder dans Firestore
    await db.collection('stripeAccounts').doc(userId).set({
      stripeAccountId: account.id,
      userId: userId,
      email: userEmail,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Créer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${data.baseUrl}/seller/stripe/refresh`,
      return_url: `${data.baseUrl}/seller/stripe/return`,
      type: 'account_onboarding',
    });

    console.log(`🏦 Stripe Connect account created for ${userId}`);

    return { url: accountLink.url, accountId: account.id };

  } catch (error) {
    console.error('❌ Error creating Stripe account:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// 🔗 GET STRIPE DASHBOARD LINK
// ============================================
// Permet au vendeur d'accéder à son dashboard Stripe

exports.getStripeDashboardLink = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const userId = context.auth.uid;

  try {
    const accountDoc = await db.collection('stripeAccounts').doc(userId).get();
    
    if (!accountDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'No Stripe account found');
    }

    const stripeAccountId = accountDoc.data().stripeAccountId;

    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);

    return { url: loginLink.url };

  } catch (error) {
    console.error('❌ Error getting dashboard link:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// 💸 RELEASE DEPOSIT - Trigger on seller confirm
// ============================================
// Déclenché automatiquement quand sellerConfirmed passe à true

exports.onReservationCompleted = functions.firestore
  .document('reservations/{reservationId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const reservationId = context.params.reservationId;

    // Vérifier si la double confirmation vient d'être complétée
    const wasNotCompleted = !before.sellerConfirmed || !before.buyerConfirmed;
    const isNowCompleted = after.sellerConfirmed && after.buyerConfirmed;

    if (wasNotCompleted && isNowCompleted && !after.depositReleased) {
      console.log(`✅ Double confirmation completed for ${reservationId}`);

      try {
        // Récupérer le compte Stripe du vendeur
        const sellerAccountDoc = await db.collection('stripeAccounts')
          .doc(after.sellerId)
          .get();

        if (!sellerAccountDoc.exists) {
          console.error(`❌ No Stripe account for seller ${after.sellerId}`);
          
          // Notifier l'admin qu'un payout manuel est nécessaire
          await db.collection('notifications').add({
            userId: 'admin', // ou ton userId admin
            type: 'manual_payout_required',
            title: '⚠️ Manual Payout Required',
            message: `Seller ${after.sellerName} doesn't have Stripe Connect. Manual payout of $${after.depositAmount} needed.`,
            reservationId: reservationId,
            sellerId: after.sellerId,
            amount: after.depositAmount,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          return;
        }

        const sellerStripeAccount = sellerAccountDoc.data();

        // Vérifier que le compte peut recevoir des paiements
        if (!sellerStripeAccount.payoutsEnabled) {
          console.error(`❌ Seller ${after.sellerId} payouts not enabled`);
          return;
        }

        // Calculer le montant à transférer (dépôt - commission)
        const platformFee = after.platformFee || calculatePlatformFee(after.depositAmount);
        const transferAmount = (after.depositAmount - platformFee) * 100; // En centimes

        // Créer le transfert vers le compte du vendeur
        const transfer = await stripe.transfers.create({
          amount: transferAmount,
          currency: PAYMENT_CONFIG.CURRENCY,
          destination: sellerStripeAccount.stripeAccountId,
          transfer_group: reservationId,
          metadata: {
            reservationId: reservationId,
            vanId: after.vanId,
            sellerId: after.sellerId,
            buyerId: after.buyerId,
          },
        });

        console.log(`💸 Transfer created: ${transfer.id} - $${transferAmount/100} to ${sellerStripeAccount.stripeAccountId}`);

        // Mettre à jour la réservation
        await change.after.ref.update({
          depositReleased: true,
          depositReleasedAt: admin.firestore.FieldValue.serverTimestamp(),
          stripeTransferId: transfer.id,
          sellerPayout: after.depositAmount - platformFee,
          platformFeeCollected: platformFee,
        });

        // Enregistrer le payout
        await db.collection('payouts').add({
          reservationId: reservationId,
          sellerId: after.sellerId,
          stripeAccountId: sellerStripeAccount.stripeAccountId,
          stripeTransferId: transfer.id,
          grossAmount: after.depositAmount,
          platformFee: platformFee,
          netAmount: after.depositAmount - platformFee,
          currency: PAYMENT_CONFIG.CURRENCY,
          status: 'completed',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Notifier le vendeur
        await db.collection('notifications').add({
          userId: after.sellerId,
          type: 'payout_sent',
          title: 'Payment Received! 💰',
          message: `$${after.depositAmount - platformFee} NZD has been sent to your Stripe account for "${after.vanTitle}".`,
          reservationId: reservationId,
          amount: after.depositAmount - platformFee,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Notifier l'acheteur
        await db.collection('notifications').add({
          userId: after.buyerId,
          type: 'transaction_complete',
          title: 'Transaction Complete! ✅',
          message: `Your transaction for "${after.vanTitle}" is complete. The deposit has been released to the seller.`,
          reservationId: reservationId,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Payout completed for reservation ${reservationId}`);

      } catch (error) {
        console.error(`❌ Error releasing deposit for ${reservationId}:`, error);
      }
    }
  });

// ============================================
// ✅ CONFIRM RESERVATION - Vendeur confirme
// ============================================

exports.confirmReservation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { reservationId } = data;

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

    if (reservation.sellerId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only seller can confirm');
    }

    if (reservation.status !== 'paid') {
      throw new functions.https.HttpsError('failed-precondition', 'Must be paid first');
    }

    await reservationRef.update({
      status: 'confirmed',
      confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      confirmedBy: context.auth.uid,
    });

    await db.collection('notifications').add({
      userId: reservation.buyerId,
      type: 'reservation_confirmed',
      title: 'Reservation Confirmed! 🎉',
      message: `The seller has confirmed your reservation. Contact them to arrange the viewing.`,
      reservationId: reservationId,
      vanId: reservation.vanId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };

  } catch (error) {
    console.error('❌ Error confirming:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// ❌ CANCEL RESERVATION
// ============================================

exports.cancelReservation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
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

    // Logique de remboursement
    let shouldRefund = false;
    let refundAmount = 0;

    // Le vendeur annule AVANT confirmation acheteur → remboursement
    if (isSeller && reservation.status === 'paid' && !reservation.buyerConfirmed) {
      shouldRefund = true;
      refundAmount = reservation.depositAmount;
    }
    // L'acheteur annule AVANT le viewing → remboursement
    else if (isBuyer && reservation.status === 'paid' && !reservation.buyerConfirmed) {
      shouldRefund = true;
      refundAmount = reservation.depositAmount;
    }
    // APRÈS buyerConfirmed → pas de remboursement

    if (shouldRefund && reservation.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: reservation.stripePaymentIntentId,
          amount: refundAmount * 100,
        });
        console.log(`💰 Refund: ${refundAmount} NZD`);
      } catch (refundError) {
        console.error('❌ Refund error:', refundError);
      }
    }

    await reservationRef.update({
      status: shouldRefund ? 'refunded' : 'cancelled',
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancelledBy: userId,
      cancellationReason: reason || 'No reason',
      refunded: shouldRefund,
      refundAmount: shouldRefund ? refundAmount : 0,
    });

    // Notifier l'autre partie
    const notifyUserId = isBuyer ? reservation.sellerId : reservation.buyerId;
    const cancellerName = isBuyer ? reservation.buyerName : reservation.sellerName;

    await db.collection('notifications').add({
      userId: notifyUserId,
      type: 'reservation_cancelled',
      title: 'Reservation Cancelled',
      message: `${cancellerName || 'The other party'} cancelled the reservation.${shouldRefund ? ' The deposit has been refunded.' : ''}`,
      reservationId: reservationId,
      vanId: reservation.vanId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { 
      success: true, 
      refunded: shouldRefund,
    };

  } catch (error) {
    console.error('❌ Error cancelling:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// 📊 GET RESERVATION
// ============================================

exports.getReservation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { reservationId } = data;

  if (!reservationId) {
    throw new functions.https.HttpsError('invalid-argument', 'Reservation ID required');
  }

  try {
    const reservationDoc = await db.collection('reservations').doc(reservationId).get();

    if (!reservationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Reservation not found');
    }

    const reservation = reservationDoc.data();
    const userId = context.auth.uid;

    if (reservation.buyerId !== userId && reservation.sellerId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    return {
      id: reservationDoc.id,
      ...reservation,
      createdAt: reservation.createdAt?.toDate?.() || null,
      paidAt: reservation.paidAt?.toDate?.() || null,
    };

  } catch (error) {
    console.error('❌ Error getting reservation:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// 🏦 CHECK SELLER STRIPE STATUS
// ============================================

exports.checkSellerStripeStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const userId = context.auth.uid;

  try {
    const accountDoc = await db.collection('stripeAccounts').doc(userId).get();

    if (!accountDoc.exists) {
      return { 
        hasAccount: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      };
    }

    const accountData = accountDoc.data();

    // Optionnel: refresh depuis Stripe API
    if (accountData.stripeAccountId) {
      try {
        const stripeAccount = await stripe.accounts.retrieve(accountData.stripeAccountId);
        
        // Mettre à jour si différent
        if (stripeAccount.charges_enabled !== accountData.chargesEnabled ||
            stripeAccount.payouts_enabled !== accountData.payoutsEnabled) {
          await db.collection('stripeAccounts').doc(userId).update({
            chargesEnabled: stripeAccount.charges_enabled,
            payoutsEnabled: stripeAccount.payouts_enabled,
            detailsSubmitted: stripeAccount.details_submitted,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        return {
          hasAccount: true,
          chargesEnabled: stripeAccount.charges_enabled,
          payoutsEnabled: stripeAccount.payouts_enabled,
          detailsSubmitted: stripeAccount.details_submitted,
        };
      } catch (e) {
        console.error('Error fetching Stripe account:', e);
      }
    }

    return {
      hasAccount: true,
      chargesEnabled: accountData.chargesEnabled,
      payoutsEnabled: accountData.payoutsEnabled,
      detailsSubmitted: accountData.detailsSubmitted,
    };

  } catch (error) {
    console.error('❌ Error checking status:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});