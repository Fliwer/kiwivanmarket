/* eslint-disable */
// Rapport contactabilité + export CSV (lecture seule).
// ⚠️ Contient des données vendeurs (PII) — NE PAS committer les CSV générés.
// Usage: node scripts/uncontactable-report.js
const fs = require('fs');
const path = require('path');

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
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const app = initializeApp({
  apiKey: env.REACT_APP_FIREBASE_API_KEY,
  authDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.REACT_APP_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const q = (s) => `"${String(s == null ? '' : s).replace(/"/g, '""')}"`;
const isActive = (v) => !v.status || v.status === 'active';

(async () => {
  const snap = await getDocs(collection(db, 'vans'));
  const vans = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter(isActive);

  const rows = vans.map((v) => {
    const s = v.seller || {};
    const whatsapp = s.whatsapp || '';
    const phone = s.phone || '';
    const facebook = s.facebook || '';
    const contactable = !!(whatsapp || phone || facebook);
    return {
      id: v.id,
      title: v.title || '',
      seller: s.name || '',
      email: s.email || '',
      phone,
      whatsapp,
      facebook,
      contactable: contactable ? 'YES' : 'NO',
    };
  });

  const header = 'id,title,seller,email,phone,whatsapp,facebook,contactable';
  const toCsv = (list) => [header, ...list.map((r) =>
    [r.id, r.title, r.seller, r.email, r.phone, r.whatsapp, r.facebook, r.contactable].map(q).join(',')
  )].join('\n');

  const all = rows;
  const uncontactable = rows.filter((r) => r.contactable === 'NO');

  const dir = path.join(__dirname, '..', 'reports');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'all-listings-contact.csv'), toCsv(all), 'utf8');
  fs.writeFileSync(path.join(dir, 'uncontactable.csv'), toCsv(uncontactable), 'utf8');

  const withEmail = uncontactable.filter((r) => r.email).length;
  console.log('=== SUMMARY ===');
  console.log('Active listings:', all.length);
  console.log('Uncontactable :', uncontactable.length, `(${((uncontactable.length/all.length)*100).toFixed(1)}%)`);
  console.log('Uncontactable WITH seller email (relançables) :', withEmail);
  console.log('Uncontactable WITHOUT email :', uncontactable.length - withEmail);
  console.log('CSV -> reports/all-listings-contact.csv  &  reports/uncontactable.csv');
  console.log('\n=== UNCONTACTABLE (apercu) ===');
  console.log(['title','seller','email'].join(' | '));
  uncontactable.slice(0, 50).forEach((r) => console.log([r.title, r.seller || '—', r.email || '—'].join(' | ')));
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
