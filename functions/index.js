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
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');

// Resend for email notifications
const { Resend } = require('resend');

// ✅ Define secrets for Firebase Functions v2
const resendApiKey = defineSecret('RESEND_API_KEY');
const geminiApiKey = defineSecret('GEMINI_API_KEY');

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
