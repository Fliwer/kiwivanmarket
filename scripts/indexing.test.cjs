const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const taxonomySitemap = require('../api/sitemap-taxonomy');
const brandPage = require('../api/prerender-brand');
const locationPage = require('../api/prerender-location');

function response() {
  return { code: 200, headers: {}, body: '', status(code) { this.code = code; return this; },
    setHeader(key, value) { this.headers[key] = value; return this; },
    send(body) { this.body = body; return this; } };
}

test('model pages exclude other models and competitor names in descriptions', () => {
  const { matchesBrand, vansForTaxonomy } = require('../api/_lib/taxonomy');
  const fixtures = [
    { id: 'hiace', title: 'TOYOTA HIACE High Roof', location: 'Auckland', price: 7000 },
    { id: 'estima', title: 'Toyota Estima', description: 'Cheaper than a Toyota Hiace', location: 'Auckland', price: 6000 },
    { id: 'mpv', title: 'Mazda MPV', description: 'Comparable with a Bongo', location: 'Auckland', price: 5000 },
    { id: 'serena', title: 'Nissan Serena', description: 'Alternative to a Caravan', location: 'Auckland', price: 5000 },
    { id: 'trader', title: 'Ford Trader', description: 'Alternative to a Transit', location: 'Auckland', price: 5000 },
  ];
  assert.deepEqual(vansForTaxonomy(fixtures, 'brands', 'toyota-hiace').map(v => v.id), ['hiace']);
  for (const slug of ['mazda-bongo', 'nissan-caravan', 'ford-transit']) {
    assert.equal(vansForTaxonomy(fixtures, 'brands', slug).length, 0);
  }
  assert.equal(matchesBrand({ title: 'Campervan', model: 'Hiace' }, 'toyota-hiace'), true);
  assert.equal(matchesBrand({ title: 'Hiacelike conversion' }, 'toyota-hiace'), false);
  assert.equal(matchesBrand({ title: 'Mitsubishi L300' }, 'mitsubishi-delica'), true);
  const catalog = require('../src/data/seo/long-tail.cjs');
  const page = catalog.LONG_TAIL_PAGE_MAP['toyota-hiace-auckland-under-12000'];
  assert.deepEqual(catalog.vansForPage(fixtures, page).map(v => v.id), ['hiace']);
});

test('category sitemaps and prerenders agree, including FR, empty stock and hidden listings', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ documents: [
    { name: 'vans/active', fields: { title: { stringValue: 'Toyota Hiace' },
      location: { stringValue: 'Auckland' }, status: { stringValue: 'active' },
      updatedAt: { timestampValue: '2026-10-10T12:00:00Z' } } },
    { name: 'vans/hidden', fields: { title: { stringValue: 'Mercedes Sprinter' },
      location: { stringValue: 'Dunedin' }, status: { stringValue: 'hidden' } } },
  ] }) });
  try {
    for (const [kind, handler, populated, empty] of [
      ['brands', brandPage, 'toyota-hiace', 'mercedes-sprinter'],
      ['locations', locationPage, 'auckland', 'dunedin'],
    ]) {
      const sitemap = response();
      await taxonomySitemap({ query: { kind } }, sitemap);
      assert.equal(sitemap.code, 200);
      assert.equal((sitemap.body.match(/<loc>/g) || []).length, 2);
      assert.ok(sitemap.body.includes(populated));
      assert.ok(!sitemap.body.includes(empty));
      for (const lang of ['en', 'fr']) {
        const page = response();
        await handler({ query: { slug: populated, lang } }, page);
        const canonical = page.body.match(/rel="canonical" href="([^"]+)"/)[1];
        assert.ok(sitemap.body.includes(`<loc>${canonical}</loc>`));
        assert.ok(!page.body.includes('noindex'));
        const emptyPage = response();
        await handler({ query: { slug: empty, lang } }, emptyPage);
        assert.ok(emptyPage.body.includes('noindex, follow'));
      }
    }
    global.fetch = async () => ({ ok: false, status: 503 });
    const unavailable = response();
    await taxonomySitemap({ query: { kind: 'brands' } }, unavailable);
    assert.equal(unavailable.code, 503);
    assert.equal(unavailable.headers['Retry-After'], '300');
    const invalid = response();
    await taxonomySitemap({ query: { kind: 'invalid' } }, invalid);
    assert.equal(invalid.code, 404);
  } finally { global.fetch = originalFetch; }
});

