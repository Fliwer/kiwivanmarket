import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, HelpCircle, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pagesData } from '../data/seo';

// Composant FAQ Modal
export function FAQModal({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  if (!isOpen) return null;

  const faqs = pagesData(i18n.language).faq.flatMap((category) => category.items.map(({ q, a }) => ({ question: q, answer: a })));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle size={28} />
              <h2 className="text-2xl font-bold">{t('seo_footer.faq')}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition font-semibold text-gray-800">
                  {faq.question}
                  <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-gray-600 text-sm whitespace-pre-line bg-white">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
            <p className="text-sm text-emerald-800">
              <strong>{t('footer.contact')}</strong><br />
              <a href="mailto:kiwivanmarket.contact@gmail.com" className="text-emerald-600 font-semibold hover:underline">
                kiwivanmarket.contact@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Footer principal avec disclaimer
export default function Footer({ onOpenFAQ, onOpenTerms }) {
  const { t, i18n } = useTranslation();
  const localHref = (path) => (i18n.language || '').startsWith('fr') ? `${path}?lang=fr` : path;

  return (
    <footer className="bg-gray-900 text-white mt-16">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500 text-amber-950 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            <strong>{t('seo_footer.noticeLabel')}</strong> {t('seo_footer.notice')}
          </p>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">

          {/* Brand - Logo en ROND avec couleur #f7eedd */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              {/* Logo en cercle parfait avec overflow-hidden */}
              <div
                className="w-14 h-14 rounded-full shadow-lg overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: '#f7eedd' }}
              >
                <img
                  src="/kiwi-van-logo-96.webp"
                  alt="Kiwi Van Market"
                  className="w-11 h-11 object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-bold block">Kiwi Van Market</span>
                <span className="text-emerald-400 text-sm">{t('seo_footer.tagline')}</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              {t('footer.about_desc')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-emerald-400 text-sm uppercase tracking-wider">{t('footer.quick_links')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={localHref('/why')} className="text-gray-300 hover:text-white transition">
                  {t('why_page.hero_badge')}
                </Link>
              </li>
              <li>
                <Link to={localHref('/faq')} className="text-gray-300 hover:text-white transition">
                  {t('seo_footer.faq')}
                </Link>
              </li>
              <li>
                <button onClick={onOpenTerms} className="text-gray-300 hover:text-white transition">
                  {t('seo_footer.terms')}
                </button>
              </li>
              <li>
                <Link to={localHref('/buyback-calculator')} className="text-gray-300 hover:text-white transition">
                  {t('seo_footer.resale')}
                </Link>
              </li>
              <li>
                <Link to={localHref('/campervan-prices-nz')} className="text-gray-300 hover:text-white transition">
                  {t('seo_footer.prices')}
                </Link>
              </li>
              <li>
                <Link to={localHref('/contact')} className="text-gray-300 hover:text-white transition">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
            <h3 className="font-bold mb-3 mt-6 text-emerald-400 text-sm uppercase tracking-wider">{t('header.guides')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={localHref('/guides')} className="text-white font-semibold hover:text-emerald-400 transition flex items-center gap-2">
                  <BookOpen size={16} /> {t('seo_footer.guides')}
                </Link>
              </li>
              <li>
                <Link to={localHref('/guide/buying-campervan-nz')} className="text-gray-300 hover:text-white transition">
                  {t('seo_footer.buy')}
                </Link>
              </li>
              <li>
                <Link to={localHref('/guide/selling-campervan-nz')} className="text-gray-400 hover:text-white transition">
                  {t('seo_footer.sell')}
                </Link>
              </li>
              <li>
                <Link to={localHref('/guide/freedom-camping-nz')} className="text-gray-400 hover:text-white transition">
                  {t('seo_footer.camp')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety Tips */}
          <div>
            <h3 className="font-bold mb-4 text-emerald-400 text-sm uppercase tracking-wider">{t('seo_footer.safety')}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                {t('seo_footer.meet')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                {t('seo_footer.inspect')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                {t('seo_footer.documents')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                {t('seo_footer.payment')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">⚠</span>
                {t('seo_footer.report')}
              </li>
            </ul>
          </div>

          {/* Popular Brands */}
          <div>
            <h3 className="font-bold mb-4 text-emerald-400 text-sm uppercase tracking-wider">{t('seo_footer.brands')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={localHref('/brand/toyota-hiace')} className="text-gray-300 hover:text-white transition">
                  Toyota Hiace
                </Link>
              </li>
              <li>
                <Link to={localHref('/brand/nissan-caravan')} className="text-gray-400 hover:text-white transition">
                  Nissan Caravan
                </Link>
              </li>
              <li>
                <Link to={localHref('/brand/mitsubishi-delica')} className="text-gray-400 hover:text-white transition">
                  Mitsubishi Delica
                </Link>
              </li>
              <li>
                <Link to={localHref('/brand/mazda-bongo')} className="text-gray-400 hover:text-white transition">
                  Mazda Bongo
                </Link>
              </li>
              <li>
                <Link to={localHref('/brand/ford-transit')} className="text-gray-400 hover:text-white transition">
                  Ford Transit
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Locations */}
          <div>
            <h3 className="font-bold mb-4 text-emerald-400 text-sm uppercase tracking-wider">{t('seo_footer.cities')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={localHref('/location/auckland')} className="text-gray-300 hover:text-white transition">
                  Auckland
                </Link>
              </li>
              <li>
                <Link to={localHref('/location/wellington')} className="text-gray-400 hover:text-white transition">
                  Wellington
                </Link>
              </li>
              <li>
                <Link to={localHref('/location/christchurch')} className="text-gray-400 hover:text-white transition">
                  Christchurch
                </Link>
              </li>
              <li>
                <Link to={localHref('/location/queenstown')} className="text-gray-400 hover:text-white transition">
                  Queenstown
                </Link>
              </li>
              <li>
                <Link to={localHref('/location/rotorua')} className="text-gray-400 hover:text-white transition">
                  Rotorua
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Mini logo en rond avec couleur #f7eedd */}
            <div
              className="w-8 h-8 rounded-full shadow overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: '#f7eedd' }}
            >
              <img
                src="/kiwi-van-logo-48.webp"
                alt="Kiwi Van Market"
                className="w-6 h-6 object-contain"
              />
            </div>
            <p className="text-gray-500 text-sm">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
          <p className="text-gray-600 text-sm flex items-center gap-2">
            Made with <span className="text-2xl">❤️</span> in New Zealand
          </p>
        </div>
      </div>
    </footer>
  );
}
