import React from 'react';
import { render, waitFor, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import SeoHead from './SeoHead';

jest.mock('react-router-dom', () => {
  global.TextEncoder = require('util').TextEncoder;
  return jest.requireActual('react-router');
});

afterEach(() => {
  cleanup();
  document.head.querySelectorAll('link[data-seo]').forEach((link) => link.remove());
});

test('listing canonical and alternate URLs preserve the actual case-sensitive ID', async () => {
  await i18n.changeLanguage('en');
  const id = 'Grg9bbNBtUu0g8E5QrH3';
  render(<MemoryRouter initialEntries={[`/van/${id}/?utm_source=test`]}>
    <HelmetProvider><SeoHead title="Toyota Hiace" /></HelmetProvider>
  </MemoryRouter>);
  await waitFor(() => expect(document.querySelector('link[rel="canonical"]').href)
    .toBe(`https://kiwivanmarket.com/van/${id}`));
  for (const link of document.querySelectorAll('link[rel="canonical"], link[hreflang]')) {
    expect(link.href).toBe(`https://kiwivanmarket.com/van/${id}`);
  }
});

test('untranslated Spanish homepage consolidates to the English canonical, with no invented Spanish alternate', async () => {
  await i18n.changeLanguage('es');
  render(<MemoryRouter initialEntries={['/?lang=es']}>
    <HelmetProvider><SeoHead title="Campervans" alternateLangs={['en', 'fr']} /></HelmetProvider>
  </MemoryRouter>);
  await waitFor(() => expect(document.querySelector('link[rel="canonical"]').href)
    .toBe('https://kiwivanmarket.com/'));
  expect(document.querySelector('link[hreflang="es"]')).toBeNull();
});
