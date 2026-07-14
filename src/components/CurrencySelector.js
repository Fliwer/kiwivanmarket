import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, RefreshCw } from 'lucide-react';
import safeStorage from '../utils/safeStorage';

// Fallback rates (used if API is unavailable)
// Taux de secours (utilisés si l'API est indisponible) — rafraîchis 2026-07-13
const FALLBACK_RATES = {
    NZD: 1,
    EUR: 0.51,
    USD: 0.58,
    AUD: 0.83,
    GBP: 0.43,
};

export const CURRENCY_META = {
    NZD: { symbol: '$', code: 'NZD', flag: '🇳🇿' },
    EUR: { symbol: '€', code: 'EUR', flag: '🇪🇺' },
    USD: { symbol: '$', code: 'USD', flag: '🇺🇸' },
    AUD: { symbol: '$', code: 'AUD', flag: '🇦🇺' },
    GBP: { symbol: '£', code: 'GBP', flag: '🇬🇧' },
};

// Build the CURRENCIES export (rates filled in from live/fallback)
export const CURRENCIES = Object.fromEntries(
    Object.entries(CURRENCY_META).map(([code, meta]) => [
        code,
        { ...meta, rate: FALLBACK_RATES[code] },
    ])
);

const CACHE_KEY = 'kiwivanmarket_fx_rates';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

async function fetchLiveRates() {
    const cached = safeStorage.getItem(CACHE_KEY);
    if (cached) {
        try {
            const { rates, fetchedAt } = JSON.parse(cached);
            if (Date.now() - fetchedAt < CACHE_TTL_MS) {
                return rates;
            }
        } catch { /* ignore */ }
    }

    // Frankfurter API — free, no key, CORS-ok.
    // NB: l'ancien host api.frankfurter.app renvoie désormais un 301 qui casse
    // le CORS dans le navigateur → on utilise le host maintenu api.frankfurter.dev.
    const res = await fetch('https://api.frankfurter.dev/v1/latest?base=NZD&symbols=EUR,USD,AUD,GBP');
    if (!res.ok) throw new Error('FX fetch failed');
    const data = await res.json();

    const rates = {
        NZD: 1,
        EUR: data.rates.EUR,
        USD: data.rates.USD,
        AUD: data.rates.AUD,
        GBP: data.rates.GBP,
    };

    safeStorage.setItem(CACHE_KEY, JSON.stringify({ rates, fetchedAt: Date.now() }));
    return rates;
}

export default function CurrencySelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentCurrency, setCurrentCurrency] = useState('NZD');
    const [liveRates, setLiveRates] = useState(FALLBACK_RATES);
    const [ratesDate, setRatesDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    // Load live rates on mount
    useEffect(() => {
        const savedCurrency = safeStorage.getItem('kiwivanmarket_currency') || 'NZD';
        setCurrentCurrency(savedCurrency);

        setLoading(true);
        fetchLiveRates()
            .then(rates => {
                setLiveRates(rates);
                // Update global CURRENCIES so other components benefit
                Object.keys(rates).forEach(code => {
                    if (CURRENCIES[code]) CURRENCIES[code].rate = rates[code];
                });
                // Broadcast update
                window.dispatchEvent(new CustomEvent('currencyRatesUpdated', { detail: rates }));
                // Parse cache to show date
                const cached = safeStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { fetchedAt } = JSON.parse(cached);
                    setRatesDate(new Date(fetchedAt));
                }
            })
            .catch(() => {
                // silently fallback
            })
            .finally(() => setLoading(false));
    }, []);

    const changeCurrency = (code) => {
        setIsOpen(false);
        setCurrentCurrency(code);
        safeStorage.setItem('kiwivanmarket_currency', code);
        window.dispatchEvent(new CustomEvent('currencyChange', { detail: code }));
    };

    const currency = CURRENCY_META[currentCurrency] || CURRENCY_META.NZD;
    const rate = liveRates[currentCurrency] ?? 1;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-emerald-50 md:bg-slate-50 md:hover:bg-emerald-50 rounded-xl transition text-slate-700 text-sm font-bold border border-slate-200 md:border-slate-100"
                title={t('common.change_currency')}
            >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                    {currency.symbol}
                </span>
                <span className="tracking-tight text-slate-600">{currency.code}</span>
                {loading ? (
                    <RefreshCw size={12} className="text-emerald-400 animate-spin" />
                ) : (
                    <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 min-w-[200px] z-[101] overflow-hidden">
                        <div className="px-4 py-2 border-b border-slate-50 mb-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('common.currency')}</p>
                            {ratesDate && (
                                <p className="text-[9px] text-emerald-500 mt-0.5 flex items-center gap-1">
                                    <RefreshCw size={8} />
                                    Live · {ratesDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                        {Object.entries(CURRENCY_META).map(([code, curr]) => {
                            const currRate = liveRates[code] ?? FALLBACK_RATES[code];
                            return (
                                <button
                                    key={code}
                                    onClick={() => changeCurrency(code)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${currentCurrency === code
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'hover:bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    <span className="text-lg leading-none">{curr.flag}</span>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-sm font-bold leading-none">{code}</span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">
                                            1 NZD = {currRate.toFixed(4)} {code}
                                        </span>
                                    </div>
                                    {currentCurrency === code && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    )}
                                </button>
                            );
                        })}
                        <div className="px-4 pt-2 pb-1 border-t border-slate-50 mt-1">
                            <p className="text-[9px] text-slate-300">Powered by Frankfurter · ECB rates</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}



