import { render, screen, fireEvent } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import HomeSearch from './HomeSearch';
import en from '../locales/en/translation.json';
import fr from '../locales/fr/translation.json';
import es from '../locales/es/translation.json';

test.each(['en', 'fr', 'es'])('submits the selected city and NZD budget in %s', async (lang) => {
  const i18n = createInstance();
  const resources = { en: { translation: en }, fr: { translation: fr }, es: { translation: es } };
  await i18n.init({ lng: lang, resources, interpolation: { escapeValue: false } });
  const onSearch = jest.fn();
  render(<I18nextProvider i18n={i18n}><HomeSearch location="all" priceMax={500000} onSearch={onSearch} /></I18nextProvider>);

  fireEvent.change(screen.getByLabelText(i18n.t('marketplace.city')), { target: { value: 'Christchurch' } });
  fireEvent.change(screen.getByLabelText(i18n.t('marketplace.budget')), { target: { value: '15000' } });
  expect(onSearch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: i18n.t('marketplace.search') }));
  expect(onSearch).toHaveBeenCalledWith({ location: 'Christchurch', priceMax: 15000 });
});

test('keeps custom detailed-filter values and resets in sync with the search form', async () => {
  const i18n = createInstance();
  await i18n.init({ lng: 'en', resources: { en: { translation: en } } });
  const onSearch = jest.fn();
  const form = (location, priceMax) => <I18nextProvider i18n={i18n}><HomeSearch location={location} priceMax={priceMax} onSearch={onSearch} /></I18nextProvider>;
  const { rerender } = render(form('all', 500000));
  rerender(form('Nelson', 23500));
  expect(screen.getByLabelText('Pickup city')).toHaveValue('Nelson');
  expect(screen.getByLabelText('Maximum budget · NZD')).toHaveValue('23500');
  fireEvent.submit(screen.getByRole('search'));
  expect(onSearch).toHaveBeenLastCalledWith({ location: 'Nelson', priceMax: 23500 });
  rerender(form('all', 500000));
  expect(screen.getByLabelText('Pickup city')).toHaveValue('all');
  expect(screen.getByLabelText('Maximum budget · NZD')).toHaveValue('500000');
});
