import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, AlertTriangle, MapPin, Shield,
  Car, DollarSign, Share2, Copy, Check, Clock, BookOpen,
  ChevronRight, Globe, Calculator, Zap
} from 'lucide-react';
import SeoHead from './SeoHead';
import LanguageSelector from './LanguageSelector';
import BuybackCalculator from './BuybackCalculator';
import { GUIDES, IconMap } from '../constants/guides';
import { useHideLoader } from '../hooks/useHideLoader';

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
  useHideLoader();
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

  const [scrollProgress, setScrollProgress] = useState(0);

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

  // Scroll Progress and Spy
  useEffect(() => {
    const handleScroll = () => {
      // Progress Bar
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);

      // Section Spy
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
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
          { name: guide.title, path: `/guide/${slug}` },
        ]}
      />
      <GuideSchema guide={guide} url={url} />

      <div className="bg-[#FDFDFC] pt-24">
        {/* Reading Progress Bar */}
        <div
          className="fixed top-0 left-0 h-1.5 bg-emerald-500 z-[100] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Hero Section */}
        <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-slate-900 group">
          <img
            src={guide.heroImage}
            alt={guide.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-[20s] ease-linear scale-110 group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-32 pt-20">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-left duration-700">
                <span className="h-px w-12 bg-emerald-500" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">{currentLang === 'fr' ? 'Le Journal de Bord' : 'The Travel Journal'}</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white leading-[0.85] mb-12 tracking-tighter animate-in fade-in slide-in-from-bottom duration-1000">
                {guide.title.split(' ').map((word, i) => (
                  <span key={i} className={i % 4 === 3 ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 italic" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h1>

              <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                <Link
                  to="/guides"
                  className="flex items-center gap-2 text-white/80 font-black uppercase text-xs tracking-widest hover:text-emerald-400 transition group/back"
                >
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  {t('guides.backToList')}
                </Link>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
                  <Clock size={16} />
                  <span>{t('guides.hub.min_read', { count: readingTime })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
          <div className="flex flex-col lg:flex-row gap-20">

            {/* Sidebar / Sommaire (Desktop) */}
            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-32 space-y-12">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Explore Sections</h3>
                  <nav className="space-y-2">
                    {content.sections.map((section, idx) => (
                      <button
                        key={idx}
                        onClick={() => sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className={`w-full text-left px-5 py-4 rounded-3xl text-sm font-bold transition-all flex items-center justify-between group ${activeSection === idx
                          ? 'bg-slate-900 text-white shadow-2xl scale-105'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                      >
                        <span className="truncate">{section.title}</span>
                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSection === idx ? 'bg-emerald-400 scale-150' : 'bg-transparent'}`} />
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Simplified Sidebar CTA */}
                <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group/cta">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10 text-center">
                    <h4 className="font-black text-2xl mb-4 tracking-tight">{currentLang === 'fr' ? 'Contenu Vérifié' : 'Verified Content'}</h4>
                    <p className="text-sm text-slate-400 mb-0 font-medium leading-relaxed">{currentLang === 'fr' ? 'Ce guide est à jour avec les lois NZ 2025.' : 'This guide is updated for 2025 compliance and NZ laws.'}</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 max-w-3xl lg:pt-4">
              {/* Intro */}
              <div className="mb-24">
                <p className="text-3xl md:text-4xl text-slate-800 leading-[1.3] font-black tracking-tight mb-8">
                  {content.intro}
                </p>
                <div className="w-20 h-2 bg-emerald-500 rounded-full" />
              </div>

              {/* Sections with Rich Blocks */}
              <div className="space-y-32">
                {content.sections && content.sections.map((section, idx) => {
                  const Icon = IconMap[section.icon] || CheckCircle;
                  return (
                    <React.Fragment key={idx}>
                      <motion.section
                        ref={el => sectionRefs.current[idx] = el}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="scroll-mt-32"
                      >
                        <div className="inline-flex items-center gap-4 mb-12">
                          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 shadow-xl">
                            <Icon size={24} />
                          </div>
                          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                            {section.title}
                          </h2>
                        </div>

                        <div className="space-y-8">
                          {section.items.map((item, itemIdx) => {
                            // Block Type Logic
                            if (item.type === 'image') {
                              return (
                                <div key={itemIdx} className="my-12 animate-in fade-in duration-1000">
                                  <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 bg-slate-50">
                                    <img src={item.url} alt={item.caption} className="w-full h-auto object-cover" />
                                  </div>
                                  {item.caption && (
                                    <p className="mt-6 text-center text-sm font-bold text-slate-400 uppercase tracking-widest italic px-8">
                                      {item.caption}
                                    </p>
                                  )}
                                </div>
                              );
                            }

                            if (item.type === 'callout') {
                              return (
                                <div key={itemIdx} className={`p-10 rounded-[2.5rem] border-2 shadow-xl relative overflow-hidden ${item.variant === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
                                  }`}>
                                  <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                      {item.variant === 'warning' ? <AlertTriangle className="text-amber-500" size={24} /> : <Shield className="text-blue-500" size={24} />}
                                      <h4 className={`font-black uppercase tracking-widest text-xs ${item.variant === 'warning' ? 'text-amber-700' : 'text-blue-700'
                                        }`}>{item.title}</h4>
                                    </div>
                                    <p className={`text-lg font-bold leading-relaxed ${item.variant === 'warning' ? 'text-amber-900' : 'text-blue-900'
                                      }`}>{item.text}</p>
                                  </div>
                                  <div className={`absolute top-0 right-0 p-8 transform rotate-12 opacity-10 ${item.variant === 'warning' ? 'text-amber-500' : 'text-blue-500'
                                    }`}>
                                    {item.variant === 'warning' ? <AlertTriangle size={100} /> : <Shield size={100} />}
                                  </div>
                                </div>
                              );
                            }

                            // Default Card Block
                            return (
                              <div
                                key={itemIdx}
                                className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group/item"
                              >
                                <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center justify-between">
                                  {item.title}
                                  <span className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[10px] text-slate-300 font-bold group-hover/item:bg-emerald-500 group-hover/item:text-white transition-colors duration-500">
                                    {(itemIdx + 1).toString().padStart(2, '0')}
                                  </span>
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-lg font-medium">{item.text}</p>

                                {item.expertTip && (
                                  <div className="mt-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex gap-4 animate-in fade-in duration-500">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500 shrink-0">
                                      <Zap size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
                                        {currentLang === 'fr' ? "ASTUCE D'EXPERT" : "PRO TIP"}
                                      </p>
                                      <p className="text-emerald-900 font-bold text-sm leading-relaxed">{item.expertTip}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.section>

                      {/* Injection du calculateur après la section de prix */}
                      {((slug === 'buying-campervan-nz' && idx === 3) ||
                        (slug === 'selling-campervan-nz' && idx === 2)) && (
                          <div
                            ref={calculatorRef}
                            className="my-16 md:my-24 scroll-mt-32"
                          >
                            <div className="p-4 sm:p-8 md:p-16 bg-slate-900 rounded-3xl md:rounded-[4rem] text-white shadow-3xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
                              <div className="relative z-10 max-w-2xl mx-auto text-center mb-12">
                                <div className="inline-flex items-center gap-3 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                                  <Calculator size={14} /> {currentLang === 'fr' ? 'OUTIL : ESTIMATEUR DE PRIX' : 'TOOL: BUYBACK ESTIMATOR'}
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">{currentLang === 'fr' ? 'Estimez votre valeur de revente.' : 'Estimate your resale value.'}</h2>
                                <p className="text-slate-400 text-lg font-medium">{currentLang === 'fr' ? 'Simulez votre prix de rachat garanti basé sur la saisonnalité du marché.' : 'Simulate your rachat garanti price based on real-time market seasonality.'}</p>
                              </div>
                              <BuybackCalculator isEmbedded={true} />
                            </div>
                          </div>
                        )}
                    </React.Fragment>
                  );
                })}

                {/* Warnings Section - Premium Box */}
                {guide.content.warnings && (
                  <section className="bg-red-50 rounded-[3rem] p-12 lg:p-16 border border-red-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-red-600 rotate-12">
                      <AlertTriangle size={200} />
                    </div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-red-900 mb-8 flex items-center gap-3">
                        <AlertTriangle className="text-red-500" size={32} />
                        {currentLang === 'fr' ? "Points de Vigilance" : "Crucial Warnings"}
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {guide.content.warnings.map((warning, idx) => (
                          <div key={idx} className="flex gap-4 bg-white/60 backdrop-blur p-6 rounded-2xl border border-red-100 shadow-sm">
                            <span className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-black text-xs">!</span>
                            <p className="text-red-800 font-bold leading-relaxed">{warning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* CTA */}
                {content.cta && (
                  <section className="relative rounded-[4rem] p-20 text-center overflow-hidden animate-in fade-in duration-1000 group">
                    <div className="absolute inset-0 bg-slate-900 group-hover:bg-slate-950 transition-colors duration-700" />
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />

                    <div className="relative text-white max-w-2xl mx-auto">
                      <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-tight">
                        {content.cta.title}
                      </h2>
                      <p className="text-slate-400 text-xl font-medium mb-12 leading-relaxed">
                        {content.cta.text}
                      </p>
                      <Link
                        to={content.cta.buttonLink}
                        className="inline-flex items-center gap-4 bg-emerald-500 text-white px-12 py-6 rounded-3xl font-black text-xl hover:bg-emerald-400 hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:-translate-y-2 transition-all duration-300 active:scale-95 group/btn"
                      >
                        {content.cta.buttonText}
                        <ArrowLeft size={24} className="rotate-180 group-hover:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  </section>
                )}
              </div>

              {/* Share & Layout Footer */}
              <div className="mt-32 pt-16 border-t border-slate-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="flex items-center gap-8 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                    <div className="relative shadow-2xl">
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" className="w-20 h-20 rounded-3xl border-4 border-white object-cover" alt="Author" />
                      <div className="absolute -bottom-2 -right-2 bg-slate-900 text-emerald-400 p-2 rounded-2xl border-4 border-white shadow-xl">
                        <Shield size={16} />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-2xl text-slate-900 leading-none mb-2">KiwiVan Team</h4>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">NZ Travel Experts Since 2018</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleShare}
                      className="group flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-lg hover:shadow-2xl transition-all active:scale-95"
                    >
                      <Share2 size={24} className="group-hover:scale-110 transition-transform" />
                      {t('guides.page.share_btn')}
                    </button>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center justify-center w-16 h-16 rounded-3xl transition-all border-2 ${copied
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-white text-slate-300 border-slate-100 hover:border-slate-900 hover:text-slate-900'
                        }`}
                    >
                      {copied ? <Check size={28} /> : <Copy size={28} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Back to Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-8 right-8 w-16 h-16 bg-white border border-slate-100 text-slate-900 rounded-3xl shadow-2xl flex items-center justify-center transition-all duration-500 z-[90] active:scale-95 group ${scrollProgress > 20 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
        >
          <ArrowLeft size={24} className="rotate-90 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </>
  );
}
