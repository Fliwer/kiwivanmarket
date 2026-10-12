import { act, renderHook, waitFor } from '@testing-library/react';
import { getDoc } from 'firebase/firestore';
import useVanContact from './useVanContact';

jest.mock('../firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, ...path) => path.join('/')),
  getDoc: jest.fn(),
}));

const viewer = { uid: 'buyer', emailVerified: true };
const snapshot = (phone) => ({ exists: () => true, data: () => ({ phone }) });
beforeEach(() => getDoc.mockReset());

test('retains contact arriving before the public listing and after session restoration', async () => {
  getDoc.mockResolvedValue(snapshot('test-contact'));
  const { result, rerender } = renderHook(({ user }) => useVanContact('listing', user), {
    initialProps: { user: null },
  });
  expect(getDoc).not.toHaveBeenCalled();
  rerender({ user: viewer });
  await waitFor(() => expect(result.current?.phone).toBe('test-contact'));
  rerender({ user: viewer }); // Public listing completion cannot replace contact.
  expect(result.current.phone).toBe('test-contact');
  rerender({ user: null });
  expect(result.current).toBeNull();
});

test('ignores a late response for the previous listing', async () => {
  let resolveOld;
  getDoc.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }))
    .mockResolvedValueOnce(snapshot('new-contact'));
  const { result, rerender } = renderHook(({ id }) => useVanContact(id, viewer), {
    initialProps: { id: 'old' },
  });
  rerender({ id: 'new' });
  await waitFor(() => expect(result.current?.phone).toBe('new-contact'));
  await act(async () => resolveOld(snapshot('old-contact')));
  expect(result.current.phone).toBe('new-contact');
});

test('does not fetch private contact for an unverified account', () => {
  const { result } = renderHook(() => useVanContact('listing', { ...viewer, emailVerified: false }));
  expect(getDoc).not.toHaveBeenCalled();
  expect(result.current).toBeNull();
});
