const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const prices = require('../src/data/seo/price-index.cjs');
const copy = require('../src/data/seo/copy.cjs');
const guideSchema = require('../src/data/seo/guide-schema.cjs');
const response = () => ({ code: 200, headers: {}, body: '', status(code) { this.code = code; return this; },
  setHeader(key, value) { this.headers[key] = value; }, send(body) { this.body = body; return this; } });
const schemas = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));

test('price samples exclude inactive, missing and out-of-scope prices and suppress small samples', () => {
  const active = [5000, 6000, 7000, 8000, 10000].map((price, i) => ({ price, status: i ? 'active' : undefined }));
  const fixtures = [...active, ...['sold', 'hidden', 'draft', 'pending'].map((status) => ({ status, price: 200000 })),
    ...[undefined, 0, -1, 'bad', 999, 200001, Infinity].map((price) => ({ price }))];
  const result = prices.calculate(fixtures, copy.en.prices);
  assert.equal(result.total, 5);
  assert.equal(result.median, 7000);
  assert.equal(result.max, 10000);
  assert.equal(result.buckets.reduce((sum, row) => sum + row.count, 0), 5);
  assert.equal(prices.calculate(active.slice(0, 4), copy.en.prices), null);
  assert.equal(prices.calculate([...active, { price: 9000 }], copy.en.prices).median, 7500);
});

test('price grouping is exclusive and unknown declarations are not treated as certified or uncertified', () => {
  const fixtures = Array.from({ length: 15 }, (_, i) => ({
    title: i < 5 ? 'Toyota Hiace campervan' : i < 10 ? 'Mercedes Sprinter' : 'Mercedes Vito',
    price: 10000 + i * 100, year: 2001, selfContained: i < 5 ? true : i < 10 ? false : 'false',
  }));
  const stats = prices.calculate(fixtures, copy.fr.prices, 'fr');
  assert.equal(stats.byBrand.length, 3);
  assert.equal(stats.byBrand.reduce((n, g) => n + g.count, 0), 15);
  assert.equal(stats.selfContained.count, 5);
  assert.equal(stats.notSelfContained.count, 5);
  assert.equal(stats.byAge[0].count, 15);
  // A generic camper/caravan title is not evidence of the Nissan model.
  const generic = fixtures.map((v) => ({ ...v, title: 'Camper caravan conversion' }));
  assert.deepEqual(prices.calculate(generic, copy.en.prices).byBrand, []);
});

test('price HTML and structured data describe the same active snapshot in each language', async () => {
  const originalFetch = global.fetch;
  const docs = [5000, 6000, 7000, 8000, 10000, 100000].map((price, i) => ({ name: `vans/${i}`, fields: {
    title: { stringValue: 'Toyota Hiace' }, price: { integerValue: String(price) },
    status: { stringValue: i === 5 ? 'sold' : 'active' }, selfContained: { booleanValue: true },
  } }));
  global.fetch = async () => ({ ok: true, json: async () => ({ documents: docs }) });
  try {
    for (const lang of ['en', 'fr']) {
      const res = response();
      await require('../api/prerender-page')({ query: { page: 'prices', lang } }, res);
      assert.equal(res.code, 200);
      const dataset = schemas(res.body).find((s) => s['@type'] === 'Dataset');
      assert.equal(dataset.variableMeasured[0].value, 7000);
      assert.equal(dataset.variableMeasured[1].value, 5);
      assert.ok(res.body.includes(dataset.dateModified));
      assert.equal(dataset.temporalCoverage, dataset.dateModified.slice(0, 10));
      assert.equal(dataset.inLanguage, lang);
      assert.equal(dataset.url.endsWith('?lang=fr'), lang === 'fr');
      assert.ok(!res.body.includes('$100,000'));
      const faq = schemas(res.body).find((s) => s['@type'] === 'FAQPage');
      for (const q of faq.mainEntity) assert.ok(res.body.includes(q.acceptedAnswer.text));
    }
    global.fetch = async () => ({ ok: false, status: 503 });
    const failed = response();
    await require('../api/prerender-page')({ query: { page: 'prices' } }, failed);
    assert.equal(failed.code, 503);
    assert.ok(!failed.body.includes('Dataset'));
  } finally { global.fetch = originalFetch; }
});

