'use strict';

const { createHash } = require('node:crypto');
const PLANS = Object.freeze({
  fortnight: { id: 'fortnight', days: 14, amountCents: 3000, currency: 'nzd' },
  month: { id: 'month', days: 28, amountCents: 5000, currency: 'nzd' },
});
const LEAKED_KEY_HASH = 'd0eb18a233966667e6909a8423699955d38a9b4229f9843ccdec821332f90ec4';
const SITE = 'https://kiwivanmarket.com';
const millis = (value) => value?.toMillis ? value.toMillis() : value?.seconds != null ? value.seconds * 1000 : new Date(value || 0).getTime();
const activeBoost = (van, now = Date.now()) => van?.status === 'active' && van.boostState === 'active' && millis(van.boostExpiresAt) > now;

function keyState(key, liveEnabled) {
  if (typeof key !== 'string' || !/^(sk|rk)_(test|live)_/.test(key)) return { available: false, mode: 'test', reason: 'setup' };
  const mode = key.includes('_live_') ? 'live' : 'test';
  if (createHash('sha256').update(key).digest('hex') === LEAKED_KEY_HASH) return { available: false, mode, reason: 'key_rotation' };
  return { available: mode === 'test' || liveEnabled === true, mode, reason: mode === 'live' && !liveEnabled ? 'setup' : null };
}

function matchesOrder(session, order, id) {
  return session.mode === 'payment' && session.payment_status === 'paid' &&
    session.id === order.checkoutSessionId && session.amount_total === order.amountCents &&
    session.currency === order.currency && session.livemode === order.livemode &&
    typeof session.payment_intent === 'string' &&
    session.metadata?.kind === 'listing_boost' && session.metadata.orderId === id &&
    session.metadata.vanId === order.vanId && session.metadata.ownerId === order.ownerId &&
    session.metadata.planId === order.planId && session.metadata.days === String(order.days);
}

