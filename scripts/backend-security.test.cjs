const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { createEmailDelivery } = require('../functions/emailDelivery');
const { createListingLifecycle, applyLifecycleAction } = require('../functions/lifecycleToken');

function fixture() {
  let clock = 1800000000000, serial = Promise.resolve(), sequence = 0;
  const rows = new Map(), sent = [];
  const DELETE = Symbol('delete'), STAMP = Symbol('stamp');
  const FV = { delete: () => DELETE, serverTimestamp: () => STAMP, increment: (n) => ({ increment: n }) };
  const clone = (value) => value === undefined ? undefined : structuredClone(value);
  const apply = (old, fields) => {
    const data = clone(old || {});
    for (const [key, value] of Object.entries(fields)) {
      const parts = key.split('.');
      let target = data;
      for (const part of parts.slice(0, -1)) target = target[part] ||= {};
      const name = parts.at(-1);
      if (value === DELETE) delete target[name];
      else target[name] = value === STAMP ? new Date(clock) : value?.increment ? (target[name] || 0) + value.increment : clone(value);
    }
    return data;
  };
  const snapshot = (ref) => {
    const data = clone(rows.get(ref.path));
    return { ref, id: ref.id, exists: data !== undefined, data: () => clone(data) };
  };
  const ref = (path) => ({ path, id: path.split('/').at(-1), collection: (name) => collection(`${path}/${name}`),
    get: async () => snapshot(ref(path)), update: async (fields) => rows.set(path, apply(rows.get(path), fields)),
    set: async (fields, options) => rows.set(path, apply(options?.merge ? rows.get(path) : {}, fields)) });
  const query = (path, filters = []) => ({
    where: (...args) => query(path, [...filters, args]), orderBy: () => query(path, filters),
    get: async () => {
      const docs = [...rows.keys()].filter((key) => key.startsWith(`${path}/`) && !key.slice(path.length + 1).includes('/'))
        .filter((key) => filters.every(([field, op, value]) => op === '==' ? rows.get(key)[field] === value :
          op === 'in' ? value.includes(rows.get(key)[field]) : rows.get(key)[field] >= value)).map((key) => snapshot(ref(key)));
      const result = { docs, size: docs.length, empty: !docs.length, forEach: (fn) => docs.forEach(fn) };
      if (f.onQuery) await f.onQuery(path);
      return result;
    },
  });
  const collection = (path) => ({ ...query(path), doc: (id = `generated_${++sequence}`) => ref(`${path}/${id}`),
    add: async (fields) => { const r = ref(`${path}/generated_${++sequence}`); await r.set(fields); return r; } });
  const db = { collection, runTransaction: (fn) => {
    const result = serial.then(async () => {
      const writes = [];
      const value = await fn({ get: async (r) => snapshot(r),
        set: (r, fields, options) => writes.push(() => rows.set(r.path, apply(options?.merge ? rows.get(r.path) : {}, fields))),
        update: (r, fields) => writes.push(() => rows.set(r.path, apply(rows.get(r.path), fields))),
        delete: (r) => writes.push(() => rows.delete(r.path)) });
      writes.forEach((write) => write());
      return value;
    });
    serial = result.catch(() => {});
    return result;
  } };
  const requestHeaders = [];
  const resend = { headers: new Headers({ Authorization: 'Bearer synthetic', 'Content-Type': 'application/json' }), emails: { send: async (payload, options) => {
    sent.push(payload);
    requestHeaders.push(options?.headers);
    if (f.onSend) await f.onSend();
    return f.providerError ? { data: null, error: { name: 'synthetic_failure' } } : { data: { id: `synthetic_${sent.length}` }, error: null };
  } } };
  const f = { db, rows, ref, FV, sent, resend, requestHeaders, now: () => clock, advance: (ms) => { clock += ms; } };
  return f;
}

