import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, CheckCircle, AlertTriangle, MapPin, Shield,
  Car, DollarSign, Share2, Copy, Check, Clock, BookOpen,
  ChevronRight, Globe
} from 'lucide-react';
import SeoHead from './SeoHead';
import LanguageSelector from './LanguageSelector';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('guides.page.not_found_title')}</h1>
          <p className="text-gray-600 mb-6">{t('guides.page.not_found_desc')}</p>
          <Link
            to="/"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition inline-flex items-center gap-2"
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
        <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
          <img
            src={guide.heroImage}
            alt={guide.title}
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-black/30" />

          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-12">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="hidden lg:block">
                <LanguageSelector />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6 max-w-4xl drop-shadow-sm">
              {guide.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link
                to="/guides"
                className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition"
              >
                <ArrowLeft size={20} />
                {t('guides.backToList')}
              </Link>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full">
                <Clock size={18} />
                <span>{readingTime} min de lecture</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                <BookOpen size={18} />
                <span>Guide Expert 2025</span>
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
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Sommaire</h3>
                  <nav className="space-y-1">
                    {content.sections.map((section, idx) => (
                      <button
                        key={idx}
                        onClick={() => sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${activeSection === idx
                          ? 'bg-emerald-50 text-emerald-700 translate-x-1'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        {section.title}
                        <ChevronRight size={14} className={`transition-transform ${activeSection === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Besoin d'aide ?</h4>
                  <p className="text-sm text-gray-500 mb-4">Nos experts Kiwi Van Market sont là pour vous accompagner dans votre achat.</p>
                  <button className="w-full bg-white text-gray-900 border border-gray-200 py-2.5 rounded-xl text-sm font-bold hover:shadow-md transition">
                    Contactez-nous
                  </button>
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
                    <section
                      key={idx}
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
        <footer className="bg-gray-50 pt-20 pb-12 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12 mb-16">
              <div className="space-y-6">
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center border border-gray-50 overflow-hidden">
                    <img src="/kiwi-van-logo-48.webp" className="w-8 h-8 object-contain" alt="Logo" />
                  </div>
                  <span className="font-black text-2xl tracking-tighter text-gray-900">Kiwi Van Market</span>
                </Link>
                <p className="text-gray-500 leading-relaxed">
                  La marketplace n°1 pour acheter et vendre votre van en Nouvelle-Zélande. Expertise, sécurité et passion vanlife.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 col-span-2">
                <div>
                  <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">Langues</h4>
                  <ul className="space-y-4 text-gray-500 font-medium">
                    <li><button onClick={() => i18n.changeLanguage('fr')} className="hover:text-emerald-600">Français</button></li>
                    <li><button onClick={() => i18n.changeLanguage('en')} className="hover:text-emerald-600">English</button></li>
                    <li><button onClick={() => i18n.changeLanguage('es')} className="hover:text-emerald-600">Español</button></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">Navigation</h4>
                  <ul className="space-y-4 text-gray-500 font-medium">
                    <li><Link to="/guides" className="hover:text-emerald-600">Tous les guides</Link></li>
                    <li><Link to="/" className="hover:text-emerald-600">Acheter</Link></li>
                    <li><Link to="/sell" className="hover:text-emerald-600">Vendre</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm font-medium">© 2025 Kiwi Van Market. Fait avec ❤️ pour les voyageurs.</p>
              <div className="flex gap-6 text-sm text-gray-400 font-bold">
                <Link to="/terms" className="hover:text-gray-900 transition">Conditions</Link>
                <Link to="/privacy" className="hover:text-gray-900 transition">Confidentialité</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
