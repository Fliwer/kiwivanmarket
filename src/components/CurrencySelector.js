import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import safeStorage from '../utils/safeStorage';

export const CURRENCIES = {
    NZD: { symbol: '$', code: 'NZD', rate: 1 },
    EUR: { symbol: '€', code: 'EUR', rate: 0.57 },
    USD: { symbol: '$', code: 'USD', rate: 0.61 },
    AUD: { symbol: '$', code: 'AUD', rate: 0.94 },
    GBP: { symbol: '£', code: 'GBP', rate: 0.48 },
};

export default function CurrencySelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentCurrency, setCurrentCurrency] = useState('NZD');
    const { t } = useTranslation();

    useEffect(() => {
        const savedCurrency = safeStorage.getItem('kiwivanmarket_currency') || 'NZD';
        setCurrentCurrency(savedCurrency);
    }, []);

    const changeCurrency = (code) => {
        setIsOpen(false);
        setCurrentCurrency(code);
        safeStorage.setItem('kiwivanmarket_currency', code);
        window.dispatchEvent(new CustomEvent('currencyChange', { detail: code }));
    };

    const currency = CURRENCIES[currentCurrency] || CURRENCIES.NZD;

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
                <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 min-w-[160px] z-[101] animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                        <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 mb-1">
                            {t('common.currency')}
                        </div>
                        {Object.entries(CURRENCIES).map(([code, curr]) => (
                            <button
                                key={code}
                                onClick={() => changeCurrency(code)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${currentCurrency === code
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'hover:bg-slate-50 text-slate-600'
                                    }`}
                            >
                                <span className={`flex items-center justify-center w-8 h-8 rounded-xl text-sm font-black transition-colors ${currentCurrency === code ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {curr.symbol}
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold leading-none">{code}</span>
                                    {currentCurrency === code && (
                                        <span className="text-[10px] font-medium text-emerald-600/70 mt-0.5">Active</span>
                                    )}
                                </div>
                                {currentCurrency === code && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
