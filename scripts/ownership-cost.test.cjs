const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate } = require('../src/data/seo/ownership-cost.cjs');
const example = { purchase: '12000', resale: '9500', days: '90', inspection: '250', repairs: '1000', insurance: '600', administration: '300', rentalDaily: '', rentalExtras: '' };

test('ownership example includes all entered costs and separates cash before resale', () => {
  const result = calculate(example);
  assert.equal(result.expenses, 2150);
  assert.equal(result.ownership, 4650);
  assert.equal(result.cashRequired, 14150);
  assert.ok(Math.abs(result.daily - 51.6666666667) < 1e-8);
  assert.equal(result.rental, null);
});

test('a cheaper rental scenario keeps its negative difference instead of implying guaranteed savings', () => {
  const result = calculate({ ...example, rentalDaily: '40', rentalExtras: '100' });
  assert.equal(result.rental, 3700);
  assert.equal(result.difference, -950);
  assert.equal(calculate({ ...example, rentalDaily: 100 }).difference, 4350);
});

test('resale changes affect the result dollar for dollar without invented floors or valuation coefficients', () => {
  assert.equal(calculate({ ...example, resale: 0 }).ownership, 14150);
  assert.equal(calculate({ ...example, resale: 20000 }).ownership, -5850);
  assert.equal(calculate({ ...example, resale: 8500 }).ownership - calculate(example).ownership, 1000);
});

test('missing required assumptions and negative or non-finite costs do not produce a result', () => {
  for (const overrides of [{ days: 0 }, { purchase: '' }, { resale: '' }, { repairs: -1 }, { rentalDaily: Infinity }, { insurance: 'not a quote' }]) {
    assert.equal(calculate({ ...example, ...overrides }), null);
  }
  assert.equal(calculate({ ...example, repairs: '' }).expenses, 1150);
});

test('crawler cost explanation and FAQs match the visitor copy in English and French', async () => {
  for (const lang of ['en', 'fr']) {
    const B = require(`../src/data/seo/pages-data${lang === 'fr' ? '.fr' : ''}.json`).buyback;
    const response = { status() { return this; }, setHeader() {}, send(body) { this.body = body; } };
    await require('../api/prerender-page')({ query: { page: 'buyback', lang } }, response);
    for (const phrase of [B.intro, B.ui.formula, B.ui.limits, B.ui.example]) assert.ok(response.body.includes(phrase));
    assert.ok(response.body.includes('4,650'));
    assert.ok(!response.body.includes('1.6%'));
    for (const { q, a } of B.faqs) { assert.ok(response.body.includes(q)); assert.ok(response.body.includes(a)); }
  }
});
