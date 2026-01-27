// ============================================
// 🔥 FIREBASE CLOUD FUNCTIONS - Kiwi Van Market
// ============================================
//
// ✅ Email notifications (Resend)
// 🔒 Stripe payment functions (COMMENTED - activate when needed)
//
// ============================================

require('dotenv').config();
const admin = require('firebase-admin');

// Firebase Functions v2 imports
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');

// Resend for email notifications
const { Resend } = require('resend');

// ✅ Define secrets for Firebase Functions v2
const resendApiKey = defineSecret('RESEND_API_KEY');

// Initialiser Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Escape HTML to prevent XSS in email templates
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================
// 📧 EMAIL NOTIFICATION - New Conversation
// ============================================
// Sends ONE email per new conversation (not per message)
// Uses Resend (free: 100 emails/day)

exports.onNewConversation = onDocumentCreated(
  {
    document: 'conversations/{conversationId}',
    secrets: [resendApiKey], // ✅ Declare secret dependency
  },
  async (event) => {
  const conversation = event.data.data();
  const conversationId = event.params.conversationId;

  console.log(`📧 New conversation created: ${conversationId}`);
  console.log('📝 Conversation data:', JSON.stringify(conversation, null, 2));

  // ✅ Support multiple ways to get sellerId (backward compatibility)
  const sellerId = conversation.sellerId ||
                   conversation.participants?.find(p => p !== conversation.buyerId) ||
                   null;

  if (!sellerId || !conversation.vanId) {
    console.log('❌ Missing sellerId or vanId', { sellerId, vanId: conversation.vanId });
    return null;
  }

  try {
    // Initialiser Resend avec le secret Firebase
    const apiKey = resendApiKey.value();
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      return null;
    }
    const resend = new Resend(apiKey);

    // ✅ D'abord essayer de récupérer l'email depuis participantEmails (plus fiable)
    let sellerEmail = conversation.participantEmails?.[sellerId];
    let sellerName = conversation.participantNames?.[sellerId] || 'there';

    // Si pas d'email dans la conversation, chercher dans users
    if (!sellerEmail) {
      const sellerDoc = await db.collection('users').doc(sellerId).get();
      if (!sellerDoc.exists) {
        console.log('❌ Seller not found in users collection');
        return null;
      }
      const seller = sellerDoc.data();
      sellerEmail = seller.email;
      sellerName = seller.displayName || seller.name || 'there';
    }

    // ✅ Utiliser les infos du van de la conversation (plus rapide) ou récupérer depuis DB
    let van = conversation.van;
    if (!van || !van.title) {
      const vanDoc = await db.collection('vans').doc(conversation.vanId).get();
      if (!vanDoc.exists) {
        console.log('❌ Van not found');
        return null;
      }
      van = vanDoc.data();
    }

    // Récupérer le nom de l'acheteur
    const buyerName = conversation.buyerName ||
                      conversation.participantNames?.[conversation.buyerId] ||
                      'Someone';

    // Premier message (preview)
    const firstMessage = conversation.lastMessage || conversation.firstMessage || '';
    const messagePreview = firstMessage.length > 100
      ? firstMessage.substring(0, 100) + '...'
      : firstMessage;

    if (!sellerEmail) {
      console.log('❌ Seller has no email');
      return null;
    }

    // Escape user-provided values for safe HTML injection
    const safeSellerName = escapeHtml(sellerName);
    const safeBuyerName = escapeHtml(buyerName);
    const safeVanTitle = escapeHtml(van.title);
    const safeMessagePreview = escapeHtml(messagePreview);

    // Envoyer l'email
    const { data, error } = await resend.emails.send({
      from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
      to: sellerEmail,
      subject: `💬 New inquiry about your ${safeVanTitle}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚐 New Message!</h1>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Hi ${safeSellerName},
            </p>

            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Great news! <strong>${safeBuyerName}</strong> is interested in your <strong>${safeVanTitle}</strong> (NZ$${van.price?.toLocaleString() || 'N/A'}).
            </p>

            ${safeMessagePreview ? `
              <div style="background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">They wrote:</p>
                <p style="color: #374151; font-size: 15px; margin: 0; font-style: italic;">"${safeMessagePreview}"</p>
              </div>
            ` : ''}

            <a href="https://kiwivanmarket.com" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 20px 0;">
              → Reply now
            </a>

            <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
              Good luck with your sale!<br/>
              <strong>Kiwi Van Market</strong> 🥝
            </p>
          </div>

          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
            You received this email because someone contacted you on Kiwi Van Market.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return null;
    }

    console.log(`✅ Email sent to ${sellerEmail} - ID: ${data?.id}`);

    // Marquer que l'email a été envoyé (pour éviter les doublons)
    await event.data.ref.update({
      emailNotificationSent: true,
      emailNotificationSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, emailId: data?.id };

  } catch (error) {
    console.error('❌ Error sending email notification:', error);
    return null;
  }
});


// ============================================
// 📧 EMAIL NOTIFICATION - New Message
// ============================================
// Sends an email when a new message is added to an existing conversation
// Throttled: max 1 email per conversation per 10 minutes

exports.onNewMessage = onDocumentCreated(
  {
    document: 'conversations/{conversationId}/messages/{messageId}',
    secrets: [resendApiKey],
  },
  async (event) => {
    const message = event.data.data();
    const conversationId = event.params.conversationId;
    const senderId = message.senderId;

    console.log(`📧 New message in conversation: ${conversationId}`);

    try {
      // Get the conversation
      const convDoc = await db.collection('conversations').doc(conversationId).get();
      if (!convDoc.exists) {
        console.log('❌ Conversation not found');
        return null;
      }
      const conversation = convDoc.data();

      // Don't send if the conversation was just created (onNewConversation handles that)
      const createdAt = conversation.createdAt?._seconds || 0;
      const now = Math.floor(Date.now() / 1000);
      if (now - createdAt < 30) {
        console.log('⏭️ Conversation just created, skipping (onNewConversation handles it)');
        return null;
      }

      // Throttle: check last email sent time
      const lastEmailAt = conversation.lastMessageEmailAt?._seconds || 0;
      if (now - lastEmailAt < 600) { // 10 minutes
        console.log('⏭️ Email sent recently, throttling');
        return null;
      }

      // Find the recipient (the other participant)
      const recipientId = conversation.participants?.find(p => p !== senderId);
      if (!recipientId) {
        console.log('❌ Recipient not found');
        return null;
      }

      // Get recipient email
      let recipientEmail = conversation.participantEmails?.[recipientId];
      let recipientName = conversation.participantNames?.[recipientId] || 'there';

      if (!recipientEmail) {
        const recipientDoc = await db.collection('users').doc(recipientId).get();
        if (!recipientDoc.exists) {
          console.log('❌ Recipient not found in users collection');
          return null;
        }
        const recipient = recipientDoc.data();
        recipientEmail = recipient.email;
        recipientName = recipient.displayName || recipient.name || 'there';
      }

      if (!recipientEmail) {
        console.log('❌ Recipient has no email');
        return null;
      }

      // Init Resend
      const apiKey = resendApiKey.value();
      if (!apiKey) {
        console.error('❌ RESEND_API_KEY not configured');
        return null;
      }
      const resend = new Resend(apiKey);

      const senderName = message.senderName || conversation.participantNames?.[senderId] || 'Someone';
      const vanTitle = conversation.van?.title || 'a listing';
      const messagePreview = (message.text || '').length > 100
        ? message.text.substring(0, 100) + '...'
        : (message.text || '');

      const safeRecipientName = escapeHtml(recipientName);
      const safeSenderName = escapeHtml(senderName);
      const safeVanTitle = escapeHtml(vanTitle);
      const safeMessagePreview = escapeHtml(messagePreview);

      const { data, error } = await resend.emails.send({
        from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
        to: recipientEmail,
        subject: `💬 New message from ${safeSenderName} about ${safeVanTitle}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">💬 New Message!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Hi ${safeRecipientName},
              </p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                <strong>${safeSenderName}</strong> sent you a message about <strong>${safeVanTitle}</strong>.
              </p>
              ${safeMessagePreview ? `
                <div style="background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Message:</p>
                  <p style="color: #374151; font-size: 15px; margin: 0; font-style: italic;">"${safeMessagePreview}"</p>
                </div>
              ` : ''}
              <a href="https://kiwivanmarket.com" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 20px 0;">
                Reply now
              </a>
              <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
                <strong>Kiwi Van Market</strong> 🥝
              </p>
            </div>
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
              You received this email because someone messaged you on Kiwi Van Market.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return null;
      }

      console.log(`✅ Message email sent to ${recipientEmail} - ID: ${data?.id}`);

      // Update throttle timestamp
      await convDoc.ref.update({
        lastMessageEmailAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, emailId: data?.id };
    } catch (error) {
      console.error('❌ Error sending message email:', error);
      return null;
    }
  }
);


// ============================================
// 🗑️ DELETE USER - Admin only
// ============================================
const { onCall, HttpsError } = require('firebase-functions/v2/https');

exports.deleteUser = onCall(async (request) => {
  // Verify caller is admin
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Only admins can delete users.');
  }

  const userId = request.data.userId;
  if (!userId || typeof userId !== 'string') {
    throw new HttpsError('invalid-argument', 'A valid userId is required.');
  }

  // Prevent self-deletion
  if (userId === request.auth.uid) {
    throw new HttpsError('failed-precondition', 'You cannot delete your own account.');
  }

  try {
    // 1. Delete all vans belonging to this user
    const vansSnapshot = await db.collection('vans')
      .where('seller.uid', '==', userId)
      .get();

    const batch = db.batch();
    let vansDeleted = 0;

    vansSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      vansDeleted++;
    });

    // 2. Delete the user document from Firestore
    batch.delete(db.collection('users').doc(userId));

    await batch.commit();

    // 3. Delete the Firebase Auth account
    await admin.auth().deleteUser(userId);

    console.log(`✅ User ${userId} deleted: ${vansDeleted} vans removed`);

    return { success: true, vansDeleted };
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw new HttpsError('internal', 'Failed to delete user: ' + error.message);
  }
});

/* ============================================
// 🔒 STRIPE FUNCTIONS - COMMENTED OUT
// ============================================
// Uncomment when you're ready to use Stripe payments
// Don't forget to add STRIPE_SECRET_KEY to .env

const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');

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
];

function isOriginAllowed(origin) {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

function setCorsHeaders(res, origin) {
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  res.set('Access-Control-Allow-Origin', allowedOrigin);
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Max-Age', '3600');
}

// ============================================
// 💰 CONFIG PAIEMENT
// ============================================

const PAYMENT_CONFIG = {
  MIN_DEPOSIT: 500,
  DEPOSIT_PERCENTAGE: 5,
  PERCENTAGE_THRESHOLD: 10000,
  PLATFORM_FEE_PERCENTAGE: 5,
  CURRENCY: 'nzd',
  SELLER_RESPONSE_HOURS: 48,
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

// ... REST OF STRIPE FUNCTIONS ...
// See full code in git history or backup

============================================ */
