import React, { useState, useMemo, useEffect } from 'react';

// Depreciation parameters configuration
const CONFIG = {
  depreciationPerMonth: 2,
  depreciationPerKmBlock: 150,
  kmBlockSize: 5000,
  conditionMultipliers: {
    excellent: 1.0,
    good: 0.92,
    fair: 0.80,
    poor: 0.65,
  },
};

// 💱 Currency configuration
const CURRENCIES = {
  NZD: { symbol: '$', code: 'NZD', flag: '🇳🇿', rate: 1 },
  EUR: { symbol: '€', code: 'EUR', flag: '🇪🇺', rate: 0.54 },
  USD: { symbol: '$', code: 'USD', flag: '🇺🇸', rate: 0.59 },
  AUD: { symbol: '$', code: 'AUD', flag: '🇦🇺', rate: 0.92 },
  GBP: { symbol: '£', code: 'GBP', flag: '🇬🇧', rate: 0.47 },
};

// 🌐 Traductions EN/FR
const translations = {
  en: {
    badge: 'Buyback Calculator',
    title: 'Estimate your',
    titleHighlight: 'buyback price',
    subtitle: 'Calculate how much you could get back at the end of your New Zealand adventure',
    labelPrice: '💰 Van purchase price',
    labelDuration: '📅 Trip duration',
    labelKilometers: '🛣️ Kilometers driven',
    labelCondition: '🔍 Vehicle condition on return',
    weeks: 'Weeks',
    months: 'Months',
    calculateBtn: 'Calculate buyback price',
    resultTitle: 'Estimated buyback price',
    resultRecovered: 'of purchase price recovered',
    breakdownTitle: 'Calculation breakdown',
    initialPrice: 'Initial purchase price',
    timeDepreciation: 'Time depreciation',
    mileageDepreciation: 'Mileage depreciation',
    conditionAdjustment: 'Condition adjustment',
    estimatedPrice: 'Estimated buyback price',
    disclaimer: 'This calculation is based on standard parameters. The final buyback price may vary depending on the mechanical condition of the vehicle, current market conditions, and specific seller terms.',
    disclaimerTitle: '⚠️ Estimate only:',
    newCalculation: 'New calculation',
    poweredBy: 'Powered by',
    monthsLabel: 'months',
    currency: 'Currency',
    conditions: {
      excellent: { label: 'Excellent', description: 'Like new, no damage' },
      good: { label: 'Good', description: 'Normal wear, well maintained' },
      fair: { label: 'Fair', description: 'Visible wear, minor issues' },
      poor: { label: 'Poor', description: 'Damage or repairs needed' },
    }
  },
  fr: {
    badge: 'Calculateur Buyback',
    title: 'Estimez votre',
    titleHighlight: 'prix de rachat',
    subtitle: 'Calculez combien vous pourriez récupérer à la fin de votre aventure en Nouvelle-Zélande',
    labelPrice: '💰 Prix d\'achat du van',
    labelDuration: '📅 Durée du voyage',
    labelKilometers: '🛣️ Kilomètres parcourus',
    labelCondition: '🔍 État du véhicule au retour',
    weeks: 'Semaines',
    months: 'Mois',
    calculateBtn: 'Calculer le prix de rachat',
    resultTitle: 'Prix de rachat estimé',
    resultRecovered: 'du prix d\'achat récupéré',
    breakdownTitle: 'Détail du calcul',
    initialPrice: 'Prix d\'achat initial',
    timeDepreciation: 'Dépréciation temps',
    mileageDepreciation: 'Dépréciation kilométrage',
    conditionAdjustment: 'Ajustement état',
    estimatedPrice: 'Prix de rachat estimé',
    disclaimer: 'Ce calcul est une estimation basée sur des paramètres standards. Le prix final de rachat peut varier selon l\'état mécanique du véhicule, le marché actuel, et les conditions spécifiques de chaque vendeur.',
    disclaimerTitle: '⚠️ Estimation indicative :',
    newCalculation: 'Nouveau calcul',
    poweredBy: 'Propulsé par',
    monthsLabel: 'mois',
    currency: 'Devise',
    conditions: {
      excellent: { label: 'Excellent', description: 'Comme neuf, aucun dégât' },
      good: { label: 'Bon état', description: 'Usure normale, bien entretenu' },
      fair: { label: 'Correct', description: 'Usure visible, petits défauts' },
      poor: { label: 'Usé', description: 'Dégâts ou réparations nécessaires' },
    }
  }
};

