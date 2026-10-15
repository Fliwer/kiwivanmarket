import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from './ProfilePage';
import { getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

jest.mock('../firebase', () => ({ db: {}, auth: { currentUser: { uid: 'viewer', getIdToken: jest.fn() } } }));
jest.mock('../AuthContext', () => {
  const currentUser = { uid: 'viewer', email: 'viewer@example.test', displayName: 'Original' };
  return { useAuth: () => ({ currentUser, logout: jest.fn() }) };
});
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn(), Link: ({ children }) => <span>{children}</span> }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key }) }));
jest.mock('./SeoHead', () => () => null);
jest.mock('../cloudinaryConfig', () => ({ uploadToCloudinary: jest.fn() }));
jest.mock('firebase/auth', () => ({ updateProfile: jest.fn() }));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(), collection: jest.fn(), query: jest.fn(), where: jest.fn(), setDoc: jest.fn(),
  getDoc: jest.fn(async () => ({ exists: () => true, data: () => ({ displayName: 'Original', city: 'Auckland', phone: '+64211234567', bio: 'Old bio' }) })),
  getDocs: jest.fn(async () => ({ docs: [], size: 0 })), updateDoc: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({ displayName: 'Original', city: 'Auckland', phone: '+64211234567', bio: 'Old bio' }) });
  getDocs.mockResolvedValue({ docs: [], size: 0 });
  updateDoc.mockResolvedValue(); updateProfile.mockResolvedValue();
});

test('profile save uses the real Auth user and persists normalized form values', async () => {
  render(<ProfilePage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
  fireEvent.change(screen.getByDisplayValue('Original'), { target: { value: 'Updated' } });
  fireEvent.change(screen.getByDisplayValue('+64211234567'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByText('profile_save.saved');
  expect(updateDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({ displayName: 'Updated', phone: null, city: 'Auckland', region: 'North Island' }));
  expect(updateProfile).toHaveBeenCalledWith(auth.currentUser, { displayName: 'Updated' });
});

test('a refused save retains edits and offers an actionable error', async () => {
  updateDoc.mockRejectedValueOnce({ code: 'permission-denied' });
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  render(<ProfilePage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
  fireEvent.change(screen.getByDisplayValue('Original'), { target: { value: 'Keep this edit' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('profile_save.access_error'));
  expect(screen.getByDisplayValue('Keep this edit')).toBeInTheDocument();
  expect(updateProfile).not.toHaveBeenCalled();
  log.mockRestore();
});
