import taxonomy from './taxonomy';
import selfContained from './self-contained';

const ORIGIN = 'https://kiwivanmarket.com';
const number = (value, minimum = 0) => value !== null && value !== '' && value !== undefined
  && Number.isFinite(Number(value)) && Number(value) >= minimum ? Number(value) : undefined;
const dateValue = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) && Number.isFinite(Date.parse(value))) return value.slice(0, 10);
  if (value && typeof value.toDate === 'function') return value.toDate().toISOString().slice(0, 10);
  return undefined;
};
const images = (van) => (Array.isArray(van.images) && van.images.length ? van.images : [van.imageUrl])
  .filter((image) => typeof image === 'string' && image.startsWith('https://'));
const consistentYear = (van) => {
  const declared = number(van.year, 1900);
  const latest = new Date().getUTCFullYear() + 1;
  if (!Number.isInteger(declared) || declared > latest) return undefined;
  const titleYears = [...String(van.title || '').matchAll(/\b(?:19|20)\d{2}\b/g)]
    .map((match) => Number(match[0])).filter((year) => year <= latest);
  return titleYears.some((year) => year !== declared) ? undefined : declared;
};
const title = (van) => {
  const name = van.title || 'Campervan';
  const year = consistentYear(van);
  return `${year && !new RegExp(`\\b${year}\\b`).test(name) ? year + ' ' : ''}${name} for Sale${van.location ? ' in ' + van.location : ' in New Zealand'}`;
};
const description = (van) => [
  number(van.price, 1) !== undefined ? `$${Number(van.price).toLocaleString('en-NZ')} NZD` : 'Price on request',
  number(van.mileage) !== undefined ? `${Number(van.mileage).toLocaleString('en-NZ')} km` : null,
  van.location ? `Located in ${van.location}` : null,
  van.selfContained === true ? selfContained.short(van) : null,
  String(van.description || '').replace(/\s+/g, ' ').slice(0, 100),
].filter(Boolean).join(' • ').slice(0, 155);

function schema(van) {
  const url = `${ORIGIN}/van/${van.id}`;
  const identity = taxonomy.vehicleIdentity(van);
  const year = consistentYear(van);
  const mileage = number(van.mileage);
  const wof = dateValue(van.wofExpiry);
  const rego = dateValue(van.regoExpiry);
  return {
    '@context': 'https://schema.org', '@type': ['Vehicle', 'Product'], '@id': url,
    name: van.title || 'Campervan', description: String(van.description || description(van)).slice(0, 5000),
    image: images(van), url,
    brand: identity.brand ? { '@type': 'Brand', name: identity.brand } : undefined,
    model: identity.model,
    vehicleModelDate: year ? String(year) : undefined,
    bodyType: 'Campervan', vehicleConfiguration: van.type || undefined,
    vehicleTransmission: van.transmission || undefined, fuelType: van.fuelType || undefined,
    mileageFromOdometer: mileage !== undefined ? { '@type': 'QuantitativeValue', value: mileage, unitCode: 'KMT' } : undefined,
    itemCondition: 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer', price: number(van.price, 1) !== undefined ? String(van.price) : undefined,
      priceCurrency: 'NZD', url, availability: van.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/UsedCondition',
      seller: { '@type': 'Person', name: (van.seller && van.seller.name) || 'Private Seller' },
      availableAtOrFrom: van.location ? { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: van.location, addressCountry: 'NZ' } } : undefined,
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: selfContained.COPY.en.label, value: selfContained.describe(van) },
      number(van.capacity, 1) !== undefined ? { '@type': 'PropertyValue', name: 'Sleeping capacity (seller declaration)', value: Number(van.capacity) } : null,
      wof ? { '@type': 'PropertyValue', name: 'WOF expiry (seller declaration)', value: wof } : null,
      rego ? { '@type': 'PropertyValue', name: 'Vehicle licence expiry (seller declaration)', value: rego } : null,
      van.buyBack ? { '@type': 'PropertyValue', name: 'Buy-back option (seller declaration)', value: 'Contact seller for contractual terms' } : null,
    ].filter(Boolean),
  };
}

export default { schema, title, description, images, consistentYear };
