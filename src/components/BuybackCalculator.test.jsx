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
  expect(screen.getByLabelText('Quoted rental daily rate (NZD)')).not.toBeVisible();
  fireEvent.click(screen.getByText('Compare with renting'));
  expect(screen.getByLabelText('Quoted rental daily rate (NZD)')).toBeVisible();
  fireEvent.change(screen.getByLabelText('Quoted rental daily rate (NZD)'), { target: { value: '40' } });
  expect(screen.getByText(/With these inputs, the rental subtotal is lower/)).toBeTruthy();
  expect(screen.getByText(/prefilled numbers are assumptions/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Remove comparison' }));
  expect(screen.queryByText('Rental total for the same days')).toBeNull();
});

test('embedded French tool has no page-level heading and uses the French assumptions', async () => {
  await i18n.changeLanguage('fr');
  render(<MemoryRouter><BuybackCalculator isEmbedded /></MemoryRouter>);
  expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  expect(screen.getByLabelText('Revente supposée (NZD)')).toBeTruthy();
  expect(screen.getByText(/les nombres préremplis sont des hypothèses/)).toBeTruthy();
});

test('duration shortcuts update the daily cost while keeping the same trip total', async () => {
  await i18n.changeLanguage('en');
  render(<MemoryRouter><BuybackCalculator isEmbedded /></MemoryRouter>);
  for (const label of ['Purchase price (NZD)', 'Assumed resale proceeds (NZD)', 'Travel days']) {
    expect(screen.getByLabelText(label)).toBeVisible();
  }
  fireEvent.click(screen.getByRole('button', { name: '60 days' }));
  expect(screen.getByLabelText('Travel days')).toHaveValue(60);
  expect(screen.getByText('$77.50')).toBeVisible();
  expect(screen.getByText('$4,650.00')).toBeVisible();
});

test('folded costs remain included and their visible total follows edits', async () => {
  await i18n.changeLanguage('en');
  render(<MemoryRouter><BuybackCalculator isEmbedded /></MemoryRouter>);
  const repairs = screen.getByLabelText('Repairs and servicing budget (NZD)');
  expect(repairs).not.toBeVisible();
  expect(screen.getByText('$2,150.00')).toBeVisible();
  fireEvent.click(screen.getByText('Planned costs'));
  fireEvent.change(repairs, { target: { value: '0' } });
  fireEvent.click(screen.getByText('Planned costs'));
  expect(repairs).not.toBeVisible();
  expect(screen.getByText('$1,150.00')).toBeVisible();
  expect(screen.getByText('$3,650.00')).toBeVisible();
});
