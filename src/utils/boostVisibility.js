const milliseconds = (value) => value?.toMillis ? value.toMillis() :
  value?.seconds != null ? value.seconds * 1000 : new Date(value || 0).getTime();

function isBoostActive(van, now = Date.now()) {
  return van?.status === 'active' && van.boostState === 'active' && van.boostLivemode === true &&
    milliseconds(van.boostStartedAt) <= now && milliseconds(van.boostExpiresAt) > now;
}

// Apply after filtering: payment never makes a van match an unrelated search.
function rankVans(vans, sortBy = 'newest', now = Date.now()) {
  const sponsoredIds = vans.filter((van) => isBoostActive(van, now)).map((van) => String(van.id)).sort();
  const offset = sponsoredIds.length ? Math.floor(now / 300000) % sponsoredIds.length : 0;
  const slot = (id) => (sponsoredIds.indexOf(String(id)) - offset + sponsoredIds.length) % sponsoredIds.length;
  // Keep this shared CommonJS module free of Babel-injected ESM spread helpers.
  // Mixing those imports with module.exports breaks CRA's browser bundle.
  return vans.slice().sort((a, b) => {
    const soldOrder = Number(a.status === 'sold') - Number(b.status === 'sold');
    if (soldOrder) return soldOrder;
    const aBoost = isBoostActive(a, now), bBoost = isBoostActive(b, now);
    if (aBoost !== bBoost) return aBoost ? -1 : 1;
    if (aBoost && bBoost) return slot(a.id) - slot(b.id);
    if (sortBy === 'price-asc') return Number(a.price || 0) - Number(b.price || 0);
    if (sortBy === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
    return milliseconds(b.createdAt) - milliseconds(a.createdAt);
  });
}

module.exports = { isBoostActive, rankVans };
