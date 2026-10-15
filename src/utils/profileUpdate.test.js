import { prepareProfileUpdate, profileErrorKey } from './profileUpdate';

const profile = { displayName: 'Traveller', phone: '+64211234567', city: 'Auckland', region: 'North Island', bio: 'Old bio' };

test('optional fields can be cleared without restoring old values', () => {
  expect(prepareProfileUpdate(profile, { phone: '', city: '', bio: '' })).toMatchObject({ phone: null, city: '', bio: '', displayName: 'Traveller' });
});

test('formatted international phone is saved as a usable contact number', () => {
  expect(prepareProfileUpdate(profile, { phone: '00 32 (474) 12-34-56' }).phone).toBe('+32474123456');
  expect(prepareProfileUpdate(profile, { phone: '+123456789012345' }).phone).toBe('+123456789012345');
});

test('invalid input produces an actionable validation error', () => {
  for (const [edits, code] of [[{ displayName: '  ' }, 'profile/name'], [{ phone: 'not a number' }, 'profile/phone'], [{ bio: 'a'.repeat(501) }, 'profile/bio']]) {
    try { prepareProfileUpdate(profile, edits); throw new Error('Expected validation failure'); }
    catch (error) { expect(error.code).toBe(code); }
  }
});

test('profile payload excludes access and payment fields supplied by edits', () => {
  const result = prepareProfileUpdate(profile, { isAdmin: true, phoneVerified: true, stripeAccountId: 'forged' });
  expect(result).not.toHaveProperty('isAdmin');
  expect(result).not.toHaveProperty('phoneVerified');
  expect(result).not.toHaveProperty('stripeAccountId');
  expect(profileErrorKey({ code: 'permission-denied' })).toBe('profile_save.access_error');
});
