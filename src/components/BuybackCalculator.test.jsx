import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import i18n from '../i18n';
import BuybackCalculator from './BuybackCalculator';

jest.mock('react-router-dom', () => {
  global.TextEncoder = require('util').TextEncoder;
  return jest.requireActual('react-router');
});
afterEach(cleanup);

test('ownership tool shows a rental quote can cost less and asks for the resale assumption', async () => {
  await i18n.changeLanguage('en');
  render(<MemoryRouter><HelmetProvider><BuybackCalculator /></HelmetProvider></MemoryRouter>);
  expect(screen.getByLabelText('Assumed resale proceeds (NZD)')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Quoted rental daily rate (NZD)'), { target: { value: '40' } });
  expect(screen.getByText(/With these inputs, the rental subtotal is lower/)).toBeTruthy();
  expect(screen.getByText(/prefilled numbers are assumptions/)).toBeTruthy();
});

test('embedded French tool has no page-level heading and uses the French assumptions', async () => {
  await i18n.changeLanguage('fr');
  render(<MemoryRouter><BuybackCalculator isEmbedded /></MemoryRouter>);
  expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  expect(screen.getByLabelText('Revente supposée (NZD)')).toBeTruthy();
  expect(screen.getByText(/les nombres préremplis sont des hypothèses/)).toBeTruthy();
});
