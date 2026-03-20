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

    // 4. Dynamic Vans
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
