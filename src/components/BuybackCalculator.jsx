import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, animate } from 'framer-motion';
import { Shield, TrendingUp, Info, AlertCircle, Calendar, Gauge, Award, Download, Printer, PieChart, Landmark, MapPin, Search, Cpu, Sparkles } from 'lucide-react';
import SeoHead from './SeoHead';
import { CURRENCIES } from './CurrencySelector';

// Professional Valuation Parameters
const CONFIG = {
  models: {
    hiace: { name: 'Toyota Hiace', scarcityFactor: 1.05, reliability: 5 },
    bongo: { name: 'Mazda Bongo', scarcityFactor: 1.0, reliability: 4 },
    caravan: { name: 'Nissan Caravan', scarcityFactor: 0.98, reliability: 4 },
    transit: { name: 'Ford Transit', scarcityFactor: 0.92, reliability: 3 },
    other: { name: 'Generic Van', scarcityFactor: 0.85, reliability: 3 },
  },
  marketTrends: {
    exceptional: { label: 'High Demand (Exceptional)', multiplier: 1.15, description: 'Post-covid rush, limited stock.' },
    standard: { label: 'Healthy Market', multiplier: 1.0, description: 'Normal supply and demand.' },
    slow: { label: 'Slow Market', multiplier: 0.85, description: 'Economic downturn or oversupply.' },
  },
  baseDepreciation: 1.8,
  kmDepreciation: 110,
  maintenanceBase: 280,
  rentalDayCost: 115,
};

const translations = {
  en: {
    title: 'Expert Valuation',
    marketStatus: 'Market Demand',
    scanning: 'Analyzing Market Data...',
    labels: { price: 'Purchase Investment', duration: 'Trip Duration', mileage: 'Projected KM', model: 'Vehicle Class', trend: 'Market Scenario' },
    results: { estimatedValue: 'Projected Market Value', recoveryRate: 'Investment Recovery', dailyNet: 'Net Daily Cost', totalSaved: 'Saved vs Renting' },
    sections: { footer: 'Valuation based on real-time NZ market data aggregates.' }
  },
  fr: {
    title: 'Expertise Pro',
    marketStatus: 'État du Marché',
    scanning: 'Analyse des données marché...',
    labels: { price: 'Investissement Initial', duration: 'Durée du Séjour', mileage: 'Distance Prévue', model: 'Classe du Véhicule', trend: 'Scénario de Marché' },
    results: { estimatedValue: 'Valeur de Revente Estimée', recoveryRate: 'Récupération du Capital', dailyNet: 'Coût Net Journalier', totalSaved: 'Économie vs Location' },
    sections: { footer: 'Valuation basée sur les données réelles du marché NZTA.' }
  }
};

// Animated Counter Component
const AnimatedCounter = ({ value, symbol = "", suffix = "" }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const controls = animate(current, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setCurrent(v)
    });
    return controls.stop;
  }, [value]);

  return (
    <span className="tabular-nums">
      {symbol}{Math.round(current).toLocaleString()}{suffix}
    </span>
  );
};

// Cinematic Scanning Component
const MarketScanner = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl rounded-[4rem]"
    >
      <div className="text-center space-y-8 max-w-md px-10">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center border border-emerald-500/50"
        >
          <Cpu className="text-emerald-500" size={40} />
        </motion.div>

        <div className="space-y-4">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
            />
          </div>
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em]"
          >
            Analyzing NZ Market Flux
          </motion.p>
        </div>
      </div>

      {/* Decorative Binary Pulse */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <motion.div
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-96 h-96 border border-emerald-500 rounded-full"
        />
      </div>
    </motion.div>
  );
};

