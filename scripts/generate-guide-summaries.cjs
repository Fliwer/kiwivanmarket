// Generate the homepage summaries and complete crawler articles from one source.
const fs = require('node:fs');
const path = require('node:path');
const guides = require('./lib/read-guides.cjs')();
const summaries = Object.fromEntries(Object.entries(guides).map(([lang, articles]) => [lang,
  Object.fromEntries(Object.entries(articles).map(([slug, guide]) => [slug,
    Object.fromEntries(['title', 'description', 'heroImage'].map((key) => {
      if (typeof guide[key] !== 'string') throw new Error(`Missing ${lang}/${slug}/${key}`);
      return [key, guide[key]];
    })),
  ])),
]));
for (const [file, data] of [
  ['../src/data/seo/guide-summaries.json', summaries],
  ['../api/_lib/guides-data.json', guides],
]) {
  const target = path.join(__dirname, file);
  const output = JSON.stringify(data, null, file.includes('summaries') ? 2 : 0) + '\n';
  if (process.argv.includes('--check')) {
    if (fs.readFileSync(target, 'utf8') !== output) throw new Error(`Generated guides are stale: ${file}`);
  } else fs.writeFileSync(target, output);
}
