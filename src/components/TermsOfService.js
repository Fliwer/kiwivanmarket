// ============================================
// 📜 TERMS OF SERVICE - Conditions Générales d'Utilisation
// ============================================
// 
// Ce composant affiche les CGU qui protègent légalement
// le propriétaire de Kiwi Van Market
//
// ============================================

import React, { useState } from 'react';
import { X, Shield, AlertTriangle, CheckCircle, FileText, Scale } from 'lucide-react';

export function TermsOfServiceModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('overview');

  if (!isOpen) return null;

  const sections = [
    { id: 'overview', label: 'Overview', icon: <FileText size={16} /> },
    { id: 'platform', label: 'Platform Role', icon: <Shield size={16} /> },
    { id: 'deposits', label: 'Deposits & Payments', icon: <Scale size={16} /> },
    { id: 'liability', label: 'Liability', icon: <AlertTriangle size={16} /> },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Scale size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Terms of Service</h2>
                <p className="text-slate-300 text-sm">Last updated: December 2024</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <div className="md:w-64 bg-slate-50 p-4 border-r border-slate-200">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition ${
                    activeSection === section.id
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {section.icon}
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[60vh]">
            {activeSection === 'overview' && (
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-900 mb-4">1. Overview</h3>
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-1">Important Notice</h4>
                      <p className="text-amber-700 text-sm">
                        By using Kiwi Van Market, you agree to these Terms of Service. 
                        Please read them carefully before making any transaction.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 mb-4">
                  Welcome to Kiwi Van Market ("we", "our", "the Platform"). These Terms of Service 
                  govern your use of our website and services located at kiwivanmarket.com.
                </p>

                <h4 className="font-semibold text-slate-800 mt-6 mb-2">1.1 Acceptance of Terms</h4>
                <p className="text-slate-600 mb-4">
                  By accessing or using our Platform, you agree to be bound by these Terms. 
                  If you do not agree to these Terms, you may not use our services.
                </p>

                <h4 className="font-semibold text-slate-800 mt-6 mb-2">1.2 Eligibility</h4>
                <p className="text-slate-600">
                  You must be at least 18 years old and legally capable of entering into 
                  binding contracts to use our Platform.
                </p>
              </div>
            )}

            {activeSection === 'platform' && (
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-900 mb-4">2. Platform Role & Limitations</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <Shield className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">We Are an Intermediary</h4>
                      <p className="text-blue-700 text-sm">
                        Kiwi Van Market is a marketplace platform that connects buyers and sellers. 
                        We are NOT the seller of any vehicle listed on our Platform.
                      </p>
                    </div>
                  </div>
                </div>

                <h4 className="font-semibold text-slate-800 mt-6 mb-2">2.1 What We Do</h4>
                <ul className="text-slate-600 space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                    <span>Provide a platform for listing and discovering campervans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                    <span>Facilitate communication between buyers and sellers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                    <span>Process reservation deposits through Stripe (secure escrow)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                    <span>Provide buyer protection for the deposit amount only</span>
                  </li>
                </ul>

                <h4 className="font-semibold text-slate-800 mt-6 mb-2">2.2 What We Do NOT Do</h4>
                <ul className="text-slate-600 space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <X size={16} className="text-red-500 mt-1 flex-shrink-0" />
                    <span>We do NOT own, sell, or inspect any vehicles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X size={16} className="text-red-500 mt-1 flex-shrink-0" />
                    <span>We do NOT guarantee the accuracy of listings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X size={16} className="text-red-500 mt-1 flex-shrink-0" />
                    <span>We do NOT process the final vehicle payment (only the deposit)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X size={16} className="text-red-500 mt-1 flex-shrink-0" />
                    <span>We do NOT provide mechanical or legal guarantees on vehicles</span>
                  </li>
                </ul>

                <div className="bg-slate-100 rounded-xl p-4 mt-6">
                  <p className="text-slate-700 text-sm font-medium">
                    💡 The final transaction (remaining balance after deposit) occurs directly 
                    between buyer and seller, outside of our Platform. We strongly recommend 
                    completing large transactions at a bank or with a lawyer present.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'deposits' && (
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-900 mb-4">3. Deposits & Payment Terms</h3>
                
                <h4 className="font-semibold text-slate-800 mt-6 mb-2">3.1 Reservation Deposit</h4>
                <p className="text-slate-600 mb-4">
                  The deposit (typically $500 NZD or 5% of the vehicle price) serves as a 
                  <strong> reservation fee</strong> to secure the vehicle and demonstrate buyer intent. 
                  It is NOT a down payment on the vehicle purchase.
                </p>

                <h4 className="font-semibold text-slate-800 mt-6 mb-2">3.2 Escrow System</h4>
                <p className="text-slate-600 mb-4">
                  All deposits are held securely by Stripe (our payment processor) and are NOT 
                  transferred to the seller until the buyer confirms viewing the vehicle.
                </p>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-emerald-800 mb-3">Deposit Release Timeline:</h4>
                  <ol className="text-emerald-700 text-sm space-y-2">
                    <li><strong>1.</strong> Buyer pays deposit → Funds held by Stripe</li>
                    <li><strong>2.</strong> Seller confirms reservation (within 48h) → Or automatic refund</li>
                    <li><strong>3.</strong> Buyer views vehicle and confirms → 7-day protection period starts</li>
                    <li><strong>4.</strong> After 7 days with no dispute → Deposit released to seller</li>
                  </ol>
                </div>

                <h4 className="font-semibold text-slate-800 mt-6 mb-2">3.3 Refund Policy</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left p-3 border">Situation</th>
                        <th className="text-left p-3 border">Refund</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 border">Seller doesn't respond within 48h</td>
                        <td className="p-3 border text-emerald-600 font-medium">✓ Full refund (automatic)</td>
                      </tr>
                      <tr>
                        <td className="p-3 border">Buyer cancels BEFORE viewing</td>
                        <td className="p-3 border text-emerald-600 font-medium">✓ Full refund</td>
                      </tr>
                      <tr>
                        <td className="p-3 border">Buyer confirms viewing</td>
                        <td className="p-3 border text-red-600 font-medium">✗ Non-refundable*</td>
                      </tr>
                      <tr>
                        <td className="p-3 border">Dispute opened within 7 days</td>
                        <td className="p-3 border text-amber-600 font-medium">⚠ Case-by-case review</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-slate-500 text-xs mt-2">
                  * Once you confirm viewing the vehicle, the deposit becomes non-refundable as 
                  the seller has fulfilled their obligation to make the vehicle available.
                </p>

                <h4 className="font-semibold text-slate-800 mt-6 mb-2">3.4 Platform Fee</h4>
                <p className="text-slate-600">
                  A 5% platform fee is deducted from the deposit to cover payment processing 
                  and platform maintenance costs.
                </p>
              </div>
            )}

            {activeSection === 'liability' && (
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-900 mb-4">4. Liability & Disclaimers</h3>
                
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">Limitation of Liability</h4>
                      <p className="text-red-700 text-sm">
                        Please read this section carefully. It limits our liability to you.
                      </p>
                    </div>
                  </div>
                </div>

                <h4 className="font-semibold text-slate-800 mt-6 mb-2">4.1 Vehicle Condition</h4>
                <p className="text-slate-600 mb-4">
                  Kiwi Van Market does NOT inspect, verify, or guarantee the condition, safety, 
                  legality, or quality of any vehicle listed on our Platform. <strong>You are solely 
                  responsible for inspecting the vehicle before purchase.</strong>
                </p>
                <p className="text-slate-600 mb-4">
                  We strongly recommend:
                </p>
                <ul className="text-slate-600 space-y-1 mb-4">
                  <li>• Getting an independent mechanical inspection (pre-purchase inspection)</li>
                  <li>• Verifying WOF and registration status on the NZTA website</li>
                  <li>• Checking for outstanding finance on the PPSR register</li>
                  <li>• Meeting the seller in person before any payment</li>
                </ul>

                <h4 className="font-semibold text-slate-800 mt-6 mb-2">4.2 Transaction Disputes</h4>
                <p className="text-slate-600 mb-4">
                  For the <strong>deposit amount only</strong>, we provide a dispute resolution process. 
                  For the <strong>final vehicle payment</strong> (which occurs outside our Platform), 
                  we have no involvement or liability.
                </p>

                <h4 className="font-semibold text-slate-800 mt-6 mb-2">4.3 Limitation of Damages</h4>
                <p className="text-slate-600 mb-4">
                  To the maximum extent permitted by law, Kiwi Van Market shall not be liable for:
                </p>
                <ul className="text-slate-600 space-y-1 mb-4">
                  <li>• Any indirect, incidental, or consequential damages</li>
                  <li>• Loss of profits, data, or business opportunities</li>
                  <li>• Damages arising from transactions between users</li>
                  <li>• Vehicle defects, misrepresentations, or fraud by sellers</li>
                  <li>• Any amount exceeding the deposit fee paid through our Platform</li>
                </ul>

                <h4 className="font-semibold text-slate-800 mt-6 mb-2">4.4 Indemnification</h4>
                <p className="text-slate-600 mb-4">
                  You agree to indemnify and hold harmless Kiwi Van Market, its owners, employees, 
                  and affiliates from any claims, damages, or expenses arising from your use of 
                  the Platform or violation of these Terms.
                </p>

                <h4 className="font-semibold text-slate-800 mt-6 mb-2">4.5 Governing Law</h4>
                <p className="text-slate-600">
                  These Terms are governed by the laws of New Zealand. Any disputes shall be 
                  resolved in the courts of New Zealand.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t flex items-center justify-between">
          <p className="text-xs text-slate-500">
            By using Kiwi Van Market, you agree to these Terms of Service.
          </p>
          <button
            onClick={onClose}
            className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 📜 TERMS CHECKBOX - Pour le checkout
// ============================================

export function TermsCheckbox({ checked, onChange }) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-sm text-gray-600">
          I have read and agree to the{' '}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
            className="text-emerald-600 font-medium hover:underline"
          >
            Terms of Service
          </button>
          {' '}and understand that the deposit is non-refundable once I confirm viewing the vehicle.
        </span>
      </label>

      <TermsOfServiceModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </>
  );
}

// ============================================
// ⚠️ CONFIRMATION WARNING - Avant buyer_confirmed
// ============================================

export function ConfirmationWarningModal({ isOpen, onClose, onConfirm, vanTitle }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Warning */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold">Confirm Vehicle Viewing</h2>
          <p className="text-amber-100 text-sm mt-1">This action cannot be undone</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            You are about to confirm that you have viewed <strong>"{vanTitle}"</strong> in person.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <h4 className="font-semibold text-amber-800 mb-2">By confirming, you acknowledge:</h4>
            <ul className="text-sm text-amber-700 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <span>You have physically seen and inspected the vehicle</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <span>You had the opportunity to verify its condition</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <span>The deposit will be released to the seller after 7 days</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-red-700 font-medium">The deposit becomes NON-REFUNDABLE</span>
              </li>
            </ul>
          </div>

          <p className="text-gray-500 text-xs">
            If you have not seen the vehicle in person, do NOT confirm. 
            You can still cancel and receive a full refund.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition"
          >
            Yes, I Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// FOOTER TERMS LINK
// ============================================

export function TermsLink() {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowTerms(true)}
        className="text-gray-500 hover:text-gray-700 text-sm underline"
      >
        Terms of Service
      </button>
      <TermsOfServiceModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </>
  );
}

export default TermsOfServiceModal;
