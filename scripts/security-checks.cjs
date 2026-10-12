// Read-only checks. Never print secrets or document values.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const patterns = {
  stripe: /(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{24,}/,
  webhook: /whsec_[A-Za-z0-9]{24,}/,
  resend: /re_[A-Za-z0-9_]{28,}/,
  privateKey: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
};

async function main() {
  const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const findings = [];
  for (const file of files) {
    if (!fs.existsSync(file) || fs.statSync(file).size > 2000000) continue;
    const content = fs.readFileSync(file, 'utf8');
    for (const [kind, pattern] of Object.entries(patterns)) {
      if (pattern.test(content)) findings.push({ file, kind });
    }
  }
  const history = execFileSync('git', ['log', '-p', '--all', '--', '.',
    ':!package-lock.json', ':!functions/package-lock.json', ':!public', ':!api/_lib/guides-data.json'],
  { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 });
  const historyFindings = Object.entries(patterns).filter(([, pattern]) => pattern.test(history)).map(([kind]) => kind);
  console.log(JSON.stringify({ check: 'secrets', trackedFindings: findings, historyKinds: historyFindings }));
  for (const file of ['.env', '.env.local', 'functions/.env']) {
    if (!fs.existsSync(file)) continue;
    const names = fs.readFileSync(file, 'utf8').split(/\r?\n/).map((line) => line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=/)?.[1]).filter(Boolean);
    console.log(JSON.stringify({ check: 'environmentNamesOnly', file, names }));
  }
  for (const path of ['/', '/sell', '/profile', '/reservation-success', '/reservation-cancelled', '/sitemap-vehicles.xml', '/sitemap-search.xml']) {
    try {
      const res = await fetch(`https://kiwivanmarket.com${path}`, { signal: AbortSignal.timeout(20000) });
      console.log(JSON.stringify({ check: 'http', path, status: res.status,
        headers: Object.fromEntries(['x-frame-options', 'x-content-type-options', 'content-security-policy',
          'strict-transport-security', 'referrer-policy'].map((key) => [key, res.headers.get(key)])) }));
      await res.body?.cancel();
    } catch (e) { console.log(JSON.stringify({ check: 'http', path, error: e.name })); }
  }
  for (const collection of ['users', 'reservations', 'stripeAccounts', 'securityRateLimits']) {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/kiwivanmarket/databases/(default)/documents/${collection}?pageSize=1`, { signal: AbortSignal.timeout(20000) });
    console.log(JSON.stringify({ check: 'anonymousAccess', collection, status: res.status }));
    await res.body?.cancel();
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
