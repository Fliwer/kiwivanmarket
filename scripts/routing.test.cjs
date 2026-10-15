const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const assets = require('../src/data/seo/public-assets.json');

async function loadMiddleware() {
  const source = fs.readFileSync('middleware.js', 'utf8')
    .replace("import crawlerPattern from './src/data/seo/crawlers';", `const crawlerPattern = ${JSON.stringify(require('../src/data/seo/crawlers.cjs'))};`)
    .replace("import publicAssets from './src/data/seo/public-assets.json';", `const publicAssets = ${JSON.stringify(assets)};`);
  return import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}

test('middleware returns actual 404 for unknown URLs with extensions, including dynamic-looking paths', async () => {
  const { default: middleware, config } = await loadMiddleware();
  const matcher = new RegExp('^' + config.matcher[0] + '$');
  for (const path of ['/abc.xyz', '/old-guide.html', '/not-a-file.png', '/unknown.xml', '/fake.pdf', '/nested/fake.txt', '/guide/not-a-guide.html', '/van/not-a-van.json']) {
    assert.ok(matcher.test(path), path);
    for (const agent of ['Googlebot', 'Mozilla/5.0']) {
      const response = middleware(new Request('https://kiwivanmarket.com' + path, { headers: { 'user-agent': agent } }));
      assert.equal(response.status, 404, path);
      assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
    }
  }
  for (const path of ['/static/js/main.hash.js', '/static/css/main.hash.css', '/api/sitemap-vehicles', '/__/auth/handler', '/_vercel/insights/script.js']) assert.equal(matcher.test(path), false, path);
});

test('all real public assets, dynamic XML sitemaps and React routes remain accessible', async () => {
  const { default: middleware } = await loadMiddleware();
  for (const path of [...assets.filter((asset) => asset !== '/index.html'), '/asset-manifest.json',
    '/sitemap-brands.xml', '/sitemap-locations.xml', '/sitemap-vehicles.xml', '/sitemap-search.xml']) {
    const response = middleware(new Request('https://kiwivanmarket.com' + path));
    assert.equal(response.headers.get('x-middleware-next'), '1', path);
  }
  const app = fs.readFileSync('src/App.js', 'utf8');
  for (const [, route] of app.matchAll(/<Route path="([^"]+)"/g)) {
    const path = route.replace(/:[^/]+/g, 'sample');
    const response = middleware(new Request('https://kiwivanmarket.com' + path));
    assert.equal(response.headers.get('x-middleware-next'), '1', path);
  }
  const home = middleware(new Request('https://kiwivanmarket.com/?lang=fr', { headers: { 'user-agent': 'Googlebot' } }));
  assert.equal(home.headers.get('x-middleware-rewrite'), 'https://kiwivanmarket.com/api/prerender-home?lang=fr');
  const redirect = middleware(new Request('https://kiwivanmarket.com/index.html?lang=fr'));
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get('location'), 'https://kiwivanmarket.com/?lang=fr');
});
