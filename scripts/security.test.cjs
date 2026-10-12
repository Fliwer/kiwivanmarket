const test = require('node:test');
const assert = require('node:assert/strict');
const { isSafeReturnUrl, isTestPaymentKey, sessionMatchesReservation, refundParameters } = require('../functions/paymentSecurity');
const { consumeRateLimit } = require('../functions/abuseProtection');
const { htmlShell } = require('../api/_lib/util');
const prerenderVan = require('../api/prerender-van');

test('edge middleware admits payment returns and keeps unknown routes at 404', async () => {
  const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../middleware.js'), 'utf8');
  const { default: middleware } = await import(`data:text/javascript,${encodeURIComponent(source)}`);
  for (const path of ['/reservation-success?id=res', '/reservation-cancelled?id=res', '/Reservation-Success/']) {
    const response = middleware(new Request(`https://kiwivanmarket.com${path}`));
    assert.equal(response.headers.get('x-middleware-next'), '1');
  }
  assert.equal(middleware(new Request('https://kiwivanmarket.com/unknown-page')).status, 404);
});

test('checkout rejects phishing, credentials, non-HTTPS and production localhost returns', () => {
  for (const url of ['https://kiwivanmarket.com.attacker.test/pay', 'javascript:alert(1)',
    'https://kiwivanmarket.com@attacker.test/', 'https://name:password@kiwivanmarket.com/',
    'http://kiwivanmarket.com/', 'http://localhost:3000/', '/relative', 'invalid']) {
    assert.equal(isSafeReturnUrl(url), false, url);
  }
  assert.equal(isSafeReturnUrl('https://kiwivanmarket.com/reservation-success?id=a'), true);
  assert.equal(isSafeReturnUrl('https://www.kiwivanmarket.com/profile'), true);
  assert.equal(isSafeReturnUrl('http://localhost:3000/', true), true);
});

test('real keys and missing secrets cannot enable charges', () => {
  for (const key of [undefined, '', 'sk_live_example', 'rk_live_example', 'anything']) {
    assert.equal(isTestPaymentKey(key), false);
  }
  assert.equal(isTestPaymentKey('sk_test_example'), true);
});

const reservation = { checkoutSessionId: 'cs_test_one', depositAmount: 500,
  vanId: 'van', buyerId: 'buyer', sellerId: 'seller' };
const session = { id: 'cs_test_one', payment_intent: 'pi_test_one', mode: 'payment',
  payment_status: 'paid', currency: 'nzd', amount_total: 50000,
  metadata: { reservationId: 'res', vanId: 'van', buyerId: 'buyer', sellerId: 'seller' } };

test('webhook requires paid, exact cents, NZD and the original checkout identity', () => {
  assert.equal(sessionMatchesReservation(session, reservation, 'res'), true);
  for (const patch of [{ payment_status: 'unpaid' }, { amount_total: 49999 },
    { amount_total: 50001 }, { currency: 'usd' }, { id: 'cs_other' },
    { payment_intent: null }, { mode: 'subscription' }, { amount_total: NaN }]) {
    assert.equal(sessionMatchesReservation({ ...session, ...patch }, reservation, 'res'), false);
  }
  for (const key of ['reservationId', 'vanId', 'buyerId', 'sellerId']) {
    const forged = { ...session, metadata: { ...session.metadata, [key]: 'attacker' } };
    assert.equal(sessionMatchesReservation(forged, reservation, 'res'), false, key);
  }
});

test('destination-charge refund recovers vendor funds and the platform fee', () => {
  const refund = refundParameters({ paymentIntentId: 'pi_original' }, 'res', 'buyer');
  assert.equal(refund.payment_intent, 'pi_original');
  assert.equal(refund.reverse_transfer, true);
  assert.equal(refund.refund_application_fee, true);
});

test('rate limits persist across requests and identities, with hourly renewal', async () => {
  const docs = new Map();
  const db = {
    collection: () => ({ doc: (id) => id }),
    runTransaction: async (fn) => fn({
      get: async (id) => ({ exists: docs.has(id), data: () => docs.get(id) }),
      set: (id, data) => docs.set(id, data),
    }),
  };
  assert.equal(await consumeRateLimit(db, 'contact', 'user', 2, 0), true);
  assert.equal(await consumeRateLimit(db, 'contact', 'user', 2, 0), true);
  assert.equal(await consumeRateLimit(db, 'contact', 'user', 2, 0), false);
  assert.equal(await consumeRateLimit(db, 'contact', 'other', 2, 0), true);
  assert.equal(await consumeRateLimit(db, 'contact', 'user', 2, 3600000), true);
  assert.ok([...docs.keys()].every((key) => /^[a-f0-9]{64}$/.test(key)));
});

test('shared HTML renderer contains JSON-LD script breakout', () => {
  const payload = '</script><script>alert(document.cookie)</script>';
  const html = htmlShell({ title: payload, metaDesc: payload,
    canonical: 'https://kiwivanmarket.com/', jsonLd: [{ name: payload }], body: '' });
  assert.ok(!html.includes('<script>alert('));
  const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
  assert.equal(JSON.parse(json).name, payload);
});

test('van prerender contains malicious listing fields in HTML and JSON-LD', async () => {
  const originalFetch = global.fetch;
  const payload = '</script><script>alert(document.cookie)</script>';
  global.fetch = async () => ({ ok: true, json: async () => ({ documents: [{
    name: 'projects/test/databases/(default)/documents/vans/van',
    fields: { title: { stringValue: payload }, description: { stringValue: payload },
      status: { stringValue: 'active' }, price: { integerValue: '10000' } },
  }] }) });
  let html;
  const res = { status: () => res, setHeader: () => res, send: (body) => { html = body; } };
  try {
    await prerenderVan({ query: { id: 'van' } }, res);
    assert.ok(!html.includes('<script>alert('));
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
    assert.equal(scripts.length, 2);
    assert.equal(JSON.parse(scripts[0][1]).name, payload);
  } finally { global.fetch = originalFetch; }
});
