// Read-only Firebase deployment inspection and compilation. Uses the existing CLI login.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

async function main() {
  const auth = require(path.join(process.env.APPDATA, 'npm/node_modules/firebase-tools/lib/auth.js'));
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Firebase CLI login required');
  const token = await auth.getAccessToken(account.tokens.refresh_token,
    ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase']);
  const headers = { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' };
  const base = 'https://firebaserules.googleapis.com/v1/';
  const digest = (s) => createHash('sha256').update(s).digest('hex');
  for (const [file, release] of [['firestore.rules', 'cloud.firestore'], ['storage.rules', 'firebase.storage/kiwivanmarket.firebasestorage.app']]) {
    const cases = file === 'firestore.rules' ? require('./security-rule-cases.cjs').firestore : [];
    const content = fs.readFileSync(file, 'utf8');
    const result = await fetch(`${base}projects/kiwivanmarket:test`, {
      method: 'POST', headers, body: JSON.stringify({ source: { files: [{ name: file, content }] },
        testSuite: { testCases: cases.map((entry) => entry.test) } }),
    });
    const data = await result.json();
    console.log(JSON.stringify({ check: 'rulesCompile', file, status: result.status,
      issues: data.issues || [], error: data.error?.message }));
    if (!result.ok || data.issues?.some((issue) => issue.severity === 'ERROR')) process.exitCode = 1;
    for (let i = 0; i < (data.testResults || []).length; i++) {
      const outcome = data.testResults[i];
      console.log(JSON.stringify({ check: 'rulesTest', label: cases[i].label, state: outcome.state,
        debugMessages: outcome.debugMessages }));
      if (outcome.state !== 'SUCCESS') process.exitCode = 1;
    }
    const current = await fetch(`${base}projects/kiwivanmarket/releases/${release}`, { headers });
    if (current.ok) {
      const releaseData = await current.json();
      const rules = await fetch(`${base}${releaseData.rulesetName}`, { headers });
      const rulesData = await rules.json();
      console.log(JSON.stringify({ check: 'deployedRules', file,
        matchesLocal: rulesData.source?.files?.some((entry) => digest(entry.content) === digest(content)),
        releasedAt: releaseData.updateTime }));
    } else console.log(JSON.stringify({ check: 'deployedRules', file, status: current.status }));
  }
  const policyRes = await fetch('https://cloudresourcemanager.googleapis.com/v1/projects/kiwivanmarket:getIamPolicy',
    { method: 'POST', headers, body: '{}' });
  const policy = await policyRes.json();
  console.log(JSON.stringify({ check: 'iam', status: policyRes.status,
    roles: policy.bindings?.map((b) => ({ role: b.role, members: b.members.length,
      publicAccess: b.members.some((m) => ['allUsers', 'allAuthenticatedUsers'].includes(m)),
      runtimeServiceAccount: b.members.some((m) => m.includes('658498951752-compute@')) })) }));
  const res = await fetch('https://firestore.googleapis.com/v1/projects/kiwivanmarket/databases/(default)/documents/vans?pageSize=300&mask.fieldPaths=availabilityToken&mask.fieldPaths=seller.email&mask.fieldPaths=seller.phone&mask.fieldPaths=seller.whatsapp');
  const vans = await res.json();
  console.log(JSON.stringify({ check: 'publicListingExposure', status: res.status,
    sampled: vans.documents?.length, morePages: !!vans.nextPageToken,
    withPublicToken: vans.documents?.filter((d) => d.fields?.availabilityToken?.stringValue).length,
    withPublicContacts: vans.documents?.filter((d) => Object.values(d.fields?.seller?.mapValue?.fields || {}).some((v) => v.stringValue)).length }));
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
