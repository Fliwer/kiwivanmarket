// Preserve secure email links, but never promote a publicly exposed token.
async function ensurePrivateLifecycleToken(db, vanRef, createToken, deleteField) {
  return db.runTransaction(async (tx) => {
    const ref = vanRef.collection('private').doc('lifecycle');
    const snapshot = await tx.get(ref);
    const existing = snapshot.exists && snapshot.data().availabilityToken;
    const token = typeof existing === 'string' && existing.length >= 32
      ? existing : createToken();
    if (token !== existing) tx.set(ref, { availabilityToken: token }, { merge: true });
    tx.update(vanRef, { availabilityToken: deleteField() });
    return token;
  });
}
module.exports = { ensurePrivateLifecycleToken };
