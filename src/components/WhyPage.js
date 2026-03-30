import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SeoHead from './SeoHead';

const TOP_10_VANS = [
  {
    rank: 1, emoji: '🏆', name: 'Toyota Hiace', tagline: 'The Gold Standard',
    priceRange: '$5,000 – $20,000 NZD', badge: 'Best Overall', badgeColor: 'bg-amber-500',
    pros: ['Virtually indestructible engine', 'Tons of parts everywhere in NZ', 'Best resale value on the market', 'Ideal for long-term builds'],
    bestFor: 'Solo travellers & couples', highlight: true,
  },
  {
    rank: 2, emoji: '🚐', name: 'Nissan Caravan / Homy', tagline: 'The Reliable Workhorse',
    priceRange: '$4,000 – $14,000 NZD', badge: 'Best Value', badgeColor: 'bg-blue-500',
    pros: ['Very affordable entry price', 'Spacious high-roof interior', 'Easy to find used versions', 'Strong aftermarket support'],
    bestFor: 'Budget travellers',
  },
  {
    rank: 3, emoji: '👑', name: 'Nissan Elgrand', tagline: 'The King of Vans',
    priceRange: '$5,000 – $18,000 NZD', badge: 'Most Comfortable', badgeColor: 'bg-purple-500',
    pros: ['Luxurious interior finish', 'Very smooth & quiet ride', 'Popular for premium conversions', 'Great for couples & families'],
    bestFor: 'Comfort seekers',
  },
  {
    rank: 4, emoji: '🌲', name: 'Mitsubishi Delica', tagline: 'The Off-Road Beast',
    priceRange: '$4,000 – $12,000 NZD', badge: 'Best 4WD', badgeColor: 'bg-emerald-600',
    pros: ['4WD capability standard', 'Handles gravel & forest roads', 'Iconic in NZ backpacker scene', 'Very compact and easy to park'],
    bestFor: 'Adventure & off-road trips',
  },
  {
    rank: 5, emoji: '⚡', name: 'Toyota HiAce Diesel', tagline: 'The Fuel Saver',
    priceRange: '$6,000 – $22,000 NZD', badge: 'Best for Long Distances', badgeColor: 'bg-teal-500',
    pros: ['Incredible fuel economy', 'Up to 1000km per tank', 'Same legendary Hiace reliability', 'Great for South Island road trips'],
    bestFor: 'Long-distance travellers',
  },
  {
    rank: 6, emoji: '🎒', name: 'Mazda Bongo', tagline: 'The Compact Expert',
    priceRange: '$3,000 – $9,000 NZD', badge: 'Best Budget', badgeColor: 'bg-orange-500',
    pros: ['Very cheap entry price', 'Easy to drive in cities', 'Low fuel consumption', 'Small enough for tight campsites'],
    bestFor: 'Solo budget travellers',
  },
  {
    rank: 7, emoji: '🏠', name: 'Ford Transit', tagline: 'The Conversion King',
    priceRange: '$5,000 – $25,000 NZD', badge: 'Best for Custom Builds', badgeColor: 'bg-blue-600',
    pros: ['Largest interior space', 'Perfect for full custom builds', 'Good parts availability in NZ', 'Very sturdy European build quality'],
    bestFor: 'DIY builders & long stays',
  },
  {
    rank: 8, emoji: '🐻', name: 'Toyota Camroad', tagline: 'The Cult Classic',
    priceRange: '$7,000 – $28,000 NZD', badge: 'Best Pre-Built', badgeColor: 'bg-rose-500',
    pros: ['Often comes fully converted', 'Very high build quality in Japan', 'Self-contained certified common', 'Extremely reliable diesel'],
    bestFor: 'Turnkey buyers',
  },
  {
    rank: 9, emoji: '🚀', name: 'Mitsubishi Express', tagline: 'The Hidden Gem',
    priceRange: '$2,500 – $7,000 NZD', badge: 'Best Underrated Pick', badgeColor: 'bg-slate-500',
    pros: ['Very underrated & affordable', 'Decent space for a small van', 'Low competition when buying', 'Good for short NZ trips (3–4 months)'],
    bestFor: 'Short-stay backpackers',
  },
  {
    rank: 10, emoji: '🌍', name: 'VW Transporter (T4/T5)', tagline: 'The Lifestyle Van',
    priceRange: '$8,000 – $30,000 NZD', badge: 'Most Instagrammable', badgeColor: 'bg-yellow-500',
    pros: ['Iconic & stylish design', 'Great community around VW vans', 'Good resale value if well-maintained', 'Comfortable for long trips'],
    bestFor: 'Lifestyle & content creators',
  },
];

