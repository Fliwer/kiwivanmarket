// ============================================
// 🔥 FIREBASE CLOUD FUNCTIONS - Kiwi Van Market
// ============================================
//
// ✅ Email notifications (Resend)
// 🔒 Stripe (Checkout, Connect, webhook) — secrets via Secret Manager
//
// ============================================

require('dotenv').config();
const admin = require('firebase-admin');

// Firebase Functions v2 imports
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');

// Resend for email notifications
const { Resend } = require('resend');

// ✅ Define secrets for Firebase Functions v2
const resendApiKey = defineSecret('RESEND_API_KEY');
const geminiApiKey = defineSecret('GEMINI_API_KEY');
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');

const { GoogleGenerativeAI } = require('@google/generative-ai');

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
// Sends email to recipient when a new message arrives
// Only sends if recipient hasn't been notified in the last 30 minutes

exports.onNewMessage = onDocumentCreated(
  {
    document: 'conversations/{conversationId}/messages/{messageId}',
    secrets: [resendApiKey],
  },
  async (event) => {
    const message = event.data.data();
    const conversationId = event.params.conversationId;

    // Don't send email for system messages
    if (!message.senderId || message.type === 'system') return null;

    try {
      const convDoc = await db.collection('conversations').doc(conversationId).get();
      if (!convDoc.exists) return null;
      const conv = convDoc.data();

      // Find recipient (the other participant)
      const recipientId = conv.participants?.find(p => p !== message.senderId);
      if (!recipientId) return null;

      // Check if we already sent a notification recently (throttle: 30 min)
      const lastNotif = conv.lastEmailNotification?.[recipientId];
      if (lastNotif) {
        const lastNotifTime = lastNotif.toDate ? lastNotif.toDate() : new Date(lastNotif);
        const diffMin = (Date.now() - lastNotifTime.getTime()) / 60000;
        if (diffMin < 30) {
          console.log(`⏳ Notification throttled for ${recipientId} (${Math.round(diffMin)}min ago)`);
          return null;
        }
      }

      // Skip if this is the very first message (handled by onNewConversation)
      if (conv.emailNotificationSent && !conv.lastEmailNotification) {
        // First message already handled, but mark the tracking field
        await convDoc.ref.update({
          [`lastEmailNotification.${recipientId}`]: admin.firestore.FieldValue.serverTimestamp(),
        });
        return null;
      }

      // Get recipient email
      let recipientEmail = conv.participantEmails?.[recipientId];
      let recipientName = conv.participantNames?.[recipientId] || 'there';

      if (!recipientEmail) {
        const userDoc = await db.collection('users').doc(recipientId).get();
        if (!userDoc.exists) return null;
        const userData = userDoc.data();
        recipientEmail = userData.email;
        recipientName = userData.displayName || userData.name || 'there';
      }

      if (!recipientEmail) return null;

      const senderName = conv.participantNames?.[message.senderId] || 'Someone';
      const vanTitle = conv.van?.title || 'a van';
      const messagePreview = (message.text || '').length > 100
        ? message.text.substring(0, 100) + '...'
        : (message.text || '');

      const safeRecipientName = escapeHtml(recipientName);
      const safeSenderName = escapeHtml(senderName);
      const safeVanTitle = escapeHtml(vanTitle);
      const safeMessagePreview = escapeHtml(messagePreview);

      const apiKey = resendApiKey.value();
      if (!apiKey) return null;
      const resend = new Resend(apiKey);

      const { data, error } = await resend.emails.send({
        from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
        to: recipientEmail,
        subject: `💬 New message from ${safeSenderName} about ${safeVanTitle}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Message</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
              <p style="font-size: 16px; color: #374151;">Hi ${safeRecipientName},</p>
              <p style="font-size: 16px; color: #374151;">
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
                <strong>Kiwi Van Market</strong>
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

      console.log(`✅ Message notification sent to ${recipientEmail} - ID: ${data?.id}`);

      // Update throttle timestamp
      await convDoc.ref.update({
        [`lastEmailNotification.${recipientId}`]: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error sending message notification:', error);
      return null;
    }
  }
);


// ============================================
// ⏰ REMINDER EMAIL - Unanswered conversations
// ============================================
// Runs every 3 hours, checks for conversations where
// the seller hasn't replied within 6 hours of receiving a message

exports.sendReminderEmails = onSchedule(
  {
    schedule: 'every 3 hours',
    secrets: [resendApiKey],
  },
  async () => {
    console.log('⏰ Running reminder email check...');

    try {
      const apiKey = resendApiKey.value();
      if (!apiKey) {
        console.error('❌ RESEND_API_KEY not configured');
        return;
      }
      const resend = new Resend(apiKey);

      // Find conversations with recent messages (last 24h) that may need reminders
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const reminderThreshold = new Date(Date.now() - 6 * 60 * 60 * 1000); // 6 hours ago

      const convsSnapshot = await db.collection('conversations')
        .where('lastMessageAt', '>=', cutoff)
        .get();

      let remindersSent = 0;

      for (const convDoc of convsSnapshot.docs) {
        const conv = convDoc.data();

        // Skip if reminder already sent for this round
        if (conv.reminderSentAt) {
          const reminderTime = conv.reminderSentAt.toDate ? conv.reminderSentAt.toDate() : new Date(conv.reminderSentAt);
          if (Date.now() - reminderTime.getTime() < 12 * 60 * 60 * 1000) {
            continue; // Already sent a reminder in the last 12h
          }
        }

        // Check if last message is old enough (> 6h)
        const lastMsgTime = conv.lastMessageAt?.toDate ? conv.lastMessageAt.toDate() : new Date(conv.lastMessageAt);
        if (lastMsgTime > reminderThreshold) {
          continue; // Too recent, don't remind yet
        }

        // Find who sent the last message and who needs reminding
        const lastSenderId = conv.lastMessageSenderId;
        if (!lastSenderId) continue;

        const recipientId = conv.participants?.find(p => p !== lastSenderId);
        if (!recipientId) continue;

        // Get recipient email
        let recipientEmail = conv.participantEmails?.[recipientId];
        let recipientName = conv.participantNames?.[recipientId] || 'there';

        if (!recipientEmail) {
          const userDoc = await db.collection('users').doc(recipientId).get();
          if (!userDoc.exists) continue;
          const userData = userDoc.data();
          recipientEmail = userData.email;
          recipientName = userData.displayName || userData.name || 'there';
        }

        if (!recipientEmail) continue;

        const senderName = conv.participantNames?.[lastSenderId] || 'Someone';
        const vanTitle = conv.van?.title || 'a van';

        const safeRecipientName = escapeHtml(recipientName);
        const safeSenderName = escapeHtml(senderName);
        const safeVanTitle = escapeHtml(vanTitle);

        const { data, error } = await resend.emails.send({
          from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
          to: recipientEmail,
          subject: `Reminder: ${safeSenderName} is waiting for your reply about ${safeVanTitle}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Don't miss out!</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
                <p style="font-size: 16px; color: #374151;">Hi ${safeRecipientName},</p>
                <p style="font-size: 16px; color: #374151;">
                  <strong>${safeSenderName}</strong> messaged you about <strong>${safeVanTitle}</strong> and is still waiting for a reply.
                </p>
                <p style="font-size: 16px; color: #374151;">
                  Responding quickly increases your chances of closing the deal!
                </p>
                <a href="https://kiwivanmarket.com" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 20px 0;">
                  Reply now
                </a>
                <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
                  <strong>Kiwi Van Market</strong>
                </p>
              </div>
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
                You received this email because you have an unanswered message on Kiwi Van Market.
              </p>
            </div>
          `,
        });

        if (error) {
          console.error(`❌ Reminder error for ${recipientEmail}:`, error);
          continue;
        }

        console.log(`✅ Reminder sent to ${recipientEmail} - ID: ${data?.id}`);
        remindersSent++;

        // Mark reminder as sent
        await convDoc.ref.update({
          reminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      console.log(`⏰ Reminder check complete: ${remindersSent} reminders sent`);
    } catch (error) {
      console.error('❌ Error in reminder emails:', error);
    }
  }
);


// ============================================
// 🗑️ DELETE USER - Admin only
// ============================================
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');

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

// ============================================
// 📣 EMAIL CAMPAIGN - CarJam Feature Broadcast
// ============================================
// Admin-only callable function to email users about
// the new CarJam plate feature for higher buyer trust.
//
// Example payload:
// {
//   "dryRun": true,
//   "limit": 80,
//   "onlySellers": true
// }
exports.sendCarJamCampaign = onCall(
  {
    secrets: [resendApiKey],
    timeoutSeconds: 540,
  },
  async (request) => {
    if (!request.auth || request.auth.token.admin !== true) {
      throw new HttpsError('permission-denied', 'Only admins can send campaigns.');
    }

    const dryRun = request.data?.dryRun !== false; // default true for safety
    const onlySellers = request.data?.onlySellers !== false; // default true
    const limit = Math.min(Math.max(parseInt(request.data?.limit || 80, 10), 1), 200);

    const usersSnap = await db.collection('users').get();
    if (usersSnap.empty) {
      return { success: true, dryRun, totalCandidates: 0, message: 'No users found.' };
    }

    // Build seller set from listed vans so campaign can focus on relevant users.
    const sellerIds = new Set();
    const sellerEmailFromVans = new Map();
    const vansBySeller = new Map();
    const primaryVanIdBySeller = new Map();
    const hasActivePrimaryBySeller = new Set();

    const vansSnap = await db.collection('vans')
      .where('status', 'in', ['active', 'sold'])
      .get();

    vansSnap.forEach((doc) => {
      const van = doc.data();
      const uid = van?.seller?.uid;
      const email = (van?.seller?.email || '').trim().toLowerCase();
      if (!uid) return;
      sellerIds.add(uid);
      if (email) sellerEmailFromVans.set(uid, email);
      vansBySeller.set(uid, (vansBySeller.get(uid) || 0) + 1);
      if (!primaryVanIdBySeller.has(uid)) {
        primaryVanIdBySeller.set(uid, doc.id);
      }
      if (van?.status === 'active' && !hasActivePrimaryBySeller.has(uid)) {
        primaryVanIdBySeller.set(uid, doc.id);
        hasActivePrimaryBySeller.add(uid);
      }
    });

    const recipients = [];
    const seenEmails = new Set();

    usersSnap.forEach((doc) => {
      const user = doc.data() || {};
      const uid = doc.id;

      if (onlySellers && !sellerIds.has(uid)) return;
      if (user.banned === true) return;

      const email = (user.email || sellerEmailFromVans.get(uid) || '').trim().toLowerCase();
      if (!email || !email.includes('@')) return;
      if (seenEmails.has(email)) return;

      seenEmails.add(email);
      recipients.push({
        uid,
        email,
        name: user.displayName || user.name || 'there',
        vansCount: vansBySeller.get(uid) || 0,
        primaryVanId: primaryVanIdBySeller.get(uid) || null,
      });
    });

    recipients.sort((a, b) => b.vansCount - a.vansCount);

    if (dryRun) {
      return {
        success: true,
        dryRun: true,
        totalUsers: usersSnap.size,
        totalCandidates: recipients.length,
        wouldSend: Math.min(limit, recipients.length),
        onlySellers,
        sample: recipients.slice(0, 10),
      };
    }

    const apiKey = resendApiKey.value();
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'RESEND_API_KEY is not configured.');
    }

    const resend = new Resend(apiKey);
    const toSend = recipients.slice(0, limit);
    const sent = [];
    const failed = [];

    for (const recipient of toSend) {
      const safeName = escapeHtml(recipient.name);
      const editUrl = recipient.primaryVanId
        ? `https://kiwivanmarket.com/my-listings?edit=${encodeURIComponent(recipient.primaryVanId)}&focus=plate`
        : 'https://kiwivanmarket.com/my-listings?focus=plate';
      const { data, error } = await resend.emails.send({
        from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
        to: recipient.email,
        subject: 'Nouvelle fonctionnalite CarJam / New CarJam trust feature',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 28px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">Nouvelle fonctionnalite CarJam</h1>
            </div>
            <div style="background: #f8fafc; padding: 28px; border-radius: 0 0 16px 16px;">
              <p style="font-size: 16px; color: #1f2937;">Hi ${safeName},</p>
              <p style="font-size: 15px; color: #374151; line-height: 1.6;">
                <strong>FR :</strong> Nouvelle fonctionnalite sur Kiwi Van Market : les acheteurs peuvent maintenant acceder directement a une verification <strong>CarJam</strong> depuis votre annonce.
              </p>
              <p style="font-size: 15px; color: #374151; line-height: 1.6;">
                Pour l'activer, ajoutez simplement votre <strong>plaque d'immatriculation</strong> dans l'edition de votre annonce.
                C'est un vrai signal de confiance qui augmente generalement les messages d'acheteurs serieux.
              </p>
              <a href="${editUrl}" style="display:inline-block; margin: 18px 0; background: #0ea5e9; color: #fff; text-decoration: none; font-weight: 700; padding: 12px 22px; border-radius: 10px;">
                Mettre a jour mon annonce
              </a>
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:22px 0;" />
              <p style="font-size: 15px; color: #374151; line-height: 1.6;">
                <strong>EN:</strong> New on Kiwi Van Market: buyers can now access a <strong>CarJam safety check</strong> directly from your listing.
              </p>
              <p style="font-size: 15px; color: #374151; line-height: 1.6;">
                To activate it, simply add your <strong>license plate</strong> in your listing edit form.
                This boosts trust and usually increases serious buyer messages.
              </p>
              <a href="${editUrl}" style="display:inline-block; margin: 8px 0 18px; background: #0ea5e9; color: #fff; text-decoration: none; font-weight: 700; padding: 12px 22px; border-radius: 10px;">
                Update my listing now
              </a>
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                Besoin d'aide ? Repondez simplement a cet email et on vous aide.
              </p>
              <p style="font-size: 14px; color: #111827; margin-top: 20px;">
                Kiwi Van Market team
              </p>
            </div>
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">
              You received this email because you have an account on Kiwi Van Market.
            </p>
          </div>
        `,
      });

      if (error) {
        failed.push({ email: recipient.email, error: error.message || 'Unknown error' });
      } else {
        sent.push({ email: recipient.email, emailId: data?.id || null });
      }

      // Keep a small gap to stay gentle with provider limits
      await sleep(250);
    }

    return {
      success: true,
      dryRun: false,
      requestedLimit: limit,
      totalCandidates: recipients.length,
      sentCount: sent.length,
      failedCount: failed.length,
      sent,
      failed: failed.slice(0, 20),
      hasMoreFailures: failed.length > 20,
    };
  }
);

// ============================================
// 🗺️ DYNAMIC SITEMAP GENERATOR for SEO
// ============================================

exports.sitemap = onRequest({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 30
}, async (req, res) => {
  try {
    const baseUrl = 'https://kiwivanmarket.com';
    const date = new Date().toISOString().split('T')[0];
    
    // Fetch all active/sold vans
    const vansSnapshot = await db.collection('vans')
      .where('status', 'in', ['active', 'sold'])
      .orderBy('updatedAt', 'desc')
      .get();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Core Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${date}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/sell</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/guides</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/faq</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/why</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/buyback-calculator</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/llms.txt</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/llms-full.txt</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

    // 1. Guides - Using the slugs from GUIDES.en
    const guideSlugs = [
      'buying-campervan-nz',
      'selling-campervan-nz',
      'how-to-inspect-campervan-nz',
      'freedom-camping-nz',
      'winter-camping-nz',
      'south-island-road-trip',
      'best-vanlife-apps-nz'
    ];
    guideSlugs.forEach(slug => {
      xml += `  <url>
    <loc>${baseUrl}/guide/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });

    // 2. Brands - Popular ones for SEO
    const brands = [
      'toyota-hiace', 
      'nissan-caravan', 
      'mazda-bongo', 
      'mitsubishi-delica', 
      'ford-transit', 
      'mercedes-sprinter',
      'volkswagen-transporter'
    ];
    brands.forEach(brand => {
      xml += `  <url>
    <loc>${baseUrl}/brand/${brand}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });

    // 3. Locations - Major backpacker hubs
    const locations = [
      'auckland',
      'christchurch',
      'queenstown',
      'wellington',
      'nelson',
      'tauranga',
      'rotorua',
      'dunedin',
      'hamilton'
    ];
    locations.forEach(location => {
      xml += `  <url>
    <loc>${baseUrl}/location/${location}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });

    // 4. Programmatic long-tail search landing pages (high volume set)
    const longTailCities = [
      'auckland',
      'christchurch',
      'wellington',
      'queenstown',
      'hamilton',
      'tauranga',
      'rotorua',
      'dunedin',
      'nelson',
    ];
    const longTailBudgets = [8000, 12000, 15000, 18000, 22000];
    const longTailBrands = [
      'toyota-hiace',
      'nissan-caravan',
      'mazda-bongo',
      'mitsubishi-delica',
      'ford-transit',
      'mercedes-sprinter',
    ];
    const brandCityFocus = ['auckland', 'christchurch', 'wellington', 'queenstown'];
    const brandBudgets = [12000, 18000, 22000];
    const longTailSearchPages = [];

    longTailCities.forEach((city) => {
      longTailBudgets.forEach((budget) => {
        longTailSearchPages.push(`buy-campervan-in-${city}-under-${budget}`);
      });
      longTailSearchPages.push(`self-contained-van-${city}`);
    });

    longTailBrands.forEach((brand) => {
      brandCityFocus.forEach((city) => {
        brandBudgets.forEach((budget) => {
          longTailSearchPages.push(`${brand}-${city}-under-${budget}`);
        });
      });
    });
    longTailSearchPages.forEach((slug) => {
      xml += `  <url>
    <loc>${baseUrl}/search/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>\n`;
    });

    // 5. Programmatic FAQ pages by location/brand
    locations.forEach((location) => {
      xml += `  <url>
    <loc>${baseUrl}/faq/location/${location}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.65</priority>
  </url>\n`;
    });
    brands.forEach((brand) => {
      xml += `  <url>
    <loc>${baseUrl}/faq/brand/${brand}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.65</priority>
  </url>\n`;
    });

    // 6. Dynamic Vans
    vansSnapshot.forEach(doc => {
      const van = doc.data();
      let lastModDate = new Date();
      
      if (van.updatedAt) {
        lastModDate = van.updatedAt.toDate ? van.updatedAt.toDate() : new Date(van.updatedAt);
      } else if (van.createdAt) {
        lastModDate = van.createdAt.toDate ? van.createdAt.toDate() : new Date(van.createdAt);
      }
      
      const lastMod = lastModDate.toISOString().split('T')[0];
      
      xml += `  <url>
    <loc>${baseUrl}/van/${doc.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });

    xml += '</urlset>';

    res.set('Content-Type', 'text/xml');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=14400');
    res.status(200).send(xml);

  } catch (error) {
    console.error('❌ Error generating dynamic sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// ============================================
// 🚗 CARJAM API - Vehicle details autofill
// ============================================

const carjamApiKey = defineSecret('CARJAM_API_KEY');

exports.fetchCarJamData = onCall(
  {
    secrets: [carjamApiKey],
    timeoutSeconds: 15,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be logged in to fetch vehicle data.');
    }

    const { plate } = request.data;
    if (!plate || plate.trim() === '') {
      throw new HttpsError('invalid-argument', 'License plate is required.');
    }

    try {
      let apiKey;
      try {
        apiKey = carjamApiKey.value();
      } catch (e) {
        // Secret not available in local or not set
        apiKey = null;
      }
      
      // If no usable API key is configured, return mock data to keep the UI working
      if (!apiKey || apiKey === 'not-set' || apiKey === 'changeme') {
         console.warn("CARJAM_API_KEY is not set. Returning mock data.");
         return {
           year: 2008,
           make: "TOYOTA",
           model: "HIACE",
           mocked: true
         };
      }

      // Real fetch logic
      const response = await fetch(`https://carjam.co.nz/api/car/?plate=${encodeURIComponent(plate)}&key=${apiKey}&format=json`);
      
      if (!response.ok) {
        console.error("Carjam error:", response.status);
        throw new HttpsError('internal', 'CarJam API returned an error.');
      }
      
      const data = await response.json();
      
      return {
        year: data.year_of_manufacture || data.year,
        make: data.make,
        model: data.model,
        mocked: false
      };
      
    } catch (error) {
      console.error('❌ CarJam Fetch error:', error);
      throw new HttpsError('internal', 'Failed to fetch vehicle data.');
    }
  }
);

// ============================================
// ✨ AI LISTING ASSISTANT - Generate Description
// ============================================

exports.generateVanDescription = onCall(
  {
    secrets: [geminiApiKey],
    // Increase timeout for AI generation
    timeoutSeconds: 60,
  },
  async (request) => {
    // 1. Basic Auth Check
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be logged in to use AI Assistant.');
    }

    const vanData = request.data;
    if (!vanData || !vanData.title) {
      throw new HttpsError('invalid-argument', 'Van title and basic info are required.');
    }

    try {
      const apiKey = geminiApiKey.value();
      if (!apiKey) {
        throw new HttpsError('failed-precondition', 'AI Service not configured.');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Build a detailed prompt based on van data
      const equipmentList = Object.entries(vanData.equipment || {})
        .filter(([_, value]) => value === true)
        .map(([key, _]) => key)
        .join(', ');

      const prompt = `
        You are an expert van life copywriter for "Kiwi Van Market", the #1 platform in New Zealand.
        Generate a professional, compelling, and honest van listing description for a ${vanData.year || '[YEAR]'} ${vanData.title}.
        
        Details provided:
        - Price: ${vanData.price ? `NZ$${vanData.price}` : '[PRICE]'}
        - Mileage: ${vanData.mileage ? `${vanData.mileage} km` : '[MILEAGE]'}
        - Location: ${vanData.location || '[LOCATION]'}, ${vanData.region || 'New Zealand'}
        - Type: ${vanData.type || 'Van'}
        - Capacity: ${vanData.capacity || '[CAPACITY]'} people
        - Self-Contained: ${vanData.selfContained ? `Yes (${vanData.selfContainedType})` : 'No'}
        - Equipment: ${equipmentList || 'Basic setup'}
        - Extra features: ${vanData.customFeatures || 'None'}
        
        Guidelines:
        - If some details above are marked with brackets like [PRICE], please use your best judgement to write a general description or use those placeholders so the user can fill them in later.
        - Start with a catchy opening.
        - Highlight key selling points (reliability, specific features, NZ travel readiness).
        - Use a friendly but professional tone.
        - Structure with bullet points for readability.
        - Language: Generate the response in the language most appropriate for the title/location (mainly English, but French or Spanish if the input suggests it).
        - Length: Around 150-250 words.
        - DO NOT mention seller contact details (phone/email).
        - End with a call to action.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        description: text.trim()
      };
    } catch (error) {
      console.error('❌ AI Generation error:', error);
      throw new HttpsError('internal', 'Failed to generate description: ' + error.message);
    }
  }
);

// ============================================
// 💳 STRIPE PAYMENTS - Production Grade
// ============================================
const Stripe = require('stripe');

const ALLOWED_ORIGINS = [
  'https://kiwivanmarket.com',
  'https://www.kiwivanmarket.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

const PAYMENT_CONFIG = {
  MIN_DEPOSIT: 500,
  DEPOSIT_PERCENTAGE: 5,
  PERCENTAGE_THRESHOLD: 10000,
  PLATFORM_FEE_PERCENTAGE: 5,
  CURRENCY: 'nzd',
  SELLER_RESPONSE_HOURS: 48,
};

function getStripeClient() {
  const key = stripeSecretKey.value();
  if (!key) {
    throw new HttpsError('failed-precondition', 'STRIPE_SECRET_KEY is not configured.');
  }
  return new Stripe(key);
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

function setCorsHeaders(res, origin) {
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  res.set('Access-Control-Allow-Origin', allowedOrigin);
  res.set('Vary', 'Origin');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Max-Age', '3600');
}

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
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new HttpsError('unauthenticated', 'Missing authentication token');
  }
  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) {
    throw new HttpsError('unauthenticated', 'Invalid authentication token');
  }
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('❌ Invalid token:', error.message);
    throw new HttpsError('unauthenticated', 'Invalid authentication token');
  }
}

function sanitizeBaseUrl(baseUrl) {
  if (!baseUrl || typeof baseUrl !== 'string') return 'https://kiwivanmarket.com';
  const normalized = baseUrl.trim().replace(/\/+$/, '');
  return ALLOWED_ORIGINS.includes(normalized) ? normalized : 'https://kiwivanmarket.com';
}

async function refreshStripeAccountSnapshot(stripe, uid) {
  const stripeRef = db.collection('stripeAccounts').doc(uid);
  const stripeDoc = await stripeRef.get();
  if (!stripeDoc.exists) return null;
  const data = stripeDoc.data();
  if (!data?.stripeAccountId) return null;

  const account = await stripe.accounts.retrieve(data.stripeAccountId);
  const patch = {
    chargesEnabled: !!account.charges_enabled,
    payoutsEnabled: !!account.payouts_enabled,
    detailsSubmitted: !!account.details_submitted,
    disabledReason: account.requirements?.disabled_reason || null,
    currentlyDue: account.requirements?.currently_due || [],
    eventuallyDue: account.requirements?.eventually_due || [],
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastCheckedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await stripeRef.set(patch, { merge: true });

  return { ...data, ...patch };
}

exports.createStripeConnectAccount = onCall(
  { secrets: [stripeSecretKey], timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email || null;
    const baseUrl = sanitizeBaseUrl(request.data?.baseUrl);
    const stripe = getStripeClient();
    const stripeRef = db.collection('stripeAccounts').doc(uid);
    const existing = await stripeRef.get();

    let accountId = existing.data()?.stripeAccountId || null;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'NZ',
        email: email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: uid,
          source: 'kiwivanmarket',
        },
      });
      accountId = account.id;
      await stripeRef.set(
        {
          userId: uid,
          stripeAccountId: accountId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/profile?stripe=refresh`,
      return_url: `${baseUrl}/profile?stripe=return`,
      type: 'account_onboarding',
    });

    await refreshStripeAccountSnapshot(stripe, uid);
    return { url: accountLink.url, accountId };
  }
);

exports.checkSellerStripeStatus = onCall(
  { secrets: [stripeSecretKey], timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }
    const uid = request.auth.uid;
    const stripe = getStripeClient();
    const status = await refreshStripeAccountSnapshot(stripe, uid);
    if (!status) {
      return {
        hasAccount: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      };
    }
    return {
      hasAccount: true,
      chargesEnabled: !!status.chargesEnabled,
      payoutsEnabled: !!status.payoutsEnabled,
      detailsSubmitted: !!status.detailsSubmitted,
      disabledReason: status.disabledReason || null,
      currentlyDue: status.currentlyDue || [],
    };
  }
);

exports.getStripeDashboardLink = onCall(
  { secrets: [stripeSecretKey], timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const uid = request.auth.uid;
    const stripeDoc = await db.collection('stripeAccounts').doc(uid).get();
    const accountId = stripeDoc.data()?.stripeAccountId;
    if (!accountId) {
      throw new HttpsError('failed-precondition', 'Stripe account is not configured.');
    }

    const stripe = getStripeClient();
    const link = await stripe.accounts.createLoginLink(accountId);
    return { url: link.url };
  }
);

exports.createCheckoutSession = onRequest(
  { secrets: [stripeSecretKey], timeoutSeconds: 60 },
  async (req, res) => {
    const origin = req.get('origin') || '';
    setCorsHeaders(res, origin);
    if (req.method === 'OPTIONS') return res.status(204).send('');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!isOriginAllowed(origin)) return res.status(403).json({ error: 'Origin not allowed' });

    try {
      const decoded = await verifyAuthToken(req);
      const reservationId = String(req.body?.reservationId || '').trim();
      const vanId = String(req.body?.vanId || '').trim();
      const successUrl = String(req.body?.successUrl || '').trim();
      const cancelUrl = String(req.body?.cancelUrl || '').trim();

      if (!reservationId || !vanId || !successUrl || !cancelUrl) {
        return res.status(400).json({ error: 'Missing required payload.' });
      }

      const reservationRef = db.collection('reservations').doc(reservationId);
      const reservationDoc = await reservationRef.get();
      if (!reservationDoc.exists) return res.status(404).json({ error: 'Reservation not found.' });
      const reservation = reservationDoc.data();

      if (reservation.buyerId !== decoded.uid) {
        return res.status(403).json({ error: 'Forbidden: reservation does not belong to user.' });
      }
      if (reservation.status !== 'pending') {
        return res.status(409).json({ error: 'Reservation is not payable anymore.' });
      }
      if (reservation.vanId !== vanId) {
        return res.status(400).json({ error: 'Van mismatch.' });
      }
      if (reservation.expiresAt) {
        const expires = reservation.expiresAt.toDate ? reservation.expiresAt.toDate() : new Date(reservation.expiresAt);
        if (expires.getTime() <= Date.now()) {
          return res.status(409).json({ error: 'Reservation has expired.' });
        }
      }

      const vanDoc = await db.collection('vans').doc(vanId).get();
      if (!vanDoc.exists) return res.status(404).json({ error: 'Van not found.' });
      const van = vanDoc.data();
      const sellerId = van?.seller?.uid;
      if (!sellerId || reservation.sellerId !== sellerId) {
        return res.status(400).json({ error: 'Seller mismatch.' });
      }

      const stripeAccountDoc = await db.collection('stripeAccounts').doc(sellerId).get();
      const sellerStripeAccountId = stripeAccountDoc.data()?.stripeAccountId;
      const sellerPayoutsEnabled = !!stripeAccountDoc.data()?.payoutsEnabled;
      if (!sellerStripeAccountId || !sellerPayoutsEnabled) {
        return res.status(409).json({ error: 'Seller payment account is not ready yet.' });
      }

      const vanPrice = Number(van?.price || reservation.vanPrice || 0);
      if (!Number.isFinite(vanPrice) || vanPrice <= 0) {
        return res.status(400).json({ error: 'Invalid van price.' });
      }

      const depositAmount = calculateDepositFromPrice(vanPrice);
      const platformFee = calculatePlatformFee(depositAmount);
      const sellerPayout = depositAmount - platformFee;
      const remainingBalance = vanPrice - depositAmount;
      const stripe = getStripeClient();

      if (reservation.checkoutSessionId) {
        try {
          const existing = await stripe.checkout.sessions.retrieve(reservation.checkoutSessionId);
          if (existing?.status === 'open' && existing.url) {
            return res.status(200).json({ url: existing.url, id: existing.id, reused: true });
          }
        } catch (e) {
          console.warn('Unable to reuse previous checkout session:', e.message);
        }
      }

      const session = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          success_url: successUrl,
          cancel_url: cancelUrl,
          payment_method_types: ['card'],
          customer_email: decoded.email || reservation.buyerEmail || undefined,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: PAYMENT_CONFIG.CURRENCY,
                unit_amount: depositAmount * 100,
                product_data: {
                  name: `Reservation deposit - ${van.title || reservation.vanTitle || 'Campervan'}`,
                  description: `Reservation ${reservationId.slice(0, 8).toUpperCase()}`,
                },
              },
            },
          ],
          payment_intent_data: {
            application_fee_amount: platformFee * 100,
            transfer_data: {
              destination: sellerStripeAccountId,
            },
            metadata: {
              reservationId,
              vanId,
              buyerId: decoded.uid,
              sellerId,
            },
          },
          metadata: {
            reservationId,
            vanId,
            buyerId: decoded.uid,
            sellerId,
          },
        },
        { idempotencyKey: `checkout_session_${reservationId}` }
      );

      await reservationRef.set(
        {
          checkoutSessionId: session.id,
          checkoutUrl: session.url || null,
          checkoutSessionCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
          depositAmount,
          platformFee,
          sellerPayout,
          remainingBalance,
          currency: PAYMENT_CONFIG.CURRENCY.toUpperCase(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return res.status(200).json({ url: session.url, id: session.id, reused: false });
    } catch (error) {
      console.error('❌ createCheckoutSession error:', error);
      const message = error instanceof HttpsError ? error.message : 'Failed to create checkout session';
      return res.status(500).json({ error: message });
    }
  }
);