function handlers(f) {
  const firestore = () => f.db; firestore.FieldValue = f.FV;
  const hook = (...args) => args.at(-1);
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const modules = {
    dotenv: { config() {} }, 'firebase-admin': { initializeApp() {}, firestore },
    'firebase-functions/v2/firestore': { onDocumentCreated: hook },
    'firebase-functions/v2/scheduler': { onSchedule: hook },
    'firebase-functions/v2/https': { onCall: hook, onRequest: hook, HttpsError },
    'firebase-functions/params': { defineSecret: () => ({ value: () => 'synthetic' }), defineBoolean: () => ({ value: () => false }) },
    resend: { Resend: class { constructor() { this.emails = f.resend.emails; this.headers = f.resend.headers; } } },
    '@google/generative-ai': { GoogleGenerativeAI: class {} }, stripe: class {},
    './emailDelivery': { createEmailDelivery: ({ db }) => createEmailDelivery({ db, now: f.now }) },
    './lifecycleToken': { ...require('../functions/lifecycleToken'), createListingLifecycle: (options) => createListingLifecycle({ ...options, now: f.now }) },
  };
  const FakeDate = class extends Date { constructor(...args) { super(...(args.length ? args : [f.now()])); } static now() { return f.now(); } };
  const sandbox = { require: (name) => modules[name] || require(name.startsWith('./') ? `../functions/${name.slice(2)}` : name),
    exports: {}, console: { log() {}, error() {} }, Buffer, URL, setTimeout, Date: FakeDate };
  vm.runInNewContext(fs.readFileSync(require.resolve('../functions/index.js'), 'utf8'), sandbox);
  return sandbox.exports;
}

const payload = (to = 'synthetic@example.test') => ({ to, from: 'synthetic@example.test', subject: 'Synthetic audit', html: '<p>Test</p>' });

test('email transactions allow one notification for 20 concurrent messages to a recipient', async () => {
  const f = fixture(), delivery = createEmailDelivery({ db: f.db, now: f.now });
  const results = await Promise.all(Array.from({ length: 20 }, (_, i) => delivery.send(f.resend, payload(), {
    key: `message:${i}`, senderId: 'buyer', cooldownMs: 1800000,
  })));
  assert.equal(f.sent.length, 1);
  assert.equal(results.filter((result) => result.skipped).length, 19);
});

test('email event retries do not resend and every path shares hourly/daily capacity', async () => {
  const f = fixture(), delivery = createEmailDelivery({ db: f.db, now: f.now, dailyLimit: 3, hourlyLimit: 2 });
  await delivery.send(f.resend, payload(), { key: 'one' });
  await delivery.send(f.resend, payload(), { key: 'one' });
  assert.equal(f.sent.length, 1);
  await delivery.send(f.resend, payload(), { key: 'two' });
  assert.equal((await delivery.send(f.resend, payload(), { key: 'three' })).error.name, 'email_quota');
  f.advance(3600000);
  await delivery.send(f.resend, payload(), { key: 'three' });
  assert.equal((await delivery.send(f.resend, payload(), { key: 'four' })).error.name, 'email_quota');
  assert.equal(f.sent.length, 3);
  assert.match(f.requestHeaders[0].get('Idempotency-Key'), /^kvm_[a-f0-9]{64}$/);
  assert.equal(f.requestHeaders[0].get('Authorization'), 'Bearer synthetic');
  assert.equal(f.resend.headers.has('Idempotency-Key'), false);
});

test('installed Resend SDK forwards the idempotency header while preserving authentication', async () => {
  const { Resend } = require('../functions/node_modules/resend');
  const f = fixture(), delivery = createEmailDelivery({ db: f.db, now: f.now });
  const client = new Resend('re_synthetic');
  let request;
  client.fetchRequest = async (path, options) => { request = { path, options }; return { data: { id: 'synthetic' }, error: null }; };
  await delivery.send(client, payload(), { key: 'sdk-forwarding' });
  assert.equal(request.path, '/emails');
  assert.match(request.options.headers.get('Idempotency-Key'), /^kvm_[a-f0-9]{64}$/);
  assert.equal(request.options.headers.get('Authorization'), 'Bearer re_synthetic');
  assert.equal(client.headers.has('Idempotency-Key'), false);
});

test('failed provider deliveries release recipient cooldown but still consume attempt budget', async () => {
  const f = fixture(), delivery = createEmailDelivery({ db: f.db, now: f.now, dailyLimit: 2 });
  f.providerError = true;
  assert.ok((await delivery.send(f.resend, payload(), { key: 'failed', cooldownMs: 1800000 })).error);
  f.providerError = false;
  assert.ok((await delivery.send(f.resend, payload(), { key: 'next', cooldownMs: 1800000 })).data);
  assert.equal((await delivery.send(f.resend, payload(), { key: 'over-budget' })).error.name, 'email_quota');
  assert.equal(f.sent.length, 2);
});

