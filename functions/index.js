// ============================================
// 🔥 FIREBASE CLOUD FUNCTIONS - Kiwi Van Market
// ============================================
// 
// Backend pour le système de paiement Stripe
// Gère : création de session, webhooks, confirmations
//
// ============================================
require('dotenv').config();
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialiser Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialiser Stripe avec la clé secrète
const stripe = require('stripe')('sk_test_51SaGyADf4aPEZKU6YuwYIOQf0xlSVDd5uR0x1ZYpcqqOLCmYYJxx3XSYPfJwgj0kt5uQ8dtTwLrZm1a7AVN0SlZd00W1EA9EVK');
// ============================================
// 💳 CREATE CHECKOUT SESSION
// ============================================
// Crée une session Stripe Checkout pour le paiement

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Vérifier la méthode
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const {
        reservationId,
        vanId,
        vanTitle,
        amount,
        currency,
        buyerEmail,
        successUrl,
        cancelUrl,
      } = req.body;

      // Validation
      if (!reservationId || !amount || !successUrl || !cancelUrl) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Créer la session Stripe Checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: buyerEmail,
        line_items: [
          {
            price_data: {
              currency: currency || 'nzd',
              product_data: {
                name: `Reservation Deposit - ${vanTitle || 'Campervan'}`,
                description: `Deposit for van reservation (ID: ${vanId})`,
              },
              unit_amount: amount, // Montant en centimes
            },
            quantity: 1,
          },
        ],
        metadata: {
          reservationId,
          vanId,
          type: 'van_reservation_deposit',
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Expire dans 30 minutes
      });

      // Mettre à jour la réservation avec le sessionId
      await db.collection('reservations').doc(reservationId).update({
        stripeSessionId: session.id,
        stripeSessionUrl: session.url,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Retourner l'ID de session
      res.status(200).json({
        sessionId: session.id,
        url: session.url,
      });

    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============================================
// 🔔 STRIPE WEBHOOK
// ============================================
// Reçoit les événements de Stripe (paiement réussi, etc.)

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les différents types d'événements
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const reservationId = session.metadata?.reservationId;

      if (reservationId) {
        try {
          // Mettre à jour la réservation comme payée
          const reservationRef = db.collection('reservations').doc(reservationId);
          const reservationDoc = await reservationRef.get();

          if (reservationDoc.exists) {
            const reservationData = reservationDoc.data();

            await reservationRef.update({
              status: 'paid',
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              stripePaymentIntentId: session.payment_intent,
              stripeCustomerId: session.customer,
              paymentMethod: 'stripe',
            });

            // Créer une notification pour le vendeur
            await db.collection('notifications').add({
              userId: reservationData.sellerId,
              type: 'reservation_paid',
              title: 'New Reservation!',
              message: `${reservationData.buyerName} has paid the deposit for "${reservationData.van?.title}"`,
              reservationId: reservationId,
              vanId: reservationData.vanId,
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Créer une notification pour l'acheteur
            await db.collection('notifications').add({
              userId: reservationData.buyerId,
              type: 'payment_confirmed',
              title: 'Payment Confirmed!',
              message: `Your deposit for "${reservationData.van?.title}" has been received. The seller will contact you soon.`,
              reservationId: reservationId,
              vanId: reservationData.vanId,
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Optionnel: Ajouter un message système dans la conversation
            const conversationsQuery = await db.collection('conversations')
              .where('vanId', '==', reservationData.vanId)
              .where('participants', 'array-contains', reservationData.buyerId)
              .get();

            if (!conversationsQuery.empty) {
              const conversationId = conversationsQuery.docs[0].id;
              await db.collection('conversations').doc(conversationId).collection('messages').add({
                text: `💳 Deposit of $${reservationData.depositAmount} NZD has been paid for this van. The seller will confirm the reservation soon.`,
                senderId: 'system',
                senderName: 'Kiwi Van Market',
                type: 'system',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              });

              await db.collection('conversations').doc(conversationId).update({
                lastMessage: '💳 Deposit paid - Awaiting seller confirmation',
                lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            }

            console.log(`✅ Reservation ${reservationId} marked as paid`);
          }
        } catch (error) {
          console.error('Error processing payment:', error);
        }
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object;
      const reservationId = session.metadata?.reservationId;

      if (reservationId) {
        try {
          await db.collection('reservations').doc(reservationId).update({
            status: 'expired',
            expiredAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`⌛ Reservation ${reservationId} expired`);
        } catch (error) {
          console.error('Error marking reservation as expired:', error);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.log(`❌ Payment failed: ${paymentIntent.id}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

// ============================================
// ✅ CONFIRM RESERVATION
// ============================================
// Le vendeur confirme la réservation

exports.confirmReservation = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { reservationId } = data;

  if (!reservationId) {
    throw new functions.https.HttpsError('invalid-argument', 'Reservation ID is required');
  }

  try {
    const reservationRef = db.collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Reservation not found');
    }

    const reservation = reservationDoc.data();

    // Vérifier que l'utilisateur est le vendeur
    if (reservation.sellerId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only the seller can confirm');
    }

    // Vérifier le statut
    if (reservation.status !== 'paid') {
      throw new functions.https.HttpsError('failed-precondition', 'Reservation must be paid first');
    }

    // Mettre à jour le statut
    await reservationRef.update({
      status: 'confirmed',
      confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      confirmedBy: context.auth.uid,
    });

    // Notifier l'acheteur
    await db.collection('notifications').add({
      userId: reservation.buyerId,
      type: 'reservation_confirmed',
      title: 'Reservation Confirmed! 🎉',
      message: `Great news! The seller has confirmed your reservation for "${reservation.van?.title}". Contact them to arrange the viewing.`,
      reservationId: reservationId,
      vanId: reservation.vanId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: 'Reservation confirmed' };

  } catch (error) {
    console.error('Error confirming reservation:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// ❌ CANCEL RESERVATION
// ============================================
// Annuler une réservation (avec remboursement possible)

exports.cancelReservation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { reservationId, reason } = data;

  if (!reservationId) {
    throw new functions.https.HttpsError('invalid-argument', 'Reservation ID is required');
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

    if (isSeller && reservation.status === 'paid') {
      // Le vendeur annule → remboursement total
      shouldRefund = true;
      refundAmount = reservation.depositAmount;
    } else if (isBuyer && reservation.status === 'pending') {
      // L'acheteur annule avant paiement → pas de remboursement nécessaire
      shouldRefund = false;
    }
    // Note: Si l'acheteur annule après paiement, pas de remboursement (selon les conditions)

    // Effectuer le remboursement si nécessaire
    if (shouldRefund && reservation.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: reservation.stripePaymentIntentId,
          amount: refundAmount * 100, // En centimes
        });
      } catch (refundError) {
        console.error('Refund error:', refundError);
        // Continuer même si le remboursement échoue
      }
    }

    // Mettre à jour la réservation
    await reservationRef.update({
      status: shouldRefund ? 'refunded' : 'cancelled',
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancelledBy: userId,
      cancellationReason: reason || 'No reason provided',
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
      message: `${cancellerName} has cancelled the reservation for "${reservation.van?.title}".${shouldRefund ? ' The deposit will be refunded.' : ''}`,
      reservationId: reservationId,
      vanId: reservation.vanId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { 
      success: true, 
      message: shouldRefund ? 'Reservation cancelled and refunded' : 'Reservation cancelled',
      refunded: shouldRefund,
    };

  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});


// ============================================
// 📊 GET RESERVATION
// ============================================
// Récupérer les détails d'une réservation

exports.getReservation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { reservationId } = data;

  if (!reservationId) {
    throw new functions.https.HttpsError('invalid-argument', 'Reservation ID is required');
  }

  try {
    const reservationDoc = await db.collection('reservations').doc(reservationId).get();

    if (!reservationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Reservation not found');
    }

    const reservation = reservationDoc.data();
    const userId = context.auth.uid;

    // Vérifier les permissions
    if (reservation.buyerId !== userId && reservation.sellerId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized to view this reservation');
    }

    return {
      id: reservationDoc.id,
      ...reservation,
      createdAt: reservation.createdAt?.toDate?.() || null,
      paidAt: reservation.paidAt?.toDate?.() || null,
      confirmedAt: reservation.confirmedAt?.toDate?.() || null,
    };

  } catch (error) {
    console.error('Error getting reservation:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});