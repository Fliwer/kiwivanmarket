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
