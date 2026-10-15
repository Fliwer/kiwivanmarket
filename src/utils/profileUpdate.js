export function prepareProfileUpdate(profile, edits) {
  const value = (field) => String(edits[field] ?? profile[field] ?? '').trim();
  const fail = (code) => { throw Object.assign(new Error(code), { code }); };
  const displayName = value('displayName');
  if (!displayName || displayName.length > 100) fail('profile/name');
  const city = value('city');
  const region = value('region');
  if (city.length > 100 || region.length > 100) fail('profile/location');
  const bio = value('bio');
  if (bio.length > 500) fail('profile/bio');
  const phone = value('phone').replace(/[ ().-]/g, '').replace(/^00/, '+');
  if (phone && !/^\+?\d{8,15}$/.test(phone)) fail('profile/phone');
  return { displayName, city, region, bio, phone: phone || null, lastActive: new Date() };
}

export function profileErrorKey(error, fallback = 'save_error') {
  const keys = {
    'profile/name': 'name_error', 'profile/location': 'location_error',
    'profile/bio': 'bio_error', 'profile/phone': 'phone_error',
    'permission-denied': 'access_error', 'unauthenticated': 'session_error',
    'auth/user-token-expired': 'session_error', 'unavailable': 'network_error',
    'deadline-exceeded': 'network_error', 'auth/network-request-failed': 'network_error',
  };
  return `profile_save.${keys[error?.code] || fallback}`;
}
