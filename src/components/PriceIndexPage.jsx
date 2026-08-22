import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { TrendingUp, Info, ArrowRight, BarChart3, Calendar } from 'lucide-react';
import { db } from '../firebase';
import SeoHead from './SeoHead';

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
  { name: 'Toyota (autres modèles)', kws: ['toyota', 'estima', 'regius', 'townace', 'liteace', 'granvia'] },
  { name: 'Nissan (autres modèles)', kws: ['nissan', 'serena', 'vanette', 'nv200'] },
];

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

function PriceDatasetSchema({ stats, url }) {
  if (!stats || !stats.total) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `New Zealand Campervan Price Index ${CURRENT_YEAR}`,
    description: `Median and range of asking prices for campervans and backpacker vans listed for sale in New Zealand, based on ${stats.total} live listings on Kiwi Van Market.`,
    url,
    keywords: ['campervan prices New Zealand', 'how much does a campervan cost NZ', 'backpacker van price NZ', 'used campervan value NZ'],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: { '@type': 'Organization', name: 'Kiwi Van Market', url: 'https://kiwivanmarket.com' },
    temporalCoverage: String(CURRENT_YEAR),
    spatialCoverage: { '@type': 'Country', name: 'New Zealand' },
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'Median asking price', value: stats.median, unitText: 'NZD' },
      { '@type': 'PropertyValue', name: 'Sample size', value: stats.total, unitText: 'listings' },
    ],
  };
  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PriceIndexPage() {
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
        name, count: p.length, median: median(p), min: Math.min(...p), max: Math.max(...p),
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
      segment('Avant 2000', vans.filter((v) => v.year && v.year < 2000)),
      segment('2000 – 2009', vans.filter((v) => v.year >= 2000 && v.year <= 2009)),
      segment('2010 et plus récent', vans.filter((v) => v.year >= 2010)),
    ].filter(Boolean);

    const selfContained = segment('Self-contained certifié', vans.filter((v) => v.selfContained));
    const notSelfContained = segment('Non certifié', vans.filter((v) => !v.selfContained));

    const buckets = [
      { label: 'Moins de $5,000', test: (p) => p < 5000 },
      { label: '$5,000 – $9,999', test: (p) => p >= 5000 && p < 10000 },
      { label: '$10,000 – $14,999', test: (p) => p >= 10000 && p < 15000 },
      { label: '$15,000 – $24,999', test: (p) => p >= 15000 && p < 25000 },
      { label: '$25,000 et plus', test: (p) => p >= 25000 },
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
  }, [vans]);

  const faqs = stats
    ? [
        {
          q: 'How much does a campervan cost in New Zealand?',
          a: `Based on ${stats.total} campervans currently listed for sale on Kiwi Van Market, the median asking price is ${nzd(stats.median)} NZD, with listings ranging from ${nzd(stats.min)} to ${nzd(stats.max)}. Most backpacker vans sell between $5,000 and $15,000 NZD.`,
        },
        {
          q: 'What is a fair price for a backpacker van in NZ?',
          a: `A reliable self-contained backpacker van in New Zealand typically sits between $6,000 and $12,000 NZD. Below $5,000 you should expect high mileage and possible WOF work; above $15,000 you are generally paying for a newer vehicle or a professional conversion.`,
        },
        {
          q: 'Does a self-contained certificate increase a van price in New Zealand?',
          a: stats.selfContained && stats.notSelfContained
            ? `Yes. On Kiwi Van Market, self-contained certified vans have a median asking price of ${nzd(stats.selfContained.median)} NZD versus ${nzd(stats.notSelfContained.median)} NZD for non-certified vans.`
            : 'Yes. Self-contained certification lets you freedom camp legally in many areas, which noticeably increases resale value and demand in New Zealand.',
        },
        {
          q: 'When is the cheapest time to buy a campervan in New Zealand?',
          a: 'Prices are lowest around March to May, when backpackers leave at the end of the summer season and supply peaks. Prices are highest from November to January, when arrivals compete for vans at the start of the season.',
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <SeoHead
        title={`Campervan Prices NZ ${CURRENT_YEAR} — Real Market Data`}
        description={`How much does a campervan cost in New Zealand? Median asking prices by brand, age and self-contained status, based on live listings. Updated ${CURRENT_YEAR}.`}
        keywords={['campervan prices New Zealand', 'how much does a campervan cost NZ', 'backpacker van price NZ', 'average price campervan New Zealand', 'used van value NZ']}
        canonicalUrl={url}
        faqs={faqs}
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Campervan prices NZ', path: '/campervan-prices-nz' }]}
      />
      <PriceDatasetSchema stats={stats} url={url} />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-5 py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
            <BarChart3 size={14} /> Données de marché {CURRENT_YEAR}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4">
            Prix des campervans en Nouvelle-Zélande
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            Combien coûte un van en NZ&nbsp;? Voici les prix réellement demandés,
            calculés en direct depuis les annonces publiées sur Kiwi Van Market —
            par marque, par âge et selon la certification self-contained.
          </p>

          {loading ? (
            <div className="mt-10 h-24 w-full max-w-md bg-white/5 rounded-2xl animate-pulse" />
          ) : stats ? (
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Prix médian" value={nzd(stats.median)} highlight />
              <Stat label="Le moins cher" value={nzd(stats.min)} />
              <Stat label="Le plus cher" value={nzd(stats.max)} />
              <Stat label="Annonces analysées" value={stats.total} />
            </div>
          ) : (
            <p className="mt-10 text-slate-400">
              Pas encore assez d'annonces pour publier des statistiques fiables.
            </p>
          )}
        </div>
      </section>

      {stats && (
        <div className="max-w-5xl mx-auto px-5 py-12 space-y-12">
          {/* ── Réponse directe (format citable par les IA) ──────────── */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
              Combien coûte un campervan en Nouvelle-Zélande&nbsp;?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Sur les <strong>{stats.total} vans</strong> actuellement en vente sur Kiwi Van Market,
              le prix médian demandé est de <strong className="text-emerald-600">{nzd(stats.median)} NZD</strong>,
              dans une fourchette allant de {nzd(stats.min)} à {nzd(stats.max)}.
              La majorité des vans de backpackers se négocient entre $5,000 et $15,000 NZD.
            </p>
          </section>

          {/* ── Répartition ─────────────────────────────────────────── */}
          <Section title="Répartition des prix" icon={TrendingUp}>
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
            <Section title="Prix médian par marque" icon={BarChart3}>
              <PriceTable rows={stats.byBrand} firstCol="Modèle" />
            </Section>
          )}

          {/* ── Par âge ─────────────────────────────────────────────── */}
          {stats.byAge.length > 0 && (
            <Section title="Prix médian par âge du véhicule" icon={Calendar}>
              <PriceTable rows={stats.byAge.map((r) => ({ ...r, name: r.label }))} firstCol="Année" />
            </Section>
          )}

          {/* ── Self-contained ──────────────────────────────────────── */}
          {stats.selfContained && stats.notSelfContained && (
            <Section title="L'effet du certificat self-contained" icon={TrendingUp}>
              <div className="grid sm:grid-cols-2 gap-4">
                {[stats.selfContained, stats.notSelfContained].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
                    <p className="text-sm font-bold text-slate-500 mb-1">{s.label}</p>
                    <p className="text-3xl font-black text-slate-900">{nzd(s.median)}</p>
                    <p className="text-xs text-slate-400 mt-1">médiane · {s.count} annonces</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                La certification self-contained autorise le freedom camping dans de
                nombreuses zones de Nouvelle-Zélande : c'est l'équipement qui
                influence le plus la valeur de revente d'un van.
              </p>
            </Section>
          )}

          {/* ── Méthodologie — indispensable pour être crédible/cité ── */}
          <section className="bg-slate-100 rounded-2xl p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-3">
              <Info size={18} className="text-slate-500" /> Méthodologie
            </h2>
            <ul className="space-y-2 text-sm text-slate-600 leading-relaxed list-disc pl-5">
              <li>
                Calculs effectués en direct sur les <strong>{stats.total} annonces</strong> publiées
                sur Kiwi Van Market, mises à jour à chaque chargement de la page.
              </li>
              <li>
                Il s'agit de <strong>prix demandés</strong> par les vendeurs, pas de prix de vente
                finaux : le prix négocié est généralement inférieur de 5 à 15&nbsp;%.
              </li>
              <li>
                Nous utilisons la <strong>médiane</strong> plutôt que la moyenne, moins sensible
                aux annonces extrêmes.
              </li>
              <li>
                Les annonces hors fourchette $1,000–$200,000 sont écartées (erreurs de saisie),
                et un segment n'est affiché qu'à partir de {MIN_SAMPLE} annonces — en dessous,
                l'échantillon est trop petit pour être significatif.
              </li>
              <li>
                Chaque van n'est compté que dans <strong>un seul</strong> segment de marque :
                les effectifs ne se chevauchent pas.
              </li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Données librement réutilisables avec un lien vers kiwivanmarket.com.
            </p>
          </section>

          {/* ── CTA ─────────────────────────────────────────────────── */}
          <section className="bg-emerald-600 rounded-2xl p-6 sm:p-8 text-white text-center">
            <h2 className="text-xl sm:text-2xl font-black mb-2">
              Tu sais maintenant ce que vaut ton van
            </h2>
            <p className="text-emerald-50 mb-6 text-sm sm:text-base">
              Publie ton annonce gratuitement, sans commission.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/sell"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition"
              >
                Vendre mon van <ArrowRight size={18} />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 bg-emerald-700/50 border border-white/25 px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
              >
                Voir les vans en vente
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

function PriceTable({ rows, firstCol }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
      <table className="w-full text-sm min-w-[520px]">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <th className="text-left font-bold px-4 py-3">{firstCol}</th>
            <th className="text-right font-bold px-4 py-3">Prix médian</th>
            <th className="text-right font-bold px-4 py-3">Fourchette</th>
            <th className="text-right font-bold px-4 py-3">Annonces</th>
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
