import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

jest.mock('firebase/app', () => ({ initializeApp: jest.fn(() => ({})) }));
jest.mock('firebase/auth', () => ({ getAuth: jest.fn() }));
jest.mock('firebase/firestore', () => ({ initializeFirestore: jest.fn() }));
jest.mock('firebase/storage', () => ({ getStorage: jest.fn() }));
jest.mock('firebase/functions', () => ({ getFunctions: jest.fn() }));

test('Firebase configuration removes accidental surrounding whitespace before SDK initialization', () => {
  const previous = process.env.REACT_APP_FIREBASE_API_KEY;
  process.env.REACT_APP_FIREBASE_API_KEY = ' public-test-key\n';
  require('./firebase');
  expect(initializeApp.mock.calls[0][0].apiKey).toBe('public-test-key');
  expect(initializeFirestore).toHaveBeenCalled();
  if (previous === undefined) delete process.env.REACT_APP_FIREBASE_API_KEY;
  else process.env.REACT_APP_FIREBASE_API_KEY = previous;
});
