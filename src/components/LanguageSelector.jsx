// 🌐 Sélecteur de langue pour le header - AVEC IMAGES DE DRAPEAUX
// Remplace le LanguageSelector existant dans App.js

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Utilise flagcdn.com pour les images de drapeaux
  const languages = [
    { code: 'en', flag: 'https://flagcdn.com/24x18/gb.png', name: 'ENGLISH', short: 'EN' },
    { code: 'fr', flag: 'https://flagcdn.com/24x18/fr.png', name: 'FRANÇAIS', short: 'FR' },
    { code: 'de', flag: 'https://flagcdn.com/24x18/de.png', name: 'DEUTSCH', short: 'DE' },
    { code: 'es', flag: 'https://flagcdn.com/24x18/es.png', name: 'ESPAÑOL', short: 'ES' },
    { code: 'zh-CN', flag: 'https://flagcdn.com/24x18/cn.png', name: '简体中文', short: '中文' },
    { code: 'ja', flag: 'https://flagcdn.com/24x18/jp.png', name: '日本語', short: 'JA' },
    { code: 'ko', flag: 'https://flagcdn.com/24x18/kr.png', name: '한국어', short: 'KO' },
    { code: 'pt', flag: 'https://flagcdn.com/24x18/br.png', name: 'PORTUGUÊS', short: 'PT' },
    { code: 'th', flag: 'https://flagcdn.com/24x18/th.png', name: 'ไทย', short: 'TH' },
    { code: 'vi', flag: 'https://flagcdn.com/24x18/vn.png', name: 'TIẾNG VIỆT', short: 'VI' },
  ];

  const changeLanguage = (langCode) => {
    if (langCode === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
      window.location.reload();
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname}`;
      window.location.reload();
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (!document.getElementById('google-translate-script')) {
      const translateDiv = document.createElement('div');
      translateDiv.id = 'google_translate_element';
      translateDiv.style.display = 'none';
      document.body.appendChild(translateDiv);

      window.googleTranslateElementInit = function() {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,fr,de,es,zh-CN,ja,ko,pt,th,vi',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const getCurrentLang = () => {
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    return match ? match[1] : 'en';
  };

  const currentLang = getCurrentLang();
  const currentLangData = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white text-sm font-semibold"
        title="Change language"
      >
        <img 
          src={currentLangData.flag} 
          alt={currentLangData.name}
          className="w-6 h-4 object-cover rounded-sm shadow-sm"
        />
        <span className="hidden sm:inline">{currentLangData.short}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[200px] z-[101]">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                  currentLang === lang.code 
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

export default LanguageSelector;