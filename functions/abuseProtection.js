'use strict';

const { createHash } = require('node:crypto');

async function consumeRateLimit(db, action, identity, limit, now = Date.now()) {
  const windowMs = 60 * 60 * 1000;
  const bucket = Math.floor(now / windowMs);
  const id = createHash('sha256').update(`${action}:${identity}:${bucket}`).digest('hex');
  const ref = db.collection('securityRateLimits').doc(id);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = snap.exists ? snap.data().count : 0;
    if (count >= limit) return false;
    tx.set(ref, { count: count + 1, expiresAt: new Date((bucket + 2) * windowMs) });
    return true;
  });
}

module.exports = { consumeRateLimit };
