import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Award, Landmark, Zap, Info } from 'lucide-react';
import SeoHead from './SeoHead';
import { CURRENCIES } from './CurrencySelector';

const CURRENT_YEAR = new Date().getFullYear();

// Professional Valuation Parameters - NZ Specific
const CONFIG = {
  brands: {
    toyota: { name: 'Toyota (Hiace/Estima)', factor: 1.08, reliability: 5 },
    mazda: { name: 'Mazda (Bongo/E2000)', factor: 1.02, reliability: 4 },
    nissan: { name: 'Nissan (Caravan/Serena)', factor: 0.98, reliability: 4 },
    mitsubishi: { name: 'Mitsubishi (L300/Delica)', factor: 1.05, reliability: 4 },
    other: { name: 'Generic / Other', factor: 0.85, reliability: 3 },
  },
  scStatus: {
    blue: { multiplier: 1.12 },
    green: { multiplier: 1.05 },
    none: { multiplier: 0.9 },
  },
  serviceHistory: {
    full: { multiplier: 1.08 },
    partial: { multiplier: 1.02 },
    none: { multiplier: 0.95 },
  },
  equipment: {
    basic: { multiplier: 1.0 },
    premium: { multiplier: 1.15 },
  },
  seasons: {
    summer: { multiplier: 1.1 },
    winter: { multiplier: 0.9 },
  },
  marketTrends: {
    exceptional: { multiplier: 1.15 },
    standard: { multiplier: 1.0 },
    slow: { multiplier: 0.85 },
  },
  baseDepreciation: 1.6,
  kmDepreciationRate: 0.02,
  maintenanceBase: 250,
  rentalDayCost: 115,
};

