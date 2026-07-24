import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, RefreshCw, Check } from 'lucide-react';
import safeStorage from '../utils/safeStorage';
import { CURRENCY_META, CURRENCIES, fetchLiveRates } from './CurrencySelector';

// ============================================================================
// RegionSelector — devise + langue regroupées dans UN seul menu déroulant.
// Remplace <CurrencySelector /> + <LanguageSelector /> dans le header.
// Garde intactes : la logique devise (localStorage 'kiwivanmarket_currency' +
// event 'currencyChange' + chargement des taux live) et la logique langue (i18n).
// ============================================================================

const FALLBACK = { NZD: 1, EUR: 0.51, USD: 0.58, AUD: 0.83, GBP: 0.43 };

const LANGUAGES = [
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  { code: 'es', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
];

export default function RegionSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState('NZD');
  const [liveRates, setLiveRates] = useState(FALLBACK);
  const [loading, setLoading] = useState(false);

  // Chargement des taux live au montage (repris de CurrencySelector)
  useEffect(() => {
    setCurrentCurrency(safeStorage.getItem('kiwivanmarket_currency') || 'NZD');
    setLoading(true);
    fetchLiveRates()
      .then((rates) => {
        setLiveRates(rates);
        Object.keys(rates).forEach((code) => {
          if (CURRENCIES[code]) CURRENCIES[code].rate = rates[code];
        });
        window.dispatchEvent(new CustomEvent('currencyRatesUpdated', { detail: rates }));
      })
      .catch(() => { /* fallback silencieux */ })
      .finally(() => setLoading(false));
  }, []);

  const changeCurrency = (code) => {
    setCurrentCurrency(code);
    safeStorage.setItem('kiwivanmarket_currency', code);
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: code }));
  };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    safeStorage.setItem('preferredLang', code);
    const u = new URL(window.location);
    if (code === 'en') u.searchParams.delete('lang');
    else u.searchParams.set('lang', code);
    window.history.pushState({}, '', u);
  };

  const curr = CURRENCY_META[currentCurrency] || CURRENCY_META.NZD;
  const langCode = (i18n.language || 'en').split('-')[0];
  const lang = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0];

  return (
    <div className="relative">
      {/* Déclencheur : devise + langue en un bloc */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Currency and language"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 rounded-xl transition border border-slate-100 text-sm font-bold"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
          {curr.symbol}
        </span>
        <span className="tracking-tight text-slate-600">{curr.code}</span>
        <span className="w-px h-4 bg-slate-200" />
        <img src={lang.flag} alt={lang.name} className="w-5 h-3.5 object-cover rounded shadow-sm" />
        <span className="tracking-tight text-slate-600 uppercase hidden sm:inline">{lang.code}</span>
        {loading
          ? <RefreshCw size={13} className="text-emerald-400 animate-spin" />
          : <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 min-w-[230px] z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right">

            {/* ── Devise ── */}
            <p className="px-4 pt-1.5 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Currency</p>
            {Object.entries(CURRENCY_META).map(([code, c]) => {
              const rate = liveRates[code] ?? FALLBACK[code];
              const active = currentCurrency === code;
              return (
                <button
                  key={code}
                  onClick={() => changeCurrency(code)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${active ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="text-sm font-bold flex-1">{code}</span>
                  <span className="text-[10px] text-slate-400">1 NZD = {Number(rate).toFixed(3)}</span>
                  {active && <Check size={15} strokeWidth={3} className="text-emerald-500" />}
                </button>
              );
            })}

            {/* ── Langue ── */}
            <p className="px-4 pt-3 pb-2 mt-1 border-t border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">Language</p>
            {LANGUAGES.map((l) => {
              const active = langCode === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => changeLanguage(l.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${active ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <img src={l.flag} alt={l.name} className="w-6 h-4 object-cover rounded shadow-sm" />
                  <span className="text-sm font-bold flex-1">{l.name}</span>
                  {active && <Check size={15} strokeWidth={3} className="text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
