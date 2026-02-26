import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import safeStorage from '../utils/safeStorage';

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    // Supported languages
    const languages = [
        { code: 'en', name: 'ENGLISH', short: 'EN', flag: 'https://flagcdn.com/w40/gb.png' },
        { code: 'fr', name: 'FRANÇAIS', short: 'FR', flag: 'https://flagcdn.com/w40/fr.png' },
        { code: 'es', name: 'ESPAÑOL', short: 'ES', flag: 'https://flagcdn.com/w40/es.png' }
    ];

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
        safeStorage.setItem('preferredLang', langCode);

        // Update URL param for SEO
        const url = new URL(window.location);
        if (langCode === 'en') {
            url.searchParams.delete('lang');
        } else {
            url.searchParams.set('lang', langCode);
        }
        window.history.pushState({}, '', url);
    };

    const currentLang = i18n.language || 'en';
    const currentLangCode = currentLang.split('-')[0]; // Handle 'en-US' -> 'en'
    const currentLangData = languages.find((l) => l.code === currentLangCode) || languages[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-emerald-50 md:bg-slate-50 md:hover:bg-emerald-50 rounded-xl transition text-slate-700 text-sm font-bold border border-slate-200 md:border-slate-100"
                aria-label="Select language"
                aria-expanded={isOpen}
                aria-haspopup="true"
                title="Change language"
            >
                <img
                    src={currentLangData.flag}
                    alt={currentLangData.name}
                    className="w-5 h-3.5 object-cover rounded shadow-sm"
                />
                <span className="tracking-tight text-slate-600 hidden sm:inline">{currentLangData.name.split(' ')[0]}</span>
                <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
                            Language
                        </div>
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${currentLangCode === lang.code
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'hover:bg-slate-50 text-slate-600'
                                    }`}
                            >
                                <img
                                    src={lang.flag}
                                    alt={lang.name}
                                    className="w-6 h-4 object-cover rounded shadow-sm"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold leading-none">{lang.name}</span>
                                    {currentLangCode === lang.code && (
                                        <span className="text-[10px] font-medium text-emerald-600/70 mt-0.5">Active</span>
                                    )}
                                </div>
                                {currentLangCode === lang.code && (
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
