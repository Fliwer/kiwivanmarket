import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { getDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import VanPage from './VanPage';

let mockStatus;
const mockChangeStatus = jest.fn();
const mockToast = { error: jest.fn(), success: jest.fn() };
jest.mock('react-router-dom', () => {
  global.TextEncoder = require('util').TextEncoder;
  return jest.requireActual('react-router');
});
jest.mock('../firebase', () => ({ db: {}, functions: {} }));
jest.mock('../AuthContext', () => ({ useAuth: () => ({ currentUser: { uid: 'seller', emailVerified: true } }) }));
jest.mock('../hooks/useFavorites', () => ({ useFavorites: () => ({ isFavorite: () => false }) }));
jest.mock('../hooks/useHideLoader', () => ({ useHideLoader: () => {} }));
jest.mock('../hooks/useVanContact', () => () => null);
jest.mock('./ToastProvider', () => ({ useToast: () => mockToast }));
jest.mock('./VanSeo', () => () => null);
jest.mock('./SeoHead', () => () => null);
jest.mock('./ListingOwnerPanel', () => ({ van, onToggleSold, onTogglePause }) => <div>
  <p data-testid="status">{van.status}</p>
  <button onClick={onToggleSold}>owner-sold</button><button onClick={onTogglePause}>owner-pause</button>
</div>);
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key, i18n: { language: 'en' } }) }));
jest.mock('firebase/firestore', () => ({
  doc: (_, ...parts) => parts.join('/'), getDoc: jest.fn(), updateDoc: jest.fn(async () => {}), increment: jest.fn(),
}));
jest.mock('firebase/functions', () => ({ httpsCallable: jest.fn(() => (...args) => mockChangeStatus(...args)) }));
beforeEach(() => {
  jest.clearAllMocks();
  httpsCallable.mockImplementation(() => (...args) => mockChangeStatus(...args));
  mockStatus = 'active';
  sessionStorage.setItem('viewed_existing', '1');
  getDoc.mockImplementation(async path => path === 'vans/existing' ? { id: 'existing', exists: () => true, data: () => ({
    title: 'Existing van', price: 15000, year: 2010, mileage: 100000, location: 'Auckland', status: mockStatus,
    seller: { uid: 'seller', name: 'Seller' }, equipment: {}, images: ['https://example.com/van.jpg'],
  }) } : { exists: () => false });
  mockChangeStatus.mockImplementation(async ({ status }) => ({ data: { status, confirmedAt: status === 'active' ? '2026-10-15T12:00:00.000Z' : null } }));
});
function renderVan() {
  return render(<MemoryRouter initialEntries={['/van/existing']}><Routes><Route path="/van/:id" element={<VanPage />} /></Routes></MemoryRouter>);
}
test.each([
  ['active', 'owner-sold', 'sold'], ['active', 'owner-pause', 'paused'],
  ['paused', 'owner-pause', 'active'], ['sold', 'owner-sold', 'active'],
])('owner changes %s via %s through the server lifecycle endpoint', async (initial, action, status) => {
  mockStatus = initial;
  renderVan();
  fireEvent.click(await screen.findByRole('button', { name: action }));
  await waitFor(() => expect(mockChangeStatus).toHaveBeenCalledWith({ vanId: 'existing', status }));
  expect(httpsCallable).toHaveBeenCalledWith(expect.anything(), 'setListingAvailability');
  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent(status));
  expect(updateDoc).not.toHaveBeenCalledWith('vans/existing', expect.objectContaining({ status }));
});
test('a rejected status change leaves the listing status unchanged', async () => {
  mockChangeStatus.mockRejectedValue(new Error('moderation hold'));
  renderVan();
  fireEvent.click(await screen.findByRole('button', { name: 'owner-pause' }));
  await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
  expect(screen.getByTestId('status')).toHaveTextContent('active');
});
