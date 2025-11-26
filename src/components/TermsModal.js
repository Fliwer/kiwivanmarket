import React from 'react';
import { FileText, X, Shield, AlertTriangle, Mail, CheckCircle } from 'lucide-react';

export default function TermsModal({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={28} />
              <div>
                <h2 className="text-2xl font-bold">Terms of Use</h2>
                <p className="text-emerald-100 text-sm">Last updated: November 2025</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          
          {/* 1. About */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
              About Kiwi Van Market
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Kiwi Van Market is an online platform that allows users to post, browse, and manage listings for campervans, vans, and similar vehicles in New Zealand.
            </p>
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm font-medium flex items-start gap-2">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                We are not a seller, buyer, or owner of any vehicles listed. We do not participate in any transactions.
              </p>
            </div>
          </section>

          {/* 2. Account */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
              Account Creation and Use
            </h3>
            <p className="text-gray-600 text-sm mb-2">By creating an account, you agree that:</p>
            <ul className="text-gray-600 text-sm space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                You are at least 18 years old
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                You are responsible for the security of your account
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                You provide accurate and up-to-date information
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Only one account is allowed per person
              </li>
            </ul>
          </section>

          {/* 3. Seller Responsibilities */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
              Seller Responsibilities
            </h3>
            <p className="text-gray-600 text-sm mb-2">By posting a listing, you agree to:</p>
            <ul className="text-gray-600 text-sm space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Be the legal owner or have authorisation to sell
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Provide accurate, non-misleading information
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Use your own photos that accurately represent the vehicle
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Provide correct WOF, REGO, mileage, and history information
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Disclose any known defects or mechanical issues
              </li>
            </ul>
          </section>

          {/* 4. Buyer Responsibilities */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
              Buyer Responsibilities
            </h3>
            <p className="text-gray-600 text-sm mb-2">By using the platform to purchase, you acknowledge that:</p>
            <ul className="text-gray-600 text-sm space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                You must inspect the vehicle before purchase
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                You are responsible for verifying WOF, REGO, and ownership documents
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                We recommend a professional mechanical inspection
              </li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                All transactions happen directly between buyer and seller, without intervention from Kiwi Van Market.
              </p>
            </div>
          </section>

          {/* 5. Buy-Back Policy */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">5</span>
              Buy-Back Guarantee Policy
            </h3>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className="text-green-600" />
                <span className="font-semibold text-green-800">Important</span>
              </div>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Buy-back is an agreement between buyer and seller only</li>
                <li>• Kiwi Van Market does NOT guarantee or enforce buy-back agreements</li>
                <li>• We strongly recommend getting agreements in writing</li>
                <li>• Disputes are the sole responsibility of buyer and seller</li>
              </ul>
            </div>
          </section>

          {/* 6. Listing Duration */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">6</span>
              Listing Duration
            </h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Listings remain active until the vehicle is sold or the seller removes them
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Sellers are responsible for keeping listings up to date
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Sellers may delete their listing at any time
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                We reserve the right to remove inactive or outdated listings
              </li>
            </ul>
          </section>

          {/* 7. Fees */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">7</span>
              Fees and Paid Services
            </h3>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-800 text-sm font-semibold mb-2">
                ✅ Currently, Kiwi Van Market is FREE to use for both buyers and sellers.
              </p>
              <p className="text-gray-600 text-sm">
                In the future, we may introduce optional paid features (featured listings, premium badges, etc.). 
                Users will never be charged without explicit consent.
              </p>
            </div>
          </section>

          {/* 8. Prohibited Content */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">8</span>
              Prohibited Content
            </h3>
            <p className="text-gray-600 text-sm mb-2">It is strictly prohibited to post:</p>
            <ul className="text-gray-600 text-sm space-y-1">
              <li className="flex items-start gap-2">
                <X size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                Fraudulent, misleading, or false listings
              </li>
              <li className="flex items-start gap-2">
                <X size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                Stolen vehicles or vehicles you do not own
              </li>
              <li className="flex items-start gap-2">
                <X size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                Offensive, abusive, or discriminatory content
              </li>
              <li className="flex items-start gap-2">
                <X size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                Duplicate listings or spam
              </li>
            </ul>
          </section>

          {/* 9. Limitation of Liability */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">9</span>
              Limitation of Liability
            </h3>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle size={16} />
                Kiwi Van Market is solely a platform connecting buyers and sellers.
              </p>
              <p className="text-gray-600 text-sm">
                We do not verify listings, guarantee vehicle conditions, intervene in payments, or manage disputes. 
                All transactions are at your own risk.
              </p>
            </div>
          </section>

          {/* 10. Data Protection */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">10</span>
              Data Protection and Privacy
            </h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Your data is stored securely
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Your data is never sold to third parties
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                You may request deletion of your account and data
              </li>
            </ul>
          </section>

          {/* 11-13. Other sections */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">11</span>
              Cookies, Changes & Governing Law
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li><strong>Cookies:</strong> We use necessary cookies for authentication and security.</li>
              <li><strong>Changes:</strong> We may update these Terms at any time. Continued use constitutes acceptance.</li>
              <li><strong>Governing Law:</strong> These Terms are governed by the laws of <strong>New Zealand</strong>.</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Mail size={20} className="text-emerald-600" />
              Contact
            </h3>
            <p className="text-gray-600 text-sm">
              For any questions, requests, or complaints:
            </p>
            <a 
              href="mailto:kiwivanmarket.contact@gmail.com" 
              className="text-emerald-600 font-semibold hover:underline text-sm"
            >
              📧 kiwivanmarket.contact@gmail.com
            </a>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            By using Kiwi Van Market, you agree to these Terms.
          </p>
          <button
            onClick={onAccept || onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition shadow-lg"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}