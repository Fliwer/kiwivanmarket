import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, CheckCircle, AlertTriangle, MapPin, Shield,
  Car, DollarSign, Share2, Copy, Check, Clock, BookOpen,
  ChevronRight, Globe, Calculator
} from 'lucide-react';
import SeoHead from './SeoHead';
import LanguageSelector from './LanguageSelector';
import BuybackCalculator from './BuybackCalculator';
import { GUIDES, IconMap } from '../constants/guides';

// Schema.org pour les guides
const GuideSchema = ({ guide, url }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": guide.title,
    "description": guide.description,
    "image": guide.heroImage,
    "url": url,
    "author": {
      "@type": "Organization",
      "name": "Kiwi Van Market"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Kiwi Van Market",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kiwivanmarket.com/kiwi-van-logo.png"
      }
    },
    "datePublished": "2025-01-01",
    "dateModified": new Date().toISOString().split('T')[0]
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

export default function GuidePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const currentLang = (i18n.language || 'en').split('-')[0];
  const [shareSuccess, setShareSuccess] = useState(false);

  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef([]);
  const calculatorRef = useRef(null);

  // Récupérer le guide dans la langue actuelle, ou fallback en EN
  const langGuides = GUIDES[currentLang] || GUIDES.en;
  const guide = langGuides[slug] || GUIDES.en[slug];

  const url = `https://kiwivanmarket.com/guide/${slug}`;
  const [copied, setCopied] = useState(false);

  // Estimation du temps de lecture (Base: 200 mots/min)
  const calculateReadingTime = () => {
    if (!guide) return 5;
    const text = JSON.stringify(guide.content);
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: guide.title,
          text: guide.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fermer le loader initial et gérer le scroll spy
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      const currentSectionIndex = sectionRefs.current.findIndex(ref => {
        if (!ref) return false;
        const offsetTop = ref.offsetTop;
        const offsetBottom = offsetTop + ref.offsetHeight;
        return scrollPosition >= offsetTop && scrollPosition < offsetBottom;
      });

      if (currentSectionIndex !== -1) {
        setActiveSection(currentSectionIndex);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug, currentLang]);

  if (!guide) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center p-12 bg-white rounded-[2rem] shadow-xl border border-slate-100 max-w-md">
          <div className="text-7xl mb-6">📖</div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">{t('guides.page.not_found_title')}</h1>
          <p className="text-slate-500 mb-8 font-medium">{t('guides.page.not_found_desc')}</p>
          <Link
            to="/"
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            {t('guides.page.back')}
          </Link>
        </div>
      </div>
    );
  }

  const { content } = guide;
  const readingTime = calculateReadingTime();

  return (
    <>
      <SeoHead
        title={guide.title}
        description={guide.description}
        image={guide.heroImage}
        type="article"
      />
      <GuideSchema guide={guide} url={url} />

      <div className="min-h-screen bg-white">
        {/* Header Premium Flottant / Mobile Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="text-emerald-600 font-bold flex items-center gap-2">
              <img src="/kiwi-van-logo-48.webp" className="w-8 h-8" alt="Logo" />
            </Link>
            <LanguageSelector />
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative h-[65vh] min-h-[550px] w-full overflow-hidden bg-slate-900">
          <img
            src={guide.heroImage}
            alt={guide.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />

          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="hidden lg:block">
                <LanguageSelector />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-slate-900 leading-[0.9] mb-8 max-w-4xl tracking-tighter">
              {guide.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/guides"
                className="flex items-center gap-2 text-emerald-600 font-black uppercase text-xs tracking-widest hover:text-emerald-500 transition"
              >
                <ArrowLeft size={18} />
                {t('guides.backToList')}
              </Link>
              <div className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20">
                <Clock size={16} />
                <span>{readingTime} min read</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">
                <BookOpen size={16} />
                <span>Expert Guide 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-16">

            {/* Sidebar / Sommaire (Desktop) */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Table of Contents</h3>
                  <nav className="space-y-1.5">
                    {content.sections.map((section, idx) => (
                      <button
                        key={idx}
                        onClick={() => sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group ${activeSection === idx
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/10'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                      >
                        {section.title}
                        <ChevronRight size={14} className={`transition-transform ${activeSection === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                      </button>
                    ))}
                    {/* Lien vers le calculateur dans le sommaire */}
                    {((slug === 'buying-campervan-nz') || (slug === 'selling-campervan-nz')) && (
                      <button
                        onClick={() => calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="w-full text-left px-4 py-3 rounded-2xl text-sm font-black text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-between group border-2 border-emerald-100 mt-4"
                      >
                        {currentLang === 'fr' ? 'Estimer mon Buyback' : currentLang === 'es' ? 'Estimar mi Buyback' : 'Estimate Buyback'}
                        <Calculator size={14} />
                      </button>
                    )}
                  </nav>
                </div>

                <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="font-black text-xl mb-3 tracking-tight">Need expert advice?</h4>
                    <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">Our KiwiVan specialists are here to help you secure the best deal.</p>
                    <button className="w-full bg-emerald-600 text-white py-3 rounded-2xl text-sm font-black hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
                      Contact Us
                    </button>
                  </div>
                  <div className="absolute -bottom-4 -right-4 text-white/5 transform rotate-12">
                    <Shield size={120} />
                  </div>
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 max-w-3xl">
              {/* Intro */}
              <div className="prose prose-xl prose-emerald mb-16">
                <p className="text-2xl text-gray-600 leading-relaxed font-light italic border-l-4 border-emerald-500 pl-8 py-2">
                  {content.intro}
                </p>
              </div>

              {/* Sections */}
              <div className="space-y-20">
                {content.sections && content.sections.map((section, idx) => {
                  const Icon = IconMap[section.icon] || CheckCircle;
                  return (
                    <React.Fragment key={idx}>
                      <section
                        ref={el => sectionRefs.current[idx] = el}
                        className="scroll-mt-32 group"
                      >
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-16 h-16 bg-white shadow-xl shadow-emerald-100 border border-emerald-50 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <Icon size={28} className="text-emerald-500" />
                          </div>
                          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                            {section.title}
                          </h2>
                        </div>

                        <div className="grid gap-6">
                          {section.items.map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group/item"
                            >
                              <div className="absolute top-0 left-0 w-2 h-0 bg-emerald-500 group-hover/item:h-full transition-all duration-300" />
                              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                {item.title}
                              </h3>
                              <p className="text-gray-600 leading-relaxed text-lg">{item.text}</p>

                              {/* Expert Badge on items */}
                              {item.expertTip && (
                                <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                  <Shield size={12} />
                                  {currentLang === 'fr' ? "Conseil d'expert" : currentLang === 'es' ? "Consejo de experto" : "Expert Tip"}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Injection du calculateur après la section de prix */}
                      {((slug === 'buying-campervan-nz' && idx === 3) ||
                        (slug === 'selling-campervan-nz' && idx === 2)) && (
                          <div
                            ref={calculatorRef}
                            className="my-16 animate-in fade-in slide-in-from-bottom-8 duration-700 scroll-mt-32"
                          >
                            <BuybackCalculator isEmbedded={true} />
                          </div>
                        )}
                    </React.Fragment>
                  );
                })}

                {/* Warnings */}
                {content.warnings && (
                  <section className="bg-amber-50 border border-amber-100 rounded-[2rem] p-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 text-amber-100 transform rotate-12">
                      <AlertTriangle size={120} />
                    </div>
                    <div className="relative">
                      <h2 className="text-2xl font-black text-amber-900 mb-6 flex items-center gap-3">
                        <AlertTriangle className="text-amber-500" size={28} />
                        Important : À ne pas oublier
                      </h2>
                      <div className="grid gap-4">
                        {content.warnings.map((warning, idx) => (
                          <div key={idx} className="flex gap-4 p-4 bg-white/50 rounded-2xl border border-amber-200/50">
                            <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center shrink-0 text-amber-700 font-bold text-sm">
                              !
                            </div>
                            <p className="text-amber-900 font-medium">{warning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* CTA */}
                {content.cta && (
                  <section className="relative rounded-[2.5rem] p-12 text-center overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900" />
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <div className="relative text-white max-w-xl mx-auto">
                      <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
                        {content.cta.title}
                      </h2>
                      <p className="text-white/70 text-lg mb-10 leading-relaxed">
                        {content.cta.text}
                      </p>
                      <Link
                        to={content.cta.buttonLink}
                        className="inline-flex items-center gap-3 bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all"
                      >
                        {content.cta.buttonText}
                        <ChevronRight size={24} />
                      </Link>
                    </div>
                  </section>
                )}
              </div>

              {/* Share & Layout Footer */}
              <div className="mt-24 pt-12 border-t border-gray-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img src="https://images.unsplash.com/photo-1537367663815-2250ec4be574?w=100" className="w-16 h-16 rounded-full border-4 border-white shadow-lg" alt="Author" />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                        <CheckCircle size={12} />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Écrit par l'équipe Kiwi Van</h4>
                      <p className="text-gray-500 text-sm">Spécialistes du Vanlife en NZ depuis 2018</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleShare}
                      className="group flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition shadow-xl active:scale-95"
                    >
                      <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
                      Partager
                    </button>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all border ${copied
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-900 hover:text-gray-900'
                        }`}
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <footer className="bg-slate-900 text-white py-20 mt-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center">
              <Link to="/" className="flex items-center gap-3 mb-10 group">
                <div className="w-16 h-16 rounded-2xl bg-[#f7eedd] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                  <img src="/kiwi-van-logo-48.webp" className="w-12 h-12 object-contain" alt="Logo" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-2xl tracking-tighter text-white">KiwiVan Market</span>
                  <span className="block text-slate-400 text-xs font-black uppercase tracking-[0.2em]">{t('van_page.footer_slogan')}</span>
                </div>
              </Link>

              <div className="grid md:grid-cols-2 gap-16 w-full max-w-4xl mb-20 border-y border-white/5 py-12">
                <div>
                  <h4 className="font-black text-white mb-6 uppercase tracking-[0.2em] text-[10px]">{currentLang === 'fr' ? 'Navigation' : 'Explore'}</h4>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/" className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all">{t('hero.cta_browse')}</Link>
                    <Link to="/sell" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold transition-all">{t('hero.cta_sell')}</Link>
                    <Link to="/guides" className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all">{currentLang === 'fr' ? 'Guides' : 'Expert Guides'}</Link>
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-white mb-6 uppercase tracking-[0.2em] text-[10px]">{currentLang === 'fr' ? 'Langues' : 'Language'}</h4>
                  <div className="flex gap-4">
                    <button onClick={() => i18n.changeLanguage('fr')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentLang === 'fr' ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>FR</button>
                    <button onClick={() => i18n.changeLanguage('en')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentLang === 'en' ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>EN</button>
                    <button onClick={() => i18n.changeLanguage('es')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentLang === 'es' ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>ES</button>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-4">© 2025 KiwiVan Market • New Zealand</p>
                <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  <Link to="/terms" className="hover:text-emerald-500 transition-colors">Terms</Link>
                  <Link to="/privacy" className="hover:text-emerald-500 transition-colors">Privacy</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