test('sitemap index includes every child and dynamic XML paths have no static shadow', () => {
  const index = fs.readFileSync('public/sitemap.xml', 'utf8');
  assert.ok(index.includes('<sitemapindex'));
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  for (const name of ['main', 'guides', 'brands', 'locations', 'vehicles', 'search']) {
    const file = `sitemap-${name}.xml`;
    assert.ok(index.includes(`https://kiwivanmarket.com/${file}`));
    if (['main', 'guides'].includes(name)) assert.ok(fs.existsSync(`public/${file}`));
    else {
      assert.ok(!fs.existsSync(`public/${file}`));
      assert.ok(config.rewrites.some((rule) => rule.source === `/${file}`));
    }
  }
  const main = fs.readFileSync('public/sitemap-main.xml', 'utf8');
  for (const path of ['/faq', '/contact', '/why', '/campervan-prices-nz', '/buyback-calculator']) {
    assert.ok(main.includes(`<loc>https://kiwivanmarket.com${path}</loc>`));
    assert.ok(main.includes(`<loc>https://kiwivanmarket.com${path}?lang=fr</loc>`));
  }
});

test('sold-only categories stay readable but are noindex and absent from EN/FR sitemaps', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ documents: [
    { name: 'vans/sold', fields: { title: { stringValue: 'Ford Transit' },
      location: { stringValue: 'Hamilton' }, status: { stringValue: 'sold' },
      price: { integerValue: '10000' } } },
  ] }) });
  try {
    const { hasActiveStock } = require('../api/_lib/taxonomy');
    assert.equal(hasActiveStock([{ status: 'sold' }, { status: 'hidden' }]), false);
    assert.equal(hasActiveStock([{ status: 'active' }]), true);
    assert.equal(hasActiveStock([{}]), true);
    for (const [kind, handler, slug] of [
      ['brands', brandPage, 'ford-transit'],
      ['locations', locationPage, 'hamilton'],
    ]) {
      const sitemap = response();
      await taxonomySitemap({ query: { kind } }, sitemap);
      assert.equal(sitemap.code, 200);
      assert.ok(!sitemap.body.includes(`<loc>`));
      for (const lang of ['en', 'fr']) {
        const page = response();
        await handler({ query: { slug, lang } }, page);
        assert.equal(page.code, 200);
        assert.ok(page.body.includes('noindex, follow'));
        assert.ok(page.body.includes('/van/sold'));
      }
    }
  } finally { global.fetch = originalFetch; }
});

test('for-sale metadata and category ItemList count active vans while sold cards stay readable', async () => {
  const originalFetch = global.fetch;
  const documents = ['active-one', 'active-two', 'sold'].map((id) => ({ name: `vans/${id}`, fields: {
    title: { stringValue: 'Toyota Hiace' }, location: { stringValue: 'Auckland' },
    status: { stringValue: id === 'sold' ? 'sold' : 'active' },
    price: { integerValue: id === 'sold' ? '500' : '10000' },
  } }));
  global.fetch = async () => ({ ok: true, json: async () => ({ documents }) });
  try {
    for (const [handler, slug] of [[brandPage, 'toyota-hiace'], [locationPage, 'auckland']]) {
      for (const lang of ['en', 'fr']) {
        const page = response();
        await handler({ query: { slug, lang } }, page);
        assert.match(page.body, /<meta name="description" content="2 /);
        const schemas = [...page.body.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
        const list = schemas.find((schema) => schema['@type'] === 'ItemList');
        assert.equal(list.numberOfItems, 2);
        assert.deepEqual(list.itemListElement.map((item) => item.url.split('/').pop()).sort(), ['active-one', 'active-two']);
        assert.ok(page.body.includes('/van/sold'));
        assert.ok(page.body.includes(lang === 'fr' ? 'VENDU' : 'SOLD'));
      }
    }
  } finally { global.fetch = originalFetch; }
});

test('budget search pages share stock rules, French content and reciprocal language links', async () => {
  const originalFetch = global.fetch;
  const documents = Array.from({ length: 8 }, (_, i) => ({ name: `vans/v${i}`, fields: {
    title: { stringValue: 'Toyota Hiace' }, location: { stringValue: 'Auckland' },
    price: { integerValue: String(i < 3 ? 6000 : 14000) },
    status: { stringValue: 'active' }, createdAt: { timestampValue: '2026-10-10T12:00:00Z' },
  } }));
  global.fetch = async () => ({ ok: true, json: async () => ({ documents }) });
  try {
    const sitemap = response();
    await require('../api/sitemap-search')({ query: {} }, sitemap);
    const slug = 'buy-campervan-in-auckland-under-8000';
    const page = response();
    await require('../api/prerender-search')({ query: { slug, lang: 'fr' } }, page);
    assert.equal(page.code, 200);
    assert.ok(page.body.includes('<html lang="fr">'));
    assert.ok(page.body.includes('<h1>Acheter un van à Auckland'));
    assert.ok(page.body.includes('hreflang="en"'));
    assert.ok(page.body.includes(`hreflang="fr" href="https://kiwivanmarket.com/search/${slug}?lang=fr"`));
    assert.ok(sitemap.body.includes(`<loc>https://kiwivanmarket.com/search/${slug}?lang=fr</loc>`));
    assert.ok(!page.body.includes('noindex'));
    const empty = response();
    await require('../api/prerender-search')({ query: { slug: 'self-contained-van-dunedin', lang: 'fr' } }, empty);
    assert.ok(empty.body.includes('noindex, follow'));
    const catalog = require('../src/data/seo/long-tail.cjs');
    const criteria = catalog.LONG_TAIL_PAGE_MAP[slug];
    assert.equal(catalog.vansForPage([{ location: 'Auckland', price: 0 },
      { location: 'Auckland', price: 5000, status: 'hidden' }], criteria).length, 0);
  } finally { global.fetch = originalFetch; }
});

test('category structured data links to listings without declaring each one a product on the category page', () => {
  const { itemListLd } = require('../api/_lib/util');
  const schema = itemListLd('Toyota Hiace', [{ id: 'hiace', title: 'Toyota Hiace', price: 10000 }]);
  assert.equal(schema['@type'], 'ItemList');
  assert.equal(schema.itemListElement[0].url, 'https://kiwivanmarket.com/van/hiace');
  assert.equal(schema.itemListElement[0].name, 'Toyota Hiace');
  assert.equal(schema.itemListElement[0].item, undefined);
});

test('homepage exposes the same reviewed facts and sources to crawlers in EN and FR', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ documents: [] }) });
  try {
    const { COPY, SOURCES } = require('../src/data/seo/market.cjs');
    for (const lang of ['en', 'fr']) {
      const page = response();
      await require('../api/prerender-home')({ query: { lang } }, page);
      assert.equal(page.code, 200);
      assert.ok(page.body.includes(COPY[lang].buyersTitle));
      assert.ok(page.body.includes(COPY[lang].reviewed));
      assert.ok(page.body.includes('green warrant'));
      for (const source of SOURCES) assert.ok(page.body.includes(source.url));
      for (const json of page.body.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
        assert.notEqual(JSON.parse(json[1])['@type'], 'AutoDealer');
      }
      assert.ok(!page.body.includes('The #1 campervan marketplace'));
    }
  } finally { global.fetch = originalFetch; }
});

