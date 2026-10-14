import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ListingBoostModal } from './ListingBoost';

let mockUser;
const mockTranslate = (key, values) => key + (values ? JSON.stringify(values) : '');
const mockCallable = jest.fn();
jest.mock('../AuthContext', () => ({ useAuth: () => ({ currentUser: mockUser }) }));
jest.mock('../firebase', () => ({ db: {}, functions: {} }));
jest.mock('firebase/functions', () => ({ httpsCallable: (...args) => mockCallable(...args) }));
jest.mock('firebase/firestore', () => ({ doc: jest.fn(), onSnapshot: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockTranslate, i18n: { language: 'en' } }) }));

const plans = [{ id: 'fortnight', days: 14, amountCents: 3000 }, { id: 'month', days: 28, amountCents: 5000 }];
const van = { id: 'van', title: 'Toyota Hiace', status: 'active' };
const originalLocation = Object.getOwnPropertyDescriptor(window, 'location');
const mockAssign = jest.fn();
beforeEach(() => {
  mockUser = { uid: 'seller', emailVerified: true };
  mockCallable.mockReset(); mockAssign.mockReset();
  Object.defineProperty(window, 'location', { configurable: true, value: { assign: mockAssign } });
});
afterEach(() => Object.defineProperty(window, 'location', originalLocation));

test('seller sees both fixed offers but cannot purchase when checkout is not open', async () => {
  mockCallable.mockReturnValue(async () => ({ data: { plans, available: false, mode: 'test' } }));
  render(<ListingBoostModal van={van} onClose={jest.fn()} onUpdated={jest.fn()} />);
  expect(await screen.findByText('boost.not_ready')).toBeInTheDocument();
  const fortnight = screen.getByRole('button', { name: /14/ });
  const month = screen.getByRole('button', { name: /28/ });
  expect(fortnight).toBeDisabled(); expect(month).toBeDisabled();
  expect(fortnight).toHaveTextContent('30.00'); expect(month).toHaveTextContent('50.00');
  fireEvent.click(fortnight);
  expect(mockCallable.mock.calls.map((call) => call[1])).toEqual(['getBoostPlans']);
});

test('checkout sends only listing/plan identifiers and redirects to Stripe', async () => {
  const purchase = jest.fn(async () => ({ data: { url: 'https://checkout.stripe.com/c/pay/test' } }));
  mockCallable.mockImplementation((_, name) => name === 'getBoostPlans' ?
    async () => ({ data: { plans, available: true, mode: 'test' } }) : purchase);
  render(<ListingBoostModal van={van} onClose={jest.fn()} onUpdated={jest.fn()} />);
  fireEvent.click(await screen.findByRole('button', { name: /14/ }));
  await waitFor(() => expect(purchase).toHaveBeenCalledWith({ vanId: 'van', planId: 'fortnight' }));
  expect(mockAssign).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/test');
});

test('a forged checkout redirect cannot navigate away to an attacker', async () => {
  mockCallable.mockImplementation((_, name) => name === 'getBoostPlans' ?
    async () => ({ data: { plans, available: true, mode: 'test' } }) :
    async () => ({ data: { url: 'https://attacker.example/checkout' } }));
  render(<ListingBoostModal van={van} onClose={jest.fn()} onUpdated={jest.fn()} />);
  fireEvent.click(await screen.findByRole('button', { name: /28/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('boost.error');
  expect(mockAssign).not.toHaveBeenCalled();
});

test('an unverified account cannot start Checkout', async () => {
  mockUser.emailVerified = false;
  mockCallable.mockReturnValue(async () => ({ data: { plans, available: true, mode: 'test' } }));
  render(<ListingBoostModal van={van} onClose={jest.fn()} onUpdated={jest.fn()} />);
  expect(await screen.findByRole('button', { name: /14/ })).toBeDisabled();
  expect(screen.getByText('boost.verify_email')).toBeInTheDocument();
});
