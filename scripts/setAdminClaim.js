#!/usr/bin/env node
/**
 * Set Firebase Auth custom claim `admin: true` on a user.
 *
 * Usage:
 *   node scripts/setAdminClaim.js <email>
 *
 * Prerequisites:
 *   - firebase-admin must be installed (it's already in functions/node_modules)
 *   - A service account key JSON file must be available.
 *     Set GOOGLE_APPLICATION_CREDENTIALS env var or place the key at
 *     ./serviceAccountKey.json
 *
 * Example:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/setAdminClaim.js p.morthier@gmail.com
 */

const admin = require('../functions/node_modules/firebase-admin');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/setAdminClaim.js <email>');
  process.exit(1);
}

// Initialize with default credentials (GOOGLE_APPLICATION_CREDENTIALS) or explicit path
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';

try {
  const serviceAccount = require(require('path').resolve(serviceAccountPath));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch {
  // Fall back to application default credentials (e.g. gcloud auth)
  admin.initializeApp();
}

async function setAdmin() {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Successfully set admin claim for ${email} (uid: ${user.uid})`);
    console.log('The user must sign out and sign back in for the claim to take effect.');
  } catch (error) {
    console.error('Error setting admin claim:', error.message);
    process.exit(1);
  }
}

setAdmin();
