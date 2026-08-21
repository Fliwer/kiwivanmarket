import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Award, Landmark, Zap, Info } from 'lucide-react';
import SeoHead from './SeoHead';
import { CURRENCIES } from './CurrencySelector';

const CURRENT_YEAR = new Date().getFullYear();

// ============================================================================
// Paramètres d'estimation de revente — spécifiques au marché NZ (backpackers).
// Modèle ADDITIF : on part de 100 % du prix d'achat (le "taux de récupération"),
// on retire l'usure (temps + km), puis on applique des ajustements clairs, en
// POINTS DE POURCENTAGE. Chaque facteur a donc un effet lisible et prévisible
// (contrairement à l'ancien modèle multiplicatif qui s'emballait > 1 et était
// écrasé par un plafond, rendant les réglages fins inutiles).
// ============================================================================
const CONFIG = {
  // adj = points de % ajoutés/retirés au taux de récupération.
  brands: {
    toyota: { name: 'Toyota (Hiace/Estima)', adj: 4, reliability: 5 },
    mitsubishi: { name: 'Mitsubishi (L300/Delica)', adj: 2, reliability: 4 },
    mazda: { name: 'Mazda (Bongo/E2000)', adj: 0, reliability: 4 },
    nissan: { name: 'Nissan (Caravan/Serena)', adj: -1, reliability: 4 },
    other: { name: 'Generic / Other', adj: -6, reliability: 3 },
  },
  // Self-contained : le VERT (toilettes fixes) est la norme actuelle et prend
  // de la valeur ; le BLEU est en voie de suppression → vaut moins que le vert.
  scStatus: {
    green: { adj: 6 },
    blue: { adj: 3 },
    none: { adj: -10 },
  },
  serviceHistory: {
    full: { adj: 3 },
    partial: { adj: 0 },
    none: { adj: -4 },
  },
  equipment: {
    premium: { adj: 5 },
    basic: { adj: 0 },
  },
  // Saison de REVENTE : forte demande l'été, faible l'hiver.
  seasons: {
    summer: { adj: 6 },
    winter: { adj: -6 },
  },
  marketTrends: {
    exceptional: { adj: 6 },
    standard: { adj: 0 },
    slow: { adj: -8 },
  },
  // Dépréciation mensuelle (%/mois) selon l'âge, appliquée sur la durée de
  // possession. Les vans backpackers se déprécient lentement, les plus vieux
  // (déjà bon marché) encore moins.
  monthlyDepreciation: (age) => (age >= 20 ? 1.0 : age >= 12 ? 1.3 : 1.6),
  kmWearPer: 3500,          // -1 pt de récupération par 3 500 km parcourus
  maintenancePerMonth: 45,  // réserve entretien, ajoutée au coût de possession
  rentalDayCost: 115,       // coût moyen/jour d'une location équivalente (NZD)
  retentionFloor: 45,       // plancher réaliste du taux de récupération
  retentionCeil: 93,        // plafond : on ne revend pas plus cher que le prix payé
};

