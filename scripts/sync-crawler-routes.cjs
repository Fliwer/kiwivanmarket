const fs = require('node:fs');
const path = require('node:path');
const pattern = require('../src/data/seo/crawlers.cjs');
const file = path.join(__dirname, '../vercel.json');
const original = fs.readFileSync(file, 'utf8');
const config = JSON.parse(original);
let result = original;
for (const rule of config.rewrites) {
  if (!rule.destination.startsWith('/api/prerender-')) continue;
  const condition = rule.has?.find((item) => item.type === 'header' && item.key === 'user-agent');
  if (!condition) throw new Error(`Missing crawler route condition: ${rule.source}`);
  result = result.replace(JSON.stringify(condition.value), JSON.stringify(`(?i).*${pattern}.*`));
}
if (process.argv.includes('--check')) {
  if (result !== original) throw new Error('Crawler routes are out of date');
} else fs.writeFileSync(file, result);