test('all generated guides match the visitor source, including dates and references', () => {
  assert.deepEqual(require('../api/_lib/guides-data.json'), require('./lib/read-guides.cjs')());
});

test('buyer guides expose visible citations and self-referencing article data in EN and FR', async () => {
  for (const lang of ['en', 'fr']) {
    const res = response();
    await require('../api/prerender-guide')({ query: { slug: 'buying-campervan-nz', lang } }, res);
    const article = schemas(res.body).find((s) => s['@type'] === 'Article');
    const url = 'https://kiwivanmarket.com/guide/buying-campervan-nz' + (lang === 'fr' ? '?lang=fr' : '');
    assert.equal(article.url, url);
    assert.equal(article.mainEntityOfPage, url);
    assert.equal(article.inLanguage, lang);
    assert.equal(article.dateModified, '2026-10-15');
    assert.ok(article.citation.length >= 10);
    for (const reference of article.citation) assert.ok(res.body.includes(`href="${reference}"`));
    assert.ok(res.body.includes(`href="https://kiwivanmarket.com/campervan-prices-nz${lang === 'fr' ? '?lang=fr' : ''}"`));
    assert.ok(res.body.includes(`datetime="${article.dateModified}"`));
    assert.ok(!res.body.includes('about $5 a day'));
  }
  assert.equal(guideSchema.localizedPath('/guide/test#checks', 'fr'), '/guide/test?lang=fr#checks');
  assert.equal(guideSchema.localizedPath('/checklist.pdf', 'fr'), '/checklist.pdf');
  assert.equal(guideSchema.localizedPath('https://example.com/', 'fr'), 'https://example.com/');
});

test('search and AI crawlers receive readable HTML on root and every configured article route', async () => {
  const pattern = require('../src/data/seo/crawlers.cjs');
  const source = fs.readFileSync('middleware.js', 'utf8')
    .replace("import crawlerPattern from './src/data/seo/crawlers';", `const crawlerPattern = ${JSON.stringify(pattern)};`)
    .replace("import publicAssets from './src/data/seo/public-assets.json';", `const publicAssets = ${JSON.stringify(require('../src/data/seo/public-assets.json'))};`);
  const middleware = (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).default;
  const routes = JSON.parse(fs.readFileSync('vercel.json', 'utf8')).rewrites.filter((r) => r.destination.startsWith('/api/prerender-'));
  for (const ua of ['Googlebot', 'Google-InspectionTool', 'bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'cohere-ai']) {
    const res = middleware(new Request('https://kiwivanmarket.com/?lang=fr', { headers: { 'user-agent': ua } }));
    assert.equal(res.headers.get('x-middleware-rewrite'), 'https://kiwivanmarket.com/api/prerender-home?lang=fr');
    for (const route of routes) {
      const rule = route.has.find((h) => h.key === 'user-agent').value;
      assert.equal(rule, `(?i).*${pattern}.*`);
      assert.ok(new RegExp(rule.replace('(?i)', ''), 'i').test(ua), `${ua}: ${route.source}`);
    }
  }
  assert.equal(middleware(new Request('https://kiwivanmarket.com/', { headers: { 'user-agent': 'Mozilla/5.0 Chrome/130' } })).headers.get('x-middleware-next'), '1');
});

test('about pages publish the owner-provided story in both languages and link to existing model routes', async () => {
  const { BRANDS } = require('../src/data/seo/taxonomy.cjs');
  for (const lang of ['en', 'fr']) {
    const data = require(`../src/data/seo/pages-data${lang === 'fr' ? '.fr' : ''}.json`).why;
    const translations = require(`../src/locales/${lang}/translation.json`).why_page;
    assert.equal(data.storyText, translations.story_text);
    const res = response();
    await require('../api/prerender-page')({ query: { page: 'why', lang } }, res);
    assert.equal(res.code, 200);
    assert.ok(res.body.includes(data.storyText));
    assert.ok(!res.body.includes('undefined'));
    assert.ok(!res.body.includes('indestructible'));
    for (const item of data.top10) if (item.path) assert.ok(BRANDS[item.path.split('/').pop()]);
    const about = schemas(res.body).find((s) => s['@type'] === 'AboutPage');
    assert.equal(about.url, `https://kiwivanmarket.com/why${lang === 'fr' ? '?lang=fr' : ''}`);
  }
});
