import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { onSnapshot, setDoc, updateDoc, getDocs } from 'firebase/firestore';
import MessagingPage from './MessagingPage';

let mockUser;
let mockMessageListener;
const mockToast = { error: jest.fn() };
jest.mock('react-router-dom', () => {
  global.TextEncoder = require('util').TextEncoder;
  return jest.requireActual('react-router');
});
jest.mock('../firebase', () => ({ db: {} }));
jest.mock('../AuthContext', () => ({ useAuth: () => ({ currentUser: mockUser }) }));
jest.mock('../hooks/useHideLoader', () => ({ useHideLoader: () => {} }));
jest.mock('../hooks/useRateLimit', () => ({ useRateLimit: () => ({ checkAndRecord: () => ({ allowed: true }) }) }));
jest.mock('./ToastProvider', () => ({ useToast: () => mockToast }));
jest.mock('./SeoHead', () => () => null);
jest.mock('firebase/firestore', () => ({
  collection: (_, ...parts) => parts.join('/'), doc: (_, ...parts) => parts.join('/'),
  query: (path, ...constraints) => ({ path, constraints }),
  where: (field, operator, value) => ({ type: 'where', field, operator, value }),
  orderBy: (field, direction) => ({ type: 'orderBy', field, direction }),
  limit: count => ({ type: 'limit', count }),
  onSnapshot: jest.fn(), getDocs: jest.fn(async () => ({ empty: true })),
  updateDoc: jest.fn(async () => {}), setDoc: jest.fn(async () => {}), serverTimestamp: jest.fn(),
}));
const message = (index) => ({ id: `message-${String(index).padStart(3, '0')}`, data: () => ({
  text: `Message number ${index}`, senderId: 'seller', senderName: 'Seller', createdAt: { toDate: () => new Date(index * 1000) },
}) });
beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { uid: 'buyer', displayName: 'Buyer' };
  mockMessageListener = null;
  setDoc.mockResolvedValue();
  updateDoc.mockResolvedValue();
  getDocs.mockResolvedValue({ empty: true });
  window.scrollTo = jest.fn();
  Element.prototype.scrollTo = jest.fn();
  onSnapshot.mockImplementation((request, callback) => {
    if (request.path === 'conversations') {
      if (mockUser.uid === 'buyer') callback({ docs: [{ id: 'conversation-one', data: () => ({ participants: ['buyer', 'seller'], participantNames: { seller: 'Seller' }, status: 'active' }) }] });
      else callback({ docs: [] });
    } else if (request.path?.endsWith('/messages')) {
      mockMessageListener = callback;
      let docs = Array.from({ length: 101 }, (_, index) => message(index + 1));
      const newestFirst = request.constraints.some(item => item.type === 'orderBy' && item.field === 'createdAt' && item.direction === 'desc');
      docs.sort((a, b) => newestFirst ? b.data().createdAt.toDate() - a.data().createdAt.toDate() : a.id.localeCompare(b.id));
      callback({ docs: docs.slice(0, 100) });
    } else callback({ exists: () => false });
    return jest.fn();
  });
});

test('a conversation of more than 100 messages shows the latest 100 in chronological order', async () => {
  render(<MemoryRouter><MessagingPage /></MemoryRouter>);
  expect(await screen.findByText('Message number 101')).toBeInTheDocument();
  expect(screen.queryByText('Message number 1')).not.toBeInTheDocument();
  const displayed = screen.getAllByText(/^Message number /).map(node => node.textContent);
  expect(displayed).toEqual(Array.from({ length: 100 }, (_, index) => `Message number ${index + 2}`));
});

test('switching accounts clears the previous conversation and rejects late message results', async () => {
  const page = render(<MemoryRouter><MessagingPage /></MemoryRouter>);
  expect(await screen.findByText('Message number 101')).toBeInTheDocument();
  const oldCallback = mockMessageListener;
  mockUser = { uid: 'another-user', displayName: 'Another' };
  page.rerender(<MemoryRouter><MessagingPage /></MemoryRouter>);
  await waitFor(() => expect(screen.queryByText('Message number 101')).not.toBeInTheDocument());
  act(() => oldCallback({ docs: [message(101)] }));
  await waitFor(() => expect(screen.queryByText('Message number 101')).not.toBeInTheDocument());
  expect(screen.getByText('0 conversations')).toBeInTheDocument();
});

test('signing out hides message content immediately', async () => {
  const page = render(<MemoryRouter><MessagingPage /></MemoryRouter>);
  expect(await screen.findByText('Message number 101')).toBeInTheDocument();
  mockUser = null;
  page.rerender(<MemoryRouter><MessagingPage /></MemoryRouter>);
  expect(screen.getByText('Sign in required')).toBeInTheDocument();
  expect(screen.queryByText('Message number 101')).not.toBeInTheDocument();
});