export default function BuybackCalculator() {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('weeks');
  const [kilometers, setKilometers] = useState('');
  const [condition, setCondition] = useState('good');
  const [showResult, setShowResult] = useState(false);
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('NZD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // 🌐 Détecter la langue depuis le cookie Google Translate
  useEffect(() => {
    const detectLanguage = () => {
      const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
      if (match && match[1] === 'fr') {
        setLang('fr');
      } else {
        setLang('en');
      }
    };
    
    detectLanguage();
    const interval = setInterval(detectLanguage, 1000);
    return () => clearInterval(interval);
  }, []);

  // 💱 Charger la devise sauvegardée
  useEffect(() => {
    const savedCurrency = localStorage.getItem('kiwivanmarket_currency');
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setCurrency(savedCurrency);
    }
  }, []);

  const t = translations[lang];
  const currentCurrency = CURRENCIES[currency];
  
  const conditionLabels = {
    excellent: { ...t.conditions.excellent, emoji: '✨' },
    good: { ...t.conditions.good, emoji: '👍' },
    fair: { ...t.conditions.fair, emoji: '👌' },
    poor: { ...t.conditions.poor, emoji: '🔧' },
  };

  // 💱 Convertir un montant de la devise actuelle vers NZD (pour calcul interne)
  const toNZD = (amount) => {
    return amount / currentCurrency.rate;
  };

  // 💱 Convertir un montant NZD vers la devise sélectionnée (pour affichage)
  const fromNZD = (nzdAmount) => {
    return Math.round(nzdAmount * currentCurrency.rate);
  };

  // 💱 Formater un prix avec la devise (montant déjà dans la devise actuelle)
  const formatPrice = (amount) => {
    return `${Math.round(amount).toLocaleString()} ${currentCurrency.symbol}`;
  };

  // 💱 Formater un prix NZD converti vers la devise actuelle
  const formatPriceFromNZD = (nzdAmount) => {
    const converted = fromNZD(nzdAmount);
    return `${converted.toLocaleString()} ${currentCurrency.symbol}`;
  };

  const calculation = useMemo(() => {
    const priceInUserCurrency = parseFloat(purchasePrice) || 0;
    const dur = parseFloat(duration) || 0;
    const km = parseFloat(kilometers) || 0;

    if (priceInUserCurrency <= 0) return null;

    // Convertir le prix en NZD pour le calcul
    const priceNZD = toNZD(priceInUserCurrency);

    const months = durationUnit === 'weeks' ? dur / 4.33 : dur;
    const timeDepreciation = Math.min(months * CONFIG.depreciationPerMonth, 50) / 100;
    const kmBlocks = Math.floor(km / CONFIG.kmBlockSize);
    const kmDepreciationNZD = kmBlocks * CONFIG.depreciationPerKmBlock;
    const conditionMultiplier = CONFIG.conditionMultipliers[condition];
    const priceAfterTimeNZD = priceNZD * (1 - timeDepreciation);
    const priceAfterKmNZD = Math.max(priceAfterTimeNZD - kmDepreciationNZD, priceNZD * 0.3);
    const finalPriceNZD = Math.max(priceAfterKmNZD * conditionMultiplier, priceNZD * 0.2);
    const percentageRecovered = (finalPriceNZD / priceNZD) * 100;

    // Reconvertir les montants dans la devise de l'utilisateur pour l'affichage
    return {
      originalPrice: priceInUserCurrency, // Prix original tel qu'entré par l'utilisateur
      timeDepreciationPercent: timeDepreciation * 100,
      timeDepreciationAmount: priceInUserCurrency * timeDepreciation, // En devise utilisateur
      kmDepreciation: fromNZD(kmDepreciationNZD), // Converti en devise utilisateur
      conditionMultiplier,
      conditionAdjustment: fromNZD(priceAfterKmNZD * (1 - conditionMultiplier)), // Converti
      finalPrice: fromNZD(finalPriceNZD), // Prix final converti
      percentageRecovered: Math.round(percentageRecovered),
      months: months.toFixed(1),
    };
  }, [purchasePrice, duration, durationUnit, kilometers, condition, currentCurrency]);

  const handleCalculate = () => {
    if (purchasePrice && duration && kilometers) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setPurchasePrice('');
    setDuration('');
    setKilometers('');
    setCondition('good');
    setShowResult(false);
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('kiwivanmarket_currency', newCurrency);
    setShowCurrencyDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-emerald-50 to-stone-100 py-12 px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-700 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {t.badge}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-3" style={{ fontFamily: 'system-ui' }}>
            {t.title} <span className="text-emerald-700">{t.titleHighlight}</span>
          </h1>
          <p className="text-stone-600 max-w-md mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200/50 overflow-hidden">
          {/* Form Section */}
          <div className="p-6 md:p-8 space-y-6">
            
            {/* 💱 Currency Selector */}
            <div className="flex justify-end">
              <div className="relative">
                <button
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl transition text-stone-700 text-sm font-medium border border-stone-200"
                >
                  <span>{currentCurrency.flag}</span>
                  <span>{currentCurrency.code}</span>
                  <svg className={`w-4 h-4 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCurrencyDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowCurrencyDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-stone-200 py-2 min-w-[140px] z-20">
                      {Object.entries(CURRENCIES).map(([code, curr]) => (
                        <button
                          key={code}
                          onClick={() => handleCurrencyChange(code)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                            currency === code
                              ? 'bg-emerald-50 text-emerald-700 font-semibold'
                              : 'hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <span>{curr.flag}</span>
                          <span>{code}</span>
                          <span className="text-stone-400 ml-auto">{curr.symbol}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                {t.labelPrice}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">{currentCurrency.symbol}</span>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => {
                    setPurchasePrice(e.target.value);
                    // ✅ FIX: Permettre le recalcul en temps réel
                    if (showResult) setShowResult(false);
                  }}
                  placeholder="8500"
                  className="w-full pl-10 pr-16 py-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl text-stone-800 font-medium placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">{currentCurrency.code}</span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                {t.labelDuration}
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    if (showResult) setShowResult(false);
                  }}
                  placeholder="12"
                  className="flex-1 px-4 py-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl text-stone-800 font-medium placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <select
                  value={durationUnit}
                  onChange={(e) => {
                    setDurationUnit(e.target.value);
                    if (showResult) setShowResult(false);
                  }}
                  className="px-4 py-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl text-stone-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="weeks">{t.weeks}</option>
                  <option value="months">{t.months}</option>
                </select>
              </div>
            </div>

            {/* Kilometers */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                {t.labelKilometers}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={kilometers}
                  onChange={(e) => {
                    setKilometers(e.target.value);
                    if (showResult) setShowResult(false);
                  }}
                  placeholder="15000"
                  className="w-full px-4 py-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl text-stone-800 font-medium placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">km</span>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">
                {t.labelCondition}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(conditionLabels).map(([key, { label, description, emoji }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setCondition(key);
                      if (showResult) setShowResult(false);
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      condition === key
                        ? 'border-emerald-500 bg-emerald-50 shadow-md'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{emoji}</span>
                      <span className={`font-semibold ${condition === key ? 'text-emerald-700' : 'text-stone-700'}`}>
                        {label}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              disabled={!purchasePrice || !duration || !kilometers}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-stone-300 disabled:to-stone-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 disabled:shadow-none transition-all transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {t.calculateBtn}
            </button>
          </div>

          {/* Results Section */}
          {showResult && calculation && (
            <div className="border-t-2 border-dashed border-stone-200 bg-gradient-to-b from-emerald-50/50 to-white p-6 md:p-8">
              {/* Main Result */}
              <div className="text-center mb-8">
                <p className="text-sm text-stone-500 mb-2">{t.resultTitle}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl md:text-6xl font-bold text-emerald-700">
                    {formatPrice(calculation.finalPrice)}
                  </span>
                  <span className="text-stone-400 text-lg">{currentCurrency.code}</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {calculation.percentageRecovered}% {t.resultRecovered}
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6">
                <h3 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t.breakdownTitle}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">{t.initialPrice}</span>
                    <span className="font-semibold text-stone-800">{formatPrice(calculation.originalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-700">
                    <span>{t.timeDepreciation} ({calculation.months} {t.monthsLabel})</span>
                    <span className="font-medium">- {formatPrice(Math.round(calculation.timeDepreciationAmount))}</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-700">
                    <span>{t.mileageDepreciation} ({kilometers} km)</span>
                    <span className="font-medium">- {formatPrice(calculation.kmDepreciation)}</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-700">
                    <span>{t.conditionAdjustment} ({conditionLabels[condition].label})</span>
                    <span className="font-medium">- {formatPrice(Math.round(calculation.conditionAdjustment))}</span>
                  </div>
                  <div className="border-t border-stone-200 pt-3 flex justify-between items-center">
                    <span className="font-bold text-stone-800">{t.estimatedPrice}</span>
                    <span className="font-bold text-emerald-700 text-lg">{formatPrice(calculation.finalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>{t.disclaimerTitle}</strong> {t.disclaimer}
                </p>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full py-3 border-2 border-stone-300 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors"
              >
                {t.newCalculation}
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-stone-500">
            {t.poweredBy} <span className="font-semibold text-emerald-700">Kiwi Van Market</span> 🥝
          </p>
        </div>
      </div>
    </div>
  );
}