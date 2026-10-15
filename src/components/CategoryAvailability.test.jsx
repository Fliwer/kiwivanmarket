import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getDocs } from 'firebase/firestore';
import BrandPage from './BrandPage';
import LocationPage from './LocationPage';

jest.mock('react-router-dom', () => {
  global.TextEncoder = require('util').TextEncoder;
  return jest.requireActual('react-router');
});
jest.mock('../firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), getDocs: jest.fn() }));
jest.mock('../hooks/useHideLoader', () => ({ useHideLoader: () => {} }));
jest.mock('../hooks/useBoostClock', () => ({ useBoostClock: () => 0 }));
jest.mock('./AlertCta', () => () => null);
jest.mock('./VanCard', () => ({ van }) => <div>{van.status === 'sold' ? 'SOLD' : van.id}</div>);
jest.mock('./SeoHead', () => ({ description }) => <div data-testid="metadata">{description}</div>);
jest.mock('react-i18next', () => ({ useTranslation: () => ({
  i18n: { language: 'en' },
  t: (key, values) => key.startsWith('seo_pages.') && key.includes('available') ? `available-count:${values.count}` : key,
}) }));

test.each([
  ['brand', '/brand/toyota-hiace', '/brand/:brand', BrandPage],
  ['location', '/location/auckland', '/location/:location', LocationPage],
])('%s availability, metadata and for-sale ItemList exclude sold vans', async (_name, path, route, Page) => {
  getDocs.mockResolvedValue({ docs: ['active-one', 'active-two', 'sold'].map((id) => ({ id,
    data: () => ({ title: 'Toyota Hiace', location: 'Auckland', price: id === 'sold' ? 500 : 10000, status: id === 'sold' ? 'sold' : 'active' }),
  })) });
  const { container } = render(<MemoryRouter initialEntries={[path]}><Routes><Route path={route} element={<Page />} /></Routes></MemoryRouter>);
  await waitFor(() => expect(screen.getByText('available-count:2')).toBeTruthy());
  expect(screen.getByTestId('metadata').textContent).toMatch(/^2 /);
  expect(screen.getByText('SOLD')).toBeTruthy();
  const schemas = [...container.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent));
  const list = schemas.find((schema) => schema['@type'] === 'ItemList');
  expect(list.numberOfItems).toBe(2);
  expect(list.itemListElement.map((item) => item.url.split('/').pop()).sort()).toEqual(['active-one', 'active-two']);
});