function createBoostService({ db, stripe, getKey, liveEnabled, FV, HttpsError, rateLimit, now = Date.now }) {
  const fail = (code, message, details) => { throw new HttpsError(code, message, details); };
  const validId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(id);
  const requireUser = async (request) => {
    if (!request.auth) fail('unauthenticated', 'Authentication required.');
    if (request.auth.token.email_verified !== true) fail('permission-denied', 'Verified email required.');
    await rateLimit(request, 'boost', 10);
    return request.auth.uid;
  };

  async function catalog(request) {
    await rateLimit(request, 'boost-catalog', 60);
    const state = keyState(getKey(), liveEnabled());
    if (state.mode === 'test' && request?.auth?.token?.admin !== true) state.available = false;
    return { plans: Object.values(PLANS), ...state };
  }

  async function setAvailability(request) {
    const uid = await requireUser(request);
    const vanId = request.data?.vanId, status = request.data?.status;
    if (!validId(vanId) || !['active', 'sold'].includes(status)) fail('invalid-argument', 'Invalid listing status.');
    const ref = db.collection('vans').doc(vanId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists || (snap.data().seller?.uid !== uid && request.auth.token.admin !== true)) fail('permission-denied', 'Access denied.');
      tx.update(ref, { status, updatedAt: FV.serverTimestamp(), ...(status === 'active' ? {
        availabilityConfirmedAt: FV.serverTimestamp(), availabilityReminderSentAt: FV.delete(),
        expiredAt: FV.delete(), expiredReason: FV.delete(),
      } : {}) });
    });
    return { status, confirmedAt: status === 'active' ? new Date(now()).toISOString() : null };
  }

  async function fulfill(session, eventId) {
    const id = session.metadata?.orderId;
    if (!validId(id)) throw new Error('Invalid boost order reference');
    if (session.payment_status !== 'paid') return;
    const orderRef = db.collection('boostOrders').doc(id);
    const eventRef = db.collection('boostWebhookEvents').doc(eventId);
    await db.runTransaction(async (tx) => {
      const [orderSnap, eventSnap] = await Promise.all([tx.get(orderRef), tx.get(eventRef)]);
      if (eventSnap.exists) return;
      if (!orderSnap.exists || !matchesOrder(session, orderSnap.data(), id)) throw new Error('Boost payment does not match order');
      const order = orderSnap.data();
      if (order.fulfilledAt || ['refunded', 'disputed'].includes(order.status)) {
        tx.set(eventRef, { processedAt: FV.serverTimestamp(), orderId: id });
        return;
      }
      const vanRef = db.collection('vans').doc(order.vanId);
      const lockRef = vanRef.collection('private').doc('boostLock');
      const [vanSnap, lockSnap] = await Promise.all([tx.get(vanRef), tx.get(lockRef)]);
      const van = vanSnap.data();
      const canActivate = vanSnap.exists && van?.seller?.uid === order.ownerId &&
        ['active', 'paused'].includes(van.status) && !activeBoost(van, now());
      const expiresAt = new Date(now() + order.days * 86400000);
      tx.update(orderRef, {
        status: canActivate ? 'active' : 'paid_unavailable', fulfilledAt: FV.serverTimestamp(),
        paymentIntentId: session.payment_intent, expiresAt: canActivate ? expiresAt : null,
        updatedAt: FV.serverTimestamp(),
      });
      if (canActivate) tx.update(vanRef, {
        status: 'active', boostState: 'active', boostStartedAt: FV.serverTimestamp(), boostExpiresAt: expiresAt,
        boostOrderId: id, boostLivemode: order.livemode, availabilityConfirmedAt: FV.serverTimestamp(),
        availabilityReminderSentAt: FV.delete(), expiredAt: FV.delete(), expiredReason: FV.delete(), updatedAt: FV.serverTimestamp(),
      });
      if (lockSnap.data()?.orderId === id) tx.delete(lockRef);
      tx.set(eventRef, { processedAt: FV.serverTimestamp(), orderId: id });
    });
    const result = (await orderRef.get()).data();
    if (['paid_unavailable', 'refund_pending'].includes(result?.status)) {
      // The listing was sold/deleted while Checkout was open: return the money.
      const refund = await stripe().refunds.create({ payment_intent: session.payment_intent,
        metadata: { kind: 'listing_boost', orderId: id } }, { idempotencyKey: `boost_unavailable_refund_${id}` });
      if (!['pending', 'succeeded'].includes(refund.status)) throw new Error('Boost refund failed');
      await orderRef.update({ status: refund.status === 'succeeded' ? 'refunded' : 'refund_pending',
        refundId: refund.id, updatedAt: FV.serverTimestamp() });
    }
  }

  async function reconcile(request) {
    const uid = await requireUser(request);
    const id = request.data?.orderId;
    if (!validId(id)) fail('invalid-argument', 'Invalid order.');
    const ref = db.collection('boostOrders').doc(id);
    const snap = await ref.get();
    if (!snap.exists) fail('not-found', 'Order not found.');
    const order = snap.data();
    if (order.ownerId !== uid) fail('permission-denied', 'Access denied.');
    if (order.status === 'pending' && order.checkoutSessionId) {
      const session = await stripe().checkout.sessions.retrieve(order.checkoutSessionId);
      if (session.payment_status === 'paid') await fulfill(session, `reconcile_${session.id}`);
      else if (session.status === 'expired') await ref.update({ status: 'expired', updatedAt: FV.serverTimestamp() });
    }
    return { orderId: id, status: (await ref.get()).data().status };
  }

  async function checkout(request) {
    const uid = await requireUser(request);
    const state = keyState(getKey(), liveEnabled());
    if (!state.available) fail('failed-precondition', 'Boost checkout is not configured.');
    if (state.mode === 'test' && request.auth.token.admin !== true) fail('permission-denied', 'Test checkout is restricted to administrators.');
    const vanId = request.data?.vanId;
    const plan = Object.values(PLANS).find((candidate) => candidate.id === request.data?.planId);
    if (!validId(vanId) || !plan) fail('invalid-argument', 'Invalid listing or plan.');
    const vanRef = db.collection('vans').doc(vanId);
    const lockRef = vanRef.collection('private').doc('boostLock');
    const newRef = db.collection('boostOrders').doc();
    // Stripe Checkout expires after 60 min. Keep the lock longer to allow event delivery.
    const expiry = Math.floor(now() / 1000) + 3600;
    const { id, order } = await db.runTransaction(async (tx) => {
      const [vanSnap, lockSnap] = await Promise.all([tx.get(vanRef), tx.get(lockRef)]);
      const van = vanSnap.data();
      if (!vanSnap.exists || van?.seller?.uid !== uid) fail('permission-denied', 'Only the listing owner can buy a boost.');
      if (van.status !== 'active') fail('failed-precondition', 'Reactivate your listing before buying a boost.');
      if (activeBoost(van, now())) fail('already-exists', 'A boost is already active.');
      if (lockSnap.data()?.orderId) {
        const oldRef = db.collection('boostOrders').doc(lockSnap.data().orderId);
        const oldSnap = await tx.get(oldRef);
        const old = oldSnap.data();
        // An existing checkout must be reconciled/expired before creating another one.
        if (old?.status === 'pending' && (old.checkoutSessionId || millis(old.checkoutExpiresAt) > now())) {
          if (old.planId !== plan.id) fail('failed-precondition', 'Complete or cancel the pending checkout first.', { orderId: oldSnap.id });
          return { id: oldSnap.id, order: old };
        }
        if (old?.status === 'pending') tx.update(oldRef, { status: 'expired', updatedAt: FV.serverTimestamp() });
      }
      const order = { ownerId: uid, vanId, planId: plan.id, days: plan.days,
        amountCents: plan.amountCents, currency: plan.currency, livemode: state.mode === 'live',
        status: 'pending', checkoutExpiresAt: new Date(expiry * 1000), createdAt: FV.serverTimestamp() };
      tx.set(newRef, order);
      tx.set(lockRef, { orderId: newRef.id });
      return { id: newRef.id, order };
    });
    const orderRef = db.collection('boostOrders').doc(id);
    if (order.checkoutSessionId) {
      const session = await stripe().checkout.sessions.retrieve(order.checkoutSessionId);
      if (session.payment_status === 'paid') {
        await fulfill(session, `reconcile_${session.id}`);
        return { orderId: id, activated: true };
      }
      if (session.status === 'open' && session.url) return { orderId: id, url: session.url, mode: state.mode };
      await orderRef.update({ status: 'expired', updatedAt: FV.serverTimestamp() });
      fail('failed-precondition', 'Checkout expired. Please try again.', { orderId: id });
    }
    // Snapshot limits survive concurrent requests; do not trust the browser's price or duration.
    const session = await stripe().checkout.sessions.create({
      mode: 'payment', payment_method_types: ['card'], expires_at: Math.floor(millis(order.checkoutExpiresAt) / 1000),
      client_reference_id: id, customer_email: request.auth.token.email || undefined,
      success_url: `${SITE}/my-listings?boost_order=${id}`,
      cancel_url: `${SITE}/my-listings?boost_order=${id}&boost_cancelled=1`,
      line_items: [{ quantity: 1, price_data: { currency: order.currency, unit_amount: order.amountCents,
        product_data: { name: `Kiwi Van Market — ${order.days}-day listing boost` } } }],
      metadata: { kind: 'listing_boost', orderId: id, vanId, ownerId: uid, planId: order.planId, days: String(order.days) },
      payment_intent_data: { metadata: { kind: 'listing_boost', orderId: id, vanId } },
    }, { idempotencyKey: `boost_checkout_${id}` });
    await orderRef.update({ checkoutSessionId: session.id, updatedAt: FV.serverTimestamp() });
    return { orderId: id, url: session.url, mode: state.mode };
  }

  async function cancelCheckout(request) {
    const uid = await requireUser(request);
    const id = request.data?.orderId;
    if (!validId(id)) fail('invalid-argument', 'Invalid order.');
    const ref = db.collection('boostOrders').doc(id);
    const snap = await ref.get();
    if (!snap.exists || snap.data().ownerId !== uid) fail('permission-denied', 'Access denied.');
    const order = snap.data();
    if (order.status !== 'pending') return { status: order.status };
    if (order.checkoutSessionId) {
      const session = await stripe().checkout.sessions.retrieve(order.checkoutSessionId);
      if (session.payment_status === 'paid' || session.status === 'complete') {
        if (session.payment_status === 'paid') await fulfill(session, `reconcile_${session.id}`);
        fail('failed-precondition', 'Payment is already being processed.');
      }
      if (session.status === 'open') await stripe().checkout.sessions.expire(session.id);
    }
    await db.runTransaction(async (tx) => {
      const current = await tx.get(ref);
      if (current.data()?.status === 'pending') tx.update(ref, { status: 'cancelled', updatedAt: FV.serverTimestamp() });
    });
    return { status: 'cancelled' };
  }

  async function financialEvent(event) {
    let object = event.data.object;
    if (event.type.startsWith('charge.dispute.')) {
      // Stripe does not guarantee delivery order. Use the latest dispute state.
      object = await stripe().disputes.retrieve(object.id);
    }
    const intent = typeof object.payment_intent === 'string' ? object.payment_intent : object.payment_intent?.id;
    if (!intent) return;
    let orders = await db.collection('boostOrders').where('paymentIntentId', '==', intent).get();
    if (!orders.docs.length) {
      // Refund/dispute notifications may arrive before checkout.session.completed.
      const payment = await stripe().paymentIntents.retrieve(intent);
      const meta = payment.metadata;
      if (meta?.kind !== 'listing_boost' || !validId(meta.orderId)) return;
      const candidate = await db.collection('boostOrders').doc(meta.orderId).get();
      if (!candidate.exists || !candidate.data().checkoutSessionId) throw new Error('Boost order is not yet ready for reconciliation');
      const checkout = await stripe().checkout.sessions.retrieve(candidate.data().checkoutSessionId);
      if (checkout.payment_intent !== intent || !matchesOrder(checkout, candidate.data(), candidate.id)) throw new Error('Financial event does not match boost');
      orders = { docs: [candidate] };
    }
    for (const snap of orders.docs) {
      const ref = snap.ref;
      await db.runTransaction(async (tx) => {
        const current = await tx.get(ref);
        const order = current.data();
        const vanRef = db.collection('vans').doc(order.vanId);
        const van = await tx.get(vanRef);
        const isRefund = event.type === 'charge.refunded';
        const isFullRefund = isRefund && object.amount_refunded >= order.amountCents;
        const disputed = event.type.startsWith('charge.dispute.') && object.status !== 'won';
        const won = event.type.startsWith('charge.dispute.') && object.status === 'won';
        const lost = object.status === 'lost';
        // A full refund remains final even if an earlier dispute event is delivered later.
        if (order.status === 'refunded' && !isFullRefund) return;
        const status = isFullRefund ? 'refunded' : disputed || lost ? 'disputed' : won ?
          (!order.fulfilledAt ? 'pending' : millis(order.expiresAt) > now() ? 'active' : 'expired') : order.status;
        tx.update(ref, { status, paymentIntentId: intent,
          ...(isFullRefund && !order.fulfilledAt ? { fulfilledAt: FV.serverTimestamp() } : {}),
          ...(isRefund ? { refundedCents: Math.max(order.refundedCents || 0, object.amount_refunded) } : {}), updatedAt: FV.serverTimestamp() });
        if (van.data()?.boostOrderId === snap.id && (isFullRefund || disputed || lost || won)) {
          tx.update(vanRef, { boostState: status, updatedAt: FV.serverTimestamp() });
        }
      });
      const currentOrder = (await ref.get()).data();
      if (object.status === 'won' && currentOrder.status === 'pending' && !currentOrder.fulfilledAt) {
        const checkout = await stripe().checkout.sessions.retrieve(currentOrder.checkoutSessionId);
        await fulfill(checkout, `dispute_won_${object.id}`);
      }
    }
  }

  async function expireCheckout(session) {
    const id = session.metadata?.orderId;
    if (!validId(id)) return;
    const ref = db.collection('boostOrders').doc(id);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.data()?.status === 'pending' && snap.data().checkoutSessionId === session.id) {
        tx.update(ref, { status: 'expired', updatedAt: FV.serverTimestamp() });
      }
    });
  }

  return { catalog, checkout, fulfill, reconcile, cancelCheckout, financialEvent, setAvailability, expireCheckout };
}

module.exports = { PLANS, keyState, matchesOrder, activeBoost, createBoostService };
