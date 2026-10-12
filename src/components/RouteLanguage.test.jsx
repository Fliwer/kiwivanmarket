import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import RouteLanguage from './RouteLanguage';

// CRA's Jest resolver predates package exports; use the same router's core
// exports rather than resolving react-router/dom through the DOM shim.
jest.mock('react-router-dom', () => {
  global.TextEncoder = require('util').TextEncoder;
  return jest.requireActual('react-router');
});

function Fixture() {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n: translation } = useTranslation();
  return <><RouteLanguage /><span>{location.pathname + location.search + location.hash}</span>
    <span>{translation.language}</span><Link to="/brand/toyota-hiace?sort=price#listings">Model</Link>
    <button onClick={() => navigate(-1)}>Back</button>
    <button onClick={() => navigate('/', { replace: true })}>English</button></>;
}

beforeEach(async () => { await i18n.changeLanguage('en'); });
test('explicit French URL overrides the prior language', async () => {
  render(<MemoryRouter initialEntries={['/?lang=fr']}><Fixture /></MemoryRouter>);
  await waitFor(() => expect(screen.getByText('fr')).toBeTruthy());
});
test('English direct arrival does not display the prior French content', async () => {
  await act(async () => i18n.changeLanguage('fr'));
  render(<MemoryRouter initialEntries={['/']}><Fixture /></MemoryRouter>);
  await waitFor(() => expect(screen.getByText('en')).toBeTruthy());
});
test('internal French navigation keeps language, filters and hash in the URL', async () => {
  render(<MemoryRouter initialEntries={['/?lang=fr']}><Fixture /></MemoryRouter>);
  await waitFor(() => expect(screen.getByText('fr')).toBeTruthy());
  fireEvent.click(screen.getByText('Model'));
  await waitFor(() => expect(screen.getByText('/brand/toyota-hiace?sort=price&lang=fr#listings')).toBeTruthy());
});
test('choosing English removes the language instead of being redirected to French', async () => {
  render(<MemoryRouter initialEntries={['/?lang=fr']}><Fixture /></MemoryRouter>);
  await waitFor(() => expect(screen.getByText('fr')).toBeTruthy());
  fireEvent.click(screen.getByText('English'));
  await waitFor(() => expect(screen.getByText('en')).toBeTruthy());
  expect(screen.getByText('/')).toBeTruthy();
});
test('history restores the English URL and its language', async () => {
  render(<MemoryRouter initialEntries={['/', '/?lang=fr']}><Fixture /></MemoryRouter>);
  await waitFor(() => expect(screen.getByText('fr')).toBeTruthy());
  fireEvent.click(screen.getByText('Back'));
  await waitFor(() => expect(screen.getByText('en')).toBeTruthy());
});
