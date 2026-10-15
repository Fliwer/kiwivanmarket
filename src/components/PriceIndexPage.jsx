import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { TrendingUp, Info, ArrowRight, BarChart3, Calendar } from 'lucide-react';
import { db } from '../firebase';
import SeoHead from './SeoHead';
import { useTranslation } from 'react-i18next';
import { seoCopy, seoLang, SEO_LANGS } from '../data/seo';

import priceIndex from '../data/seo/price-index';
const { MIN_SAMPLE } = priceIndex;

const CURRENT_YEAR = new Date().getFullYear();

const nzd = (n) => `$${Math.round(n).toLocaleString('en-NZ')}`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PriceIndexPage() {
  const { t, i18n } = useTranslation();
  const lang = seoLang(i18n.language);
  const T = seoCopy(i18n.language).prices;
  const C = seoCopy(i18n.language).common;
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [observedAt, setObservedAt] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const href = (path) => lang === 'fr' ? `${path}?lang=fr` : path;

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'vans'));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setVans(list);
        setObservedAt(new Date().toISOString());
      } catch (e) {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => priceIndex.calculate(vans, T, lang), [vans, T, lang]);
  const dataset = observedAt && priceIndex.dataset(stats, T, lang, observedAt);

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
      {dataset && <script type="application/ld+json">{JSON.stringify(dataset)}</script>}

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
              {loadError ? T.error : T.empty}
            </p>
          )}
        </div>
      </section>

      {stats && (
        <div className="max-w-5xl mx-auto px-5 py-12 space-y-12">
          <p className="text-sm text-slate-500">{T.observed}: <time dateTime={observedAt}>{new Date(observedAt).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-NZ', { timeZone: 'Pacific/Auckland' })} NZ</time></p>
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

          <section><h2 className="text-2xl font-bold mb-5">{C.faqTitle}</h2>{faqs.map(({ q, a }) => <details key={q} className="border-b border-slate-200 py-4"><summary className="font-bold cursor-pointer">{q}</summary><p className="pt-3 text-slate-600 leading-relaxed">{a}</p></details>)}</section>
          <Link className="inline-flex font-bold text-emerald-700 underline" to={href('/guide/buying-campervan-nz')}>{T.guideBuy}</Link>

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
                to={href('/sell')}
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition"
              >
                {T.sellMy} <ArrowRight size={18} />
              </Link>
              <Link
                to={href('/')}
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
