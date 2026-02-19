import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import safeStorage from '../utils/safeStorage';

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    // Supported languages
    const languages = [
        { code: 'en', flag: 'https://flagcdn.com/24x18/gb.png', name: 'ENGLISH', short: 'EN' },
        { code: 'fr', flag: 'https://flagcdn.com/24x18/fr.png', name: 'FRANÇAIS', short: 'FR' },
        { code: 'es', flag: 'https://flagcdn.com/24x18/es.png', name: 'ESPAÑOL', short: 'ES' }
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
                className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white text-sm font-semibold"
                aria-label="Select language"
                aria-expanded={isOpen}
                aria-haspopup="true"
                title="Change language"
            >
                <img
                    src={currentLangData.flag}
                    alt={currentLangData.name}
                    className="w-6 h-4 object-cover rounded-sm shadow-sm"
                />
                <span className="hidden sm:inline">{currentLangData.short}</span>
                <ChevronDown
                    size={14}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[180px] z-[101]">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition ${currentLangCode === lang.code
                                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                    : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <img
                                    src={lang.flag}
                                    alt={lang.name}
                                    className="w-6 h-4 object-cover rounded-sm shadow-sm"
                                />
                                <span className="font-medium">{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