const translations = {
  en: {
    title: 'Resale Estimate',
    subtitle: 'NZ Campervan Resale Estimator',
    intro: 'Get a market estimate based on New Zealand vehicle demographics, seasonal demand, and brand reliability.',
    labels: { price: 'Purchase Price', year: 'Vehicle Year', brand: 'Vehicle Brand', duration: 'Travel Duration', mileage: 'Estimated KM', sc: 'Self-Containment (NZ Standards)', history: 'Service History', equipment: 'Equipment', marketTiming: 'Market Context & Timing', season: 'Season', trend: 'Trend' },
    results: { estimatedValue: 'Estimated Resale Value', recoveryRate: 'Recovery Estimate', dailyNet: 'Net Daily Cost', totalSaved: 'Total Saving vs Renting', scStatus: 'SC Status', equipBonus: 'Equip. Bonus', nzTrend: 'NZ Trend', comparedRenting: 'Compared to renting', perDayNet: 'Per day net cost' },
    units: { months: 'mths', km: 'km' },
    empty: 'Enter a purchase price and travel duration to see your estimate.',
    footer: 'Estimate based on aggregate NZ market trends and seasonal demand. Indicative only — not a guaranteed offer.',
    options: {
      sc: { blue: 'Blue Sticker', green: 'Green Sticker', none: 'Not Self-Contained' },
      history: { full: 'Full Service History', partial: 'Partial History', none: 'No History' },
      equipment: { basic: 'Basic Build', premium: 'Premium Build' },
      seasons: { summer: 'Summer', winter: 'Winter' },
      trends: { exceptional: 'High Demand', standard: 'Healthy Market', slow: 'Slow Market' },
    },
  },
  fr: {
    title: 'Estimation de revente',
    subtitle: 'Estimateur de revente NZ',
    intro: 'Obtiens une estimation de marché basée sur le parc automobile néo-zélandais, la demande saisonnière et la fiabilité des marques.',
    labels: { price: 'Prix d\'achat', year: 'Année du van', brand: 'Marque du van', duration: 'Durée du voyage', mileage: 'Distance estimée', sc: 'Auto-suffisance (normes NZ)', history: 'Historique d\'entretien', equipment: 'Équipement', marketTiming: 'Contexte marché & saison', season: 'Saison', trend: 'Tendance' },
    results: { estimatedValue: 'Valeur de revente estimée', recoveryRate: 'Taux de récupération', dailyNet: 'Coût net journalier', totalSaved: 'Économie vs location', scStatus: 'Statut SC', equipBonus: 'Bonus équip.', nzTrend: 'Tendance NZ', comparedRenting: 'Comparé à la location', perDayNet: 'Coût net par jour' },
    units: { months: 'mois', km: 'km' },
    empty: 'Saisis un prix d\'achat et une durée de voyage pour voir l\'estimation.',
    footer: 'Estimation basée sur les tendances agrégées du marché néo-zélandais et la demande saisonnière. Indicatif seulement — ce n\'est pas une offre garantie.',
    options: {
      sc: { blue: 'Sticker bleu', green: 'Sticker vert', none: 'Non auto-suffisant' },
      history: { full: 'Historique complet', partial: 'Historique partiel', none: 'Aucun historique' },
      equipment: { basic: 'Aménagement basique', premium: 'Aménagement premium' },
      seasons: { summer: 'Été', winter: 'Hiver' },
      trends: { exceptional: 'Forte demande', standard: 'Marché sain', slow: 'Marché lent' },
    },
  },
  es: {
    title: 'Estimación de reventa',
    subtitle: 'Estimador de reventa NZ',
    intro: 'Obtén una estimación de mercado basada en el parque de vehículos de Nueva Zelanda, la demanda estacional y la fiabilidad de las marcas.',
    labels: { price: 'Precio de compra', year: 'Año del van', brand: 'Marca del van', duration: 'Duración del viaje', mileage: 'KM estimados', sc: 'Auto-contenido (normas NZ)', history: 'Historial de servicio', equipment: 'Equipamiento', marketTiming: 'Contexto de mercado y temporada', season: 'Temporada', trend: 'Tendencia' },
    results: { estimatedValue: 'Valor de reventa estimado', recoveryRate: 'Tasa de recuperación', dailyNet: 'Coste neto diario', totalSaved: 'Ahorro vs alquiler', scStatus: 'Estado SC', equipBonus: 'Bonus equip.', nzTrend: 'Tendencia NZ', comparedRenting: 'Comparado con alquilar', perDayNet: 'Coste neto por día' },
    units: { months: 'meses', km: 'km' },
    empty: 'Introduce un precio de compra y una duración de viaje para ver la estimación.',
    footer: 'Estimación basada en tendencias agregadas del mercado neozelandés y la demanda estacional. Solo indicativo — no es una oferta garantizada.',
    options: {
      sc: { blue: 'Sticker azul', green: 'Sticker verde', none: 'No auto-contenido' },
      history: { full: 'Historial completo', partial: 'Historial parcial', none: 'Sin historial' },
      equipment: { basic: 'Equipamiento básico', premium: 'Equipamiento premium' },
      seasons: { summer: 'Verano', winter: 'Invierno' },
      trends: { exceptional: 'Alta demanda', standard: 'Mercado sano', slow: 'Mercado lento' },
    },
  },
};