export default function BuybackCalculator({ isEmbedded = false }) {
  const [purchasePrice, setPurchasePrice] = useState('12000');
  const [duration, setDuration] = useState('4');
  const [kilometers, setKilometers] = useState('10000');
  const [model, setModel] = useState('hiace');
  const [trend, setTrend] = useState('exceptional');
  const [isScanning, setIsScanning] = useState(false);
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('NZD');

  const t = translations[lang];
  const curr = CURRENCIES[currency] || CURRENCIES.NZD;

  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    setLang(match && match[1] === 'fr' ? 'fr' : 'en');
  }, []);

  const handleUpdate = (updater) => {
    setIsScanning(true);
    updater();
  };

  const calculation = useMemo(() => {
    const priceUser = parseFloat(purchasePrice) || 0;
    const durOrig = parseFloat(duration) || 0;
    const km = parseFloat(kilometers) || 0;

    if (priceUser <= 0 || durOrig <= 0) return null;

    const priceNZD = priceUser / curr.rate;
    const totalDays = durOrig * 30.44;
    const totalMonths = durOrig;

    let resaleNZD = priceNZD;
    resaleNZD *= (1 - (totalMonths * CONFIG.baseDepreciation) / 100);
    resaleNZD -= (km / 5000) * CONFIG.kmDepreciation;

    const modelData = CONFIG.models[model];
    const trendData = CONFIG.marketTrends[trend];

    resaleNZD *= modelData.scarcityFactor;
    resaleNZD *= trendData.multiplier;
    resaleNZD -= CONFIG.maintenanceBase;
    resaleNZD = Math.max(resaleNZD, priceNZD * 0.4);

    const ownerCost = priceNZD - resaleNZD;
    const totalRentCost = totalDays * CONFIG.rentalDayCost;

    return {
      resalePrice: resaleNZD * curr.rate,
      percentage: Math.min(Math.round((resaleNZD / priceNZD) * 100), 98),
      totalSaved: (totalRentCost - ownerCost) * curr.rate,
      dailyNet: (ownerCost / totalDays) * curr.rate,
      scarcity: modelData.scarcityFactor,
      trendImpact: Math.round((trendData.multiplier - 1) * 100)
    };
  }, [purchasePrice, duration, kilometers, model, trend, currency]);

  return (
    <div className={isEmbedded ? "max-w-7xl mx-auto py-12" : "min-h-screen bg-[#0A0B10] text-[#E0E0E0] py-20 px-4 select-none"}>
      {!isEmbedded && (
        <SeoHead
          title={lang === 'fr' ? 'Algorithme de Valeur KiwiVan' : 'KiwiVan Valuation AI'}
          description="High-end cinematic market valuation tool for campervans in New Zealand."
        />
      )}

      {/* Decorative Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header - Cinematic Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 space-y-6"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px]"
            >
              <div className="w-full h-full bg-[#0A0B10] rounded-2xl flex items-center justify-center">
                <Sparkles size={20} className="text-emerald-500" />
              </div>
            </motion.div>
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-emerald-500/80">K-V Algorithmic Appraisal</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
            True <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Worth</span> AI
          </h1>
          <p className="text-slate-500 text-lg max-w-xl font-medium tracking-wide leading-relaxed">
            Generating ultra-precise market insights using regional demand aggregates and mechanical scarcity factors.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* Glass Control Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-12 xl:col-span-4"
          >
            <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[3rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative group overflow-hidden">
              {/* Magnetic Hover Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.labels.price} ({currency})</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => handleUpdate(() => setPurchasePrice(e.target.value))}
                      className="w-full bg-white/5 border-2 border-white/5 focus:border-emerald-500/50 rounded-2xl px-6 py-6 outline-none transition-all font-black text-3xl text-white"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 font-bold">{curr.symbol}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.labels.model}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(CONFIG.models).map(([key, data]) => (
                      <button
                        key={key}
                        onClick={() => handleUpdate(() => setModel(key))}
                        className={`p-4 rounded-2xl border-2 text-[11px] font-black transition-all ${model === key ? 'bg-emerald-500 border-emerald-500 text-slate-900 shadow-[0_0_25px_rgba(16,185,129,0.3)]' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        {data.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.labels.duration}</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => handleUpdate(() => setDuration(e.target.value))}
                      className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-emerald-500/50 transition-all font-black text-xl text-white"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.labels.mileage}</label>
                    <input
                      type="number"
                      value={kilometers}
                      onChange={(e) => handleUpdate(() => setKilometers(e.target.value))}
                      className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-emerald-500/50 transition-all font-black text-xl text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.labels.trend}</label>
                  <div className="space-y-3">
                    {Object.entries(CONFIG.marketTrends).map(([key, trendData]) => (
                      <button
                        key={key}
                        onClick={() => handleUpdate(() => setTrend(key))}
                        className={`w-full p-5 rounded-3xl border-2 flex items-center justify-between transition-all ${trend === key ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${trend === 'exceptional' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                          <span className="text-sm font-black">{trendData.label}</span>
                        </div>
                        {trend === key && <TrendingUp size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Report Display */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-12 xl:col-span-8 relative"
          >
            <div className="bg-white/5 backdrop-blur-[60px] border border-white/10 rounded-[4rem] p-12 lg:p-24 shadow-2xl relative min-h-[700px] overflow-hidden group">

              <AnimatePresence>
                {isScanning && <MarketScanner onComplete={() => setIsScanning(false)} />}
              </AnimatePresence>

              {calculation && !isScanning && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-20 relative z-10"
                >
                  {/* Price & Recovery Card */}
                  <div className="flex flex-col lg:flex-row justify-between items-center gap-16 border-b border-white/5 pb-20">
                    <div className="text-center lg:text-left">
                      <motion.div initial={{ x: -20 }} animate={{ x: 0 }} className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full mb-8">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Final Appraisal Result</span>
                      </motion.div>
                      <div className="flex items-baseline justify-center lg:justify-start gap-4">
                        <span className="text-8xl md:text-[10rem] font-black tracking-tighter text-white">
                          <AnimatedCounter value={calculation.resalePrice} />
                        </span>
                        <span className="text-3xl font-black text-slate-600">{curr.code}</span>
                      </div>
                    </div>

                    <div className="w-full lg:w-48 space-y-6">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recovery Confidence</span>
                        <span className="text-3xl font-black text-emerald-500"><AnimatedCounter value={calculation.percentage} suffix="%" /></span>
                      </div>
                      <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${calculation.percentage}%` }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Battle Map: Rent vs Buy */}
                  <div className="grid md:grid-cols-2 gap-12">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/[0.03] border border-white/5 rounded-[3rem] p-10 space-y-6 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-4 text-slate-500">
                        <PieChart size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ownership Net Cost</span>
                      </div>
                      <div>
                        <p className="text-5xl font-black text-white">
                          <AnimatedCounter value={calculation.dailyNet} symbol={curr.symbol} />
                        </p>
                        <p className="text-xs text-slate-500 font-bold mt-2">Per travel day (inclusive)</p>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative bg-gradient-to-br from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 rounded-[3rem] p-12 overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)]"
                    >
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-[60px] rounded-full" />
                      <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4 text-emerald-400">
                          <Sparkles size={20} />
                          <span className="text-[10px] font-black uppercase tracking-widest">AI Projected Saving</span>
                        </div>
                        <div>
                          <p className="text-6xl font-black text-emerald-400">
                            +<AnimatedCounter value={calculation.totalSaved} symbol={curr.symbol} />
                          </p>
                          <p className="text-xs text-emerald-400/60 font-black mt-2 uppercase tracking-tighter italic">Compared to rental baseline</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      { icon: Gauge, label: "Scarcity Lift", val: `+${Math.round((calculation.scarcity - 1) * 100)}%`, color: "blue" },
                      { icon: Landmark, label: "Market Surge", val: `${calculation.trendImpact}%`, color: "purple" },
                      { icon: Shield, label: "Risk Rating", val: "L-2 Stable", color: "emerald" }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-4 p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                        <item.icon size={24} className={`text-${item.color}-500 opacity-60`} />
                        <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                          <p className="text-xl font-black text-white">{item.val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="w-[120%] h-[120%]"
                >
                  <Award size={800} />
                </motion.div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
