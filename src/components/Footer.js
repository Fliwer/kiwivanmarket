import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, HelpCircle, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Composant FAQ Modal
export function FAQModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const faqs = [
    {
      question: "How does Kiwi Van Market work?",
      answer: "Kiwi Van Market is a free platform connecting campervan buyers and sellers in New Zealand. Sellers list their vans with photos and details, buyers browse and contact sellers directly through our messaging system. We don't handle payments or transactions - those happen directly between buyer and seller."
    },
    {
      question: "Is it free to use?",
      answer: "Yes! Listing your van and browsing listings is completely free. We may introduce optional paid features in the future, but basic functionality will always remain free."
    },
    {
      question: "How do I sell my van?",
      answer: "1. Create an account (free)\n2. Click 'Sell Your Van'\n3. Add photos and details\n4. Publish your listing\n5. Respond to messages from interested buyers\n6. Meet buyers and complete the sale directly"
    },
    {
      question: "How do I buy a van?",
      answer: "1. Browse listings using filters\n2. Save favorites with the heart button\n3. Message sellers you're interested in\n4. Arrange viewings directly with sellers\n5. Inspect the van thoroughly before buying\n6. Complete the purchase directly with the seller"
    },
    {
      question: "What is 'Self-Contained'?",
      answer: "A self-contained vehicle has a toilet, fresh water tank, and grey water tank that meets New Zealand standards for freedom camping. Look for the blue Self-Contained badge on listings."
    },
    {
      question: "What is 'Buy-Back'?",
      answer: "Some sellers offer to buy back the van at an agreed price after your trip. This is an arrangement between you and the seller - Kiwi Van Market does not guarantee or enforce buy-back agreements."
    },
    {
      question: "Is Kiwi Van Market responsible for transactions?",
      answer: "No. We are a listing platform only. All transactions, inspections, and agreements are between buyers and sellers directly. We strongly recommend:\n• Meeting in person before any payment\n• Inspecting the vehicle thoroughly\n• Verifying WOF and REGO documents\n• Getting a mechanical inspection for expensive purchases"
    },
    {
      question: "How do I report a suspicious listing?",
      answer: "Contact us at kiwivanmarket.contact@gmail.com with the listing details. We take fraud seriously and will investigate all reports."
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle size={28} />
              <h2 className="text-2xl font-bold">FAQ & How It Works</h2>
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
              <strong>Still have questions?</strong><br />
              Contact us at{' '}
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
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500 text-amber-950 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            <strong>Disclaimer:</strong> Kiwi Van Market is a listing platform only. We do not verify listings, guarantee vehicle conditions, or handle transactions.
            All sales are between buyers and sellers directly. Always inspect vehicles in person before purchasing.
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
                <span className="text-emerald-400 text-sm">NZ's #1 Campervan Marketplace</span>
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
                <button onClick={onOpenFAQ} className="text-gray-300 hover:text-white transition">
                  FAQ & How It Works
                </button>
              </li>
              <li>
                <button onClick={onOpenTerms} className="text-gray-300 hover:text-white transition">
                  Terms of Use
                </button>
              </li>
              <li>
                <Link to="/buyback-calculator" className="text-gray-300 hover:text-white transition">
                  Buy-back Calculator
                </Link>
              </li>
              <li>
                <a href="mailto:kiwivanmarket.contact@gmail.com" className="text-gray-300 hover:text-white transition">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
            <h3 className="font-bold mb-3 mt-6 text-emerald-400 text-sm uppercase tracking-wider">{t('header.guides')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/guides" className="text-white font-semibold hover:text-emerald-400 transition flex items-center gap-2">
                  <BookOpen size={16} /> Browse All Guides
                </Link>
              </li>
              <li>
                <Link to="/guide/buying-campervan-nz" className="text-gray-300 hover:text-white transition">
                  Buying a Campervan
                </Link>
              </li>
              <li>
                <Link to="/guide/selling-campervan-nz" className="text-gray-400 hover:text-white transition">
                  Selling Your Van
                </Link>
              </li>
              <li>
                <Link to="/guide/freedom-camping-nz" className="text-gray-400 hover:text-white transition">
                  Freedom Camping
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety Tips */}
          <div>
            <h3 className="font-bold mb-4 text-emerald-400 text-sm uppercase tracking-wider">Safety Tips</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                Always meet sellers in person
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                Inspect vehicles before buying
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                Verify WOF & REGO documents
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">✓</span>
                Never pay without seeing the van
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">⚠</span>
                Report suspicious listings
              </li>
            </ul>
          </div>

          {/* Popular Brands */}
          <div>
            <h3 className="font-bold mb-4 text-emerald-400 text-sm uppercase tracking-wider">Popular Brands</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/brand/toyota-hiace" className="text-gray-300 hover:text-white transition">
                  Toyota Hiace
                </Link>
              </li>
              <li>
                <Link to="/brand/nissan-caravan" className="text-gray-400 hover:text-white transition">
                  Nissan Caravan
                </Link>
              </li>
              <li>
                <Link to="/brand/mitsubishi-delica" className="text-gray-400 hover:text-white transition">
                  Mitsubishi Delica
                </Link>
              </li>
              <li>
                <Link to="/brand/mazda-bongo" className="text-gray-400 hover:text-white transition">
                  Mazda Bongo
                </Link>
              </li>
              <li>
                <Link to="/brand/ford-transit" className="text-gray-400 hover:text-white transition">
                  Ford Transit
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Locations */}
          <div>
            <h3 className="font-bold mb-4 text-emerald-400 text-sm uppercase tracking-wider">Popular Locations</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/location/auckland" className="text-gray-300 hover:text-white transition">
                  Auckland
                </Link>
              </li>
              <li>
                <Link to="/location/wellington" className="text-gray-400 hover:text-white transition">
                  Wellington
                </Link>
              </li>
              <li>
                <Link to="/location/christchurch" className="text-gray-400 hover:text-white transition">
                  Christchurch
                </Link>
              </li>
              <li>
                <Link to="/location/queenstown" className="text-gray-400 hover:text-white transition">
                  Queenstown
                </Link>
              </li>
              <li>
                <Link to="/location/rotorua" className="text-gray-400 hover:text-white transition">
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