test('listing discovery follows Firestore pages and fails rather than publishing a partial inventory', async () => {
  const originalFetch = global.fetch;
  const calls = [];
  const document = (id, status = 'active') => ({ name: `vans/${id}`, fields: {
    title: { stringValue: 'Toyota Hiace' }, status: { stringValue: status },
  } });
  global.fetch = async (url) => {
    calls.push(new URL(url));
    return { ok: true, json: async () => calls.length === 1
      ? { documents: [document('first')], nextPageToken: 'next+/=' }
      : { documents: [document('second'), document('hidden', 'hidden')] } };
  };
  try {
    const { fetchAllVans } = require('../api/_lib/util');
    const vans = await fetchAllVans();
    assert.deepEqual(vans.map((van) => van.id).sort(), ['first', 'second']);
    assert.equal(calls.length, 2);
    assert.equal(calls[1].searchParams.get('pageToken'), 'next+/=');
    let page = 0;
    global.fetch = async () => ++page === 1
      ? { ok: true, json: async () => ({ documents: [document('first')], nextPageToken: 'next' }) }
      : { ok: false, status: 503 };
    await assert.rejects(fetchAllVans(), /Firestore 503/);
  } finally { global.fetch = originalFetch; }
});

test('homepage discovery shows actual available stock and excludes sold/hidden/empty categories in both languages', async () => {
  const originalFetch = global.fetch;
  const documents = [
    ['active', 'Toyota Hiace', 'Auckland', 10000, 'active'],
    ['sold', 'Toyota Hiace', 'Auckland', 1000, 'sold'],
    ['hidden', 'Mercedes Sprinter', 'Dunedin', 500, 'hidden'],
  ].map(([id, title, location, price, status]) => ({ name: `vans/${id}`, fields: {
    title: { stringValue: title }, location: { stringValue: location },
    price: { integerValue: String(price) }, status: { stringValue: status },
  } }));
  global.fetch = async () => ({ ok: true, json: async () => ({ documents }) });
  try {
    const inventoryLinks = require('../src/data/seo/inventory.cjs');
    const vans = await require('../api/_lib/util').fetchAllVans();
    assert.deepEqual(inventoryLinks(vans).cities, [{ path: '/location/auckland', name: 'Auckland', count: 1, min: 10000 }]);
    for (const lang of ['en', 'fr']) {
      const page = response();
      await require('../api/prerender-home')({ query: { lang } }, page);
      assert.ok(page.body.includes('/brand/toyota-hiace'));
      assert.ok(!page.body.includes('/brand/mercedes-sprinter'));
      assert.ok(!page.body.includes('/location/dunedin'));
      assert.ok(page.body.includes(lang === 'en' ? '1 for sale' : '1 en vente'));
      assert.ok(page.body.includes('$10,000 NZD'));
      assert.ok(page.body.includes(`/guide/buying-campervan-nz${lang === 'fr' ? '?lang=fr' : ''}`));
    }
  } finally { global.fetch = originalFetch; }
});
