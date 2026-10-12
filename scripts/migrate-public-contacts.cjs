// Copies contacts and removes leaked public fields atomically per listing.
// Dry run by default; --apply performs writes. No PII or token values are logged.
const path = require('node:path');
async function main() {
  const apply = process.argv.includes('--apply');
  const auth = require(path.join(process.env.APPDATA, 'npm/node_modules/firebase-tools/lib/auth.js'));
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Firebase CLI login required');
  const token = await auth.getAccessToken(account.tokens.refresh_token,
    ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase']);
  const headers = { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' };
  const database = 'projects/kiwivanmarket/databases/(default)';
  const base = `https://firestore.googleapis.com/v1/${database}/documents`;
  const stats = { apply, scanned: 0, affected: 0, migrated: 0, conflicts: 0 };
  let pageToken = '';
  do {
    const list = await fetch(`${base}/vans?pageSize=300&pageToken=${encodeURIComponent(pageToken)}`, { headers });
    if (!list.ok) throw new Error(`List failed: ${list.status}`);
    const data = await list.json();
    pageToken = data.nextPageToken || '';
    for (const van of data.documents || []) {
      stats.scanned++;
      const seller = van.fields?.seller?.mapValue?.fields || {};
      const removed = [];
      const legacy = {};
      for (const key of ['email', 'phone', 'whatsapp']) {
        if (seller[key]) removed.push(`seller.${key}`);
        if (van.fields?.[key]) removed.push(key);
        const value = seller[key]?.stringValue ? seller[key] : van.fields?.[key];
        if (value?.stringValue) legacy[key] = value;
      }
      if (van.fields?.availabilityToken) removed.push('availabilityToken');
      if (!removed.length) continue;
      stats.affected++;
      if (!apply) continue;
      const contactName = `${van.name}/private/contact`;
      const contactRes = await fetch(`https://firestore.googleapis.com/v1/${contactName}`, { headers });
      if (!contactRes.ok && contactRes.status !== 404) throw new Error(`Private read failed: ${contactRes.status}`);
      const contact = contactRes.ok ? await contactRes.json() : null;
      const missing = Object.keys(legacy).filter((key) => !contact?.fields?.[key]?.stringValue);
      const writes = [];
      if (missing.length) writes.push({
        update: { name: contactName, fields: Object.fromEntries(missing.map((key) => [key, legacy[key]])) },
        updateMask: { fieldPaths: missing },
        currentDocument: contact ? { updateTime: contact.updateTime } : { exists: false },
      });
      writes.push({ update: { name: van.name, fields: {} }, updateMask: { fieldPaths: removed },
        currentDocument: { updateTime: van.updateTime } });
      const commit = await fetch(`${base}:commit`, { method: 'POST', headers, body: JSON.stringify({ writes }) });
      if (commit.status === 409 || commit.status === 412) { stats.conflicts++; continue; }
      if (!commit.ok) throw new Error(`Atomic migration failed: ${commit.status}`);
      stats.migrated++;
    }
  } while (pageToken);
  console.log(JSON.stringify(stats));
  if (stats.conflicts) process.exitCode = 1;
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
