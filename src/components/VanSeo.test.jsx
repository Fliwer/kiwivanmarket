import React from 'react';
import { render } from '@testing-library/react';
import VanSeo from './VanSeo';
import vehicleData from '../data/seo/vehicle-schema';

jest.mock('./SeoHead', () => () => null);

test('visitor listing structured data is the shared factual product data without an invisible FAQ', () => {
  const van = { id: 'CaseSensitiveID', title: '2012 Nissan Caravan', capacity: 2, selfContained: true };
  const { container } = render(<VanSeo van={van} />);
  const scripts = container.querySelectorAll('script[type="application/ld+json"]');
  expect(scripts).toHaveLength(1);
  expect(JSON.parse(scripts[0].textContent)).toEqual(JSON.parse(JSON.stringify(vehicleData.schema(van))));
  expect(scripts[0].textContent).not.toContain('vehicleIdentificationNumber');
  expect(scripts[0].textContent).not.toContain('vehicleSeatingCapacity');
  expect(scripts[0].textContent).not.toContain('FAQPage');
});