const translations = {
  en: {
    title: 'Buyback Appraisal',
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
    title: 'Estimation Buyback',
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
    title: 'Estimación Buyback',
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

  // Language follows the site (react-i18next), not the old googtrans cookie
  const code = (i18n.language || 'en').slice(0, 2);
  const lang = translations[code] ? code : 'en';
  const t = translations[lang];
  const curr = CURRENCIES[currency] || CURRENCIES.NZD;

  // Currency follows the site-wide selector
  useEffect(() => {
    const handler = (e) => setCurrency(e.detail);
    window.addEventListener('currencyChange', handler);
    return () => window.removeEventListener('currencyChange', handler);
  }, []);

  const calculation = useMemo(() => {
    const priceUser = parseFloat(purchasePrice) || 0;
    const durOrig = parseFloat(duration) || 0;
    const km = parseFloat(kilometers) || 0;
    const yr = parseInt(year) || 2000;

    if (priceUser <= 0 || durOrig <= 0) return null;

    const priceNZD = priceUser / curr.rate;
    const totalDays = durOrig * 30.44;

    const ageFactor = Math.max(0.7, 1 - (CURRENT_YEAR - yr) * 0.015);
    let resaleNZD = priceNZD;

    const depRate = CONFIG.baseDepreciation * ageFactor;
    resaleNZD *= (1 - (durOrig * depRate) / 100);

    resaleNZD -= (km / 1000) * (priceNZD * CONFIG.kmDepreciationRate / 20);

    // Advanced Factors Multipliers
    const brandData = CONFIG.brands[brand];
    const trendData = CONFIG.marketTrends[trend];
    const scData = CONFIG.scStatus[sc];
    const historyData = CONFIG.serviceHistory[history];
    const equipData = CONFIG.equipment[equip];
    const seasonData = CONFIG.seasons[season];

    resaleNZD *= brandData.factor;
    resaleNZD *= trendData.multiplier;
    resaleNZD *= scData.multiplier;
    resaleNZD *= historyData.multiplier;
    resaleNZD *= equipData.multiplier;
    resaleNZD *= seasonData.multiplier;

    resaleNZD -= CONFIG.maintenanceBase;

    resaleNZD = Math.max(resaleNZD, priceNZD * 0.45);
    resaleNZD = Math.min(resaleNZD, priceNZD * 0.98);

    const ownerCost = priceNZD - resaleNZD;
    const totalRentCost = totalDays * CONFIG.rentalDayCost;

    return {
      resalePrice: resaleNZD * curr.rate,
      percentage: Math.round((resaleNZD / priceNZD) * 100),
      totalSaved: (totalRentCost - ownerCost) * curr.rate,
      dailyNet: (ownerCost / totalDays) * curr.rate,
      brandReliability: brandData.reliability,
      trendImpact: Math.round((trendData.multiplier - 1) * 100),
      equipImpact: Math.round((equipData.multiplier - 1) * 100),
    };
  }, [purchasePrice, duration, kilometers, year, brand, trend, sc, history, equip, season, curr.rate]);

  return (
    <div className={isEmbedded ? 'w-full py-4 md:py-8' : 'min-h-screen bg-[#FDFDFD] text-slate-800 py-8 md:py-16 px-4'}>
      {!isEmbedded && (
        <SeoHead
          title={lang === 'fr' ? 'Estimation Buyback KiwiVan' : lang === 'es' ? 'Estimación Buyback KiwiVan' : 'KiwiVan Buyback Appraisal'}
          description="New Zealand campervan resale value estimator."
        />
      )}

      {/* Cinematic Background Layer */}
      {!isEmbedded && (
        <>
          <div className="fixed inset-0 z-0 overflow-hidden">
            <img
              src="/nz-road-bg.png"
              alt="NZ Road Adventure"
              className="w-full h-full object-cover opacity-[0.03] scale-105 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-white to-blue-50/20 pointer-events-none" />
          </div>

          {/* Subtle Brand Accents */}
          <div className="fixed top-0 right-0 w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] pointer-events-none opacity-30" />
          <div className="fixed bottom-0 left-0 w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] pointer-events-none opacity-30" />
        </>
      )}

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Clean Header */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {!isEmbedded && (
                <Link to="/" className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform shrink-0">
                  <img src="/kiwi-van-logo-48.webp" className="w-8 h-8 invert brightness-0" alt="Home" />
                </Link>
              )}
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 line-clamp-1">{t.subtitle}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">
              {t.title}
            </h1>
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
                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-emerald-500/30 focus:bg-white rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 outline-none transition-all font-black text-lg md:text-xl text-slate-800"
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
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-emerald-500/30 focus:bg-white rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 outline-none transition-all font-black text-lg md:text-xl text-slate-800"
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
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 outline-none focus:border-emerald-500/30 transition-all font-black text-lg md:text-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.labels.mileage} ({t.units.km})</label>
                    <input
                      type="number"
                      value={kilometers}
                      onChange={(e) => setKilometers(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 outline-none focus:border-emerald-500/30 transition-all font-black text-lg md:text-xl"
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

              </div>
            </div>
          </div>

          {/* Results Panel - High-End Frosted Glass */}
          <div className="xl:col-span-7 relative order-1 xl:order-2">
            <div className="bg-white/60 backdrop-blur-2xl border-2 md:border-4 border-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-slate-200/50 min-h-[400px] md:min-h-[600px] relative overflow-hidden flex flex-col justify-between">

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
                      <h2 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-slate-900 line-clamp-1">
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
                        <h3 className="text-3xl md:text-5xl font-black">
                          +<AnimatedCounter value={calculation.totalSaved} symbol={curr.symbol} />
                        </h3>
                        <p className="text-emerald-200/60 text-[9px] md:text-[10px] font-bold uppercase tracking-widest italic">{t.results.comparedRenting}</p>
                      </div>
                      <div className="h-0.5 md:h-20 w-12 md:w-[2px] bg-white/10 shrink-0" />
                      <div className="space-y-1 md:space-y-2">
                        <p className="text-emerald-100 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">{t.results.dailyNet}</p>
                        <p className="text-2xl md:text-3xl font-black">
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
      </div>
    </div>
  );
}