test('one sender cannot evade the hourly notification limit by targeting different recipients', async () => {
  const f = fixture(), delivery = createEmailDelivery({ db: f.db, now: f.now, senderLimit: 2 });
  const results = await Promise.all(Array.from({ length: 6 }, (_, i) => delivery.send(f.resend, payload(`synthetic${i}@example.test`), {
    key: `recipient:${i}`, senderId: 'buyer',
  })));
  assert.equal(f.sent.length, 2);
  assert.equal(results.filter((result) => result.error?.name === 'email_quota').length, 4);
});

test('real notification handlers stop duplicate-conversation and concurrent-message email amplification', async () => {
  const f = fixture(), h = handlers(f);
  f.rows.set('users/seller', { email: 'seller@example.test' });
  for (let i = 0; i < 20; i++) await h.onNewConversation({ params: { conversationId: `conv_${i}` }, data: {
    data: () => ({ sellerId: 'seller', buyerId: 'buyer', vanId: 'van', van: { title: 'Synthetic van' }, lastMessage: 'Hello' }),
    ref: f.ref(`conversations/conv_${i}`),
  } });
  assert.equal(f.sent.length, 1);
  f.advance(1800001);
  f.rows.set('conversations/existing', { participants: ['buyer', 'seller'], buyerId: 'buyer', van: { title: 'Synthetic van' } });
  await Promise.all(Array.from({ length: 20 }, (_, i) => h.onNewMessage({
    params: { conversationId: 'existing', messageId: `msg_${i}` }, data: { data: () => ({ senderId: 'buyer', text: 'Hello' }) },
  })));
  assert.equal(f.sent.length, 2);
});

test('first seller reply is notified to buyer even when initial inquiry email was already sent', async () => {
  const f = fixture(), h = handlers(f);
  f.rows.set('users/buyer', { email: 'buyer@example.test' });
  f.rows.set('conversations/existing', { participants: ['buyer', 'seller'], buyerId: 'buyer', emailNotificationSent: true, van: { title: 'Synthetic van' } });
  await h.onNewMessage({ params: { conversationId: 'existing', messageId: 'reply' }, data: { data: () => ({ senderId: 'seller', text: 'Available' }) } });
  assert.equal(f.sent.length, 1);
  assert.equal(f.sent[0].to, 'buyer@example.test');
});

function oldVan(f, reminded = false) {
  const DAY = 86400000;
  f.rows.set('vans/van', { status: 'active', seller: { uid: 'seller' }, title: 'Synthetic van', createdAt: new Date(f.now() - 90 * DAY),
    ...(reminded ? { availabilityReminderSentAt: new Date(f.now() - 35 * DAY) } : {}) });
  f.rows.set('vans/van/private/contact', { email: 'seller@example.test' });
}

test('lifecycle re-reads current van so a boost activated after scheduler snapshot cannot be paused', async () => {
  const f = fixture(), h = handlers(f); oldVan(f, true);
  f.onQuery = (path) => { if (path === 'vans') Object.assign(f.rows.get('vans/van'), { boostState: 'active', boostLivemode: true, boostExpiresAt: new Date(f.now() + 28 * 86400000) }); };
  await h.listingLifecycle();
  assert.equal(f.rows.get('vans/van').status, 'active');
  assert.equal(f.sent.length, 0);
});

test('failed reminder email never marks a reminder as sent or starts the pause countdown', async () => {
  const f = fixture(), h = handlers(f); oldVan(f); f.providerError = true;
  await h.listingLifecycle();
  assert.equal(f.rows.get('vans/van').availabilityReminderSentAt, undefined);
  f.advance(31 * 86400000);
  await h.listingLifecycle();
  assert.equal(f.rows.get('vans/van').status, 'active');
  assert.equal(f.rows.get('vans/van').availabilityReminderSentAt, undefined);
});

test('pause still commits when email capacity is exhausted', async () => {
  const f = fixture(), h = handlers(f); oldVan(f, true);
  f.rows.set(`securityEmailDeliveries/day_${Math.floor(f.now() / 86400000)}`, { count: 80 });
  await h.listingLifecycle();
  assert.equal(f.rows.get('vans/van').status, 'paused');
  assert.equal(f.sent.length, 0);
});

test('a confirmation during reminder delivery cannot be overwritten by a stale reminder timestamp', async () => {
  const f = fixture(), h = handlers(f); oldVan(f);
  f.onSend = () => { f.rows.get('vans/van').availabilityConfirmedAt = new Date(f.now()); };
  await h.listingLifecycle();
  assert.equal(f.rows.get('vans/van').availabilityReminderSentAt, undefined);
});

