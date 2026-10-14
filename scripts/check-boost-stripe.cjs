// Read-only setup inspection. Never output API keys, webhook secrets or personal details.
const path = require('node:path');
const { keyState } = require('../functions/boostService');
async function main() {
  const auth = require(path.join(process.env.APPDATA, 'npm/node_modules/firebase-tools/lib/auth.js'));
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Firebase login required');
  const token = await auth.getAccessToken(account.tokens.refresh_token,
    ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase']);
  const response = await fetch('https://secretmanager.googleapis.com/v1/projects/kiwivanmarket/secrets/STRIPE_SECRET_KEY/versions/latest:access',
    { headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!response.ok) throw new Error(`Secret access unavailable (${response.status})`);
  const secret = await response.json();
  const key = Buffer.from(secret.payload.data, 'base64').toString('utf8').trim();
  const state = keyState(key, false);
  console.log(JSON.stringify({ keyMode: state.mode, checkoutAllowed: state.available, reason: state.reason }));
  if (!state.available) return;
  const Stripe = require('../functions/node_modules/stripe');
  const stripe = new Stripe(key);
  if (process.argv.includes('--verify-checkout')) {
    if (state.mode !== 'test') throw new Error('Checkout verification requires test mode');
    for (const plan of Object.values(require('../functions/boostService').PLANS)) {
      let session;
      try {
        session = await stripe.checkout.sessions.create({ mode: 'payment', payment_method_types: ['card'],
          success_url: 'https://kiwivanmarket.com/my-listings?boost_test=1',
          cancel_url: 'https://kiwivanmarket.com/my-listings?boost_test=1',
          metadata: { kind: 'boost_config_check' },
          line_items: [{ quantity: 1, price_data: { currency: plan.currency, unit_amount: plan.amountCents,
            product_data: { name: `Kiwi Van Market — ${plan.days}-day listing boost` } } }],
        });
        if (session.livemode || session.amount_total !== plan.amountCents || session.currency !== plan.currency) throw new Error('Unexpected checkout validation');
        console.log(JSON.stringify({ checkoutAccepted: true, days: plan.days, amountCents: session.amount_total, currency: session.currency, livemode: session.livemode }));
      } finally { if (session?.id) await stripe.checkout.sessions.expire(session.id); }
    }
  }
  const headers = { Authorization: `Bearer ${key}` };
  const [accountRes, hooksRes] = await Promise.all([
    fetch('https://api.stripe.com/v1/account', { headers }),
    fetch('https://api.stripe.com/v1/webhook_endpoints?limit=100', { headers }),
  ]);
  if (accountRes.ok) {
    const data = await accountRes.json();
    console.log(JSON.stringify({ accountCountry: data.country, chargesEnabled: data.charges_enabled, detailsSubmitted: data.details_submitted }));
  } else console.log(JSON.stringify({ stripeAccountReadStatus: accountRes.status }));
  if (hooksRes.ok) {
    const data = await hooksRes.json();
    const hooks = data.data.filter((hook) => /^https:\/\/(us-central1-kiwivanmarket\.cloudfunctions\.net\/stripeWebhook|stripewebhook-[a-z0-9-]+\.a\.run\.app\/?)/.test(hook.url));
    if (process.argv.includes('--configure-test-webhook')) {
      if (state.mode !== 'test') throw new Error('Webhook setup requires test mode');
      if (hooks.length !== 1) throw new Error('Expected exactly one existing Kiwi Van Market webhook');
      const existing = hooks[0];
      const events = existing.enabled_events.includes('*') ? ['*'] : [...new Set([...existing.enabled_events,
        'checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.expired',
        'charge.refunded', 'charge.dispute.created', 'charge.dispute.closed'])];
      await stripe.webhookEndpoints.update(existing.id, { enabled_events: events });
      existing.enabled_events = events;
      console.log(JSON.stringify({ testWebhookConfigured: true }));
    }
    console.log(JSON.stringify({ webhookEndpoints: hooks.map((hook) => ({ url: hook.url, status: hook.status, events: hook.enabled_events })) }));
  } else console.log(JSON.stringify({ webhookReadStatus: hooksRes.status }));
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
