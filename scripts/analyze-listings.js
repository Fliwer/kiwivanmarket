/* eslint-disable */
// Analyse des annonces (contactabilité + qualité) — lecture seule.
// Usage: node scripts/analyze-listings.js
const fs = require('fs');
const path = require('path');

// --- Charge .env puis .env.local (override) ---
function loadEnv(file) {
  const p = path.join(__dirname, '..', file);
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}
const env = { ...loadEnv('.env'), ...loadEnv('.env.local') };

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

const app = initializeApp({
  apiKey: env.REACT_APP_FIREBASE_API_KEY,
  authDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.REACT_APP_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const hasPhotos = (v) => (Array.isArray(v.images) && v.images.length > 0) || nonEmpty(v.imageUrl);
const pct = (n, d) => (d === 0 ? '0.0' : ((n / d) * 100).toFixed(1));

(async () => {
  const snap = await getDocs(collection(db, 'vans'));
  const vans = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Enrichissement via la collection users (best-effort, peut échouer si rules restrictives)
  let userFetchError = null;
  const userCache = {};
  for (const v of vans) {
    const sid = v.seller?.uid || v.userId;
    if (sid && !(sid in userCache)) {
      try {
        const us = await getDoc(doc(db, 'users', sid));
        userCache[sid] = us.exists() ? us.data() : null;
      } catch (e) {
        userFetchError = e.message;
        userCache[sid] = null;
      }
    }
  }

  const contactOf = (v) => {
    const sid = v.seller?.uid || v.userId;
    const u = (sid && userCache[sid]) || {};
    const whatsapp = v.seller?.whatsapp || u.whatsapp || null;
    const phone = v.seller?.phone || u.phone || null;
    const facebook = v.seller?.facebook || u.facebook || null;
    return { whatsapp, phone, facebook, sellerId: sid || null };
  };

  const isActive = (v) => !v.status || v.status === 'active';
  const active = vans.filter(isActive);

  let withWhatsapp = 0, withPhone = 0, withFacebook = 0, contactable = 0, uncontactable = [];
  const qualityMiss = { price: [], location: [], photos: [], description: [], thinDesc: [] };

  for (const v of active) {
    const c = contactOf(v);
    if (c.whatsapp) withWhatsapp++;
    if (c.phone) withPhone++;
    if (c.facebook) withFacebook++;
    const canContact = !!(c.whatsapp || c.phone || c.facebook);
    if (canContact) contactable++;
    else uncontactable.push({ id: v.id, title: v.title || '(sans titre)' });

    if (!(typeof v.price === 'number' && v.price > 0)) qualityMiss.price.push(v.id);
    if (!nonEmpty(v.location)) qualityMiss.location.push(v.id);
    if (!hasPhotos(v)) qualityMiss.photos.push(v.id);
    if (!nonEmpty(v.description)) qualityMiss.description.push(v.id);
    else if (v.description.trim().length < 40) qualityMiss.thinDesc.push(v.id);
  }

  const n = active.length;
  const out = {
    generatedAt: new Date().toISOString(),
    totals: { allDocs: vans.length, active: n, sold: vans.filter((v) => v.status === 'sold').length, other: vans.length - n - vans.filter((v) => v.status === 'sold').length },
    contactability: {
      contactable, uncontactable: uncontactable.length,
      coveragePct: pct(contactable, n),
      withWhatsapp, withWhatsappPct: pct(withWhatsapp, n),
      withPhone, withPhonePct: pct(withPhone, n),
      withFacebook, withFacebookPct: pct(withFacebook, n),
      uncontactableList: uncontactable,
    },
    quality: {
      missingPrice: qualityMiss.price.length,
      missingLocation: qualityMiss.location.length,
      missingPhotos: qualityMiss.photos.length,
      missingDescription: qualityMiss.description.length,
      thinDescription: qualityMiss.thinDesc.length,
    },
    notes: userFetchError ? `users collection partiellement illisible (rules): ${userFetchError}` : 'users collection lue avec succès',
  };

  // Score qualité global (pondéré) — sur les annonces actives
  const completeAll = active.filter((v) => {
    const c = contactOf(v);
    return (typeof v.price === 'number' && v.price > 0) && nonEmpty(v.location) && hasPhotos(v) && nonEmpty(v.description) && !!(c.whatsapp || c.phone || c.facebook);
  }).length;
  out.qualityScore = { fullyCompleteListings: completeAll, fullyCompletePct: pct(completeAll, n) };

  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
