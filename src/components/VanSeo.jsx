import React from 'react';
import SeoHead from './SeoHead';
import vehicleData from '../data/seo/vehicle-schema';
import taxonomy from '../data/seo/taxonomy';

// Shared with prerender-van: sleeping capacity is not seating capacity and
// certificate details remain seller declarations.
export default function VanSeo({ van }) {
  if (!van) return null;
  const url = 'https://kiwivanmarket.com/van/' + van.id;
  const city = Object.entries(taxonomy.LOCATIONS).find(([slug]) => String(van.location || '').toLowerCase().includes(slug));
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    ...(city ? [{ name: city[1], path: '/location/' + city[0] }] : []),
    { name: van.title || 'Campervan', path: '/van/' + van.id },
  ];
  return (
    <>
      <SeoHead title={vehicleData.title(van)} description={vehicleData.description(van)}
        image={vehicleData.images(van)[0]} canonicalUrl={url} type="product" breadcrumbs={breadcrumbs} />
      <script type="application/ld+json">{JSON.stringify(vehicleData.schema(van)).replace(/</g, '\\u003c')}</script>
    </>
  );
}
