import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SellPage from './SellPage';
import AddVanForm from './AddVanForm';

let mockUser;
const mockGetDoc = jest.fn();
const mockAddDoc = jest.fn();
const mockBatch = { update: jest.fn(), set: jest.fn(), commit: jest.fn() };
const mockToast = { error: jest.fn(), success: jest.fn(), info: jest.fn(), warning: jest.fn() };
const mockT = (key) => key;
jest.mock('react-router-dom', () => {
  global.TextEncoder = require('util').TextEncoder;
  return jest.requireActual('react-router');
});
jest.mock('../AuthContext', () => ({ useAuth: () => ({ currentUser: mockUser }) }));
jest.mock('../firebase', () => ({ db: {}, functions: {}, auth: {} }));
jest.mock('firebase/firestore', () => ({
  doc: (_, ...parts) => parts.join('/'), getDoc: (...args) => mockGetDoc(...args),
  addDoc: (...args) => mockAddDoc(...args), writeBatch: () => mockBatch,
}));
jest.mock('firebase/functions', () => ({ httpsCallable: jest.fn() }));
jest.mock('../cloudinaryConfig', () => ({ uploadToCloudinary: jest.fn(), compressImage: jest.fn() }));
jest.mock('./AuthModal', () => ({ __esModule: true, default: ({ isOpen }) => isOpen ? <p>Sign in required</p> : null }));
jest.mock('./ToastProvider', () => ({ useToast: () => mockToast }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT }) }));

const listing = { title: 'Existing Toyota Hiace', price: 23000, location: 'Auckland', region: 'North Island',
  year: 2008, mileage: 210000, description: 'Existing detailed van description', status: 'active',
  seller: { uid: 'seller', name: 'Seller' }, images: ['https://example.com/van.jpg'],
  wofExpiry: '2027-04-15', regoExpiry: { toDate: () => new Date('2027-05-20') },
  plateNumber: 'ABC123', equipment: { fridge: true }, boostState: 'active' };
const contact = { phone: '+64211234567', whatsapp: '+64217654321' };
function renderRoute(url = '/sell?edit=existing') {
  return render(<MemoryRouter initialEntries={[url]}><Routes>
    <Route path="/sell" element={<SellPage />} />
    <Route path="/my-listings" element={<p>My listings return</p>} />
  </Routes></MemoryRouter>);
}
beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { uid: 'seller', emailVerified: true, email: 'seller@example.com' };
  mockBatch.commit.mockResolvedValue();
  mockGetDoc.mockImplementation(async (path) => path === 'vans/existing'
    ? { id: 'existing', exists: () => true, data: () => listing }
    : { exists: () => true, data: () => contact });
});

test('Edit link preloads the original listing and saves the same document without creating a duplicate', async () => {
  renderRoute();
  const title = await screen.findByDisplayValue(listing.title);
  expect(screen.getByDisplayValue('23000')).toBeInTheDocument();
  expect(screen.getByDisplayValue('2027-05-20')).toBeInTheDocument();
  expect(screen.getByDisplayValue('ABC123')).toBeInTheDocument();
  expect(screen.getByDisplayValue(contact.phone)).toBeInTheDocument();
  expect(screen.getByDisplayValue(contact.whatsapp)).toBeInTheDocument();
  expect(document.querySelector('img[src="https://example.com/van.jpg"]')).not.toBeNull();
  fireEvent.change(title, { target: { value: 'Updated Toyota Hiace' } });
  fireEvent.submit(document.getElementById('addVanForm'));
  await waitFor(() => expect(mockBatch.commit).toHaveBeenCalledTimes(1));
  expect(mockBatch.update).toHaveBeenCalledWith('vans/existing', expect.objectContaining({
    title: 'Updated Toyota Hiace', price: 23000, images: listing.images,
  }));
  expect(mockBatch.update.mock.calls[0][1]).not.toHaveProperty('boostState');
  expect(mockBatch.set).toHaveBeenCalledWith('vans/existing/private/contact', {
    email: mockUser.email, ...contact,
  }, { merge: true });
  expect(mockAddDoc).not.toHaveBeenCalled();
  expect(await screen.findByText('My listings return')).toBeInTheDocument();
});

test('another seller cannot open the editor', async () => {
  mockUser.uid = 'other';
  renderRoute();
  expect(await screen.findByRole('alert')).toHaveTextContent('edit_listing.denied');
  expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
});

test('a missing or malformed edit target never falls back to the create form', async () => {
  renderRoute('/sell?edit=');
  expect(await screen.findByRole('alert')).toHaveTextContent('edit_listing.missing');
  expect(mockGetDoc).not.toHaveBeenCalled();
  expect(screen.queryByText('Publish Your Van - FREE')).not.toBeInTheDocument();
});

test('private contact read failure blocks saving instead of overwriting contact with empty values', async () => {
  mockGetDoc.mockRejectedValue(new Error('network'));
  render(<AddVanForm isEditMode van={{ ...listing, id: 'existing' }} onClose={jest.fn()} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('edit_listing.load_error');
  expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
  expect(mockBatch.commit).not.toHaveBeenCalled();
});

test('signed out edit links request login', () => {
  mockUser = null;
  renderRoute();
  expect(screen.getByText('Sign in required')).toBeInTheDocument();
  expect(mockGetDoc).not.toHaveBeenCalled();
});

test('editing from My listings calls its refresh callback after saving', async () => {
  const refreshed = jest.fn();
  render(<AddVanForm isEditMode van={{ ...listing, id: 'existing' }} onClose={jest.fn()} onSuccess={refreshed} />);
  await screen.findByDisplayValue(listing.title);
  fireEvent.submit(document.getElementById('addVanForm'));
  await waitFor(() => expect(refreshed).toHaveBeenCalledTimes(1));
});

test('admin edits preserve another seller’s private contact', async () => {
  mockUser = { ...mockUser, uid: 'admin', isAdmin: true };
  renderRoute();
  await screen.findByDisplayValue(listing.title);
  expect(screen.getByDisplayValue(contact.phone)).toBeDisabled();
  fireEvent.submit(document.getElementById('addVanForm'));
  await waitFor(() => expect(mockBatch.commit).toHaveBeenCalledTimes(1));
  expect(mockBatch.set).not.toHaveBeenCalled();
});
