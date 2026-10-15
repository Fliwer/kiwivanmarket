const test = require('node:test');
const assert = require('node:assert/strict');
const { createBoostService, keyState, PLANS } = require('../functions/boostService');
const { rankVans, isBoostActive } = require('../src/utils/boostVisibility.js');

function fixture() {
  let clock = 1800000000000, id = 0, queue = Promise.resolve();
  const data = new Map([['vans/van', { seller: { uid: 'seller' }, status: 'active', title: 'Toyota Hiace' }]]);
  const apply = (fields, old = {}) => {
    const result = { ...old };
    for (const [key, value] of Object.entries(fields)) {
      if (value === DELETE) delete result[key];
      else result[key] = value === STAMP ? new Date(clock) : value;
    }
    return result;
  };
  const STAMP = Symbol('timestamp'), DELETE = Symbol('delete');
  const snapshot = (ref) => ({ id: ref.id, ref, exists: data.has(ref.path), data: () => data.get(ref.path) });
  const makeRef = (path) => ({ path, id: path.split('/').pop(), get: async () => snapshot(makeRef(path)),
    update: async (fields) => data.set(path, apply(fields, data.get(path))),
    collection: (name) => collection(`${path}/${name}`) });
  const collection = (path) => ({ doc: (name = `order_${++id}`) => makeRef(`${path}/${name}`),
    where: (field, op, value) => ({ get: async () => ({ docs: [...data.entries()]
      .filter(([key, row]) => key.startsWith(`${path}/`) && !key.slice(path.length + 1).includes('/') && row[field] === value)
      .map(([key]) => snapshot(makeRef(key))) }) }) });
  const db = { collection, runTransaction: (fn) => {
    const execution = queue.then(async () => {
      const writes = [];
      const result = await fn({ get: async (ref) => snapshot(ref),
        set: (ref, fields) => writes.push(() => data.set(ref.path, apply(fields))),
        update: (ref, fields) => writes.push(() => data.set(ref.path, apply(fields, data.get(ref.path)))),
        delete: (ref) => writes.push(() => data.delete(ref.path)) });
      writes.forEach((write) => write());
      return result;
    });
    queue = execution.catch(() => {});
    return execution;
  } };
  const sessions = new Map(), params = [], refunds = [];
  let disputeStatus = 'under_review';
  const stripe = { checkout: { sessions: {
    create: async (input, options) => {
      params.push(input);
      if (!sessions.has(options.idempotencyKey)) sessions.set(options.idempotencyKey, {
        id: `cs_${options.idempotencyKey}`, url: 'https://checkout.stripe.com/c/pay/test', mode: 'payment',
        payment_status: 'unpaid', status: 'open', livemode: false, currency: input.line_items[0].price_data.currency,
        amount_total: input.line_items[0].price_data.unit_amount, metadata: input.metadata,
      });
      return sessions.get(options.idempotencyKey);
    },
    retrieve: async (id) => [...sessions.values()].find((session) => session.id === id),
    expire: async (id) => { [...sessions.values()].find((s) => s.id === id).status = 'expired'; },
  } }, refunds: { create: async (input, opts) => { refunds.push({ input, opts }); return { id: 're_test', status: 'succeeded' }; } },
  disputes: { retrieve: async () => ({ id: 'dp_test', payment_intent: 'pi_test', status: disputeStatus }) },
  paymentIntents: { retrieve: async () => ({ metadata: [...sessions.values()][0]?.metadata }) } };
  class HttpsError extends Error { constructor(code, message, details) { super(message); this.code = code; this.details = details; } }
  const service = createBoostService({ db, stripe: () => stripe, getKey: () => 'sk_test_safe_fixture', liveEnabled: () => false,
    FV: { serverTimestamp: () => STAMP, delete: () => DELETE }, HttpsError, rateLimit: async () => {}, now: () => clock });
  const request = (planId = 'fortnight', uid = 'seller') => ({ auth: { uid, token: { admin: true, email_verified: true, email: `${uid}@example.test` } },
    data: { vanId: 'van', planId, amountCents: 1, days: 9999, successUrl: 'https://attacker.example' } });
  const paidSession = () => { const session = [...sessions.values()][0]; session.payment_status = 'paid'; session.status = 'complete'; session.payment_intent = 'pi_test'; return session; };
  return { data, service, params, sessions, request, paidSession, refunds, now: () => clock,
    advance: (ms) => { clock += ms; }, dispute: (status) => { disputeStatus = status; } };
}

test('boost checkout fixes 30/50 NZD prices and excludes Connect transfers', async () => {
  for (const [planId, amount, days] of [['fortnight', 3000, 14], ['month', 5000, 28]]) {
    const f = fixture(); const result = await f.service.checkout(f.request(planId));
    const params = f.params[0];
    assert.equal(params.line_items[0].price_data.unit_amount, amount);
    assert.equal(params.metadata.days, String(days));
    assert.equal(params.mode, 'payment');
    assert.equal(params.payment_intent_data.transfer_data, undefined);
    assert.ok(params.success_url.startsWith('https://kiwivanmarket.com/my-listings?boost_order='));
    assert.equal(f.data.get(`boostOrders/${result.orderId}`).status, 'pending');
    assert.equal(f.data.get('vans/van').boostState, undefined);
  }
});

