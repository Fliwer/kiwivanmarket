// ============================================
// 🛡️ SECURITY BADGE - Composant de confiance utilisateur
// ============================================
//
// Ce composant affiche les informations de sécurité pour rassurer
// les acheteurs et vendeurs sur la protection de leurs transactions.
//
// ============================================

import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  X,
  CreditCard,
  Users,
  Calendar,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// ============================================
// 🏷️ SECURITY BADGE - Badge compact
// ============================================

export function SecurityBadge({ size = 'normal', onClick }) {
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    normal: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2'
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 hover:bg-emerald-100 transition ${sizeClasses[size]}`}
    >
      <Shield size={size === 'small' ? 12 : size === 'large' ? 18 : 14} className="text-emerald-600" />
      <span className="font-medium">Buyer Protection</span>
    </button>
  );
}

// ============================================
// 📋 SECURITY INFO CARD - Carte d'information
// ============================================

export function SecurityInfoCard({ variant = 'buyer' }) {
  const [expanded, setExpanded] = useState(false);

  const buyerProtections = [
    {
      icon: <Lock size={18} />,
      title: 'Secure Payment',
      description: 'Your deposit is held securely by Stripe until the transaction is confirmed.'
    },
    {
      icon: <Clock size={18} />,
      title: '48h Seller Response',
      description: 'If the seller doesn\'t respond within 48 hours, you\'re automatically refunded.'
    },
    {
      icon: <CheckCircle size={18} />,
      title: 'View Before Commit',
      description: 'Funds are only released after you confirm you\'ve seen the van in person.'
    },
    {
      icon: <RefreshCw size={18} />,
      title: '7-Day Safety Period',
      description: 'After confirmation, there\'s a 7-day period before funds are released to report any issues.'
    },
    {
      icon: <AlertTriangle size={18} />,
      title: 'Dispute Resolution',
      description: 'If something goes wrong, our team will help resolve the issue fairly.'
    }
  ];

  const sellerProtections = [
    {
      icon: <CreditCard size={18} />,
      title: 'Verified Payment',
      description: 'Buyers must pay a deposit upfront, showing they\'re serious about purchasing.'
    },
    {
      icon: <Users size={18} />,
      title: 'Qualified Buyers',
      description: 'Only verified users can make reservations on your van.'
    },
    {
      icon: <Calendar size={18} />,
      title: 'No-Show Protection',
      description: 'If a buyer doesn\'t confirm the meeting, you keep the deposit.'
    },
    {
      icon: <CheckCircle size={18} />,
      title: 'Guaranteed Payment',
      description: 'Once confirmed, funds are guaranteed to be released to you.'
    }
  ];

  const protections = variant === 'buyer' ? buyerProtections : sellerProtections;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Shield size={20} />
          <h3 className="font-bold">
            {variant === 'buyer' ? 'Buyer Protection' : 'Seller Protection'}
          </h3>
        </div>
        <p className="text-emerald-100 text-sm mt-1">
          {variant === 'buyer' 
            ? 'Your money is protected throughout the transaction'
            : 'Secure transactions with verified buyers'
          }
        </p>
      </div>

      {/* Protections List */}
      <div className="p-4">
        <div className="space-y-3">
          {protections.slice(0, expanded ? protections.length : 3).map((item, index) => (
            <div key={index} className="flex gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-600">
                {item.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                <p className="text-gray-600 text-xs">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {protections.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-emerald-600 text-sm font-medium flex items-center gap-1 hover:text-emerald-700"
          >
            {expanded ? (
              <>Show less <ChevronUp size={16} /></>
            ) : (
              <>Show all protections <ChevronDown size={16} /></>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white/50 px-4 py-3 border-t border-emerald-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock size={12} />
          <span>Secured by</span>
          <span className="font-semibold text-gray-700">Stripe</span>
          <span className="text-gray-400">•</span>
          <span>Bank-level encryption</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 🔍 SECURITY MODAL - Modal détaillé
// ============================================

export function SecurityModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-2xl">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">How You're Protected</h2>
              <p className="text-emerald-100">Safe transactions on Kiwi Van Market</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* How it works */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle size={18} className="text-emerald-600" />
              How the Escrow System Works
            </h3>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-emerald-200"></div>
              
              <div className="space-y-6">
                {[
                  { step: 1, title: 'You Pay the Deposit', desc: 'Your money is securely held by Stripe — not sent to the seller yet.' },
                  { step: 2, title: 'Seller Confirms (48h)', desc: 'The seller has 48 hours to confirm. No response? Automatic refund.' },
                  { step: 3, title: 'You View the Van', desc: 'Meet the seller and inspect the van in person.' },
                  { step: 4, title: 'You Confirm', desc: 'Only after you confirm viewing, the transaction proceeds.' },
                  { step: 5, title: '7-Day Safety Period', desc: 'Funds are held for 7 more days in case of any issues.' },
                  { step: 6, title: 'Funds Released', desc: 'After the safety period, the seller receives the deposit.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm z-10">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What if something goes wrong */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <AlertTriangle size={18} />
              What if something goes wrong?
            </h4>
            <ul className="text-sm text-amber-700 space-y-2">
              <li className="flex gap-2">
                <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span><strong>Seller doesn't respond?</strong> Automatic refund after 48 hours.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span><strong>Van not as described?</strong> Open a dispute within 14 days.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span><strong>Seller disappears?</strong> Your money is still safe with Stripe.</span>
              </li>
            </ul>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-emerald-600">256-bit</div>
              <div className="text-xs text-gray-500">SSL Encryption</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-emerald-600">PCI</div>
              <div className="text-xs text-gray-500">Compliant</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-emerald-600">24/7</div>
              <div className="text-xs text-gray-500">Monitoring</div>
            </div>
          </div>

          {/* Stripe badge */}
          <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-gray-500 text-sm">Payments secured by</span>
            <div className="bg-[#635BFF] text-white px-3 py-1 rounded font-bold text-sm">
              stripe
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 💳 PAYMENT SECURITY NOTICE - Notice dans le paiement
// ============================================

export function PaymentSecurityNotice() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-800 mb-1">Your Payment is Protected</h4>
            <p className="text-sm text-blue-700 mb-2">
              Your deposit will be securely held until you confirm viewing the van. 
              If the seller doesn't respond within 48 hours, you'll be automatically refunded.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1"
            >
              Learn how you're protected
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>

      <SecurityModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

// ============================================
// 🏠 HOMEPAGE TRUST BANNER - Version Premium
// ============================================

export function TrustBanner() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {/* Bannière principale - Harmonisée avec le header */}
      <div 
        className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 cursor-pointer group"
        onClick={() => setShowDetails(true)}
      >
        {/* Effet de brillance animé au hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-center gap-3 sm:gap-8">
            
            {/* Badge principal avec effet glow */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-white blur-sm opacity-40" />
                <div className="relative w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <Shield size={12} className="text-emerald-600" />
                </div>
              </div>
              <span className="text-white font-semibold text-sm">Protected Purchase</span>
            </div>

            {/* Séparateur */}
            <div className="hidden sm:block w-px h-4 bg-white/30" />

            {/* Garanties avec points colorés */}
            <div className="hidden sm:flex items-center gap-6 text-xs text-white/70">
              <div className="flex items-center gap-1.5 hover:text-white transition">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>Escrow payment</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-white transition">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>48h refund</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-white transition">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>7-day protection</span>
              </div>
            </div>

            {/* Séparateur */}
            <div className="hidden md:block w-px h-4 bg-white/30" />

            {/* Stripe - Logo SVG officiel */}
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs hidden sm:inline">Secured by</span>
              <svg className="h-5" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M59.64 14.28c0-4.48-2.17-8.02-6.32-8.02-4.17 0-6.69 3.54-6.69 7.99 0 5.27 2.97 7.94 7.24 7.94 2.08 0 3.66-.47 4.85-1.14v-3.52c-1.19.6-2.56.97-4.29.97-1.7 0-3.2-.6-3.4-2.67h8.55c0-.23.06-1.13.06-1.55zm-8.64-1.66c0-1.98 1.21-2.81 2.32-2.81 1.08 0 2.21.83 2.21 2.81h-4.53zM40.95 6.26c-1.71 0-2.81.8-3.43 1.36l-.22-1.08h-3.86v20.7l4.38-.93.01-5.02c.64.47 1.58 1.13 3.14 1.13 3.17 0 6.06-2.55 6.06-8.16-.02-5.14-2.95-8-6.08-8zm-1.07 12.31c-1.04 0-1.66-.37-2.09-.83l-.02-6.57c.46-.5 1.1-.86 2.11-.86 1.61 0 2.73 1.81 2.73 4.12 0 2.37-1.1 4.14-2.73 4.14zM28.24 5.2l4.4-.94V.8l-4.4.93zM28.24 6.54h4.4v15.22h-4.4zM23.38 7.74l-.28-1.2h-3.8v15.22h4.38V11.3c1.03-1.35 2.79-1.1 3.33-.91V6.54c-.56-.21-2.61-.59-3.63 1.2zM14.87 2.12l-4.28.91-.01 13.95c0 2.58 1.93 4.48 4.52 4.48 1.43 0 2.48-.26 3.05-.57v-3.55c-.56.22-3.33 1.02-3.33-1.55V10.3h3.33V6.54h-3.33l.05-4.42zM4.64 10.58c0-.68.56-1.1 1.49-1.1 1.33 0 3.01.4 4.34 1.12V6.87c-1.45-.58-2.88-.8-4.34-.8C2.44 6.07 0 7.92 0 10.89c0 4.59 6.32 3.86 6.32 5.84 0 .8-.7 1.06-1.68 1.06-1.45 0-3.31-.6-4.78-1.4v3.79c1.63.7 3.27 1 4.78 1 3.77 0 6.36-1.77 6.36-4.82-.02-4.95-6.36-4.08-6.36-5.94z" fill="#fff"/>
              </svg>
            </div>

            {/* Indicateur cliquable */}
            <div className="flex items-center gap-1 text-white/60 text-xs group-hover:text-white transition">
              <span className="hidden lg:inline">Learn more</span>
              <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Premium Dark Mode */}
      {showDetails && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          onClick={() => setShowDetails(false)}
        >
          <div 
            className="bg-[#0A0A0A] rounded-3xl max-w-lg w-full shadow-2xl border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec effet glass */}
            <div className="relative p-8 text-center border-b border-white/10">
              {/* Cercles décoratifs lumineux */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
              
              <button 
                onClick={() => setShowDetails(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition p-2"
              >
                <X size={20} />
              </button>

              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Shield size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Buyer Protection</h2>
                <p className="text-slate-400 text-sm">Your transaction is protected at every step</p>
              </div>
            </div>

            {/* Timeline des protections */}
            <div className="p-6 space-y-1">
              {[
                {
                  color: 'from-emerald-500 to-teal-500',
                  title: 'Secure Deposit',
                  desc: 'Your money is held securely, never sent directly to the seller',
                  icon: <Lock size={16} />
                },
                {
                  color: 'from-blue-500 to-cyan-500',
                  title: '48h Seller Response',
                  desc: 'No response within 48 hours? Automatic full refund',
                  icon: <Clock size={16} />
                },
                {
                  color: 'from-violet-500 to-purple-500',
                  title: 'View Before Release',
                  desc: 'Funds released only after you confirm seeing the van',
                  icon: <CheckCircle size={16} />
                },
                {
                  color: 'from-amber-500 to-orange-500',
                  title: '7-Day Safety Net',
                  desc: 'Full protection period to report any issues',
                  icon: <RefreshCw size={16} />
                }
              ].map((item, i) => (
                <div key={i} className="relative flex gap-4 p-3 rounded-xl hover:bg-white/5 transition group">
                  {/* Ligne de connexion entre les étapes */}
                  {i < 3 && (
                    <div className="absolute left-[23px] top-[52px] w-0.5 h-6 bg-gradient-to-b from-white/20 to-transparent" />
                  )}
                  
                  {/* Icône avec gradient */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Stripe avec style officiel */}
            <div className="p-6 pt-0">
              <div className="bg-gradient-to-r from-[#635BFF]/10 to-[#0A2540]/50 rounded-2xl p-4 border border-[#635BFF]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#635BFF] rounded-xl flex items-center justify-center">
                      <svg className="h-4" viewBox="0 0 24 10" fill="none">
                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" fill="#fff"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">Powered by Stripe</div>
                      <div className="text-slate-400 text-xs">Bank-level encryption</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-white/10 rounded-lg text-xs text-slate-300 flex items-center gap-1">
                      <Lock size={10} />
                      256-bit SSL
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// EXPORTS
// ============================================

export default {
  SecurityBadge,
  SecurityInfoCard,
  SecurityModal,
  PaymentSecurityNotice,
  TrustBanner
};