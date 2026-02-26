import React, { useState, useMemo, useEffect } from 'react';
import SeoHead from './SeoHead';
import { CURRENCIES } from './CurrencySelector';

// Depreciation parameters configuration
const CONFIG = {
  depreciationPerMonth: 2.2, // Base monthly depreciation
  kmBlockSize: 5000,
  depreciationPerKmBlock: 120, // Depreciation per 5000km
  maintenanceBase: 250, // Standard maintenance cost (NZD)
  seasonalFactors: {
    summer: 1.05, // Dec - Feb: Resale is higher
    standard: 0.95, // Shoulder seasons
    winter: 0.85,  // May - Aug: Resale is lower
  },
  conditionMultipliers: {
    excellent: 1.0,
    good: 0.95,
    fair: 0.82,
    poor: 0.65,
  },
  avgRentalPriceDay: 110, // Average cost to rent a similar van in NZD
};

// 🌐 Traductions EN/FR
const translations = {
  en: {
    badge: 'Premium Buyback Tool',
    title: 'Smart Buyback',
    titleHighlight: 'Calculator',
    subtitle: 'A professional estimation based on NZ market seasonality and real-time depreciation.',

    // Inputs
    labelPrice: '💰 Purchase Price',
    labelDuration: '📅 Trip Duration',
    labelKilometers: '🛣️ Distance Driven',
    labelCondition: '🔍 Condition on Return',
    labelSeason: '☀️ Sale Season',

    // Units
    weeks: 'Weeks',
    months: 'Months',
    estimateBtn: 'Generate Professional Report',

    // Results
    resultTitle: 'Projected Resale Value',
    percentageRecovered: 'Money Recovered',
    breakdownTitle: 'Market Breakdown',
    comparativeTitle: 'Rent vs Buy Comparison',

    // Table items
    initialPrice: 'Initial Investment',
    marketDepreciation: 'Market Depreciation',
    mileageImpact: 'Mileage Impact',
    seasonalAdjustment: 'Seasonal Factor',
    maintenanceReserve: 'Maintenance Reserve',
    buybackTotal: 'Final Buyback Price',

    // Rent vs Buy
    rentCost: 'Cost to Rent',
    buybackSaving: 'Total Saved by Buying',
    savingLabel: 'You save',
    perDay: 'per day',

    // Context
    seasons: {
      summer: { label: 'Summer (High Demand)', icon: '☀️' },
      standard: { label: 'Shoulder Season', icon: '⛅' },
      winter: { label: 'Winter (Low Demand)', icon: '❄️' }
    },
    conditions: {
      excellent: { label: 'Mint', desc: 'No damage, clean history' },
      good: { label: 'Normal', desc: 'Typical travel wear' },
      fair: { label: 'Worn', desc: 'Visible cosmetic issues' },
      poor: { label: 'Damaged', desc: 'Mechanical/body work needed' }
    },
    disclaimer: 'This estimation uses real-world NZ market data but remains indicative. Prices fluctuate based on model popularity and mechanical WOF checks.',
    currency: 'Currency'
  },
  fr: {
    badge: 'Outil Buyback Premium',
    title: 'Calculateur',
    titleHighlight: 'Buyback Intelligent',
    subtitle: 'Une estimation professionnelle basée sur la saisonnalité du marché NZ et la dépréciation réelle.',

    // Inputs
    labelPrice: '💰 Prix d\'Achat',
    labelDuration: '📅 Durée du Voyage',
    labelKilometers: '🛣️ Distance Parcourue',
    labelCondition: '🔍 État au Retour',
    labelSeason: '☀️ Saison de Vente',

    // Units
    weeks: 'Semaines',
    months: 'Mois',
    estimateBtn: 'Générer le Rapport',

    // Results
    resultTitle: 'Valeur de Revente Projetée',
    percentageRecovered: 'Capital Récupéré',
    breakdownTitle: 'Détail du Marché',
    comparativeTitle: 'Comparatif Achat vs Location',

    // Table items
    initialPrice: 'Investissement Initial',
    marketDepreciation: 'Dépréciation du Marché',
    mileageImpact: 'Impact Kilométrage',
    seasonalAdjustment: 'Ajustement Saisonnier',
    maintenanceReserve: 'Réserve Entretien',
    buybackTotal: 'Prix de Rachat Final',

    // Rent vs Buy
    rentCost: 'Coût en Location',
    buybackSaving: 'Économie Totale (Achat)',
    savingLabel: 'Vous économisez',
    perDay: 'par jour',

    // Context
    seasons: {
      summer: { label: 'Été (Forte Demande)', icon: '☀️' },
      standard: { label: 'Intersaison', icon: '⛅' },
      winter: { label: 'Hiver (Basse Demande)', icon: '❄️' }
    },
    conditions: {
      excellent: { label: 'Impeccable', desc: 'État neuf, historique clair' },
      good: { label: 'Normal', desc: 'Usure de voyage classique' },
      fair: { label: 'Fatigué', desc: 'Défauts esthétiques visibles' },
      poor: { label: 'Abîmé', desc: 'Réparations nécessaires' }
    },
    disclaimer: 'Cette estimation utilise des données réelles du marché NZ mais reste indicative. Les prix fluctuent selon la popularité du modèle.',
    currency: 'Devise'
  }
};

