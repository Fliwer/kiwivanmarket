'use strict';

const { createHash, randomUUID } = require('node:crypto');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const millis = (value) => value?.toMillis ? value.toMillis() : new Date(value || 0).getTime();

// Every Resend path shares this budget. Transactions reserve capacity before
// network I/O, so concurrent triggers cannot each observe the same free slot.
function createEmailDelivery({ db, now = Date.now, dailyLimit = 80, hourlyLimit = 40, senderLimit = 10 }) {
  const collection = db.collection('securityEmailDeliveries');
  async function send(resend, payload, options = {}) {
    const clock = now();
    const key = hash(options.key || randomUUID());
    const receipt = collection.doc(`delivery_${key}`);
    const hour = Math.floor(clock / 3600000), day = Math.floor(clock / 86400000);
    const budgets = [
      [collection.doc(`day_${day}`), dailyLimit],
      [collection.doc(`hour_${hour}`), hourlyLimit],
      ...(options.senderId ? [[collection.doc(`sender_${hash(`${options.senderId}:${hour}`)}`), senderLimit]] : []),
    ];
    const cooldown = options.cooldownMs > 0 ? collection.doc(`recipient_${hash(String(payload.to))}`) : null;
    const reservation = randomUUID();
    const outcome = await db.runTransaction(async (tx) => {
      const refs = [receipt, ...budgets.map(([ref]) => ref), ...(cooldown ? [cooldown] : [])];
      const snapshots = await Promise.all(refs.map((ref) => tx.get(ref)));
      const existing = snapshots[0].data();
      if (existing?.state === 'sent') return 'duplicate';
      if (existing?.state === 'reserved' && millis(existing.leaseUntil) > clock) return 'inflight';
      if (budgets.some(([, limit], index) => (snapshots[index + 1].data()?.count || 0) >= limit)) return 'quota';
      if (cooldown && millis(snapshots.at(-1).data()?.nextAllowedAt) > clock) return 'cooldown';
      const expiresAt = new Date(clock + 3 * 86400000);
      for (let index = 0; index < budgets.length; index++) {
        tx.set(budgets[index][0], { count: (snapshots[index + 1].data()?.count || 0) + 1, expiresAt });
      }
      tx.set(receipt, { state: 'reserved', reservation, leaseUntil: new Date(clock + 120000), expiresAt: new Date(clock + 30 * 86400000) });
      if (cooldown) tx.set(cooldown, { reservation, nextAllowedAt: new Date(clock + options.cooldownMs), expiresAt });
      return 'reserved';
    });
    if (['duplicate', 'inflight', 'cooldown'].includes(outcome)) return { data: null, error: null, skipped: true, reason: outcome };
    if (outcome === 'quota') return { data: null, error: { name: 'email_quota', message: 'Email delivery quota reached.' } };
    let result;
    try {
      // Resend v2 forwards request options to fetch. Clone its authentication
      // headers so adding idempotency does not mutate a reused SDK client.
      const headers = new Headers(resend.headers);
      headers.set('Idempotency-Key', `kvm_${key}`);
      result = await resend.emails.send(payload, { headers });
    }
    catch { result = { data: null, error: { name: 'email_provider', message: 'Email delivery failed.' } }; }
    await db.runTransaction(async (tx) => {
      const [current, gate] = await Promise.all([tx.get(receipt), cooldown ? tx.get(cooldown) : null]);
      if (current.data()?.reservation !== reservation) return;
      tx.update(receipt, { state: result.error ? 'failed' : 'sent', completedAt: new Date(now()) });
      // Keep attempts charged to the global budget, but allow a later message
      // to notify the recipient when a provider request fails.
      if (result.error && cooldown && gate.data()?.reservation === reservation) tx.delete(cooldown);
    });
    return result;
  }
  return { send };
}

module.exports = { createEmailDelivery };
