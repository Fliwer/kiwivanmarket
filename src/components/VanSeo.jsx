import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * VanSeo - Composant SEO pour les pages de détail des vans
 * Génère les meta tags et structured data pour chaque annonce
 */
export default function VanSeo({ van }) {
  if (!van) return null;

  // Construire le titre SEO optimisé
  const buildTitle = () => {
    const parts = [];
    if (van.year) parts.push(van.year);
    if (van.brand) parts.push(van.brand);
    if (van.model) parts.push(van.model);
    if (van.title && parts.length === 0) parts.push(van.title);
    
    const vehicleInfo = parts.join(' ') || 'Campervan';
    const location = van.location ? ` in ${van.location}` : ' in New Zealand';
    
    return `${vehicleInfo} for Sale${location} | Kiwi Van Market`;
  };

  const title = buildTitle();

  // Construire la description SEO
  const buildDescription = () => {
    const parts = [];
    
    // Prix
    if (van.price) {
      parts.push(`$${van.price.toLocaleString()} NZD`);
    }
    
    // Année et kilométrage
    if (van.year) parts.push(`${van.year}`);
    if (van.mileage) parts.push(`${van.mileage.toLocaleString()} km`);
    
    // Features clés
    if (van.selfContained) parts.push('Self-contained');
    if (van.buyBack) parts.push('Buy-back available');
    
    // Location
    if (van.location) parts.push(`Located in ${van.location}`);
    
    const summary = parts.join(' • ');
    
    // Ajouter la description courte si disponible
    const desc = van.description 
      ? van.description.slice(0, 100).replace(/\s+/g, ' ').trim()
      : '';
    
    return `${summary}. ${desc}`.slice(0, 155);
  };

  const description = buildDescription();

  // Images
  const images = Array.isArray(van.images) && van.images.length > 0 
    ? van.images 
    : (van.imageUrl ? [van.imageUrl] : []);
  const mainImage = images[0] || 'https://kiwivanmarket.com/og-image.jpg';

  // URL canonique (si tu as des URLs dynamiques)
  const canonicalUrl = `https://kiwivanmarket.com/van/${van.id || ''}`;

  // Structured Data - Vehicle/Product
  const vehicleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    '@id': canonicalUrl,
    name: van.title || `${van.year || ''} ${van.brand || ''} ${van.model || 'Campervan'}`.trim(),
    description: van.description || description,
    image: images,
    url: canonicalUrl,
    
    // Informations véhicule
    brand: van.brand ? { '@type': 'Brand', name: van.brand } : undefined,
    model: van.model || undefined,
    vehicleModelDate: van.year ? String(van.year) : undefined,
    modelDate: van.year ? String(van.year) : undefined,
    vehicleConfiguration: van.type || 'Campervan',
    bodyType: 'Campervan',
    numberOfDoors: van.doors || undefined,
    vehicleSeatingCapacity: van.capacity || undefined,
    vehicleTransmission: van.transmission || undefined,
    fuelType: van.fuelType || undefined,
    color: van.color || undefined,
    
    // Kilométrage
    mileageFromOdometer: van.mileage ? {
      '@type': 'QuantitativeValue',
      value: van.mileage,
      unitCode: 'KMT',
      unitText: 'kilometers'
    } : undefined,
    
    // Condition
    itemCondition: 'https://schema.org/UsedCondition',
    
    // Offre / Prix
    offers: {
      '@type': 'Offer',
      price: van.price ? String(van.price) : undefined,
      priceCurrency: 'NZD',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/UsedCondition',
      seller: van.seller ? {
        '@type': 'Person',
        name: van.seller.name || 'Private Seller'
      } : {
        '@type': 'Person',
        name: 'Private Seller'
      },
      areaServed: {
        '@type': 'Country',
        name: 'New Zealand'
      },
      availableAtOrFrom: van.location ? {
        '@type': 'Place',
        name: van.location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: van.location,
          addressCountry: 'NZ'
        }
      } : undefined
    },
    
    // Features additionnelles (custom properties)
    additionalProperty: [
      van.selfContained ? {
        '@type': 'PropertyValue',
        name: 'Self-Contained',
        value: 'Yes - Freedom camping certified'
      } : null,
      van.wofExpiry ? {
        '@type': 'PropertyValue',
        name: 'WOF Valid Until',
        value: new Date(van.wofExpiry).toLocaleDateString('en-NZ')
      } : null,
      van.regoExpiry ? {
        '@type': 'PropertyValue',
        name: 'Registration Valid Until',
        value: new Date(van.regoExpiry).toLocaleDateString('en-NZ')
      } : null,
      van.buyBack ? {
        '@type': 'PropertyValue',
        name: 'Buy-Back Option',
        value: 'Available'
      } : null,
    ].filter(Boolean)
  };

  // Structured Data - BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://kiwivanmarket.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Campervans',
        item: 'https://kiwivanmarket.com/?type=Van'
      },
      van.location ? {
        '@type': 'ListItem',
        position: 3,
        name: van.location,
        item: `https://kiwivanmarket.com/?location=${encodeURIComponent(van.location)}`
      } : null,
      {
        '@type': 'ListItem',
        position: van.location ? 4 : 3,
        name: van.title || 'Campervan',
        item: canonicalUrl
      }
    ].filter(Boolean)
  };

  // Nettoyer les undefined du JSON-LD
  const cleanJsonLd = (obj) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => 
      value === undefined ? undefined : value
    ));
  };

  return (
    <Helmet>
      {/* Meta tags de base */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={mainImage} />
      <meta property="og:image:alt" content={van.title || 'Campervan for sale'} />
      <meta property="og:site_name" content="Kiwi Van Market" />
      <meta property="og:locale" content="en_NZ" />
      
      {/* Product specific Open Graph */}
      {van.price && <meta property="product:price:amount" content={String(van.price)} />}
      <meta property="product:price:currency" content="NZD" />
      <meta property="product:availability" content="in stock" />
      <meta property="product:condition" content="used" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={mainImage} />
      
      {/* Geo tags */}
      {van.location && <meta name="geo.placename" content={`${van.location}, New Zealand`} />}
      <meta name="geo.region" content="NZ" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(cleanJsonLd(vehicleJsonLd))}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(cleanJsonLd(breadcrumbJsonLd))}
      </script>
    </Helmet>
  );
}
