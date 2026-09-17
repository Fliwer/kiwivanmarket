import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { TrendingUp, Info, ArrowRight, BarChart3, Calendar } from 'lucide-react';
import { db } from '../firebase';
import SeoHead from './SeoHead';
import { useTranslation } from 'react-i18next';
import { seoCopy, seoLang, SEO_LANGS } from '../data/seo';

const CURRENT_YEAR = new Date().getFullYear();

// Un van est rattaché à une marque via son titre, faute de champ `brand`
// structuré. L'ORDRE COMPTE : chaque van n'est compté qu'une seule fois, dans
// le premier segment qui matche. Les modèles précis passent donc avant les
// marques génériques, sinon un "Toyota Hiace" serait compté deux fois.
const BRAND_MATCHERS = [
  { name: 'Toyota Hiace', kws: ['hiace'] },
  { name: 'Nissan Caravan', kws: ['caravan', 'homy'] },
  { name: 'Nissan Elgrand', kws: ['elgrand'] },
  { name: 'Mitsubishi Delica', kws: ['delica'] },
  { name: 'Mazda Bongo', kws: ['bongo'] },
  { name: 'Ford Transit', kws: ['transit'] },
  { name: 'VW Transporter', kws: ['transporter', 'kombi'] },
  { name: 'Hyundai iLoad', kws: ['iload', 'imax'] },
  { name: 'Mercedes Sprinter', kws: ['sprinter', 'vito'] },
  { name: 'Toyota (other models)', kws: ['toyota', 'estima', 'regius', 'townace', 'liteace', 'granvia'] },
  { name: 'Nissan (other models)', kws: ['nissan', 'serena', 'vanette', 'nv200'] },
];
const BRAND_LABELS = {
  fr: { 'Toyota (other models)': 'Toyota (autres modèles)', 'Nissan (other models)': 'Nissan (autres modèles)' },
};

// ─── Stats helpers ────────────────────────────────────────────────────────────

const median = (nums) => {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
};

const nzd = (n) => `$${Math.round(n).toLocaleString('en-NZ')}`;

// Un échantillon sous ce seuil n'est pas publiable : une "médiane" sur 3
// annonces n'a aucune valeur statistique et décrédibiliserait la page — c'est
// précisément le chiffre qu'un journaliste ou une IA irait citer.
const MIN_SAMPLE = 5;

// ─── Schema.org Dataset — format que les moteurs et les IA citent ────────────

