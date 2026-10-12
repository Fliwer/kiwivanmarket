import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, getAdditionalUserInfo, signOut } from 'firebase/auth';
import { getDoc, runTransaction } from 'firebase/firestore';
import { auth } from './firebase';
import { AuthProvider, useAuth } from './AuthContext';

jest.mock('./firebase', () => ({ auth: { currentUser: null, config: { authDomain: 'kiwivanmarket.firebaseapp.com' } }, db: {} }));
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(() => ({ setCustomParameters: jest.fn() })),
  signInWithPopup: jest.fn(), signOut: jest.fn(), onAuthStateChanged: jest.fn(),
  signInWithRedirect: jest.fn(), getRedirectResult: jest.fn(), getAdditionalUserInfo: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({ doc: jest.fn(), getDoc: jest.fn(), runTransaction: jest.fn() }));

const originalAgent = navigator.userAgent;
let transaction;
let profileExists;
let errorLog;
const googleUser = { uid: 'google-user', email: 'buyer@example.test', displayName: 'Buyer', emailVerified: true,
  getIdTokenResult: async () => ({ claims: {} }) };

beforeEach(() => {
  sessionStorage.clear();
  auth.currentUser = null;
  auth.config.authDomain = 'kiwivanmarket.firebaseapp.com';
  Object.defineProperty(navigator, 'userAgent', { value: originalAgent, configurable: true });
  GoogleAuthProvider.mockImplementation(() => ({ setCustomParameters: jest.fn() }));
  onAuthStateChanged.mockImplementation((_, callback) => { callback(null); return () => {}; });
  getDoc.mockResolvedValue({ exists: () => false });
  profileExists = false;
  transaction = { get: jest.fn(async () => ({ exists: () => profileExists })), set: jest.fn() };
  runTransaction.mockImplementation((_, operation) => operation(transaction));
  getAdditionalUserInfo.mockReturnValue({ isNewUser: true });
  errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { errorLog.mockRestore(); jest.useRealTimers(); });

function SignInTest() {
  const { currentUser, signInWithGoogle, googleSignInError } = useAuth();
  const [outcome, setOutcome] = React.useState('idle');
  return <><span>{currentUser?.uid || 'anonymous'}</span><span>{currentUser?.emailVerified ? 'verified' : 'unverified'}</span><span>{outcome}</span><span>{googleSignInError}</span>
    <button onClick={() => signInWithGoogle().then((result) => setOutcome(result.redirecting ? 'redirecting' : 'success')).catch((error) => setOutcome(error.code))}>Google</button></>;
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
  render(<AuthProvider><SignInTest /></AuthProvider>);
  await waitFor(() => expect(screen.getByText('existing-session')).toBeTruthy());
  fireEvent.click(screen.getByText('Google'));
  expect(signInWithPopup).toHaveBeenCalledTimes(1);
  expect(signOut).not.toHaveBeenCalled();
  await act(async () => rejectPopup({ code: 'auth/popup-closed-by-user' }));
  expect(screen.getByText('existing-session')).toBeTruthy();
  expect(auth.currentUser).toBe(user);
});

test('first Google sign-in creates a profile before confirming success, even without an auth observer update', async () => {
  auth.currentUser = googleUser;
  signInWithPopup.mockResolvedValue({ user: googleUser });
  let saveProfile;
  runTransaction.mockImplementation((_, operation) => new Promise((resolve) => { saveProfile = async () => { await operation(transaction); resolve(); }; }));
  render(<AuthProvider><SignInTest /></AuthProvider>);
  fireEvent.click(screen.getByText('Google'));
  await waitFor(() => expect(runTransaction).toHaveBeenCalledTimes(1));
  expect(screen.queryByText('success')).toBeNull();
  await act(async () => saveProfile());
  expect(transaction.set.mock.calls[0][1]).toMatchObject({ uid: googleUser.uid, email: googleUser.email, displayName: 'Buyer' });
  expect(screen.getByText('success')).toBeTruthy();
  expect(screen.getByText('google-user')).toBeTruthy();
});

test('existing Google profile is preserved and duplicate clicks share one sign-in', async () => {
  profileExists = true;
  auth.currentUser = googleUser;
  let finish;
  signInWithPopup.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  render(<AuthProvider><SignInTest /></AuthProvider>);
  fireEvent.click(screen.getByText('Google'));
  fireEvent.click(screen.getByText('Google'));
  expect(signInWithPopup).toHaveBeenCalledTimes(1);
  await act(async () => finish({ user: googleUser }));
  expect(transaction.set.mock.calls[0][1]).toEqual({ lastLogin: expect.any(Date) });
  expect(transaction.set.mock.calls[0][2]).toEqual({ merge: true });
  expect(screen.getByText('success')).toBeTruthy();
});