test('checkout rejects impersonation, unverified email, sold listings and invalid/prototype plans', async () => {
  for (const req of [fixture().request('fortnight', 'attacker'), fixture().request('__proto__'), fixture().request('constructor'),
    { ...fixture().request(), auth: null }, { ...fixture().request(), auth: { uid: 'seller', token: { email_verified: false } } }]) {
    const f = fixture(); await assert.rejects(f.service.checkout(req)); assert.equal(f.params.length, 0);
  }
  const f = fixture(); f.data.get('vans/van').status = 'sold';
  await assert.rejects(f.service.checkout(f.request())); assert.equal(f.params.length, 0);
});

test('concurrent checkout requests reuse one order and one Stripe session', async () => {
  const f = fixture();
  const results = await Promise.all([f.service.checkout(f.request()), f.service.checkout(f.request())]);
  assert.equal(results[0].orderId, results[1].orderId);
  assert.equal(f.sessions.size, 1);
  await assert.rejects(f.service.checkout(f.request('month')));
});

test('a leftover lock from another owner cannot disclose or reuse their Checkout', async () => {
  const f = fixture();
  f.data.set('vans/van/private/boostLock', { orderId: 'foreign' });
  f.data.set('boostOrders/foreign', { ownerId: 'other', vanId: 'van', status: 'pending', planId: 'fortnight', checkoutSessionId: 'cs_foreign' });
  const result = await f.service.checkout(f.request());
  assert.notEqual(result.orderId, 'foreign');
  assert.equal(f.data.get('boostOrders/foreign').status, 'pending');
});

test('non-admin users cannot buy or advertise free test boosts', async () => {
  const f = fixture(); const request = f.request(); request.auth.token.admin = false;
  assert.equal((await f.service.catalog(request)).available, false);
  await assert.rejects(f.service.checkout(request));
  assert.equal(f.params.length, 0);
});

test('owner can reactivate a paused listing and refresh its availability; other users cannot', async () => {
  const f = fixture(); f.data.get('vans/van').status = 'paused';
  const request = f.request(); request.data = { vanId: 'van', status: 'active' };
  request.auth.token.admin = false;
  await f.service.setAvailability(request);
  assert.equal(f.data.get('vans/van').status, 'active');
  assert.equal(f.data.get('vans/van').availabilityConfirmedAt.getTime(), f.now());
  request.auth.uid = 'attacker';
  await assert.rejects(f.service.setAvailability(request));
});

test('only paid matching sessions activate a boost, once, for exactly 14 days', async () => {
  const f = fixture(); await f.service.checkout(f.request());
  const unpaid = [...f.sessions.values()][0]; await f.service.fulfill(unpaid, 'evt_unpaid');
  assert.equal(f.data.get('vans/van').boostState, undefined);
  const paid = f.paidSession();
  for (const patch of [{ amount_total: 1 }, { currency: 'usd' }, { livemode: true }, { id: 'cs_wrong' },
    { metadata: { ...paid.metadata, ownerId: 'attacker' } }, { metadata: { ...paid.metadata, days: '9999' } }]) {
    await assert.rejects(f.service.fulfill({ ...paid, ...patch }, 'evt_wrong'));
  }
  await Promise.all([f.service.fulfill(paid, 'evt_paid'), f.service.fulfill(paid, 'evt_paid')]);
  const expiry = f.data.get('vans/van').boostExpiresAt.getTime();
  assert.equal(expiry, f.now() + 14 * 86400000);
  f.advance(86400000);
  await f.service.fulfill(paid, 'evt_other_paid');
  assert.equal(f.data.get('vans/van').boostExpiresAt.getTime(), expiry);
  await assert.rejects(f.service.checkout(f.request('month')));
});

test('successful payment can reconcile after browser return even without its webhook', async () => {
  const f = fixture(); const order = await f.service.checkout(f.request()); f.paidSession();
  const result = await f.service.reconcile({ ...f.request(), data: { orderId: order.orderId } });
  assert.equal(result.status, 'active');
  await assert.rejects(f.service.reconcile({ ...f.request('fortnight', 'attacker'), data: { orderId: order.orderId } }));
});

test('cancelling open checkout never activates a boost; paid checkout cannot be cancelled', async () => {
  const f = fixture(); const order = await f.service.checkout(f.request());
  await f.service.cancelCheckout({ ...f.request(), data: { orderId: order.orderId } });
  assert.equal(f.data.get(`boostOrders/${order.orderId}`).status, 'cancelled');
  assert.equal(f.data.get('vans/van').boostState, undefined);
  const g = fixture(); const second = await g.service.checkout(g.request()); g.paidSession();
  await assert.rejects(g.service.cancelCheckout({ ...g.request(), data: { orderId: second.orderId } }));
  assert.equal(g.data.get('vans/van').boostState, 'active');
});

