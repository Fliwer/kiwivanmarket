import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function VanSeo({ van }) {
  if (!van) return null;

  const title = van.title
    ? `${van.title} | Campervan for sale in New Zealand`
    : 'Campervan for sale in New Zealand';

  const description =
    (van.description && van.description.slice(0, 155)) ||
    'Campervan for sale in New Zealand with valid WOF and rego.';

  const images = Array.isArray(van.images) ? van.images : [];
  const mainImage = images[0];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Vehicle'],
    name: van.title,
    description: van.description,
    image: images,
    brand: van.brand
      ? { '@type': 'Brand', name: van.brand }
      : undefined,
    model: van.model || 'Campervan',
    vehicleConfiguration: van.type || 'Campervan',
    vehicleTransmission: van.transmission || undefined,
    vehicleEngine: van.fuelType || undefined,
    mileageFromOdometer: van.mileage
      ? {
          '@type': 'QuantitativeValue',
          value: van.mileage,
          unitCode: 'KMT'
        }
      : undefined,
    url: 'https://kiwivanmarket.com',
    offers: van.price
      ? {
          '@type': 'Offer',
          price: String(van.price),
          priceCurrency: 'NZD',
          availability: 'https://schema.org/InStock'
        }
      : undefined
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {mainImage && <meta property="og:image" content={mainImage} />}
      <meta property="og:type" content="product" />

      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
}
