import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { getDocs } from 'firebase/firestore';
import FavoritesPage from './FavoritesPage';

let mockFavorites = [];
jest.mock('react-router-dom', () => {
  global.TextEncoder = require('util').TextEncoder;
  return jest.requireActual('react-router');
});
jest.mock('../firebase', () => ({ db: {} }));
jest.mock('../hooks/useFavorites', () => ({ useFavorites: () => ({ favorites: mockFavorites, loading: false, toggleFavorite: jest.fn() }) }));
jest.mock('firebase/firestore', () => ({
  collection: (_, name) => name,
  where: (field, operator, values) => ({ field, operator, values }),
  query: (path, condition) => ({ path, condition }),
  getDocs: jest.fn(),
}));
function Location() { return <p data-testid="path">{useLocation().pathname}</p>; }
function renderFavorites(props = {}) {
  return render(<MemoryRouter><FavoritesPage onClose={jest.fn()} {...props} /><Location /></MemoryRouter>);
}
beforeEach(() => {
  jest.clearAllMocks();
  mockFavorites = Array.from({ length: 25 }, (_, index) => `van-${index + 1}`);
  getDocs.mockImplementation(async ({ condition }) => ({ docs: condition.values.map(id => ({ id,
    data: () => ({ title: `Favorite ${id}`, price: 12000, year: 2010, mileage: 100000, location: 'Auckland' }),
  })) }));
});

test('all saved vans are loaded even when there are more than ten favorites', async () => {
  renderFavorites();
  expect(await screen.findByText('Favorite van-25')).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(25);
  expect(getDocs.mock.calls.map(([request]) => request.condition.values.length)).toEqual([10, 10, 5]);
});

test('clicking a favorite opens its listing when no callback was supplied by the app', async () => {
  const onClose = jest.fn();
  renderFavorites({ onClose });
  fireEvent.click(await screen.findByText('Favorite van-25'));
  expect(screen.getByTestId('path')).toHaveTextContent('/van/van-25');
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('a result from an older favorites request cannot replace the current list', async () => {
  let finishOldRequest;
  mockFavorites = ['old-van'];
  getDocs.mockImplementationOnce(() => new Promise(resolve => { finishOldRequest = resolve; }));
  const page = renderFavorites();
  mockFavorites = ['current-van'];
  page.rerender(<MemoryRouter><FavoritesPage onClose={jest.fn()} /><Location /></MemoryRouter>);
  expect(await screen.findByText('Favorite current-van')).toBeInTheDocument();
  finishOldRequest({ docs: [{ id: 'old-van', data: () => ({ title: 'Old result', price: 10000 }) }] });
  await waitFor(() => expect(screen.queryByText('Old result')).not.toBeInTheDocument());
  expect(screen.getByText('Favorite current-van')).toBeInTheDocument();
});