test('payment for a listing sold during Checkout is refunded, never promoted', async () => {
  const f = fixture(); const order = await f.service.checkout(f.request());
  f.data.get('vans/van').status = 'sold'; await f.service.fulfill(f.paidSession(), 'evt_paid');
  assert.equal(f.data.get('vans/van').boostState, undefined);
  assert.equal(f.data.get(`boostOrders/${order.orderId}`).status, 'refunded');
  assert.equal(f.refunds[0].opts.idempotencyKey, `boost_unavailable_refund_${order.orderId}`);
});

test('full refunds revoke visibility; stale dispute events cannot restore refunded service', async () => {
  const f = fixture(); await f.service.checkout(f.request()); await f.service.fulfill(f.paidSession(), 'evt_paid');
  await f.service.financialEvent({ type: 'charge.refunded', data: { object: { payment_intent: 'pi_test', amount_refunded: 3000 } } });
  assert.equal(f.data.get('vans/van').boostState, 'refunded');
  f.dispute('won');
  await f.service.financialEvent({ type: 'charge.dispute.closed', data: { object: { id: 'dp_test' } } });
  assert.equal(f.data.get('vans/van').boostState, 'refunded');
});

test('refund received before payment notification never grants refunded service', async () => {
  const f = fixture(); const order = await f.service.checkout(f.request()); const paid = f.paidSession();
  await f.service.financialEvent({ type: 'charge.refunded', data: { object: { payment_intent: 'pi_test', amount_refunded: 3000 } } });
  await f.service.fulfill(paid, 'evt_late_payment');
  assert.equal(f.data.get(`boostOrders/${order.orderId}`).status, 'refunded');
  assert.equal(f.data.get('vans/van').boostState, undefined);
});

test('dispute before first fulfillment holds the service, then activates once on a win', async () => {
  const f = fixture(); await f.service.checkout(f.request()); const paid = f.paidSession();
  await f.service.financialEvent({ type: 'charge.dispute.created', data: { object: { id: 'dp_test' } } });
  await f.service.fulfill(paid, 'evt_late_payment');
  assert.equal(f.data.get('vans/van').boostState, undefined);
  f.advance(86400000); f.dispute('won');
  await f.service.financialEvent({ type: 'charge.dispute.closed', data: { object: { id: 'dp_test' } } });
  assert.equal(f.data.get('vans/van').boostState, 'active');
  assert.equal(f.data.get('vans/van').boostExpiresAt.getTime(), f.now() + 14 * 86400000);
});

test('latest Stripe dispute state wins over delivery order and cannot extend expiry', async () => {
  const f = fixture(); await f.service.checkout(f.request()); await f.service.fulfill(f.paidSession(), 'evt_paid');
  const expiresAt = f.data.get('vans/van').boostExpiresAt.getTime();
  await f.service.financialEvent({ type: 'charge.dispute.created', data: { object: { id: 'dp_test' } } });
  assert.equal(f.data.get('vans/van').boostState, 'disputed');
  f.dispute('won');
  await f.service.financialEvent({ type: 'charge.dispute.created', data: { object: { id: 'dp_test' } } });
  assert.equal(f.data.get('vans/van').boostState, 'active');
  assert.equal(f.data.get('vans/van').boostExpiresAt.getTime(), expiresAt);
});

test('visibility expires without scheduler, hides sold/paused vans and rotates matched boosts', () => {
  const now = 1800000000000;
  const boosted = (id) => ({ id, price: 5000, status: 'active', boostState: 'active', boostLivemode: true, boostStartedAt: new Date(now - 1000), boostExpiresAt: new Date(now + 1000) });
  const normal = { id: 'normal', status: 'active', price: 1, createdAt: new Date(now) };
  const a = boosted('a'), b = boosted('b');
  assert.equal(rankVans([normal, a], 'price-asc', now)[0].id, 'a');
  assert.equal(isBoostActive({ ...a, status: 'sold' }, now), false);
  assert.equal(isBoostActive({ ...a, status: 'paused' }, now), false);
  assert.equal(isBoostActive({ ...a, boostLivemode: false }, now), false);
  assert.equal(isBoostActive(a, now + 1000), false);
  assert.equal(rankVans([normal, a], 'price-asc', now + 1000)[0].id, 'normal');
  const longer = [a, b].map((v) => ({ ...v, boostExpiresAt: new Date(now + 86400000) }));
  const firstIds = new Set(Array.from({ length: 40 }, (_, i) => rankVans(longer, 'newest', now + i * 300000)[0].id));
  assert.equal(firstIds.size, 2);
});

test('live payments require an explicit opt-in and catalog duration/price stay fixed', () => {
  assert.equal(keyState('sk_live_fixture', false).available, false);
  assert.equal(keyState('sk_live_fixture', true).available, true);
  assert.equal(keyState('', true).available, false);
  assert.equal(keyState('\n sk_test_fixture \r\n', false).available, true);
  assert.equal(keyState('\n sk_live_fixture \r\n', false).available, false);
  assert.deepEqual(Object.values(PLANS).map((p) => [p.days, p.amountCents]), [[14, 3000], [28, 5000]]);
});
