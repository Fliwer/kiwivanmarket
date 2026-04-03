import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import SeoHead from './SeoHead';
import VanCard from './VanCard';
import { useHideLoader } from '../hooks/useHideLoader';
import { safeDate } from '../utils/dateHelper';
import { LONG_TAIL_PAGE_LIST, LONG_TAIL_PAGE_MAP } from '../constants/seoLongTailPages';

function cityLabel(citySlug) {
  return citySlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function SeoLongTailPage() {
  useHideLoader();
  const { slug } = useParams();
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = LONG_TAIL_PAGE_MAP[slug];

  useEffect(() => {
    const fetchVans = async () => {
      if (!config) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDocs(collection(db, 'vans'));
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const filtered = all.filter((van) => {
          if (van.status && van.status !== 'active' && van.status !== 'sold') return false;
          const inCity = (van.location || '').toLowerCase().includes(config.city);
          if (!inCity) return false;
          if (typeof config.maxPrice === 'number' && (van.price || 0) > config.maxPrice) return false;
          if (config.selfContainedOnly && !van.selfContained) return false;
          return true;
        });

        filtered.sort((a, b) => {
          const statusOrder = (a.status === 'sold' ? 1 : 0) - (b.status === 'sold' ? 1 : 0);
          if (statusOrder !== 0) return statusOrder;
          const aTs = safeDate(a.createdAt)?.getTime() || 0;
          const bTs = safeDate(b.createdAt)?.getTime() || 0;
          return bTs - aTs;
        });

        setVans(filtered);
      } catch (err) {
        console.error('Error loading long-tail SEO page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVans();
  }, [config]);

  const faqs = useMemo(() => {
    if (!config) return [];
    const city = cityLabel(config.city);
    return [
      {
        q: `How to buy a campervan in ${city} safely?`,
        a: `Use listing trust signals first: WOF, REGO, self-contained status, and CarJam access when a plate is provided. Then inspect in person and test drive before payment.`,
      },
      {
        q: `What budget is realistic for ${city}?`,
        a: typeof config.maxPrice === 'number'
          ? `For this page, we focus on listings up to NZ$${config.maxPrice.toLocaleString()}. You can compare similarly priced vans and contact sellers directly.`
          : `Prices vary by season and equipment. Compare current listings and prioritize condition, service history, and compliance.`,
      },
      {
        q: `Is self-contained important in New Zealand?`,
        a: `Yes, self-contained certification is a major trust and usability signal for freedom camping. It usually increases resale potential and buyer confidence.`,
      },
    ];
  }, [config]);

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <SeoHead title="Page not found" noindex={true} />
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-3">SEO page not found</h1>
          <Link to="/" className="text-emerald-600 font-bold hover:underline">Back to home</Link>
        </div>
      </div>
    );
  }

  const city = cityLabel(config.city);
  const relatedPages = LONG_TAIL_PAGE_LIST
    .filter((page) => page.city === config.city && page.slug !== slug)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <SeoHead
        title={config.title}
        description={config.description}
        faqs={faqs}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: `Location: ${city}`, path: `/location/${config.city}` },
          { name: config.heading, path: `/search/${slug}` },
        ]}
      />

      <section className="bg-white border-b border-slate-100 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">{config.heading}</h1>
          <p className="text-slate-600 max-w-3xl">
            {config.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to={`/location/${config.city}`} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm">
              View all vans in {city}
            </Link>
            <Link to={`/faq/location/${config.city}`} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">
              {city} buying FAQ
            </Link>
            <Link to="/guide/buying-campervan-nz" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">
              Read buyer guide
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center text-slate-500 font-bold">Loading listings...</div>
        ) : vans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <h2 className="text-xl font-black text-slate-900 mb-2">No exact match right now</h2>
            <p className="text-slate-500 mb-6">Try nearby pages and keep checking as new vans are listed daily.</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link to={`/location/${config.city}`} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                Browse {city}
              </Link>
              <Link to="/" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">
                Browse all listings
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vans.map((van) => <VanCard key={van.id} van={van} />)}
            </div>
            <section className="mt-10 bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">More specific searches in {city}</h2>
              <div className="flex flex-wrap gap-2">
                {relatedPages.map((page) => (
                  <Link
                    key={page.slug}
                    to={`/search/${page.slug}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition"
                  >
                    {page.heading}
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
