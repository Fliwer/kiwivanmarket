// Give middleware an exact allowlist: an extension alone must not turn an
// unknown URL into the SPA's indexable homepage response.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'public');
const collect = (directory, prefix = '') => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const relative = `${prefix}/${entry.name}`;
  return entry.isDirectory() ? collect(path.join(directory, entry.name), relative) : [relative];
});
const output = JSON.stringify(collect(root).sort(), null, 2) + '\n';
const target = path.join(__dirname, '..', 'src', 'data', 'seo', 'public-assets.json');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== output) throw new Error('Public asset allowlist is out of date');
} else fs.writeFileSync(target, output);