function PriceDatasetSchema({ stats, url, T }) {
  if (!stats || !stats.total) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: T.datasetName(CURRENT_YEAR),
    description: T.datasetDesc(stats),
    url,
    keywords: ['campervan prices New Zealand', 'how much does a campervan cost NZ', 'backpacker van price NZ', 'used campervan value NZ'],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: { '@type': 'Organization', name: 'Kiwi Van Market', url: 'https://kiwivanmarket.com' },
    temporalCoverage: String(CURRENT_YEAR),
    spatialCoverage: { '@type': 'Country', name: 'New Zealand' },
    variableMeasured: [
      { '@type': 'PropertyValue', name: T.varMedian, value: stats.median, unitText: 'NZD' },
      { '@type': 'PropertyValue', name: T.varSample, value: stats.total, unitText: 'listings' },
    ],
  };
  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PriceIndexPage() {
  const { t, i18n } = useTranslation();
  const lang = seoLang(i18n.language);
  const T = seoCopy(i18n.language).prices;
  const C = seoCopy(i18n.language).common;
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const url = 'https://kiwivanmarket.com/campervan-prices-nz';

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'vans'));
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          // On ne garde que des prix plausibles : un van à $1 ou $500k est une
          // erreur de saisie et ferait dériver la médiane.
          .filter((v) => {
            const p = Number(v.price);
            return Number.isFinite(p) && p >= 1000 && p <= 200000;
          });
        setVans(list);
      } catch (e) {
        console.error('Price index: fetch failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    if (!vans.length) return null;
    const prices = vans.map((v) => Number(v.price));

    // Attribution exclusive : chaque van tombe dans un seul segment (le premier
    // qui matche), pour que les effectifs s'additionnent sans doublon.
    const groups = new Map(BRAND_MATCHERS.map((m) => [m.name, []]));
    vans.forEach((v) => {
      const title = (v.title || '').toLowerCase();
      const hit = BRAND_MATCHERS.find((m) => m.kws.some((k) => title.includes(k)));
      if (hit) groups.get(hit.name).push(Number(v.price));
    });

    const byBrand = [...groups.entries()]
      .filter(([, p]) => p.length >= MIN_SAMPLE)
      .map(([name, p]) => ({
        name: (BRAND_LABELS[lang] && BRAND_LABELS[lang][name]) || name,
        count: p.length, median: median(p), min: Math.min(...p), max: Math.max(...p),
      }))
      .sort((a, b) => b.median - a.median);

    // Segments utiles à l'acheteur : l'âge et l'auto-suffisance sont les deux
    // variables qui pèsent le plus sur le prix d'un van en NZ.
    const segment = (label, subset) => {
      const p = subset.map((v) => Number(v.price));
      return p.length >= MIN_SAMPLE
        ? { label, count: p.length, median: median(p), min: Math.min(...p), max: Math.max(...p) }
        : null;
    };

    const byAge = [
      segment(T.ageBefore, vans.filter((v) => v.year && v.year < 2000)),
      segment(T.age2000, vans.filter((v) => v.year >= 2000 && v.year <= 2009)),
      segment(T.age2010, vans.filter((v) => v.year >= 2010)),
    ].filter(Boolean);

    const selfContained = segment(T.scYes, vans.filter((v) => v.selfContained));
    const notSelfContained = segment(T.scNo, vans.filter((v) => !v.selfContained));

    const buckets = [
      { label: T.bucketUnder, test: (p) => p < 5000 },
      { label: '$5,000 – $9,999', test: (p) => p >= 5000 && p < 10000 },
      { label: '$10,000 – $14,999', test: (p) => p >= 10000 && p < 15000 },
      { label: '$15,000 – $24,999', test: (p) => p >= 15000 && p < 25000 },
      { label: T.bucketAbove, test: (p) => p >= 25000 },
    ].map((b) => {
      const count = prices.filter(b.test).length;
      return { ...b, count, pct: Math.round((count / prices.length) * 100) };
    });

    return {
      total: prices.length,
      median: median(prices),
      min: Math.min(...prices),
      max: Math.max(...prices),
      byBrand,
      byAge,
      selfContained,
      notSelfContained,
      buckets,
    };
  }, [vans, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const faqs = stats ? T.faqs(stats, nzd) : [];
  return (
    <div className="min-h-screen bg-slate-50">
      <SeoHead
        title={T.title(CURRENT_YEAR).replace(' | Kiwi Van Market', '')}
        description={T.metaDescNoStats(CURRENT_YEAR)}
        keywords={['campervan prices New Zealand', 'how much does a campervan cost NZ', 'backpacker van price NZ', 'average price campervan New Zealand', 'used van value NZ']}
        alternateLangs={SEO_LANGS}
        faqs={faqs}
        breadcrumbs={[{ name: C.home, path: '/' }, { name: T.crumb, path: '/campervan-prices-nz' }]}
      />
      <PriceDatasetSchema stats={stats} url={url} T={T} />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-5 py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
            <BarChart3 size={14} /> {t('seo_pages.prices.badge', { year: CURRENT_YEAR })}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4">
            {T.h1}
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            {T.intro(CURRENT_YEAR).replace(/\n/g, ' ')}
          </p>

          {loading ? (
            <div className="mt-10 h-24 w-full max-w-md bg-white/5 rounded-2xl animate-pulse" />
          ) : stats ? (
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label={T.median} value={nzd(stats.median)} highlight />
              <Stat label={T.lowest} value={nzd(stats.min)} />
              <Stat label={T.highest} value={nzd(stats.max)} />
              <Stat label={T.analysed} value={stats.total} />
            </div>
          ) : (
            <p className="mt-10 text-slate-400">
              {T.empty}
            </p>
          )}
        </div>
      </section>

      {stats && (
        <div className="max-w-5xl mx-auto px-5 py-12 space-y-12">
          {/* ── Réponse directe (format citable par les IA) ──────────── */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
              {T.howMuch}
            </h2>
            <p
              className="text-slate-600 leading-relaxed [&_strong]:text-slate-900"
              dangerouslySetInnerHTML={{ __html: T.answer({ total: stats.total, median: nzd(stats.median), min: nzd(stats.min), max: nzd(stats.max) }).replace(/\n/g, ' ') }}
            />
          </section>

          {/* ── Répartition ─────────────────────────────────────────── */}
          <Section title={T.distribution} icon={TrendingUp}>
            <div className="space-y-2.5">
              {stats.buckets.map((b) => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="w-36 sm:w-44 shrink-0 text-sm font-semibold text-slate-700">{b.label}</span>
                  <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-lg transition-all"
                      style={{ width: `${Math.max(b.pct, b.count ? 2 : 0)}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-sm font-bold text-slate-900 tabular-nums">
                    {b.pct}%
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Par marque ──────────────────────────────────────────── */}
          {stats.byBrand.length > 0 && (
            <Section title={T.byBrand} icon={BarChart3}>
              <PriceTable rows={stats.byBrand} firstCol={T.model} T={T} />
            </Section>
          )}

          {/* ── Par âge ─────────────────────────────────────────────── */}
          {stats.byAge.length > 0 && (
            <Section title={T.byAge} icon={Calendar}>
              <PriceTable rows={stats.byAge.map((r) => ({ ...r, name: r.label }))} firstCol={T.year} T={T} />
            </Section>
          )}

          {/* ── Self-contained ──────────────────────────────────────── */}
          {stats.selfContained && stats.notSelfContained && (
            <Section title={T.scTitle} icon={TrendingUp}>
              <div className="grid sm:grid-cols-2 gap-4">
                {[stats.selfContained, stats.notSelfContained].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
                    <p className="text-sm font-bold text-slate-500 mb-1">{s.label}</p>
                    <p className="text-3xl font-black text-slate-900">{nzd(s.median)}</p>
                    <p className="text-xs text-slate-400 mt-1">{t('seo_pages.prices.median_listings', { count: s.count })}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                {T.scText.replace(/\n/g, ' ')}
              </p>
            </Section>
          )}

          {/* ── Méthodologie — indispensable pour être crédible/cité ── */}
          <section className="bg-slate-100 rounded-2xl p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-3">
              <Info size={18} className="text-slate-500" /> {T.methodology}
            </h2>
            <ul className="space-y-2 text-sm text-slate-600 leading-relaxed list-disc pl-5">
              {T.method(stats, MIN_SAMPLE).map((m, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: m }} />
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              {T.reuse}
            </p>
          </section>

          {/* ── CTA ─────────────────────────────────────────────────── */}
          <section className="bg-emerald-600 rounded-2xl p-6 sm:p-8 text-white text-center">
            <h2 className="text-xl sm:text-2xl font-black mb-2">
              {T.ctaTitle}
            </h2>
            <p className="text-emerald-50 mb-6 text-sm sm:text-base">
              {T.ctaText}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/sell"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition"
              >
                {T.sellMy} <ArrowRight size={18} />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 bg-emerald-700/50 border border-white/25 px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
              >
                {t('seo_pages.prices.browse')}
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// ─── Petits composants ───────────────────────────────────────────────────────

function Stat({ label, value, highlight }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-emerald-500' : 'bg-white/10'}`}>
      <p className={`text-xs font-bold uppercase tracking-wide ${highlight ? 'text-emerald-50' : 'text-slate-400'}`}>
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-black mt-1 tabular-nums">{value}</p>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-black text-slate-900 mb-5">
        <Icon size={20} className="text-emerald-600" /> {title}
      </h2>
      {children}
    </section>
  );
}

function PriceTable({ rows, firstCol, T }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
      <table className="w-full text-sm min-w-[520px]">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <th className="text-left font-bold px-4 py-3">{firstCol}</th>
            <th className="text-right font-bold px-4 py-3">{T.median}</th>
            <th className="text-right font-bold px-4 py-3">{T.range}</th>
            <th className="text-right font-bold px-4 py-3">{T.listingsCol}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-slate-100">
              <td className="px-4 py-3 font-bold text-slate-900">{r.name}</td>
              <td className="px-4 py-3 text-right font-black text-emerald-600 tabular-nums">{nzd(r.median)}</td>
              <td className="px-4 py-3 text-right text-slate-500 tabular-nums whitespace-nowrap">
                {nzd(r.min)} – {nzd(r.max)}
              </td>
              <td className="px-4 py-3 text-right text-slate-400 tabular-nums">{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
