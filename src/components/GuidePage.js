import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, AlertTriangle, MapPin, Shield, Car, DollarSign, Share2, Copy, Check } from 'lucide-react';
import SeoHead from './SeoHead';

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
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const { slug } = useParams();

  // Récupérer le guide dans la langue actuelle, ou fallback en EN
  const langGuides = GUIDES[currentLang] || GUIDES.en;
  const guide = langGuides[slug] || GUIDES.en[slug];

  const url = `https://kiwivanmarket.com/guide/${slug}`;
  const [copied, setCopied] = React.useState(false);

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

  // Fermer le loader initial
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
    window.scrollTo(0, 0);
  }, []);

  // 404 si guide non trouvé
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

  return (
    <>
      <SeoHead
        title={guide.title}
        description={guide.description}
        image={guide.heroImage}
        type="article"
      />
      <GuideSchema guide={guide} url={url} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <header className="relative h-[40vh] min-h-[300px] flex items-end">
          <img
            src={guide.heroImage}
            alt={guide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="relative max-w-4xl mx-auto px-4 pb-8 w-full">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
            >
              <ArrowLeft size={20} />
              {t('guides.page.back')}
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {guide.title}
            </h1>
          </div>
        </header>

        {/* Breadcrumb */}
        <nav className="max-w-4xl mx-auto px-4 py-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-emerald-600">{t('guides.page.breadcrumb_home')}</Link></li>
            <li>/</li>
            <li><Link to="/guides" className="hover:text-emerald-600">{t('guides.page.breadcrumb_hub')}</Link></li>
            <li>/</li>
            <li><span className="text-gray-800 font-medium">{t('guides.page.breadcrumb_guide')}</span></li>
          </ol>
        </nav>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 pb-16">
          {/* Intro */}
          <p className="text-xl text-gray-700 leading-relaxed mb-12">
            {content.intro}
          </p>

          {/* Sections */}
          {content.sections && content.sections.map((section, idx) => {
            const Icon = IconMap[section.icon] || CheckCircle;
            return (
              <section key={idx} className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Icon size={20} className="text-emerald-600" />
                  </span>
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Warnings */}
          {content.warnings && (
            <section className="mb-12 bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={24} />
                {t('guides.page.warnings_title')}
              </h2>
              <ul className="space-y-2">
                {content.warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-amber-900">
                    <span className="text-amber-500 mt-1">⚠</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* CTA */}
          {content.cta && (
            <section className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-3">{content.cta.title}</h2>
              <p className="text-white/90 mb-6 max-w-lg mx-auto">{content.cta.text}</p>
              <Link
                to={content.cta.buttonLink}
                className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg"
              >
                {content.cta.buttonText}
              </Link>
            </section>
          )}

          {/* Social Share */}
          <section className="mt-16 pb-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{t('guides.page.share_title')}</h3>
                <p className="text-gray-500">{t('guides.page.share_desc')}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition shadow-md"
                >
                  <Share2 size={18} />
                  {t('guides.page.share_btn')}
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition border ${copied
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? t('guides.page.copied') : t('guides.page.copy_link')}
                </button>
              </div>
            </div>
          </section>

          {/* Other Guides */}
          <section className="mt-12">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('guides.page.more_guides')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(langGuides)
                .filter(([key]) => key !== slug && !['how-to-buy-campervan-nz', 'how-to-inspect-a-van'].includes(key))
                .slice(0, 2)
                .map(([key, g]) => (
                  <Link
                    key={key}
                    to={`/guide/${key}`}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{g.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{g.description}</p>
                  </Link>
                ))}
            </div>
          </section>
        </main>

        {/* Simple Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden" style={{ backgroundColor: '#f7eedd' }}>
                <img src="/kiwi-van-logo-48.webp" alt="Kiwi Van Market" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl">Kiwi Van Market</span>
            </Link>
            <p className="text-gray-400 text-sm">
              {t('footer.subtitle')}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