export default function WhyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50">
      <SeoHead
        title={t('why_page.seo_title')}
        description={t('why_page.seo_desc')}
      />

      {/* Hero */}
      <section className="bg-white pt-16 pb-24 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider mb-6 border border-emerald-100">
            <Shield size={13} />
            {t('why_page.hero_badge')}
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
            {t('why_page.hero_h1')}<br />
            <span className="text-emerald-600">{t('why_page.hero_h1_highlight')}</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
            {t('why_page.hero_subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 active:scale-95">
              {t('why_page.cta_browse')} <ArrowRight size={18} />
            </Link>
            <a href="#top10" className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
              {t('why_page.cta_anchor')}
            </a>
          </div>
        </div>
      </section>

      {/* 3 Pillars */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">{t('why_page.pillars_title')}</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">{t('why_page.pillars_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500">
              <div className="w-14 h-14 bg-emerald-100 group-hover:bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 transition-colors duration-500">
                <Shield size={26} className="text-emerald-600 group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{t('why_page.p1_title')}</h3>
              <p className="text-slate-500 leading-relaxed mb-6">{t('why_page.p1_desc')}</p>
              <ul className="space-y-2">
                {['p1_li1','p1_li2','p1_li3','p1_li4'].map(key => (
                  <li key={key} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                    {t(`why_page.${key}`)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500 md:-translate-y-4">
              <div className="w-14 h-14 bg-emerald-100 group-hover:bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 transition-colors duration-500">
                <span className="text-2xl">🏕️</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{t('why_page.p2_title')}</h3>
              <p className="text-slate-500 leading-relaxed mb-6">{t('why_page.p2_desc')}</p>
              <ul className="space-y-2">
                {['p2_li1','p2_li2','p2_li3','p2_li4'].map(key => (
                  <li key={key} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                    {t(`why_page.${key}`)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500">
              <div className="w-14 h-14 bg-emerald-100 group-hover:bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 transition-colors duration-500">
                <Zap size={26} className="text-emerald-600 group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{t('why_page.p3_title')}</h3>
              <p className="text-slate-500 leading-relaxed mb-6">{t('why_page.p3_desc')}</p>
              <ul className="space-y-2">
                {['p3_li1','p3_li2','p3_li3','p3_li4'].map(key => (
                  <li key={key} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                    {t(`why_page.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Top 10 */}
      <section id="top10" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4 text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px]">
              <span className="w-8 h-px bg-emerald-600" />
              {t('why_page.top10_badge')}
              <span className="w-8 h-px bg-emerald-600" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              {t('why_page.top10_title')}<br />
              <span className="text-emerald-600">{t('why_page.top10_highlight')}</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t('why_page.top10_subtitle')}</p>
          </div>

          <div className="space-y-6">
            {TOP_10_VANS.map((van) => (
              <div
                key={van.rank}
                className={`relative rounded-[2rem] p-8 border transition-all duration-300 ${
                  van.highlight
                    ? 'bg-emerald-50 border-emerald-200 shadow-xl shadow-emerald-900/10 ring-2 ring-emerald-400/20'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-lg'
                }`}
              >
                {van.highlight && (
                  <div className="absolute -top-3 left-8 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    {t('why_page.top10_editor')}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:w-16 shrink-0">
                    <span className="text-4xl sm:text-5xl">{van.emoji}</span>
                    <span className="text-slate-300 font-black text-2xl sm:text-3xl">#{van.rank}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black text-slate-900">{van.name}</h3>
                      <span className={`text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${van.badgeColor}`}>
                        {van.badge}
                      </span>
                    </div>
                    <p className="text-slate-500 font-medium italic mb-4">"{van.tagline}" &mdash; {van.priceRange}</p>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-5">
                      {van.pros.map(pro => (
                        <div key={pro} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                          {pro}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      {t('why_page.top10_best_for')} {van.bestFor}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Final */}
          <div className="mt-16 text-center bg-emerald-600 rounded-[2.5rem] p-12 shadow-2xl shadow-emerald-900/20">
            <h3 className="text-3xl font-black text-white mb-4">{t('why_page.cta_title')}</h3>
            <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">{t('why_page.cta_subtitle')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-black px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-all shadow-lg active:scale-95">
                {t('why_page.cta_explore')} <ArrowRight size={18} />
              </Link>
              <Link to="/sell" className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all active:scale-95">
                {t('why_page.cta_list')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
