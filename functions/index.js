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
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
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
// ✉️ CONTACT FORM — envoie le message par email (Resend)
// ============================================
// Formulaire public (sans auth). Destinataire fixe = boite de l'equipe.
const CONTACT_RECIPIENT = 'kiwivanmarket.contact@gmail.com';

exports.sendContactMessage = onCall(
  { secrets: [resendApiKey] },
  async (request) => {
    const data = request.data || {};
    const name = String(data.name || '').trim().slice(0, 100);
    const email = String(data.email || '').trim().slice(0, 254);
    const subject = String(data.subject || '').trim().slice(0, 200);
    const message = String(data.message || '').trim().slice(0, 5000);
    // Honeypot anti-bot : champ cache que seuls les bots remplissent
    const honeypot = String(data.company || '').trim();
    if (honeypot) {
      // On fait semblant de reussir pour ne pas aider le bot
      return { success: true };
    }

    if (!name || !email || !subject || message.length < 5) {
      throw new HttpsError('invalid-argument', 'Please fill in all fields.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpsError('invalid-argument', 'Please enter a valid email address.');
    }

    const apiKey = resendApiKey.value();
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      throw new HttpsError('failed-precondition', 'Email service is not configured.');
    }
    const resend = new Resend(apiKey);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    try {
      const { error } = await resend.emails.send({
        from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
        to: CONTACT_RECIPIENT,
        reply_to: email,
        subject: `[Contact] ${subject}`.slice(0, 200),
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 24px; border-radius: 16px 16px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px;">✉️ New contact message</h1>
            </div>
            <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 16px 16px;">
              <p style="margin: 4px 0; color:#374151;"><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p>
              <p style="margin: 4px 0; color:#374151;"><strong>Subject:</strong> ${safeSubject}</p>
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;" />
              <p style="color:#111827; line-height:1.6; white-space:pre-wrap;">${safeMessage}</p>
              <p style="margin-top:24px; font-size:12px; color:#9ca3af;">Reply directly to this email to answer ${safeName}.</p>
            </div>
          </div>`,
      });
      if (error) {
        console.error('Contact email error:', error);
        throw new HttpsError('internal', 'Could not send your message. Please try again.');
      }
      return { success: true };
    } catch (e) {
      if (e instanceof HttpsError) throw e;
      console.error('sendContactMessage error:', e);
      throw new HttpsError('internal', 'Could not send your message. Please try again.');
    }
  }
);


// ============================================
// 🚩 REPORT LISTING — acheteur signale un van vendu / sans reponse
// ============================================
exports.reportListing = onCall(
  { secrets: [resendApiKey] },
  async (request) => {
    const data = request.data || {};
    const vanId = String(data.vanId || '').trim().slice(0, 100);
    const vanTitle = String(data.vanTitle || '').trim().slice(0, 200);
    const reason = String(data.reason || '').trim().slice(0, 40);
    const note = String(data.note || '').trim().slice(0, 500);
    // Honeypot anti-bot
    if (String(data.company || '').trim()) {
      return { success: true };
    }
    if (!vanId) {
      throw new HttpsError('invalid-argument', 'Missing listing reference.');
    }
    const REASONS = {
      sold: 'Already sold',
      no_response: 'Seller not responding',
      other: 'Other issue',
    };
    const safeReasonKey = REASONS[reason] ? reason : 'other';
    const reasonLabel = REASONS[safeReasonKey];

    const apiKey = resendApiKey.value();
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      throw new HttpsError('failed-precondition', 'Email service is not configured.');
    }
    const resend = new Resend(apiKey);

    const vanUrl = `https://www.kiwivanmarket.com/van/${encodeURIComponent(vanId)}`;
    const safeTitle = escapeHtml(vanTitle || vanId);
    const safeNote = note ? escapeHtml(note).replace(/\n/g, '<br>') : '';
    const reporterUid = request.auth ? request.auth.uid : 'anonymous';

    try {
      const { error } = await resend.emails.send({
        from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
        to: CONTACT_RECIPIENT,
        subject: `[Report] ${reasonLabel} — ${vanTitle || vanId}`.slice(0, 200),
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 24px; border-radius: 16px 16px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px;">🚩 Listing reported</h1>
            </div>
            <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 16px 16px;">
              <p style="margin: 4px 0; color:#374151;"><strong>Reason:</strong> ${escapeHtml(reasonLabel)}</p>
              <p style="margin: 4px 0; color:#374151;"><strong>Van:</strong> ${safeTitle}</p>
              <p style="margin: 4px 0; color:#374151;"><strong>Reported by:</strong> ${escapeHtml(reporterUid)}</p>
              ${safeNote ? `<p style="margin: 12px 0; color:#374151;"><strong>Note:</strong><br>${safeNote}</p>` : ''}
              <a href="${vanUrl}" style="display:inline-block; background:#dc2626; color:white; padding:12px 24px; border-radius:10px; text-decoration:none; font-weight:bold; margin:16px 0;">Open the listing</a>
              <p style="margin-top:16px; font-size:12px; color:#9ca3af;">If it's really sold/unavailable, mark it Sold from your admin / the seller's listings.</p>
            </div>
          </div>`,
      });
      if (error) {
        console.error('reportListing email error:', error);
        throw new HttpsError('internal', 'Could not send the report. Please try again.');
      }
      return { success: true };
    } catch (e) {
      if (e instanceof HttpsError) throw e;
      console.error('reportListing error:', e);
      throw new HttpsError('internal', 'Could not send the report. Please try again.');
    }
  }
);


// ============================================
// 🧹 LISTING LIFECYCLE — annonces zombies
// ============================================
// Un backpacker vend son van avant de quitter le pays et ne revient jamais
// marquer "vendu" : en sept. 2026, 73 annonces actives sur 80 avaient plus de
// 3 mois et 61 une REGO expirée. Les acheteurs contactaient des vendeurs
// partis depuis des mois.
//
// Cycle, tous les jours :
//   J+30 sans signal (création ou dernière confirmation) → email "toujours
//        disponible ?" avec 2 liens 1-clic (confirmer / vendu), token sur le doc.
//   J+30 après l'email, sans réponse → annonce mise en pause (status 'paused',
//        expiredAt renseigné). Le vendeur garde son annonce et la réactive en
//        1 clic depuis l'email ou depuis son espace (bouton Play existant).
// Confirmer remet le compteur à zéro : prochain rappel 30 jours plus tard.
//
// Les vendeurs qui répondent alimentent "Disponibilité confirmée" (VanCard) et
// le compteur de ventes réelles.

const crypto = require('crypto');

const LIFECYCLE = {
  REMIND_AFTER_MS: 30 * 24 * 60 * 60 * 1000,   // silence avant le rappel
  PAUSE_AFTER_MS: 30 * 24 * 60 * 60 * 1000,    // silence après le rappel
  MAX_EMAILS_PER_RUN: 80,                      // Resend free : 100/jour
  SITE: 'https://kiwivanmarket.com',
  ACTION_URL: 'https://us-central1-kiwivanmarket.cloudfunctions.net/listingAction',
};

// Timestamp Firestore / Date / ISO → millisecondes (0 si absent)
const toMs = (x) => {
  if (!x) return 0;
  if (typeof x.toMillis === 'function') return x.toMillis();
  if (typeof x.toDate === 'function') return x.toDate().getTime();
  if (typeof x.seconds === 'number') return x.seconds * 1000;
  const t = new Date(x).getTime();
  return Number.isFinite(t) ? t : 0;
};

const actionLink = (vanId, token, action) =>
  `${LIFECYCLE.ACTION_URL}?van=${encodeURIComponent(vanId)}&token=${encodeURIComponent(token)}&action=${action}`;

function availabilityEmailHtml({ sellerName, vanTitle, vanId, token, daysListed }) {
  const name = escapeHtml(sellerName || 'there');
  const title = escapeHtml(vanTitle || 'your van');
  const btn = (href, bg, label) =>
    `<a href="${href}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px;margin:6px 4px;">${label}</a>`;
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:linear-gradient(135deg,#059669 0%,#0d9488 100%);padding:30px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Is your van still for sale?</h1>
      </div>
      <div style="background:#f9fafb;padding:30px;border-radius:0 0 16px 16px;">
        <p style="font-size:16px;color:#374151;">Hi ${name},</p>
        <p style="font-size:16px;color:#374151;">
          Your listing <strong>${title}</strong> has been on Kiwi Van Market for ${daysListed} days.
          Buyers are still contacting sellers from listings like yours — let us know where you're at, it takes one click:
        </p>
        <div style="text-align:center;margin:24px 0;">
          ${btn(actionLink(vanId, token, 'confirm'), '#059669', '✅ Still for sale')}
          ${btn(actionLink(vanId, token, 'sold'), '#dc2626', '🎉 It\'s sold')}
        </div>
        <p style="font-size:14px;color:#6b7280;">
          Confirming keeps your listing live and shows buyers a <strong>"availability confirmed"</strong> badge.
          If we don't hear from you within 30 days, the listing is paused (not deleted — you can reactivate it anytime).
        </p>
        <p style="font-size:13px;color:#9ca3af;margin-top:24px;">
          <em>Votre van est-il toujours à vendre ? Cliquez sur « Still for sale » pour le confirmer, ou « It's sold » s'il est vendu. Sans réponse sous 30 jours, l'annonce est mise en pause (réactivable en un clic).</em>
        </p>
        <p style="font-size:12px;color:#9ca3af;">Kiwi Van Market — <a href="${LIFECYCLE.SITE}/my-listings" style="color:#059669;">manage your listings</a></p>
      </div>
    </div>`;
}

function pausedEmailHtml({ sellerName, vanTitle, vanId, token }) {
  const name = escapeHtml(sellerName || 'there');
  const title = escapeHtml(vanTitle || 'your van');
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#334155;padding:30px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Your listing has been paused</h1>
      </div>
      <div style="background:#f9fafb;padding:30px;border-radius:0 0 16px 16px;">
        <p style="font-size:16px;color:#374151;">Hi ${name},</p>
        <p style="font-size:16px;color:#374151;">
          We didn't hear back about <strong>${title}</strong>, so we paused it to keep the marketplace accurate for buyers.
          Nothing is deleted — if it's still for sale, bring it back in one click:
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${actionLink(vanId, token, 'confirm')}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px;">🔄 Reactivate my listing</a>
        </div>
        <p style="font-size:13px;color:#9ca3af;"><em>Votre annonce a été mise en pause faute de réponse. Si le van est toujours à vendre, réactivez-la en un clic ci-dessus.</em></p>
      </div>
    </div>`;
}

exports.listingLifecycle = onSchedule(
  {
    schedule: 'every 24 hours',
    secrets: [resendApiKey],
    timeoutSeconds: 300,
  },
  async () => {
    const apiKey = resendApiKey.value();
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      return;
    }
    const resend = new Resend(apiKey);
    const now = Date.now();
    const stats = { scanned: 0, reminded: 0, paused: 0, skipped: 0, errors: 0 };

    const snap = await db.collection('vans').where('status', '==', 'active').get();
    // Les plus anciennes d'abord : si on doit plafonner, on traite le pire.
    const docs = snap.docs.sort((a, b) => toMs(a.data().createdAt) - toMs(b.data().createdAt));

    for (const doc of docs) {
      const van = doc.data();
      stats.scanned++;
      const lastSignal = Math.max(toMs(van.createdAt), toMs(van.availabilityConfirmedAt));
      const remindedAt = toMs(van.availabilityReminderSentAt);
      const email = van.seller && van.seller.email;
      if (!lastSignal || !email) { stats.skipped++; continue; }

      try {
        // 2. Rappel envoyé, toujours aucune réponse 30 jours plus tard → pause.
        if (remindedAt && remindedAt > lastSignal && now - remindedAt > LIFECYCLE.PAUSE_AFTER_MS) {
          const token = van.availabilityToken || crypto.randomBytes(24).toString('hex');
          await doc.ref.update({
            status: 'paused',
            expiredAt: admin.firestore.FieldValue.serverTimestamp(),
            expiredReason: 'no_confirmation',
            availabilityToken: token,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          if (stats.reminded + stats.paused < LIFECYCLE.MAX_EMAILS_PER_RUN) {
            await resend.emails.send({
              from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
              to: email,
              subject: `Your listing "${van.title || 'your van'}" has been paused`,
              html: pausedEmailHtml({ sellerName: van.seller.name, vanTitle: van.title, vanId: doc.id, token }),
            });
          }
          stats.paused++;
          continue;
        }

        // 1. 30 jours sans signal et pas encore rappelé pour ce cycle → rappel.
        if (now - lastSignal > LIFECYCLE.REMIND_AFTER_MS && remindedAt <= lastSignal) {
          if (stats.reminded + stats.paused >= LIFECYCLE.MAX_EMAILS_PER_RUN) { stats.skipped++; continue; }
          const token = crypto.randomBytes(24).toString('hex');
          const daysListed = Math.round((now - toMs(van.createdAt)) / 86400000);
          await resend.emails.send({
            from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
            to: email,
            subject: `Is "${van.title || 'your van'}" still for sale?`,
            html: availabilityEmailHtml({ sellerName: van.seller.name, vanTitle: van.title, vanId: doc.id, token, daysListed }),
          });
          await doc.ref.update({
            availabilityReminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
            availabilityToken: token,
          });
          stats.reminded++;
        }
      } catch (e) {
        stats.errors++;
        console.error(`listingLifecycle: van ${doc.id}:`, e.message || e);
      }
    }
    console.log('🧹 listingLifecycle:', JSON.stringify(stats));
  }
);

// Liens 1-clic des emails (aucune connexion requise : le token sur le doc fait foi).
exports.listingAction = onRequest({ cors: false }, async (req, res) => {
  const vanId = String(req.query.van || '').replace(/[^A-Za-z0-9_-]/g, '');
  const token = String(req.query.token || '');
  const action = String(req.query.action || '');
  const page = (title, body, ok = true) => res.status(ok ? 200 : 400).set('Content-Type', 'text/html; charset=utf-8').send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${escapeHtml(title)} | Kiwi Van Market</title>
<style>body{font-family:system-ui,sans-serif;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;color:#1e293b;text-align:center;padding:24px}h1{font-size:1.6rem;margin:0 0 10px}p{color:#64748b;margin:0 0 22px}a{display:inline-block;margin:6px;padding:12px 20px;border-radius:12px;background:#059669;color:#fff;text-decoration:none;font-weight:700}</style>
</head><body><main><h1>${escapeHtml(title)}</h1><p>${body}</p><a href="${LIFECYCLE.SITE}/my-listings">My listings</a> <a href="${LIFECYCLE.SITE}/" style="background:#fff;color:#059669;border:2px solid #059669">Browse vans</a></main></body></html>`);

  if (!vanId || !token || !['confirm', 'sold'].includes(action)) {
    return page('Invalid link', 'This link is incomplete. Open your listings to manage your van.', false);
  }
  const ref = db.collection('vans').doc(vanId);
  const snap = await ref.get();
  if (!snap.exists) return page('Listing not found', 'This listing no longer exists.', false);
  const van = snap.data();
  const expected = String(van.availabilityToken || '');
  const given = Buffer.from(token);
  const exp = Buffer.from(expected);
  if (!expected || given.length !== exp.length || !crypto.timingSafeEqual(given, exp)) {
    return page('Link expired', 'This link is no longer valid. Sign in to manage your listing.', false);
  }
  const ts = admin.firestore.FieldValue.serverTimestamp();
  if (action === 'sold') {
    await ref.update({ status: 'sold', soldAt: ts, soldVia: 'availability_email', updatedAt: ts });
    console.log(`listingAction: ${vanId} marked sold`);
    return page('Congratulations! 🎉', `<strong>${escapeHtml(van.title || 'Your van')}</strong> is now marked as sold. Safe travels — and thanks for using Kiwi Van Market.`);
  }
  // confirm : remet en ligne si en pause, et repart pour 30 jours.
  const wasPaused = van.status === 'paused';
  await ref.update({
    status: van.status === 'sold' ? 'sold' : 'active',
    availabilityConfirmedAt: ts,
    expiredAt: admin.firestore.FieldValue.delete(),
    expiredReason: admin.firestore.FieldValue.delete(),
    updatedAt: ts,
  });
  console.log(`listingAction: ${vanId} confirmed${wasPaused ? ' (reactivated)' : ''}`);
  return page(wasPaused ? 'Listing reactivated ✅' : 'Thanks, still for sale ✅',
    `<strong>${escapeHtml(van.title || 'Your van')}</strong> is live${wasPaused ? ' again' : ''} with an <em>availability confirmed</em> badge. We'll check back in 30 days.`);
});


// ============================================
// 🔔 BUYER ALERTS — "préviens-moi quand un van correspond"
// ============================================
// 4,5 % des visiteurs reviennent la semaine suivante (GA4, sept. 2026) : un
// backpacker regarde, repart, et rate le Hiace publié le lendemain. L'alerte
// est le seul levier sur le retour, et c'est un argument vendeur ("12 acheteurs
// attendent un van à Auckland").
//
// Sans compte : un email + des critères suffisent (un backpacker ne crée pas
// de compte pour une alerte). La collection `alerts` n'est accessible que
// côté serveur (règles Firestore : deny par défaut) ; création via createAlert
// (validation + plafond), gestion via les liens tokenisés des emails.
//
// Critères : { location, brand, priceMax, selfContained } — même logique de
// matching que LocationPage/BrandPage (ville par inclusion, marque par
// mots-clés du titre).

const ALERT_BRAND_TERMS = {
  'toyota-hiace': ['toyota', 'hiace'],
  'nissan-caravan': ['nissan', 'caravan', 'homy'],
  'mazda-bongo': ['mazda', 'bongo'],
  'mitsubishi-delica': ['mitsubishi', 'delica'],
  'ford-transit': ['ford', 'transit'],
  'mercedes-sprinter': ['mercedes', 'sprinter'],
};
const ALERT_MAX_PER_EMAIL = 5;
const ALERT_ACTION_URL = 'https://us-central1-kiwivanmarket.cloudfunctions.net/alertAction';

const alertCopy = {
  en: {
    createdSubject: 'Your Kiwi Van Market alert is active',
    createdTitle: 'Alert created 🔔',
    createdBody: (label) => `We'll email you as soon as a van matching <strong>${label}</strong> is listed. Most backpacker vans sell within days, so being first matters.`,
    matchSubject: (title, price) => `New van: ${title} — ${price}`,
    matchTitle: 'A van matching your alert was just listed',
    matchBody: (label) => `New listing matching <strong>${label}</strong>:`,
    view: 'View the listing',
    browse: 'Browse all vans',
    manage: 'Stop this alert',
    footer: 'You receive this because you created an alert on Kiwi Van Market.',
    unsubscribed: 'Alert stopped',
    unsubscribedBody: "You won't receive emails for this alert anymore. You can create a new one anytime.",
  },
  fr: {
    createdSubject: 'Votre alerte Kiwi Van Market est active',
    createdTitle: 'Alerte créée 🔔',
    createdBody: (label) => `Nous vous écrirons dès qu'un van correspondant à <strong>${label}</strong> est publié. La plupart des vans de backpacker partent en quelques jours : être le premier compte.`,
    matchSubject: (title, price) => `Nouveau van : ${title} — ${price}`,
    matchTitle: 'Un van correspondant à votre alerte vient d\'être publié',
    matchBody: (label) => `Nouvelle annonce correspondant à <strong>${label}</strong> :`,
    view: 'Voir l\'annonce',
    browse: 'Voir tous les vans',
    manage: 'Arrêter cette alerte',
    footer: 'Vous recevez cet email parce que vous avez créé une alerte sur Kiwi Van Market.',
    unsubscribed: 'Alerte arrêtée',
    unsubscribedBody: 'Vous ne recevrez plus d\'emails pour cette alerte. Vous pouvez en créer une nouvelle à tout moment.',
  },
};
const alertLang = (l) => (alertCopy[l] ? l : 'en');

function normalizeCriteria(raw) {
  const c = raw && typeof raw === 'object' ? raw : {};
  const location = String(c.location || '').toLowerCase().replace(/[^a-z-]/g, '').slice(0, 40);
  const brand = String(c.brand || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
  const priceMax = Number(c.priceMax);
  return {
    location,
    brand,
    priceMax: Number.isFinite(priceMax) && priceMax > 0 ? Math.min(Math.round(priceMax), 500000) : null,
    selfContained: !!c.selfContained,
  };
}

function alertLabel(c, lang) {
  const parts = [];
  if (c.brand) parts.push(c.brand.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
  else parts.push(lang === 'fr' ? 'Van' : 'Van');
  if (c.selfContained) parts.push('self-contained');
  if (c.location) parts.push((lang === 'fr' ? 'à ' : 'in ') + c.location.charAt(0).toUpperCase() + c.location.slice(1));
  if (c.priceMax) parts.push((lang === 'fr' ? 'moins de ' : 'under ') + `NZ$${c.priceMax.toLocaleString('en-NZ')}`);
  return parts.join(' · ');
}

function vanMatchesAlert(van, c) {
  if (!van || van.status !== 'active') return false;
  if (c.location) {
    const loc = `${van.location || ''} ${van.region || ''}`.toLowerCase();
    if (!loc.includes(c.location)) return false;
  }
  if (c.brand) {
    const terms = ALERT_BRAND_TERMS[c.brand] || [c.brand];
    const t = `${van.title || ''}`.toLowerCase();
    if (!terms.some((k) => t.includes(k))) return false;
  }
  if (c.priceMax && Number(van.price || 0) > c.priceMax) return false;
  if (c.selfContained && !van.selfContained) return false;
  return true;
}

const alertEmailShell = (title, inner, lang, footerLinks) => `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#059669 0%,#0d9488 100%);padding:28px;border-radius:16px 16px 0 0;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">${title}</h1>
    </div>
    <div style="background:#f9fafb;padding:28px;border-radius:0 0 16px 16px;">
      ${inner}
      <p style="font-size:12px;color:#9ca3af;margin-top:24px;">${alertCopy[lang].footer} ${footerLinks}</p>
    </div>
  </div>`;

// Création (sans compte). Plafond par email, validation, email de confirmation.
exports.createAlert = onCall({ secrets: [resendApiKey] }, async (request) => {
  const d = request.data || {};
  const email = String(d.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) {
    throw new HttpsError('invalid-argument', 'A valid email is required.');
  }
  const criteria = normalizeCriteria(d.criteria);
  if (!criteria.location && !criteria.brand && !criteria.priceMax && !criteria.selfContained) {
    throw new HttpsError('invalid-argument', 'Pick at least one criterion.');
  }
  const lang = alertLang(String(d.lang || 'en').slice(0, 2));
  const label = alertLabel(criteria, lang);

  const existing = await db.collection('alerts').where('email', '==', email).where('active', '==', true).get();
  if (existing.size >= ALERT_MAX_PER_EMAIL) {
    throw new HttpsError('resource-exhausted', `Max ${ALERT_MAX_PER_EMAIL} active alerts per email.`);
  }
  // Même critères déjà actifs → on ne duplique pas, on renvoie l'existante.
  const dup = existing.docs.find((x) => JSON.stringify(x.data().criteria) === JSON.stringify(criteria));
  if (dup) return { ok: true, id: dup.id, label, duplicate: true };

  const token = crypto.randomBytes(24).toString('hex');
  const ref = await db.collection('alerts').add({
    email,
    criteria,
    label,
    lang,
    active: true,
    token,
    userId: request.auth ? request.auth.uid : null,
    source: String(d.source || '').slice(0, 60) || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastNotifiedAt: null,
    notifiedCount: 0,
  });

  try {
    const T = alertCopy[lang];
    const stop = `${ALERT_ACTION_URL}?id=${ref.id}&token=${token}&action=unsubscribe`;
    await new Resend(resendApiKey.value()).emails.send({
      from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
      to: email,
      subject: T.createdSubject,
      html: alertEmailShell(T.createdTitle, `
        <p style="font-size:16px;color:#374151;">${T.createdBody(escapeHtml(label))}</p>
        <p style="text-align:center;margin:22px 0;"><a href="https://kiwivanmarket.com/${lang === 'fr' ? '?lang=fr' : ''}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:12px;">${T.browse}</a></p>`,
        lang, `<a href="${stop}" style="color:#059669;">${T.manage}</a>`),
    });
  } catch (e) {
    console.error('createAlert: confirmation email failed', e.message || e);
  }
  console.log(`🔔 alert created ${ref.id} (${label})`);
  return { ok: true, id: ref.id, label };
});

// Nouvelle annonce → email aux alertes qui correspondent (1 email par adresse).
exports.onVanCreatedNotifyAlerts = onDocumentCreated(
  { document: 'vans/{vanId}', secrets: [resendApiKey] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const van = snap.data();
    const vanId = event.params.vanId;
    if (!van || van.status !== 'active') return;
    try {
      const alertsSnap = await db.collection('alerts').where('active', '==', true).get();
      if (alertsSnap.empty) return;
      const sellerEmail = String((van.seller && van.seller.email) || '').toLowerCase();
      const byEmail = new Map();
      for (const doc of alertsSnap.docs) {
        const a = doc.data();
        if (!a.email || a.email === sellerEmail || byEmail.has(a.email)) continue;
        if (vanMatchesAlert(van, a.criteria || {})) byEmail.set(a.email, { id: doc.id, ...a });
      }
      if (!byEmail.size) return;

      const resend = new Resend(resendApiKey.value());
      const price = `NZ$${Number(van.price || 0).toLocaleString('en-NZ')}`;
      const img = (Array.isArray(van.images) && van.images[0]) || van.imageUrl || '';
      const safeTitle = escapeHtml(van.title || 'Campervan');
      let sent = 0;
      for (const [email, a] of byEmail) {
        const lang = alertLang(a.lang);
        const T = alertCopy[lang];
        const vanUrl = `https://kiwivanmarket.com/van/${vanId}${lang === 'fr' ? '?lang=fr' : ''}`;
        const stop = `${ALERT_ACTION_URL}?id=${a.id}&token=${a.token}&action=unsubscribe`;
        const { error } = await resend.emails.send({
          from: 'Kiwi Van Market <noreply@kiwivanmarket.com>',
          to: email,
          subject: T.matchSubject(van.title || 'Campervan', price),
          html: alertEmailShell(T.matchTitle, `
            <p style="font-size:16px;color:#374151;">${T.matchBody(escapeHtml(a.label || ''))}</p>
            ${img ? `<a href="${vanUrl}"><img src="${escapeHtml(img)}" alt="${safeTitle}" style="width:100%;max-height:280px;object-fit:cover;border-radius:12px;margin:12px 0;"></a>` : ''}
            <h2 style="font-size:20px;color:#111827;margin:8px 0;">${safeTitle}</h2>
            <p style="font-size:18px;color:#059669;font-weight:700;margin:4px 0;">${price}</p>
            <p style="font-size:14px;color:#6b7280;margin:4px 0;">${escapeHtml(String(van.year || ''))} · ${escapeHtml(van.location || '')}${van.selfContained ? ' · self-contained' : ''}</p>
            <p style="text-align:center;margin:22px 0;"><a href="${vanUrl}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:12px;">${T.view}</a></p>`,
            lang, `<a href="${stop}" style="color:#059669;">${T.manage}</a>`),
        });
        if (error) { console.error('alert email error:', error); continue; }
        sent++;
        await db.collection('alerts').doc(a.id).update({
          lastNotifiedAt: admin.firestore.FieldValue.serverTimestamp(),
          notifiedCount: admin.firestore.FieldValue.increment(1),
        }).catch(() => {});
        await new Promise((r) => setTimeout(r, 120));
      }
      console.log(`🔔 van ${vanId}: ${sent} alert email(s) sent`);
    } catch (e) {
      console.error('onVanCreatedNotifyAlerts error:', e);
    }
  }
);

// Lien "arrêter cette alerte" des emails.
exports.alertAction = onRequest({ cors: false }, async (req, res) => {
  const id = String(req.query.id || '').replace(/[^A-Za-z0-9_-]/g, '');
  const token = String(req.query.token || '');
  const action = String(req.query.action || '');
  const page = (title, body, lang = 'en', ok = true) => res.status(ok ? 200 : 400).set('Content-Type', 'text/html; charset=utf-8').send(`<!DOCTYPE html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${escapeHtml(title)} | Kiwi Van Market</title>
<style>body{font-family:system-ui,sans-serif;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;color:#1e293b;text-align:center;padding:24px}h1{font-size:1.6rem;margin:0 0 10px}p{color:#64748b;margin:0 0 22px}a{display:inline-block;margin:6px;padding:12px 20px;border-radius:12px;background:#059669;color:#fff;text-decoration:none;font-weight:700}</style>
</head><body><main><h1>${escapeHtml(title)}</h1><p>${body}</p><a href="https://kiwivanmarket.com/${lang === 'fr' ? '?lang=fr' : ''}">${alertCopy[lang].browse}</a></main></body></html>`);

  if (!id || !token || action !== 'unsubscribe') return page('Invalid link', 'This link is incomplete.', 'en', false);
  const ref = db.collection('alerts').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return page('Not found', 'This alert no longer exists.', 'en', false);
  const a = snap.data();
  const given = Buffer.from(token), exp = Buffer.from(String(a.token || ''));
  if (!exp.length || given.length !== exp.length || !crypto.timingSafeEqual(given, exp)) {
    return page('Invalid link', 'This link is not valid.', 'en', false);
  }
  const lang = alertLang(a.lang);
  await ref.update({ active: false, unsubscribedAt: admin.firestore.FieldValue.serverTimestamp() });
  return page(alertCopy[lang].unsubscribed, alertCopy[lang].unsubscribedBody, lang);
});
