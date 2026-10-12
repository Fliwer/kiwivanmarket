// Synthetic documents only. Firebase Rules REST evaluates these without writing data.
const authenticated = (uid = 'buyer') => ({ uid, token: { admin: false, email_verified: true, email: `${uid}@example.test` } });
const baseData = { banned: false, seller: { uid: 'seller' }, participants: ['buyer', 'seller'] };
function firestoreCase(label, expectation, collection, method, auth, before = {}, after = before, mockData = baseData) {
  return { label, test: {
    expectation, request: { path: `/databases/(default)/documents/${collection}`, method,
      auth, resource: { data: after } }, resource: { data: before },
    functionMocks: [
      { function: 'exists', args: [{ anyValue: {} }], result: { value: true } },
      { function: 'get', args: [{ anyValue: {} }], result: { value: { data: mockData } } },
    ],
  } };
}
const paid = { buyerId: 'buyer', sellerId: 'seller', status: 'paid', buyerConfirmed: false };
const pending = { ...paid, status: 'pending' };
const conv = { participants: ['buyer', 'seller'], buyerId: 'buyer', sellerId: 'seller',
  createdAt: 'today', vanId: 'van', lastMessage: 'hello', lastMessageAt: 'today', status: 'new' };
const profile = { uid: 'buyer', email: 'buyer@example.test', displayName: 'Buyer', createdAt: 'today' };
const listing = { title: 'Toyota Hiace', price: 10000, description: 'A maintained campervan',
  location: 'Auckland', year: 2008, mileage: 180000, images: ['https://res.cloudinary.com/image.jpg'],
  seller: { uid: 'seller', name: 'Seller' }, views: 0, createdAt: 'today', status: 'active' };
const firestore = [
  firestoreCase('normal listing creation allowed', 'ALLOW', 'vans/van', 'create', authenticated('seller'), {}, listing),
  firestoreCase('seller edit form with null contact placeholders allowed', 'ALLOW', 'vans/van', 'update', authenticated('seller'), listing,
    { ...listing, price: 12000, description: 'Updated maintained campervan', seller: { ...listing.seller, email: null, phone: null, whatsapp: null } }),
  firestoreCase('seller can mark listing sold', 'ALLOW', 'vans/van', 'update', authenticated('seller'), listing, { ...listing, status: 'sold' }),
  firestoreCase('another user cannot edit listing', 'DENY', 'vans/van', 'update', authenticated(), listing, { ...listing, price: 1 }),
  firestoreCase('public contact creation denied', 'DENY', 'vans/van', 'create', authenticated('seller'), {}, { ...listing, seller: { ...listing.seller, email: 'seller@example.test' } }),
  firestoreCase('public token creation denied', 'DENY', 'vans/van', 'create', authenticated('seller'), {}, { ...listing, availabilityToken: 'token' }),
  firestoreCase('public contact reintroduction denied', 'DENY', 'vans/van', 'update', authenticated('seller'), listing, { ...listing, phone: '0211234567' }),
  firestoreCase('public listing read', 'ALLOW', 'vans/van', 'get', null),
  firestoreCase('anonymous profile denied', 'DENY', 'users/buyer', 'get', null),
  firestoreCase('owner profile allowed', 'ALLOW', 'users/buyer', 'get', authenticated()),
  firestoreCase('other profile denied', 'DENY', 'users/seller', 'get', authenticated()),
  firestoreCase('banned profile denied', 'DENY', 'users/buyer', 'get', authenticated(), {}, {}, { banned: true }),
  firestoreCase('auth email profile creation', 'ALLOW', 'users/buyer', 'create', authenticated(), {}, profile),
  firestoreCase('forged email denied', 'DENY', 'users/buyer', 'create', authenticated(), {}, { ...profile, email: 'victim@example.test' }),
  firestoreCase('admin elevation denied', 'DENY', 'users/buyer', 'create', authenticated(), {}, { ...profile, isAdmin: true }),
  firestoreCase('Stripe account write denied', 'DENY', 'stripeAccounts/buyer', 'create', authenticated(), {}, { stripeAccountId: 'acct_attacker' }),
  firestoreCase('buyer conversation allowed', 'ALLOW', 'conversations/conv', 'create', authenticated(), {}, conv),
  firestoreCase('forged listing seller denied', 'DENY', 'conversations/conv', 'create', authenticated(), {}, { ...conv, sellerId: 'attacker', participants: ['buyer', 'attacker'] }),
  firestoreCase('email throttle override denied', 'DENY', 'conversations/conv', 'update', authenticated(), conv, { ...conv, emailNotificationSent: false }),
  firestoreCase('paid cancellation bypass denied', 'DENY', 'reservations/res', 'update', authenticated(), paid, { ...paid, status: 'cancelled', cancelledBy: 'buyer' }),
  firestoreCase('pending without checkout cancellation allowed', 'ALLOW', 'reservations/res', 'update', authenticated(), pending, { ...pending, status: 'cancelled', cancelledBy: 'buyer' }),
  firestoreCase('open checkout cancellation bypass denied', 'DENY', 'reservations/res', 'update', authenticated(), { ...pending, checkoutSessionId: 'cs_one' }, { ...pending, checkoutSessionId: 'cs_one', status: 'cancelled', cancelledBy: 'buyer' }),
  firestoreCase('payment status forgery denied', 'DENY', 'reservations/res', 'update', authenticated(), pending, { ...pending, status: 'paid' }),
  firestoreCase('private lifecycle hidden from verified user', 'DENY', 'vans/van/private/lifecycle', 'get', authenticated()),
  firestoreCase('private contact visible to verified user', 'ALLOW', 'vans/van/private/contact', 'get', authenticated()),
  firestoreCase('private contact hidden anonymously', 'DENY', 'vans/van/private/contact', 'get', null),
  firestoreCase('owner cannot write lifecycle', 'DENY', 'vans/van/private/lifecycle', 'update', authenticated('seller')),
  firestoreCase('owner cannot forge contact email', 'DENY', 'vans/van/private/contact', 'update', authenticated('seller'), {}, { email: 'victim@example.test' }),
  firestoreCase('private settings hidden', 'DENY', 'settings/stripe', 'get', null),
];
module.exports = { firestore };
