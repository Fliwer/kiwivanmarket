import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export default function GuideLanguageSelector() {
    const { i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const currentLang = i18n.language ? i18n.language.split('-')[0] : 'en';

    const handleLanguageChange = (langCode) => {
        // Change language in i18next
        i18n.changeLanguage(langCode);

        // Update URL with ?lang= parameter for SEO consistency
        const searchParams = new URLSearchParams(location.search);
        if (langCode === 'en') {
            searchParams.delete('lang');
        } else {
            searchParams.set('lang', langCode);
        }

        const newSearch = searchParams.toString();
        navigate({
            pathname: location.pathname,
            search: newSearch ? `?${newSearch}` : ''
        }, { replace: true });
    };

    return (
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 ${currentLang === lang.code
                            ? 'bg-white shadow-lg scale-105 border-2 border-emerald-500'
                            : 'hover:bg-white/20'
                        }`}
                    title={lang.name}
                >
                    <span className="text-xl transform active:scale-95">{lang.flag}</span>
                </button>
            ))}
        </div>
    );
}
