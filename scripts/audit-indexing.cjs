// Read-only production audit: discover the sitemap tree, then check each page.
const origin = 'https://kiwivanmarket.com';
const decode = (s) => s.replace(/&amp;/g, '&');
const faults = [];
const pages = new Set();
const sitemaps = new Set();
async function fetchPage(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Googlebot' }, signal: AbortSignal.timeout(30000) });
  return { response, body: await response.text() };
}
async function readSitemap(url) {
  if (sitemaps.has(url)) return;
  sitemaps.add(url);
  const { response, body } = await fetchPage(url);
  if (response.status !== 200 || !/xml/.test(response.headers.get('content-type') || '')) {
    faults.push({ url, problem: 'sitemap response', status: response.status });
    return;
  }
  const urls = [...body.matchAll(/<loc>(.*?)<\/loc>/gs)].map((m) => decode(m[1]));
  if (body.includes('<sitemapindex')) {
    for (const child of urls) await readSitemap(child);
  } else for (const page of urls) pages.add(page);
}
async function main() {
  await readSitemap(origin + '/sitemap.xml');
  const queue = [...pages]; let cursor = 0;
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (cursor < queue.length) {
      const url = queue[cursor++];
      try {
        const { response, body } = await fetchPage(url);
        const canonical = decode(body.match(/rel="canonical" href="([^"]+)"/)?.[1] || '');
        const robots = body.match(/name="robots" content="([^"]*)"/)?.[1] || '';
        const problems = [];
        if (response.status !== 200) problems.push(`HTTP ${response.status}`);
        if (canonical !== url) problems.push('canonical mismatch');
        if (robots.includes('noindex')) problems.push('noindex in sitemap');
        if (!body.includes('<h1')) problems.push('missing h1');
        if (url.includes('lang=fr') && !body.includes('<html lang="fr">')) problems.push('French document language missing');
        for (const json of body.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
          try { JSON.parse(json[1]); } catch { problems.push('invalid JSON-LD'); }
        }
        if (problems.length) faults.push({ url, problems });
      } catch (error) { faults.push({ url, problem: error.message }); }
    }
  }));
  console.log(JSON.stringify({ sitemaps: sitemaps.size, pages: pages.size, faults }, null, 2));
  if (faults.length) process.exitCode = 1;
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
