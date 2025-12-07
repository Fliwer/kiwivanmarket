// ============================================
// 🏦 STRIPE CONNECT - Composant Onboarding Vendeur
// ============================================
// Permet aux vendeurs de configurer leur compte Stripe
// pour recevoir les paiements automatiquement
// ============================================

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  Shield,
  DollarSign,
  ArrowRight,
  Loader2,
  BadgeCheck,
  XCircle
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// ============================================
// 🎯 MAIN COMPONENT - Stripe Connect Setup
// ============================================

export const StripeConnectSetup = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState({
    loading: true,
    hasAccount: false,
    chargesEnabled: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Charger le statut actuel
  useEffect(() => {
    checkStatus();
  }, [currentUser]);

  const checkStatus = async () => {
    if (!currentUser) return;
    
    setStatus(prev => ({ ...prev, loading: true }));
    setError('');

    try {
      const checkSellerStripeStatus = httpsCallable(functions, 'checkSellerStripeStatus');
      const result = await checkSellerStripeStatus();
      
      setStatus({
        loading: false,
        ...result.data
      });

      // Si tout est configuré, callback
      if (result.data.payoutsEnabled && onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error checking status:', err);
      setStatus(prev => ({ ...prev, loading: false }));
      setError('Failed to check account status');
    }
  };

  const startOnboarding = async () => {
    setIsCreating(true);
    setError('');

    try {
      const createStripeConnectAccount = httpsCallable(functions, 'createStripeConnectAccount');
      const result = await createStripeConnectAccount({
        baseUrl: window.location.origin
      });

      // Rediriger vers Stripe
      window.location.href = result.data.url;
    } catch (err) {
      console.error('Error creating account:', err);
      setError('Failed to start setup. Please try again.');
      setIsCreating(false);
    }
  };

  const openDashboard = async () => {
    try {
      const getStripeDashboardLink = httpsCallable(functions, 'getStripeDashboardLink');
      const result = await getStripeDashboardLink();
      window.open(result.data.url, '_blank');
    } catch (err) {
      console.error('Error getting dashboard link:', err);
      setError('Failed to open dashboard');
    }
  };

  if (status.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin text-emerald-600 mr-2" size={24} />
        <span className="text-gray-600">Checking account status...</span>
      </div>
    );
  }

  // Compte entièrement configuré
  if (status.payoutsEnabled) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <BadgeCheck size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-emerald-800 text-lg">Payment Account Ready</h3>
            <p className="text-emerald-600 text-sm mt-1">
              Your Stripe account is fully configured. You'll receive payments automatically when buyers confirm viewings.
            </p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                <CheckCircle size={16} />
                Charges enabled
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                <CheckCircle size={16} />
                Payouts enabled
              </div>
            </div>

            <button
              onClick={openDashboard}
              className="mt-4 flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium text-sm"
            >
              <ExternalLink size={16} />
              Open Stripe Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Compte créé mais pas finalisé
  if (status.hasAccount && !status.detailsSubmitted) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-800 text-lg">Setup Incomplete</h3>
            <p className="text-amber-700 text-sm mt-1">
              Your Stripe account was created but you need to complete the verification to receive payments.
            </p>

            <button
              onClick={startOnboarding}
              disabled={isCreating}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Continue Setup
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pas encore de compte
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#635BFF] to-[#0A2540] px-6 py-5">
        <div className="flex items-center gap-3 text-white">
          <CreditCard size={28} />
          <div>
            <h3 className="font-bold text-lg">Set Up Payments</h3>
            <p className="text-white/70 text-sm">Receive money when buyers confirm viewings</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Benefits */}
        <div className="space-y-3 mb-6">
          {[
            { icon: Shield, text: 'Secure payments via Stripe' },
            { icon: DollarSign, text: 'Automatic payouts to your bank' },
            { icon: CheckCircle, text: 'No monthly fees - only 5% per transaction' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <item.icon size={16} className="text-emerald-600" />
              </div>
              <span className="text-gray-700 text-sm">{item.text}</span>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">How it works:</h4>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <span>Create your Stripe account (2 minutes)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <span>Buyer pays deposit → Money held by Stripe</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <span>Both confirm the viewing → Money sent to you</span>
            </li>
          </ol>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={startOnboarding}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#635BFF] text-white rounded-xl font-bold hover:bg-[#5851ea] transition disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <CreditCard size={20} />
              Set Up Stripe Account
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          Powered by Stripe • Bank-level security
        </p>
      </div>
    </div>
  );
};

// ============================================
// 📊 PAYOUT HISTORY - Liste des paiements reçus
// ============================================

export const PayoutHistory = ({ sellerId }) => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Charger les payouts depuis Firestore
    // const q = query(collection(db, 'payouts'), where('sellerId', '==', sellerId));
    setLoading(false);
  }, [sellerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-xl">
        <DollarSign size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No payouts yet</p>
        <p className="text-gray-400 text-sm">Your earnings will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payouts.map((payout) => (
        <div 
          key={payout.id}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl"
        >
          <div>
            <p className="font-semibold text-gray-800">${payout.netAmount} NZD</p>
            <p className="text-sm text-gray-500">
              {payout.createdAt?.toDate?.()?.toLocaleDateString()}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            payout.status === 'completed' 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {payout.status}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// 🔔 STRIPE STATUS BADGE - Badge compact
// ============================================

export const StripeStatusBadge = ({ status }) => {
  if (status.payoutsEnabled) {
    return (
      <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">
        <CheckCircle size={12} />
        Payments ready
      </div>
    );
  }

  if (status.hasAccount) {
    return (
      <div className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium">
        <AlertCircle size={12} />
        Setup incomplete
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
      <CreditCard size={12} />
      Setup payments
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default {
  StripeConnectSetup,
  PayoutHistory,
  StripeStatusBadge,
};