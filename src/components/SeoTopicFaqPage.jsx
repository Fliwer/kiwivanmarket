import React from 'react';
import { Link, useParams } from 'react-router-dom';
import SeoHead from './SeoHead';
import { useHideLoader } from '../hooks/useHideLoader';

const BRAND_NAMES = {
  'toyota-hiace': 'Toyota Hiace',
  'nissan-caravan': 'Nissan Caravan',
  'mazda-bongo': 'Mazda Bongo',
  'mitsubishi-delica': 'Mitsubishi Delica',
  'ford-transit': 'Ford Transit',
  'mercedes-sprinter': 'Mercedes Sprinter',
};

const LOCATION_NAMES = {
  auckland: 'Auckland',
  wellington: 'Wellington',
  christchurch: 'Christchurch',
  queenstown: 'Queenstown',
  hamilton: 'Hamilton',
  tauranga: 'Tauranga',
  dunedin: 'Dunedin',
  rotorua: 'Rotorua',
  nelson: 'Nelson',
};

function buildLocationFaq(locationName) {
  return [
    {
      q: `What should I check before buying a campervan in ${locationName}?`,
      a: `Prioritize trust signals first: WOF, REGO, and self-contained status. Ask for service history, inspect rust points, and run a CarJam check when the plate is available.`,
    },
    {
      q: `Is ${locationName} a good city to buy and resell a van?`,
      a: `${locationName} is a strong market with active backpacker demand. Pricing changes by season, so compare listing quality, not only headline price.`,
    },
    {
      q: `How can I avoid scams in ${locationName}?`,
      a: `Meet in person, never pay full amount before inspection, verify ownership transfer process, and keep communication on traceable channels.`,
    },
  ];
}

function buildBrandFaq(brandName) {
  return [
    {
      q: `Is the ${brandName} good for vanlife in New Zealand?`,
      a: `${brandName} is popular because of reliability, parts availability, and practical conversion layouts. Actual value depends on maintenance and build quality.`,
    },
    {
      q: `What matters most when buying a used ${brandName}?`,
      a: `Focus on mechanical condition, rust, WOF/REGO validity, and conversion quality (insulation, wiring, water system, and ventilation).`,
    },
    {
      q: `Can I resell a ${brandName} quickly in NZ?`,
      a: `Well-presented listings with complete trust signals usually sell faster. Good photos, transparent description, and realistic pricing are key.`,
    },
  ];
}

export default function SeoTopicFaqPage() {
  useHideLoader();
  const { scope, slug } = useParams();

  const isLocation = scope === 'location';
  const isBrand = scope === 'brand';
  const label = isLocation ? LOCATION_NAMES[slug] : BRAND_NAMES[slug];

  if ((!isLocation && !isBrand) || !label) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <SeoHead title="FAQ not found" noindex={true} />
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-3">FAQ page not found</h1>
          <Link to="/faq" className="text-emerald-600 font-bold hover:underline">Back to main FAQ</Link>
        </div>
      </div>
    );
  }

  const faqs = isLocation ? buildLocationFaq(label) : buildBrandFaq(label);
  const title = isLocation
    ? `Campervan FAQ in ${label}`
    : `${label} Campervan FAQ in New Zealand`;
  const description = isLocation
    ? `Answers about buying and selling campervans in ${label}, including trust checks, pricing, and safe transaction tips.`
    : `Answers about buying a ${label} campervan in New Zealand: reliability, checks, and resale tips.`;

  const basePath = isLocation ? `/location/${slug}` : `/brand/${slug}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <SeoHead
        title={title}
        description={description}
        faqs={faqs}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
          { name: label, path: `/faq/${scope}/${slug}` },
        ]}
      />

      <section className="bg-white border-b border-slate-100 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">{title}</h1>
          <p className="text-slate-600">{description}</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link to={basePath} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm">
              Open matching listings
            </Link>
            <Link to="/guide/buying-campervan-nz" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">
              Buyer guide
            </Link>
            <Link to="/faq" className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">
              Main FAQ
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {faqs.map((item, idx) => (
          <article key={item.q} className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-900 mb-2">{idx + 1}. {item.q}</h2>
            <p className="text-slate-600 leading-relaxed">{item.a}</p>
          </article>
        ))}
      </main>
    </div>
  );
}
