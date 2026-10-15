const test = require('node:test');
const assert = require('node:assert/strict');
const vehicleData = require('../src/data/seo/vehicle-schema.cjs');
const certification = require('../src/data/seo/self-contained.cjs');
const response = () => ({ code: 200, headers: {}, body: '', status(code) { this.code = code; return this; },
  setHeader(key, value) { this.headers[key] = value; return this; }, send(body) { this.body = body; return this; } });

test('vehicle identity uses recognized models, never the title first word or document ID as VIN', () => {
  const van = { id: 'CaseSensitiveFirestoreID', title: '2012 Nissan Caravan', year: 2012, capacity: 2, price: 10000 };
  const schema = vehicleData.schema(van);
  assert.equal(schema.brand.name, 'Nissan');
  assert.equal(schema.model, 'Caravan');
  assert.equal(schema.vehicleIdentificationNumber, undefined);
  assert.equal(schema.vehicleSeatingCapacity, undefined);
  assert.equal(schema.url, 'https://kiwivanmarket.com/van/CaseSensitiveFirestoreID');
  assert.equal(vehicleData.title(van), '2012 Nissan Caravan for Sale in New Zealand');
  const unknown = vehicleData.schema({ id: 'other', title: '2015 Volswagen' });
  assert.equal(unknown.brand, undefined);
  assert.equal(unknown.model, undefined);
  assert.equal(unknown.vehicleModelDate, undefined);
  assert.equal(unknown.mileageFromOdometer, undefined);
  assert.equal(vehicleData.schema({ id: 'l300', title: 'Mitsubishi L300' }).model, 'L300');
  for (const title of ['Dodge Caravan campervan', 'Fiat Ducato caravan', 'Camping caravane familiale', 'Toyota Estima alternative to Hiace']) {
    const other = vehicleData.schema({ id: 'other', title });
    assert.equal(other.brand, undefined, title);
    assert.equal(other.model, undefined, title);
  }
  const { matchesBrand } = require('../src/data/seo/taxonomy.cjs');
  assert.equal(matchesBrand({ title: 'Nissan Caravane', brand: 'Dodge' }, 'nissan-caravan'), false);
  const french = vehicleData.schema({ id: 'nissan', title: 'Nissan Caravane' });
  assert.equal(french.brand.name, 'Nissan');
  assert.equal(french.model, 'Caravan');
  assert.equal(vehicleData.schema({ id: 'homy', title: 'Nissan Homy' }).model, 'Homy');
});

test('certification distinguishes seller declarations, legacy blue and unknown types in EN/FR', () => {
  for (const lang of ['en', 'fr']) {
    assert.equal(certification.status({ selfContained: true }), 'unspecified');
    assert.equal(certification.status({ selfContained: false }), 'none');
    assert.equal(certification.status({ selfContained: 'true', selfContainedType: 'green' }), 'unknown');
    assert.equal(certification.status({ selfContained: true, selfContainedType: 'green' }), 'green');
    const blue = { selfContained: true, selfContainedType: 'blue' };
    assert.equal(certification.status(blue), 'blue');
    assert.equal(certification.describe(blue, lang), certification.COPY[lang].descriptions.blue);
    assert.notEqual(certification.describe({ selfContained: true }, lang), certification.COPY[lang].descriptions.green);
  }
  assert.match(certification.describe({ selfContained: true, selfContainedType: 'blue' }), /not valid/);
});

test('conflicting declared/title years are omitted from structured data without choosing a true year', () => {
  const conflicting = { id: 'conflict', title: 'Nissan Serena 2013', year: 2026 };
  assert.equal(vehicleData.consistentYear(conflicting), undefined);
  assert.equal(vehicleData.schema(conflicting).vehicleModelDate, undefined);
  assert.equal(vehicleData.title(conflicting), 'Nissan Serena 2013 for Sale in New Zealand');
  const consistent = { id: 'consistent', title: 'Toyota Hiace 2005', year: 2005 };
  assert.equal(vehicleData.schema(consistent).vehicleModelDate, '2005');
  assert.equal(vehicleData.title(consistent), 'Toyota Hiace 2005 for Sale in New Zealand');
  const missing = { id: 'missing', title: 'Toyota Hiace', year: 2005 };
  assert.equal(vehicleData.schema(missing).vehicleModelDate, '2005');
  assert.equal(vehicleData.title(missing), '2005 Toyota Hiace for Sale in New Zealand');
  assert.equal(vehicleData.schema({ id: 'only-title', title: 'Toyota Hiace 2005' }).vehicleModelDate, undefined);
});

test('listing prerender uses the same factual product schema and visible certificate disclosure', async () => {
  const originalFetch = global.fetch;
  for (const type of ['blue', 'green', undefined]) {
    const van = { id: 'TestId', title: '2012 Nissan Caravan', year: 2012, price: 10000, mileage: 200000,
      capacity: 2, status: 'active', selfContained: true, ...(type ? { selfContainedType: type } : {}) };
    const field = (value) => typeof value === 'boolean' ? { booleanValue: value }
      : typeof value === 'number' ? { integerValue: String(value) } : { stringValue: value };
    global.fetch = async () => ({ ok: true, json: async () => ({ documents: [{ name: 'vans/TestId',
      fields: Object.fromEntries(Object.entries(van).filter(([key]) => key !== 'id').map(([key, value]) => [key, field(value)])) }] }) });
    try {
      const res = response();
      await require('../api/prerender-van')({ query: { id: van.id } }, res);
      assert.equal(res.code, 200);
      const schemas = [...res.body.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
      assert.deepEqual(schemas[0], JSON.parse(JSON.stringify(vehicleData.schema(van))));
      assert.ok(!schemas.some((schema) => schema['@type'] === 'FAQPage'));
      assert.ok(res.body.includes(certification.describe(van).replace(/&/g, '&amp;')));
      assert.ok(res.body.includes(certification.SOURCE));
      assert.ok(!res.body.includes('Sleeps / Seats'));
      assert.ok(!res.body.includes('vehicleIdentificationNumber'));
    } finally { global.fetch = originalFetch; }
  }
});
