import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { auth } from './firebase';
import { AuthProvider, useAuth } from './AuthContext';

jest.mock('./firebase', () => ({ auth: { currentUser: null }, db: {} }));
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(() => ({ setCustomParameters: jest.fn() })),
  signInWithPopup: jest.fn(), signOut: jest.fn(), onAuthStateChanged: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({ doc: jest.fn(), getDoc: jest.fn() }));

function SignInTest() {
  const { currentUser, signInWithGoogle } = useAuth();
  return <><span>{currentUser?.uid || 'anonymous'}</span>
    <button onClick={() => signInWithGoogle().catch(() => {})}>Google</button></>;
}

test('cancelled Google sign-in preserves the existing session and opens without signing out first', async () => {
  GoogleAuthProvider.mockImplementation(() => ({ setCustomParameters: jest.fn() }));
  const user = { uid: 'existing-session', emailVerified: true,
    getIdTokenResult: async () => ({ claims: {} }) };
  auth.currentUser = user;
  onAuthStateChanged.mockImplementation((_, callback) => { callback(user); return () => {}; });
  getDoc.mockResolvedValue({ exists: () => false });
  let rejectPopup;
  signInWithPopup.mockImplementation(() => new Promise((_, reject) => { rejectPopup = reject; }));
  const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  render(<AuthProvider><SignInTest /></AuthProvider>);
  await waitFor(() => expect(screen.getByText('existing-session')).toBeTruthy());
  fireEvent.click(screen.getByText('Google'));
  expect(signInWithPopup).toHaveBeenCalledTimes(1);
  expect(signOut).not.toHaveBeenCalled();
  await act(async () => rejectPopup({ code: 'auth/popup-closed-by-user' }));
  expect(screen.getByText('existing-session')).toBeTruthy();
  expect(auth.currentUser).toBe(user);
  errorLog.mockRestore();
});