test('profile write failure is reported instead of silent success', async () => {
  auth.currentUser = googleUser;
  signInWithPopup.mockResolvedValue({ user: googleUser });
  runTransaction.mockRejectedValue(new Error('Profile unavailable'));
  render(<AuthProvider><SignInTest /></AuthProvider>);
  fireEvent.click(screen.getByText('Google'));
  await waitFor(() => expect(screen.getByText('auth/profile-unavailable')).toBeTruthy());
  expect(screen.queryByText('success')).toBeNull();
});

test('Google refreshes verification for an existing email account even when the UID stays the same', async () => {
  const oldUser = { ...googleUser, emailVerified: false };
  auth.currentUser = oldUser;
  profileExists = true;
  onAuthStateChanged.mockImplementation((_, callback) => { callback(oldUser); return () => {}; });
  signInWithPopup.mockImplementation(async () => { auth.currentUser = googleUser; return { user: googleUser }; });
  render(<AuthProvider><SignInTest /></AuthProvider>);
  expect(screen.getByText('unverified')).toBeTruthy();
  fireEvent.click(screen.getByText('Google'));
  await waitFor(() => expect(screen.getByText('success')).toBeTruthy());
  expect(screen.getByText('verified')).toBeTruthy();
});

test('a delayed profile from the previous account cannot overwrite the selected account or resurrect a logged-out session', async () => {
  let observer, resolveProfile;
  onAuthStateChanged.mockImplementation((_, callback) => { observer = callback; callback(null); return () => {}; });
  getDoc.mockImplementationOnce(() => new Promise((resolve) => { resolveProfile = resolve; }));
  render(<AuthProvider><SignInTest /></AuthProvider>);
  await act(async () => { auth.currentUser = googleUser; observer(googleUser); });
  const nextUser = { ...googleUser, uid: 'other-account' };
  await act(async () => { auth.currentUser = nextUser; await observer(nextUser); });
  await act(async () => { auth.currentUser = null; await observer(null); });
  await act(async () => resolveProfile({ exists: () => true, data: () => ({ uid: googleUser.uid }) }));
  expect(screen.getByText('anonymous')).toBeTruthy();
});

test('same-origin mobile sign-in redirects and creates the profile on return', async () => {
  Object.defineProperty(navigator, 'userAgent', { value: 'Android Chrome', configurable: true });
  auth.config.authDomain = window.location.hostname;
  signInWithRedirect.mockResolvedValue(undefined);
  const first = render(<AuthProvider><SignInTest /></AuthProvider>);
  fireEvent.click(screen.getByText('Google'));
  await waitFor(() => expect(screen.getByText('redirecting')).toBeTruthy());
  expect(signInWithPopup).not.toHaveBeenCalled();
  first.unmount();
  auth.currentUser = googleUser;
  getRedirectResult.mockResolvedValue({ user: googleUser });
  render(<React.StrictMode><AuthProvider><SignInTest /></AuthProvider></React.StrictMode>);
  await waitFor(() => expect(screen.getByText('google-user')).toBeTruthy());
  expect(getRedirectResult).toHaveBeenCalledTimes(1);
  expect(runTransaction).toHaveBeenCalledTimes(1);
  expect(transaction.set.mock.calls[0][1]).toMatchObject({ uid: googleUser.uid });
  expect(sessionStorage.getItem('kiwivan.googleRedirect')).toBeNull();
});

test('empty redirect return reports an error and clears the pending marker', async () => {
  sessionStorage.setItem('kiwivan.googleRedirect', 'pending');
  getRedirectResult.mockResolvedValue(null);
  render(<AuthProvider><SignInTest /></AuthProvider>);
  await waitFor(() => expect(screen.getByText('auth/redirect-incomplete')).toBeTruthy());
  expect(sessionStorage.getItem('kiwivan.googleRedirect')).toBeNull();
});

test('an unresolved Google popup stops showing pending after the timeout', async () => {
  jest.useFakeTimers();
  signInWithPopup.mockImplementation(() => new Promise(() => {}));
  render(<AuthProvider><SignInTest /></AuthProvider>);
  fireEvent.click(screen.getByText('Google'));
  await act(async () => jest.advanceTimersByTime(90000));
  expect(screen.getByText('auth/timeout')).toBeTruthy();
});

test('browser Back from Google resets the cached pending page without a reload loop', () => {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'location');
  const reload = jest.fn();
  Object.defineProperty(window, 'location', { configurable: true, value: { hostname: 'localhost', reload } });
  try {
    render(<AuthProvider><SignInTest /></AuthProvider>);
    sessionStorage.setItem('kiwivan.googleRedirect', 'pending');
    const cachedReturn = new Event('pageshow');
    Object.defineProperty(cachedReturn, 'persisted', { value: true });
    fireEvent(window, cachedReturn);
    expect(reload).toHaveBeenCalledTimes(1);
    fireEvent(window, new Event('pageshow'));
    sessionStorage.removeItem('kiwivan.googleRedirect');
    fireEvent(window, cachedReturn);
    expect(reload).toHaveBeenCalledTimes(1);
  } finally {
    Object.defineProperty(window, 'location', descriptor);
  }
});
