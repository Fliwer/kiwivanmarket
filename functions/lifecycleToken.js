// Preserve secure email links, but never promote a publicly exposed token.
const { timingSafeEqual } = require('node:crypto');

async function ensurePrivateLifecycleToken(db, vanRef, createToken, deleteField) {
  return db.runTransaction(async (tx) => {
    const ref = vanRef.collection('private').doc('lifecycle');
    const snapshot = await tx.get(ref);
    const existing = snapshot.exists && snapshot.data().availabilityToken;
    const token = typeof existing === 'string' && existing.length >= 32
      ? existing : createToken();
    if (token !== existing) tx.set(ref, { availabilityToken: token }, { merge: true });
    tx.update(vanRef, { availabilityToken: deleteField() });
    return token;
  });
}
const toMs = (value) => value?.toMillis ? value.toMillis() : value?.seconds != null ? value.seconds * 1000 : new Date(value || 0).getTime();

function createListingLifecycle({ db, FV, now = Date.now, createToken, activeBoost, remindAfterMs, pauseAfterMs }) {
  const signal = (van) => Math.max(toMs(van.createdAt), toMs(van.availabilityConfirmedAt));
  const needsReminder = (van) => van?.status === 'active' && !activeBoost(van, now()) &&
    signal(van) > 0 && now() - signal(van) > remindAfterMs && toMs(van.availabilityReminderSentAt) <= signal(van);
  const refs = (vanRef) => [vanRef, vanRef.collection('private').doc('lifecycle')];
  const read = async (tx, vanRef) => {
    const [van, lifecycle] = await Promise.all(refs(vanRef).map((ref) => tx.get(ref)));
    return { van: van.data(), lifecycle: lifecycle.data() || {} };
  };
  async function prepareReminder(vanRef) {
    return db.runTransaction(async (tx) => {
      const { van, lifecycle } = await read(tx, vanRef);
      if (!needsReminder(van)) return null;
      const cycle = signal(van);
      const token = lifecycle.reminderCycle === cycle && typeof lifecycle.availabilityToken === 'string' && lifecycle.availabilityToken.length >= 32
        ? lifecycle.availabilityToken : createToken();
      tx.set(refs(vanRef)[1], { availabilityToken: token, reminderCycle: cycle }, { merge: true });
      tx.update(vanRef, { availabilityToken: FV.delete() });
      return { token, cycle };
    });
  }
  async function markReminded(vanRef, prepared) {
    return db.runTransaction(async (tx) => {
      const { van, lifecycle } = await read(tx, vanRef);
      if (!needsReminder(van) || signal(van) !== prepared.cycle || lifecycle.availabilityToken !== prepared.token) return false;
      tx.update(vanRef, { availabilityReminderSentAt: FV.serverTimestamp(), finalNoticeSentAt: FV.delete() });
      return true;
    });
  }
  async function pause(vanRef) {
    return db.runTransaction(async (tx) => {
      const { van, lifecycle } = await read(tx, vanRef);
      const remindedAt = toMs(van?.availabilityReminderSentAt);
      if (van?.status !== 'active' || activeBoost(van, now()) || !remindedAt || remindedAt <= signal(van) || now() - remindedAt <= pauseAfterMs) return null;
      const token = typeof lifecycle.availabilityToken === 'string' && lifecycle.availabilityToken.length >= 32 ? lifecycle.availabilityToken : createToken();
      tx.set(refs(vanRef)[1], { availabilityToken: token }, { merge: true });
      tx.update(vanRef, { status: 'paused', expiredAt: FV.serverTimestamp(), expiredReason: 'no_confirmation',
        availabilityToken: FV.delete(), updatedAt: FV.serverTimestamp() });
      return { token, cycle: remindedAt };
    });
  }
  return { prepareReminder, markReminded, pause };
}

async function applyLifecycleAction(db, vanRef, token, action, FV, commit = true) {
  return db.runTransaction(async (tx) => {
    const lifecycleRef = vanRef.collection('private').doc('lifecycle');
    const [snapshot, lifecycle] = await Promise.all([tx.get(vanRef), tx.get(lifecycleRef)]);
    if (!snapshot.exists) return { error: 'missing' };
    const van = snapshot.data();
    const expected = String(lifecycle.data()?.availabilityToken || '');
    const given = Buffer.from(token), secret = Buffer.from(expected);
    if (!secret.length || given.length !== secret.length || !timingSafeEqual(given, secret)) return { error: 'expired' };
    if (!['active', 'paused', 'sold'].includes(van.status)) return { error: 'moderated' };
    if (!commit) return { van, wasPaused: van.status === 'paused' };
    const ts = FV.serverTimestamp();
    tx.update(vanRef, action === 'sold'
      ? { status: 'sold', soldAt: ts, soldVia: 'availability_email', updatedAt: ts }
      : { status: van.status === 'sold' ? 'sold' : 'active', availabilityConfirmedAt: ts,
        availabilityReminderSentAt: FV.delete(), finalNoticeSentAt: FV.delete(),
        expiredAt: FV.delete(), expiredReason: FV.delete(), updatedAt: ts });
    return { van, wasPaused: van.status === 'paused' };
  });
}

module.exports = { ensurePrivateLifecycleToken, createListingLifecycle, applyLifecycleAction };