async function markReservationPaidFromSession(session) {
  const reservationId = session.metadata?.reservationId;
  if (!reservationId) return;

  const reservationRef = db.collection('reservations').doc(reservationId);
  const reservationDoc = await reservationRef.get();
  if (!reservationDoc.exists) return;
  const reservation = reservationDoc.data();

  if (['paid', 'buyer_confirmed', 'completed', 'cancelled', 'expired'].includes(reservation.status)) {
    return;
  }

  const vanDoc = await db.collection('vans').doc(reservation.vanId).get();
  const vanPrice = Number(vanDoc.data()?.price || reservation.vanPrice || 0);
  const expectedDeposit = calculateDepositFromPrice(vanPrice);
  const amountPaid = Number(session.amount_total || 0) / 100;
  if (Math.round(amountPaid) !== Math.round(expectedDeposit)) {
    console.error('❌ Amount mismatch in Stripe webhook', { reservationId, amountPaid, expectedDeposit });
    return;
  }

  await reservationRef.set(
    {
      status: 'paid',
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentIntentId: session.payment_intent || null,
      checkoutSessionId: session.id,
      checkoutUrl: admin.firestore.FieldValue.delete(),
      sellerResponseDeadline: new Date(Date.now() + PAYMENT_CONFIG.SELLER_RESPONSE_HOURS * 60 * 60 * 1000),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

exports.stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret], timeoutSeconds: 60 },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');
    const signature = req.get('stripe-signature');
    if (!signature) return res.status(400).send('Missing signature');

    try {
      const stripe = getStripeClient();
      const webhookSecret = stripeWebhookSecret.value();
      if (!webhookSecret) {
        return res.status(500).send('Webhook secret not configured');
      }

      const event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
      const processedRef = db.collection('stripeWebhookEvents').doc(event.id);
      if ((await processedRef.get()).exists) {
        return res.status(200).json({ received: true, duplicate: true });
      }

      if (event.type === 'checkout.session.completed') {
        await markReservationPaidFromSession(event.data.object);
      }

      await processedRef.set({
        type: event.type,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('❌ Stripe webhook error:', error);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
);

exports.getReservation = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const reservationId = String(request.data?.reservationId || '').trim();
  if (!reservationId) {
    throw new HttpsError('invalid-argument', 'reservationId is required.');
  }

  const reservationDoc = await db.collection('reservations').doc(reservationId).get();
  if (!reservationDoc.exists) {
    throw new HttpsError('not-found', 'Reservation not found.');
  }
  const reservation = reservationDoc.data();
  const isParticipant = [reservation.buyerId, reservation.sellerId].includes(request.auth.uid);
  if (!isParticipant && request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Access denied.');
  }
  return { id: reservationDoc.id, ...reservation };
});

exports.confirmReservation = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const reservationId = String(request.data?.reservationId || '').trim();
  if (!reservationId) {
    throw new HttpsError('invalid-argument', 'reservationId is required.');
  }

  const ref = db.collection('reservations').doc(reservationId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Reservation not found.');
  const reservation = snap.data();

  if (reservation.sellerId !== request.auth.uid) {
    throw new HttpsError('permission-denied', 'Only the seller can confirm this reservation.');
  }
  if (reservation.status !== 'paid') {
    throw new HttpsError('failed-precondition', 'Reservation is not in a confirmable state.');
  }

  await ref.set(
    {
      status: 'confirmed',
      sellerAcceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { success: true };
});

exports.cancelReservation = onCall(
  { secrets: [stripeSecretKey], timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const reservationId = String(request.data?.reservationId || '').trim();
    const reason = String(request.data?.reason || '').trim().slice(0, 500);
    if (!reservationId) {
      throw new HttpsError('invalid-argument', 'reservationId is required.');
    }

    const ref = db.collection('reservations').doc(reservationId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError('not-found', 'Reservation not found.');
    const reservation = snap.data();

    const isParticipant = [reservation.buyerId, reservation.sellerId].includes(request.auth.uid);
    if (!isParticipant && request.auth.token.admin !== true) {
      throw new HttpsError('permission-denied', 'Access denied.');
    }
    if (['completed', 'cancelled', 'expired'].includes(reservation.status)) {
      throw new HttpsError('failed-precondition', 'Reservation cannot be cancelled anymore.');
    }

    let refundId = null;
    if (reservation.status === 'paid' && reservation.paymentIntentId) {
      const stripe = getStripeClient();
      const refund = await stripe.refunds.create({
        payment_intent: reservation.paymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          reservationId,
          cancelledBy: request.auth.uid,
        },
      });
      refundId = refund.id;
    }

    await ref.set(
      {
        status: 'cancelled',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        cancelledBy: request.auth.uid,
        cancellationReason: reason || null,
        refundId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true, refundId };
  }
);


// ============================================
// 🔔 BUYER ALERTS — saved searches + price drops
// ============================================

// Replicates the front-end filter logic (src/App.js) so a van can be matched
// against a saved search server-side.
function matchesSearch(van, criteria) {
  if (!van || !criteria) return false;
  const c = criteria;
  const price = van.price || 0;
  if (c.priceMin != null && price < c.priceMin) return false;
  if (c.priceMax != null && price > c.priceMax) return false;
  if (c.yearMin != null && (van.year || 2000) < c.yearMin) return false;
  if (c.type && c.type !== 'all' && van.type !== c.type) return false;
  if (c.location && c.location !== 'all' && van.location !== c.location) return false;
  if (c.selfContained && !van.selfContained) return false;
  if (c.buyBack && !van.buyBack) return false;

  const now = new Date();
  if (c.wofValid && !(van.wofExpiry && new Date(van.wofExpiry) > now)) return false;
  if (c.regoValid && !(van.regoExpiry && new Date(van.regoExpiry) > now)) return false;

  if (c.keyword) {
    const k = String(c.keyword).toLowerCase();
    const hit = [van.title, van.location, van.description]
      .some((s) => (s || '').toLowerCase().includes(k));
    if (!hit) return false;
  }

  if (c.equipment) {
    const eq = van.equipment || {};
    for (const [key, val] of Object.entries(c.equipment)) {
      if (!val) continue;
      let ok;
      if (key === 'shower') ok = eq.outdoorShower || eq.indoorShower;
      else if (key === 'surfRack') ok = eq.surfRack || eq.bikeRack;
      else if (key === 'heater') ok = eq.heater || eq.dieselHeater;
      else ok = eq[key] === true;
      if (!ok) return false;
    }
  }
  return true;
}

function nzd(n) {
  return `NZ$${(Number(n) || 0).toLocaleString('en-NZ')}`;
}

// 🔔 New listing → email buyers whose saved search matches
exports.onVanCreatedNotifySearches = onDocumentCreated(
  { document: 'vans/{vanId}', secrets: [resendApiKey] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const van = snap.data();
    const vanId = event.params.vanId;
    if (!van || van.status !== 'active') return;

    try {
      const apiKey = resendApiKey.value();
      if (!apiKey) { console.error('❌ RESEND_API_KEY not configured'); return; }
      const resend = new Resend(apiKey);

      const searchesSnap = await db.collection('savedSearches').where('active', '==', true).get();
      if (searchesSnap.empty) return;

      const sellerUid = van.seller?.uid || van.userId;
      // One email per user max: keep the first matching search per user.
      const matchedByUser = new Map();
      for (const doc of searchesSnap.docs) {
        const s = doc.data();
        if (s.userId === sellerUid) continue;       // never notify the seller of their own van
        if (matchedByUser.has(s.userId)) continue;
        if (matchesSearch(van, s.criteria)) {
          matchedByUser.set(s.userId, { id: doc.id, ...s });
        }
      }
      if (matchedByUser.size === 0) return;

      const price = nzd(van.price);
      const img = van.imageUrl || (van.images && van.images[0]) || '';
      const vanUrl = `https://www.kiwivanmarket.com/van/${vanId}`;
      const alertsUrl = 'https://www.kiwivanmarket.com/alerts';
      const safeTitle = escapeHtml(van.title || 'A new van');
      const safeLocation = escapeHtml(van.location || '');
      const safeYear = escapeHtml(String(van.year || ''));

      let sent = 0;
      for (const [userId, search] of matchedByUser) {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) continue;
        const u = userDoc.data();
        const email = u.email;
        const name = escapeHtml(u.displayName || u.name || 'there');
        if (!email) continue;

        const { error } = await resend.emails.send({
          from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
          to: email,
          subject: `New match: ${van.title} — ${price}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 28px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">🔔 New van matching your alert</h1>
              </div>
              <div style="background: #f9fafb; padding: 28px; border-radius: 0 0 16px 16px;">
                <p style="font-size: 16px; color: #374151;">Hi ${name},</p>
                <p style="font-size: 16px; color: #374151;">A new listing just matched your saved search <strong>"${escapeHtml(search.label || 'your search')}"</strong>:</p>
                ${img ? `<img src="${escapeHtml(img)}" alt="${safeTitle}" style="width:100%; max-height:280px; object-fit:cover; border-radius:12px; margin:16px 0;" />` : ''}
                <h2 style="font-size:20px; color:#111827; margin:8px 0;">${safeTitle}</h2>
                <p style="font-size:18px; color:#059669; font-weight:bold; margin:4px 0;">${price}</p>
                <p style="font-size:14px; color:#6b7280; margin:4px 0;">${safeYear} · ${safeLocation}</p>
                <a href="${vanUrl}" style="display:inline-block; background:linear-gradient(135deg,#059669 0%,#0d9488 100%); color:white; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:bold; font-size:16px; margin:20px 0;">View the listing</a>
                <p style="font-size:12px; color:#9ca3af; margin-top:24px;">You're receiving this because you created an alert on Kiwi Van Market. <a href="${alertsUrl}" style="color:#059669;">Manage your alerts</a>.</p>
              </div>
            </div>`
        });

        if (!error) {
          sent++;
          await db.collection('savedSearches').doc(search.id)
            .update({ lastNotifiedAt: admin.firestore.FieldValue.serverTimestamp() })
            .catch(() => {});
        } else {
          console.error('Resend error (new-van alert):', error);
        }
        await sleep(120); // gentle pacing for Resend
      }
      console.log(`🔔 New-van alert: ${sent} email(s) sent for van ${vanId}`);
    } catch (e) {
      console.error('onVanCreatedNotifySearches error:', e);
    }
  }
);

// 💸 Price drop → email buyers who favorited the van
exports.onVanPriceDropNotifyFavorites = onDocumentUpdated(
  { document: 'vans/{vanId}', secrets: [resendApiKey] },
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after) return;
    const vanId = event.params.vanId;

    const oldPrice = before.price || 0;
    const newPrice = after.price || 0;
    // Only on a genuine price drop. (Other updates leave price unchanged → guarded out,
    // so updating the doc elsewhere won't loop.)
    if (!(newPrice > 0 && newPrice < oldPrice)) return;

    try {
      const apiKey = resendApiKey.value();
      if (!apiKey) { console.error('❌ RESEND_API_KEY not configured'); return; }
      const resend = new Resend(apiKey);

      const favSnap = await db.collection('favorites').where('vanId', '==', vanId).get();
      if (favSnap.empty) return;

      const vanUrl = `https://www.kiwivanmarket.com/van/${vanId}`;
      const img = after.imageUrl || (after.images && after.images[0]) || '';
      const safeTitle = escapeHtml(after.title || 'A van you saved');
      const oldP = nzd(oldPrice);
      const newP = nzd(newPrice);
      const drop = nzd(oldPrice - newPrice);

      const seen = new Set();
      let sent = 0;
      for (const doc of favSnap.docs) {
        const userId = doc.data().userId;
        if (!userId || seen.has(userId)) continue;
        seen.add(userId);

        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) continue;
        const u = userDoc.data();
        const email = u.email;
        const name = escapeHtml(u.displayName || u.name || 'there');
        if (!email) continue;

        const { error } = await resend.emails.send({
          from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
          to: email,
          subject: `Price drop: ${after.title} is now ${newP}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 28px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">💸 Price drop on a van you saved</h1>
              </div>
              <div style="background: #f9fafb; padding: 28px; border-radius: 0 0 16px 16px;">
                <p style="font-size: 16px; color: #374151;">Hi ${name},</p>
                <p style="font-size: 16px; color: #374151;">Good news — <strong>${safeTitle}</strong> just dropped by <strong>${drop}</strong>.</p>
                ${img ? `<img src="${escapeHtml(img)}" alt="${safeTitle}" style="width:100%; max-height:280px; object-fit:cover; border-radius:12px; margin:16px 0;" />` : ''}
                <p style="font-size:16px; color:#6b7280; margin:4px 0;"><s>${oldP}</s> &nbsp; <span style="color:#d97706; font-weight:bold; font-size:20px;">${newP}</span></p>
                <a href="${vanUrl}" style="display:inline-block; background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%); color:white; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:bold; font-size:16px; margin:20px 0;">View the listing</a>
                <p style="font-size:12px; color:#9ca3af; margin-top:24px;">You're receiving this because you favorited this van on Kiwi Van Market.</p>
              </div>
            </div>`
        });

        if (!error) sent++;
        else console.error('Resend error (price-drop):', error);
        await sleep(120);
      }
      console.log(`💸 Price-drop alert: ${sent} email(s) sent for van ${vanId} (${oldP} → ${newP})`);
    } catch (e) {
      console.error('onVanPriceDropNotifyFavorites error:', e);
    }
  }
);