test('private lifecycle token cannot reactivate a moderated listing and confirmation resets final-notice cycle', async () => {
  const f = fixture(); const token = 'private-token'.repeat(4);
  f.rows.set('vans/van/private/lifecycle', { availabilityToken: token });
  for (const status of ['hidden', 'rejected', 'deleted']) {
    f.rows.set('vans/van', { status });
    assert.equal((await applyLifecycleAction(f.db, f.ref('vans/van'), token, 'confirm', f.FV)).error, 'moderated');
    assert.equal(f.rows.get('vans/van').status, status);
  }
  f.rows.set('vans/van', { status: 'paused', finalNoticeSentAt: new Date(f.now()), availabilityReminderSentAt: new Date(f.now() - 1000) });
  assert.equal((await applyLifecycleAction(f.db, f.ref('vans/van'), 'wrong', 'confirm', f.FV)).error, 'expired');
  await applyLifecycleAction(f.db, f.ref('vans/van'), token, 'confirm', f.FV);
  assert.equal(f.rows.get('vans/van').status, 'active');
  assert.equal(f.rows.get('vans/van').finalNoticeSentAt, undefined);
  assert.equal(f.rows.get('vans/van').availabilityReminderSentAt, undefined);
});

test('final notices are only marked after delivery and can be sent again during a later availability cycle', async () => {
  const f = fixture(), h = handlers(f); oldVan(f);
  f.rows.get('vans/van').availabilityReminderSentAt = new Date(f.now() - 20 * 86400000);
  f.providerError = true;
  await h.sendFinalAvailabilityNotice();
  assert.equal(f.rows.get('vans/van').finalNoticeSentAt, undefined);
  f.providerError = false;
  await h.sendFinalAvailabilityNotice();
  assert.ok(f.rows.get('vans/van').finalNoticeSentAt);
  const token = f.rows.get('vans/van/private/lifecycle').availabilityToken;
  await applyLifecycleAction(f.db, f.ref('vans/van'), token, 'confirm', f.FV);
  f.advance(31 * 86400000);
  await h.listingLifecycle();
  assert.equal(f.rows.get('vans/van').finalNoticeSentAt, undefined);
  f.advance(17 * 86400000);
  await h.sendFinalAvailabilityNotice();
  assert.ok(f.rows.get('vans/van').finalNoticeSentAt);
  assert.equal(f.sent.length, 4);
});

test('email GET never mutates the listing; only a validated POST body commits and cannot bypass moderation', async () => {
  const f = fixture(), h = handlers(f), token = 'private-token'.repeat(4);
  f.rows.set('vans/van', { status: 'active', title: 'Synthetic van' });
  f.rows.set('vans/van/private/lifecycle', { availabilityToken: token });
  const response = () => ({ code: null, headers: {}, body: null,
    status(value) { this.code = value; return this; },
    set(key, value) { if (typeof key === 'object') Object.assign(this.headers, key); else this.headers[key] = value; return this; },
    send(value) { this.body = value; return this; } });
  const query = { van: 'van', token, action: 'sold' }, get = response();
  await h.listingAction({ method: 'GET', query }, get);
  assert.equal(get.code, 200);
  assert.match(get.body, /<form method="post"/);
  assert.equal(get.headers['Cache-Control'], 'no-store');
  assert.equal(get.headers['Referrer-Policy'], 'no-referrer');
  assert.match(get.headers['Content-Security-Policy'], /form-action 'self'; frame-ancestors 'none'/);
  assert.equal(f.rows.get('vans/van').status, 'active');
  const invalid = response();
  await h.listingAction({ method: 'POST', query, body: {} }, invalid);
  assert.equal(invalid.code, 400);
  assert.equal(f.rows.get('vans/van').status, 'active');
  await h.listingAction({ method: 'POST', body: query }, response());
  assert.equal(f.rows.get('vans/van').status, 'sold');
  f.rows.get('vans/van').status = 'hidden';
  const blocked = response();
  await h.listingAction({ method: 'POST', body: { ...query, action: 'confirm' } }, blocked);
  assert.equal(blocked.code, 400);
  assert.equal(f.rows.get('vans/van').status, 'hidden');
  const method = response();
  await h.listingAction({ method: 'PUT', body: query }, method);
  assert.equal(method.code, 405);
});
