import React, { useState } from 'react';
import { X, Shield, CheckCircle, FileText, AlertTriangle } from 'lucide-react';

export default function TermsModal({ isOpen, onAccept, onClose }) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={28} />
            <h2 className="text-2xl font-bold">Terms of Use</h2>
          </div>
          <p className="text-emerald-100 text-sm">Please read and accept our terms to continue</p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto text-gray-700 text-sm leading-relaxed space-y-6">
          
          {/* 1. About */}
          <section>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              About Kiwi Van Market
            </h3>
            <p>
              Kiwi Van Market is an online platform that connects campervan buyers and sellers in New Zealand. 
              We provide the tools for users to list vehicles for sale and communicate with potential buyers. 
              Kiwi Van Market does not own, sell, or purchase any vehicles directly.
            </p>
          </section>

          {/* 2. User Accounts */}
          <section>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              User Accounts
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>You must be at least 18 years old to use this service</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>One account per person - multiple accounts may be suspended</li>
              <li>Provide accurate and truthful information</li>
            </ul>
          </section>

          {/* 3. Seller Responsibilities */}
          <section>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              Seller Responsibilities
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>You must be the legal owner of the vehicle or authorized to sell it</li>
              <li>All information in your listing must be accurate and not misleading</li>
              <li>Photos must be of the actual vehicle being sold</li>
              <li>WOF and REGO information must be current and accurate</li>
              <li>Disclose any known defects, damage, or mechanical issues</li>
              <li>Respond to inquiries in a timely and professional manner</li>
              <li>Honor any Buy-Back guarantee you offer</li>
            </ul>
          </section>

          {/* 4. Buyer Responsibilities */}
          <section>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              Buyer Responsibilities
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Inspect the vehicle thoroughly before purchasing</li>
              <li>Verify WOF, REGO, and ownership documents independently</li>
              <li>We recommend getting a mechanical inspection before buying</li>
              <li>All transactions are between buyer and seller directly</li>
            </ul>
          </section>

          {/* 5. Prohibited Content */}
          <section>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">5</span>
              Prohibited Content
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Fraudulent or misleading listings</li>
              <li>Stolen vehicles or vehicles you don't own</li>
              <li>Offensive, abusive, or inappropriate content</li>
              <li>Spam or duplicate listings</li>
              <li>Any illegal activity</li>
            </ul>
          </section>

          {/* 6. Limitation of Liability */}
          <section>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-amber-100 text-amber-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                <AlertTriangle size={14} />
              </span>
              Limitation of Liability
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
              <p className="mb-2">
                <strong>Kiwi Van Market is a listing platform only.</strong> We do not:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Verify the accuracy of listings</li>
                <li>Guarantee the condition of any vehicle</li>
                <li>Handle payments or money transfers</li>
                <li>Provide warranties or guarantees on vehicles</li>
                <li>Mediate disputes between buyers and sellers</li>
              </ul>
              <p className="mt-2 text-sm">
                All transactions are conducted at your own risk. We strongly recommend meeting in person and inspecting any vehicle before purchase.
              </p>
            </div>
          </section>

          {/* 7. Privacy */}
          <section>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">7</span>
              Privacy & Data
            </h3>
            <p>
              We collect minimal personal data required to operate the service (email, name). 
              Your data is stored securely and never sold to third parties. 
              You can request deletion of your account and data at any time by contacting us.
            </p>
          </section>

          {/* 8. Changes */}
          <section>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">8</span>
              Changes to Terms
            </h3>
            <p>
              We may update these terms from time to time. Continued use of the platform after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">📧 Contact Us</h3>
            <p>
              For questions or concerns, contact us at: <br />
              <a href="mailto:kiwivanmarket.contact@gmail.com" className="text-emerald-600 font-semibold hover:underline">
                kiwivanmarket.contact@gmail.com
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-2">Last updated: November 2025</p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input 
              type="checkbox" 
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">
              I have read and accept the <strong>Terms of Use</strong>
            </span>
          </label>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button 
              onClick={onAccept}
              disabled={!accepted}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                accepted 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle size={18} />
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
