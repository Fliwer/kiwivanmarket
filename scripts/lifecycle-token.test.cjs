const test = require('node:test');
const assert = require('node:assert/strict');
const { ensurePrivateLifecycleToken } = require('../functions/lifecycleToken');

for (const existing of [undefined, 'short', 'secure-private-token'.repeat(3)]) {
  test(`final reminder keeps token private (${existing ? 'existing' : 'missing'})`, async () => {
    const writes = [];
    const privateRef = { path: 'vans/one/private/lifecycle' };
    const vanRef = { collection: (name) => {
      assert.equal(name, 'private');
      return { doc: (id) => { assert.equal(id, 'lifecycle'); return privateRef; } };
    } };
    const db = { runTransaction: (fn) => fn({
      get: async (ref) => { assert.equal(ref, privateRef); return {
        exists: Boolean(existing), data: () => ({ availabilityToken: existing }),
      }; },
      set: (...args) => writes.push(['set', ...args]),
      update: (...args) => writes.push(['update', ...args]),
    }) };
    const generated = 'fresh-secret'.repeat(5);
    const token = await ensurePrivateLifecycleToken(db, vanRef, () => generated, () => 'DELETE');
    assert.equal(token, existing?.length >= 32 ? existing : generated);
    assert.deepEqual(writes.at(-1), ['update', vanRef, { availabilityToken: 'DELETE' }]);
    assert.equal(writes.filter(([op]) => op === 'set').length, existing?.length >= 32 ? 0 : 1);
    if (writes.length > 1) assert.deepEqual(writes[0],
      ['set', privateRef, { availabilityToken: generated }, { merge: true }]);
  });
}