// Value display. Renders the formatted value directly (instant + always correct).
// A previous version relied on an animation-frame counter that could get stuck
// at 0 if the rAF loop didn't run — so we keep this simple and bulletproof.
const AnimatedCounter = ({ value, symbol = '', suffix = '' }) => {
  const safe = Number.isFinite(value) ? value : 0;
  return (
    <span className="tabular-nums transition-all duration-300">
      {symbol}{Math.round(safe).toLocaleString()}{suffix}
    </span>
  );
};

export default function BuybackCalculator({ isEmbedded = false }) {
  const { i18n } = useTranslation();
  const [purchasePrice, setPurchasePrice] = useState('12000');
  const [duration, setDuration] = useState('4');
  const [kilometers, setKilometers] = useState('10000');
  const [year, setYear] = useState('2005');
  const [brand, setBrand] = useState('toyota');
  const [trend, setTrend] = useState('standard');
  const [sc, setSc] = useState('blue');
  const [history, setHistory] = useState('full');
  const [equip, setEquip] = useState('basic');
  const [season, setSeason] = useState('summer');
  const [currency, setCurrency] = useState(() => {
    try { return localStorage.getItem('kiwivanmarket_currency') || 'NZD'; } catch { return 'NZD'; }
  });
  const [copied, setCopied] = useState(false);

  // Language follows the site (react-i18next), not the old googtrans cookie
  const code = (i18n.language || 'en').slice(0, 2);
  const lang = translations[code] ? code : 'en';
  const t = translations[lang];
  const curr = CURRENCIES[currency] || CURRENCIES.NZD;

  // Code d'intégration (widget iframe). Le lien <a> dans le snippet = backlink
  // sur le site qui l'intègre.
  const EMBED_CODE = '<iframe src="https://kiwivanmarket.com/embed/buyback-calculator" width="100%" height="760" style="border:0;border-radius:16px;max-width:900px" title="Campervan Buyback Calculator — Kiwi Van Market" loading="lazy"></iframe>\n<p>Powered by <a href="https://kiwivanmarket.com" target="_blank" rel="noopener">Kiwi Van Market</a> — buy &amp; sell campervans in New Zealand.</p>';
  const copyEmbed = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(EMBED_CODE).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  // Currency follows the site-wide selector
  useEffect(() => {
    const handler = (e) => setCurrency(e.detail);
    window.addEventListener('currencyChange', handler);
    return () => window.removeEventListener('currencyChange', handler);
  }, []);

  const calculation = useMemo(() => {
    const priceUser = parseFloat(purchasePrice) || 0;
    const durMonths = parseFloat(duration) || 0;
    const km = parseFloat(kilometers) || 0;
    const yr = parseInt(year) || 2000;

    if (priceUser <= 0 || durMonths <= 0) return null;

    const priceNZD = priceUser / curr.rate;
    const totalDays = durMonths * 30.44;
    const age = Math.max(0, CURRENT_YEAR - yr);

    // Taux de récupération, en % du prix d'achat. On part d'une base réaliste
    // (~78 % pour un van moyen) puis on ajuste selon l'usure et les facteurs.
    let retention = 78;

    // 1) Dépréciation dans le temps (durée de possession).
    retention -= CONFIG.monthlyDepreciation(age) * durMonths;

    // 2) Km ajoutés pendant le voyage (usure).
    retention -= km / CONFIG.kmWearPer;

    // 3) Ajustements de désirabilité / marché (points de %).
    retention += CONFIG.brands[brand].adj;
    retention += CONFIG.scStatus[sc].adj;
    retention += CONFIG.serviceHistory[history].adj;
    retention += CONFIG.equipment[equip].adj;
    retention += CONFIG.seasons[season].adj;
    retention += CONFIG.marketTrends[trend].adj;

    // 4) Bande réaliste (plancher / plafond).
    retention = Math.min(CONFIG.retentionCeil, Math.max(CONFIG.retentionFloor, retention));

    const resaleNZD = priceNZD * (retention / 100);

    // Coût réel de possession = perte à la revente + réserve entretien.
    const ownerCost = (priceNZD - resaleNZD) + CONFIG.maintenancePerMonth * durMonths;
    const totalRentCost = totalDays * CONFIG.rentalDayCost;

    return {
      resalePrice: resaleNZD * curr.rate,
      percentage: Math.round(retention),
      totalSaved: Math.max(0, totalRentCost - ownerCost) * curr.rate,
      dailyNet: Math.max(0, ownerCost / totalDays) * curr.rate,
      brandReliability: CONFIG.brands[brand].reliability,
      trendImpact: CONFIG.marketTrends[trend].adj,
      equipImpact: CONFIG.equipment[equip].adj,
    };
  }, [purchasePrice, duration, kilometers, year, brand, trend, sc, history, equip, season, curr.rate]);

  return (
    <div className={isEmbedded ? 'w-full py-4 md:py-8' : 'relative overflow-hidden min-h-screen bg-[#FDFDFD] text-slate-800 py-8 md:py-16 px-4'}>
      {!isEmbedded && (
        <SeoHead
          title={lang === 'fr' ? 'Estimation de revente — KiwiVan' : lang === 'es' ? 'Estimación de reventa — KiwiVan' : 'Resale Estimate — KiwiVan'}
          description="New Zealand campervan resale value estimator."
        />
      )}

      {/* Cinematic Background Layer */}
      {!isEmbedded && (
        <>
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="/nz-road-bg.png"
              alt="NZ Road Adventure"
              className="w-full h-full object-cover opacity-[0.03] scale-105 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-white to-blue-50/20 pointer-events-none" />
          </div>

          {/* Subtle Brand Accents */}
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] pointer-events-none opacity-30" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] pointer-events-none opacity-30" />
        </>
      )}

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Clean Header */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {!isEmbedded && (
                <Link to="/" className="w-10 h-10 rounded-xl bg-[#f7eedd] flex items-center justify-center shadow-lg hover:scale-110 transition-transform shrink-0 overflow-hidden">
                  <img src="/kiwi-van-logo-48.webp" className="w-8 h-8 object-contain" alt="Kiwi Van Market home" />
                </Link>
              )}
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 line-clamp-1">{t.subtitle}</span>
            </div>
            {/* h2 quand intégré dans un guide : une page ne doit avoir qu'UN h1 (SEO) */}
            {isEmbedded ? (
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                {t.title}
              </h2>
            ) : (
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">
                {t.title}
              </h1>
            )}
            <p className="text-slate-500 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
              {t.intro}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-10">

          {/* Input Panel - Clean White Card */}
          <div className="xl:col-span-5 order-2 xl:order-1">
            <div className="bg-white border-2 border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/40">
              <div className="space-y-6 md:space-y-8">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.labels.price} ({currency})</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-emerald-500/30 focus:bg-white rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 outline-none transition-all font-black text-base md:text-lg text-slate-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.labels.year}</label>
                    <input
                      type="number"
                      min="1980"
                      max={CURRENT_YEAR}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-emerald-500/30 focus:bg-white rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 outline-none transition-all font-black text-base md:text-lg text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.labels.brand}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 md:gap-3">
                    {Object.entries(CONFIG.brands).map(([key, data]) => (
                      <button
                        key={key}
                        onClick={() => setBrand(key)}
                        className={`p-2.5 md:p-3.5 rounded-lg md:rounded-xl border-2 text-[10px] md:text-[11px] font-bold transition-all ${brand === key ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {data.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.labels.duration} ({t.units.months})</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 outline-none focus:border-emerald-500/30 transition-all font-black text-base md:text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.labels.mileage} ({t.units.km})</label>
                    <input
                      type="number"
                      value={kilometers}
                      onChange={(e) => setKilometers(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 outline-none focus:border-emerald-500/30 transition-all font-black text-base md:text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.labels.sc}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.keys(CONFIG.scStatus).map((key) => (
                      <button
                        key={key}
                        onClick={() => setSc(key)}
                        className={`p-2.5 md:p-3 rounded-lg md:rounded-xl border-2 text-[10px] font-bold transition-all ${sc === key ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {t.options.sc[key]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.labels.history}</label>
                    <select
                      value={history}
                      onChange={(e) => setHistory(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl px-4 py-3 outline-none focus:border-emerald-500/30 font-bold text-sm text-slate-700 appearance-none"
                    >
                      {Object.keys(CONFIG.serviceHistory).map((key) => (
                        <option key={key} value={key}>{t.options.history[key]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.labels.equipment}</label>
                    <select
                      value={equip}
                      onChange={(e) => setEquip(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl px-4 py-3 outline-none focus:border-emerald-500/30 font-bold text-sm text-slate-700 appearance-none"
                    >
                      {Object.keys(CONFIG.equipment).map((key) => (
                        <option key={key} value={key}>{t.options.equipment[key]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.labels.marketTiming}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">{t.labels.season}</p>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        {Object.keys(CONFIG.seasons).map((key) => (
                          <button
                            key={key}
                            onClick={() => setSeason(key)}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${season === key ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                          >
                            {t.options.seasons[key]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">{t.labels.trend}</p>
                      <select
                        value={trend}
                        onChange={(e) => setTrend(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 outline-none font-bold text-[10px] text-slate-600 appearance-none"
                      >
                        {Object.keys(CONFIG.marketTrends).map((key) => (
                          <option key={key} value={key}>{t.options.trends[key]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('resale-result');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.classList.add('ring-4', 'ring-emerald-500/40');
                      setTimeout(() => el.classList.remove('ring-4', 'ring-emerald-500/40'), 1600);
                    }
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm md:text-base py-4 rounded-2xl shadow-lg shadow-emerald-200 transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  {lang === 'fr' ? 'Estimer ma revente' : lang === 'es' ? 'Estimar mi reventa' : 'Estimate my resale'}
                </button>

              </div>
            </div>
          </div>

          {/* Results Panel - High-End Frosted Glass */}
          <div className="xl:col-span-7 relative order-1 xl:order-2">
            <div id="resale-result" className="bg-white/60 backdrop-blur-2xl border-2 md:border-4 border-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-slate-200/50 min-h-[400px] md:min-h-[600px] relative overflow-hidden flex flex-col justify-between transition-shadow">

              {!calculation && (
                <div className="flex-1 flex items-center justify-center text-center px-6">
                  <p className="text-slate-400 font-medium max-w-xs">{t.empty}</p>
                </div>
              )}

              {calculation && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 md:space-y-12 h-full flex flex-col"
                >
                  {/* Hero Result */}
                  <div className="text-center md:text-left space-y-4">
                    <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full mx-auto md:mx-0">
                      <Shield size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t.results.estimatedValue}</span>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-center md:justify-start gap-2 md:gap-4">
                      <h2 className={`${isEmbedded ? 'text-4xl' : 'text-5xl sm:text-6xl md:text-8xl line-clamp-1'} font-black tracking-tighter text-slate-900 break-words`}>
                        <AnimatedCounter value={calculation.resalePrice} symbol={curr.symbol} />
                      </h2>
                      <span className="text-xl md:text-2xl font-black text-slate-300 uppercase">{curr.code}</span>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { label: t.results.recoveryRate, val: `${calculation.percentage}%`, icon: Award, color: 'emerald' },
                      { label: t.results.scStatus, val: t.options.sc[sc], icon: Shield, color: 'blue' },
                      { label: t.results.equipBonus, val: calculation.equipImpact > 0 ? `+${calculation.equipImpact}%` : `${calculation.equipImpact}%`, icon: Zap, color: 'slate' },
                      { label: t.results.nzTrend, val: calculation.trendImpact > 0 ? `+${calculation.trendImpact}%` : `${calculation.trendImpact}%`, icon: Landmark, color: 'emerald' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white border border-slate-100 p-3 md:p-5 rounded-xl md:rounded-2xl shadow-sm text-center md:text-left">
                        <item.icon size={16} className="text-emerald-500 mb-2 md:mb-3 mx-auto md:mx-0" />
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">{item.label}</p>
                        <p className="text-sm md:text-lg font-black text-slate-800 truncate">{item.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Comparison Card */}
                  <div className="bg-emerald-600 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden shadow-xl shadow-emerald-200 mt-auto">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-center md:text-left">
                      <div className="space-y-1 md:space-y-2">
                        <p className="text-emerald-100 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">{t.results.totalSaved}</p>
                        <h3 className={`${isEmbedded ? 'text-2xl' : 'text-3xl md:text-5xl'} font-black break-words`}>
                          +<AnimatedCounter value={calculation.totalSaved} symbol={curr.symbol} />
                        </h3>
                        <p className="text-emerald-200/60 text-[9px] md:text-[10px] font-bold uppercase tracking-widest italic">{t.results.comparedRenting}</p>
                      </div>
                      <div className="h-0.5 md:h-20 w-12 md:w-[2px] bg-white/10 shrink-0" />
                      <div className="space-y-1 md:space-y-2">
                        <p className="text-emerald-100 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">{t.results.dailyNet}</p>
                        <p className={`${isEmbedded ? 'text-xl' : 'text-2xl md:text-3xl'} font-black break-words`}>
                          <AnimatedCounter value={calculation.dailyNet} symbol={curr.symbol} />
                        </p>
                        <p className="text-emerald-200/60 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">{t.results.perDayNet}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Disclosure */}
                  <div className="flex items-start md:items-center gap-3 md:gap-4 text-slate-400 pt-6 md:pt-8 border-t border-slate-100 text-[10px] md:text-[11px] font-medium italic leading-relaxed">
                    <Info size={14} className="flex-shrink-0 mt-0.5 md:mt-0" />
                    <p>{t.footer}</p>
                  </div>
                </motion.div>
              )}

            </div>
          </div>

        </div>

        {isEmbedded && (
          <div className="mt-6 text-center">
            <a href="https://kiwivanmarket.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition">
              ⚡ Powered by Kiwi Van Market — {lang === 'fr' ? 'achat & vente de vans en NZ' : lang === 'es' ? 'compra y venta de vans en NZ' : 'buy & sell campervans in NZ'}
            </a>
          </div>
        )}

        {!isEmbedded && (
          <div className="mt-12 md:mt-16 bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white">
            <h2 className="text-xl md:text-2xl font-black mb-2">
              {lang === 'fr' ? 'Ajoute cette calculatrice à ton site' : lang === 'es' ? 'Añade esta calculadora a tu sitio' : 'Add this calculator to your site'}
            </h2>
            <p className="text-slate-400 text-sm mb-5">
              {lang === 'fr' ? 'Gratuit. Colle ce code dans ton blog / site vanlife (ça t\'ajoute un lien vers ton site aussi).' : lang === 'es' ? 'Gratis. Pega este código en tu blog / sitio.' : 'Free. Paste this into your vanlife blog / site.'}
            </p>
            <pre className="bg-slate-950 text-slate-300 text-[11px] md:text-xs rounded-2xl p-4 overflow-x-auto whitespace-pre-wrap break-words">{EMBED_CODE}</pre>
            <button onClick={copyEmbed} className="mt-3 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold transition">
              {copied ? (lang === 'fr' ? 'Copié ✓' : lang === 'es' ? 'Copiado ✓' : 'Copied ✓') : (lang === 'fr' ? 'Copier le code' : lang === 'es' ? 'Copiar código' : 'Copy code')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