export default function BuybackCalculator({ isEmbedded = false }) {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('months');
  const [kilometers, setKilometers] = useState('');
  const [condition, setCondition] = useState('good');
  const [season, setSeason] = useState('standard');
  const [showResult, setShowResult] = useState(false);
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('NZD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // 🌐 Detect language
  useEffect(() => {
    const detectLanguage = () => {
      const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
      if (match && match[1] === 'fr') setLang('fr');
      else setLang('en');
    };
    detectLanguage();
    const interval = setInterval(detectLanguage, 2000);
    return () => clearInterval(interval);
  }, []);

  // 🔄 Sync currency
  useEffect(() => {
    const saved = localStorage.getItem('kiwivanmarket_currency') || 'NZD';
    setCurrency(saved);

    const handleGlobalChange = (e) => {
      if (e.detail && CURRENCIES[e.detail]) setCurrency(e.detail);
    };
    window.addEventListener('currencyChange', handleGlobalChange);
    return () => window.removeEventListener('currencyChange', handleGlobalChange);
  }, []);

  const t = translations[lang];
  const curr = CURRENCIES[currency] || CURRENCIES.NZD;

  const calculation = useMemo(() => {
    const priceUser = parseFloat(purchasePrice) || 0;
    const durOrig = parseFloat(duration) || 0;
    const km = parseFloat(kilometers) || 0;

    if (priceUser <= 0 || durOrig <= 0) return null;

    // Internal calculation always in NZD
    const priceNZD = priceUser / curr.rate;
    const totalDays = durationUnit === 'weeks' ? durOrig * 7 : durOrig * 30.44;
    const totalMonths = totalDays / 30.44;

    // 1. Time Depreciation
    const timeDeprecRate = (totalMonths * CONFIG.depreciationPerMonth) / 100;
    const priceAfterTime = priceNZD * (1 - timeDeprecRate);

    // 2. Mileage Depreciation
    const kmBlocks = km / CONFIG.kmBlockSize;
    const kmDeprec = kmBlocks * CONFIG.depreciationPerKmBlock;
    const priceAfterKm = priceAfterTime - kmDeprec;

    // 3. Condition & Seasonality
    const seasonalFactor = CONFIG.seasonalFactors[season];
    const conditionFactor = CONFIG.conditionMultipliers[condition];

    let finalNZD = priceAfterKm * conditionFactor * seasonalFactor;

    // 4. Maintenance Reserve
    finalNZD = Math.max(finalNZD - CONFIG.maintenanceBase, priceNZD * 0.2);

    const percentage = (finalNZD / priceNZD) * 100;

    // 5. Rent vs Buy Logic
    const totalRentCostNZD = totalDays * CONFIG.avgRentalPriceDay;
    const netCostOfOwnershipNZD = priceNZD - finalNZD;
    const totalSavedNZD = totalRentCostNZD - netCostOfOwnershipNZD;

    return {
      resalePrice: finalNZD * curr.rate,
      percentage: Math.round(percentage),
      timeDeprec: (priceNZD - priceAfterTime) * curr.rate,
      kmDeprec: kmDeprec * curr.rate,
      maintReserve: CONFIG.maintenanceBase * curr.rate,
      rentCost: totalRentCostNZD * curr.rate,
      netCost: netCostOfOwnershipNZD * curr.rate,
      totalSaved: totalSavedNZD * curr.rate,
      savingPerDay: (totalSavedNZD / totalDays) * curr.rate,
      days: Math.round(totalDays)
    };
  }, [purchasePrice, duration, durationUnit, kilometers, condition, season, currency]);

  return (
    <div className={isEmbedded ? "py-4" : "min-h-screen bg-slate-50 py-12 px-4"}>
      {!isEmbedded && (
        <SeoHead
          title={lang === 'fr' ? 'Calculateur Buyback Premium NZ' : 'Premium NZ Buyback Calculator'}
          description="Estimate resale value of your campervan with real market seasonality and professional data."
        />
      )}

      <div className="max-w-4xl mx-auto">
        {!isEmbedded && (
          <div className="text-center mb-12">
            <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 inline-block shadow-sm">
              {t.badge}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              {t.title} <span className="text-emerald-600 italic">{t.titleHighlight}</span>
            </h1>
            <p className="text-slate-500 max-w-lg mx-auto font-medium">
              {t.subtitle}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Inputs Section */}
          <div className="lg:col-span-12 bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/60 border border-slate-100">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">

              {/* Price & Currency */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-tighter">{t.labelPrice}</label>
                  <button
                    onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                    className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition-colors uppercase"
                  >
                    {currency} ▾
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">{curr.symbol}</span>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => { setPurchasePrice(e.target.value); setShowResult(false); }}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                    placeholder="12000"
                  />
                  {showCurrencyDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      {Object.entries(CURRENCIES).map(([code, c]) => (
                        <button
                          key={code}
                          onClick={() => { setCurrency(code); localStorage.setItem('kiwivanmarket_currency', code); setShowCurrencyDropdown(false); }}
                          className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700"
                        >
                          <span>{code}</span>
                          <span className="text-slate-400">{c.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-tighter mb-3">{t.labelDuration}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => { setDuration(e.target.value); setShowResult(false); }}
                    className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                    placeholder="4"
                  />
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 outline-none hover:border-slate-300 transition-all"
                  >
                    <option value="weeks">{t.weeks}</option>
                    <option value="months">{t.months}</option>
                  </select>
                </div>
              </div>

              {/* Kilometers */}
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-tighter mb-3">{t.labelKilometers}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={kilometers}
                    onChange={(e) => { setKilometers(e.target.value); setShowResult(false); }}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                    placeholder="10000"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">km</span>
                </div>
              </div>

              {/* Season Selection */}
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-tighter mb-3">{t.labelSeason}</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(t.seasons).map(([key, s]) => (
                    <button
                      key={key}
                      onClick={() => { setSeason(key); setShowResult(false); }}
                      className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${season === key ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                    >
                      <span className="text-xl mb-1">{s.icon}</span>
                      <span className="text-[9px] font-black uppercase text-center leading-none">{s.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-slate-700 uppercase tracking-tighter mb-3">{t.labelCondition}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(t.conditions).map(([key, cond]) => (
                    <button
                      key={key}
                      onClick={() => { setCondition(key); setShowResult(false); }}
                      className={`px-4 py-3 rounded-2xl border-2 text-left transition-all ${condition === key ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/10' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="text-sm font-black text-slate-800 mb-0.5">{cond.label}</div>
                      <div className="text-[9px] text-slate-500 leading-none">{cond.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 mt-4">
              <button
                onClick={() => setShowResult(true)}
                disabled={!purchasePrice || !duration}
                className="w-full bg-slate-900 hover:bg-emerald-700 disabled:bg-slate-200 text-white py-5 rounded-3xl font-black text-lg tracking-wider shadow-2xl transition-all active:scale-95 disabled:cursor-not-allowed group"
              >
                {t.estimateBtn}
                <span className="ml-3 group-hover:translate-x-1 inline-block transition-transform">→</span>
              </button>
            </div>
          </div>

          {/* Results Section */}
          {showResult && calculation && (
            <div className="lg:col-span-12 grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">

              {/* Main Resale Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-110" />

                <div className="relative z-10">
                  <h3 className="text-emerald-100 font-bold text-sm uppercase tracking-widest mb-2">{t.resultTitle}</h3>
                  <div className="flex items-baseline gap-3 mb-8">
                    <span className="text-6xl font-black tabular-nums">{Math.round(calculation.resalePrice).toLocaleString()}</span>
                    <span className="text-2xl font-bold opacity-70">{curr.code}</span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold opacity-90">{t.percentageRecovered}</span>
                      <span className="text-2xl font-black">{calculation.percentage}%</span>
                    </div>
                    <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${calculation.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 space-y-4 text-emerald-50">
                  <div className="flex justify-between text-sm">
                    <span>{t.initialPrice}</span>
                    <span className="font-bold">{Math.round(calculation.resalePrice + calculation.netCost).toLocaleString()} {curr.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t.marketDepreciation}</span>
                    <span className="text-red-200">-{Math.round(calculation.timeDeprec).toLocaleString()} {curr.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t.maintenanceReserve}</span>
                    <span className="text-amber-200">-{Math.round(calculation.maintReserve).toLocaleString()} {curr.code}</span>
                  </div>
                </div>
              </div>

              {/* Savings Card (Rent vs Buy) */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-6">{t.comparativeTitle}</h3>

                  <div className="flex-1 space-y-8">
                    <div>
                      <p className="text-slate-500 text-xs font-black uppercase mb-1">{t.rentCost} ({calculation.days}d)</p>
                      <p className="text-3xl font-bold text-slate-300 line-through decoration-red-500/50 opacity-50">
                        {Math.round(calculation.rentCost).toLocaleString()} {curr.code}
                      </p>
                    </div>

                    <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-[2rem] p-6">
                      <p className="text-emerald-400 text-xs font-black uppercase mb-2">🔥 {t.savingLabel}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-emerald-400">{Math.round(calculation.totalSaved).toLocaleString()}</span>
                        <span className="text-xl font-bold text-emerald-500/60">{curr.code}</span>
                      </div>
                      <p className="text-emerald-500/80 text-sm font-bold mt-2">
                        ≈ {Math.round(calculation.savingPerDay).toLocaleString()} {curr.code} {t.perDay}
                      </p>
                    </div>
                  </div>

                  <p className="mt-8 text-[10px] text-slate-500 leading-relaxed italic border-l-2 border-slate-800 pl-4">
                    {t.disclaimer}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
