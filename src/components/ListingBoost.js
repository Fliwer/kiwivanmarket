import React, { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';
import { functions, db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import boostVisibility from '../utils/boostVisibility.js';
import { useBoostClock } from '../hooks/useBoostClock';

const dateOf = (value) => value?.toDate ? value.toDate() : new Date(value?.seconds != null ? value.seconds * 1000 : value);

export function ListingBoostButton({ van, onOpen }) {
  const { t, i18n } = useTranslation();
  const now = useBoostClock();
  if (boostVisibility.isBoostActive({ ...van, boostLivemode: true }, now)) return <span className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg bg-amber-50 text-amber-800">
    <Sparkles size={16} />{t(van.boostLivemode === true ? 'boost.active_until' : 'boost.test_active_until', { date: dateOf(van.boostExpiresAt).toLocaleString(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }) })}
  </span>;
  if (van.status !== 'active') return null;
  return <button onClick={() => onOpen(van)} className="flex items-center gap-1 px-3 py-2 text-sm bg-amber-100 text-amber-900 rounded-lg hover:bg-amber-200 font-semibold">
    <Sparkles size={16} />{t('boost.button')}
  </button>;
}

export function ListingBoostModal({ van, onClose, onUpdated }) {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);
  useEffect(() => {
    let cancelled = false;
    httpsCallable(functions, 'getBoostPlans')().then(({ data }) => { if (!cancelled) setCatalog(data); })
      .catch(() => { if (!cancelled) setError(t('boost.error')); });
    return () => { cancelled = true; };
  }, [t]);

  const purchase = async (planId) => {
    if (!currentUser?.emailVerified) { setError(t('boost.verify_email')); return; }
    setBusy(planId); setError('');
    try {
      const { data } = await httpsCallable(functions, 'createBoostCheckout')({ vanId: van.id, planId });
      if (data.activated) { onUpdated(); onClose(); return; }
      const target = new URL(data.url);
      if (target.origin !== 'https://checkout.stripe.com') throw new Error('Unexpected checkout origin');
      window.location.assign(target.href);
    } catch (err) {
      if (err.details?.orderId) setPendingOrder(err.details.orderId);
      setError(t(err.code === 'functions/already-exists' ? 'boost.already_active' : 'boost.error'));
      setBusy('');
    }
  };

  const cancelPending = async () => {
    setBusy('cancel');
    try {
      await httpsCallable(functions, 'cancelBoostCheckout')({ orderId: pendingOrder });
      setPendingOrder(null); setError('');
    } catch { setError(t('boost.error')); }
    finally { setBusy(''); }
  };

  return <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4" role="presentation">
    <section role="dialog" aria-modal="true" aria-labelledby="boost-title" className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-start gap-3"><h2 id="boost-title" className="text-xl font-bold">{t('boost.title')}</h2>
        <button onClick={onClose} aria-label={t('boost.close')} disabled={!!busy}><X /></button></div>
      <p className="font-medium mt-3 text-slate-800">{van.title}</p>
      <p className="text-slate-600 text-sm mt-2">{t('boost.description')}</p>
      {catalog?.mode === 'test' && <p className="bg-blue-50 text-blue-800 rounded-lg p-3 mt-4 text-sm">{t('boost.test_mode')}</p>}
      {catalog && !catalog.available && <p className="bg-amber-50 text-amber-900 rounded-lg p-3 mt-4 text-sm">{t('boost.not_ready')}</p>}
      {!catalog && !error && <Loader2 className="animate-spin mx-auto my-5" />}
      <div className="grid grid-cols-2 gap-3 mt-5">{catalog?.plans.map((plan) => <button key={plan.id} onClick={() => purchase(plan.id)}
        disabled={!!busy || !catalog.available || !currentUser?.emailVerified} className="border-2 border-amber-200 hover:border-amber-500 rounded-xl p-4 text-left disabled:opacity-50 disabled:cursor-not-allowed">
        <span className="block font-bold">{t('boost.duration', { days: plan.days })}</span>
        <span className="block text-xl font-black mt-1">{new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'NZD' }).format(plan.amountCents / 100)} NZD</span>
        {busy === plan.id ? <Loader2 size={18} className="animate-spin mt-2" /> : <span className="block text-xs mt-2">{t('boost.one_time')}</span>}
      </button>)}</div>
      {!currentUser?.emailVerified && <p className="text-amber-800 text-sm mt-3">{t('boost.verify_email')}</p>}
      {error && <p role="alert" className="text-red-700 text-sm mt-4">{error}</p>}
      {pendingOrder && <button onClick={cancelPending} disabled={!!busy} className="text-sm underline mt-3">{t('boost.cancel_pending')}</button>}
      <p className="text-xs text-slate-500 mt-5">{t('boost.conditions')} <a href="/contact" className="underline">{t('boost.contact')}</a></p>
    </section>
  </div>;
}

export function BoostPaymentNotice({ orderId, cancelled, onActivated }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState('pending');
  const [livemode, setLivemode] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(orderId || '')) { setError(true); return undefined; }
    const unsubscribe = onSnapshot(doc(db, 'boostOrders', orderId), (snap) => {
      if (!snap.exists()) { setError(true); return; }
      const next = snap.data().status;
      setLivemode(snap.data().livemode === true);
      setStatus(next);
      if (next === 'active') onActivated(orderId);
    }, () => setError(true));
    const reconcile = httpsCallable(functions, cancelled ? 'cancelBoostCheckout' : 'reconcileBoostOrder');
    reconcile({ orderId }).catch(() => {
      // A cancelled redirect can race with successful payment: reconcile its real status.
      if (cancelled) httpsCallable(functions, 'reconcileBoostOrder')({ orderId }).catch(() => {});
    });
    return unsubscribe;
  }, [orderId, cancelled, onActivated]);
  const key = error ? 'error' : status === 'active' ? (livemode ? 'success' : 'success_test') :
    ['cancelled', 'expired'].includes(status) ? 'cancelled' :
    ['paid_unavailable', 'refund_pending', 'refunded', 'disputed'].includes(status) ? 'needs_attention' : 'confirming';
  return <div role="status" className="bg-white border border-amber-200 rounded-xl p-4 mb-5 flex items-center gap-3">
    {status === 'active' ? <CheckCircle className="text-emerald-600" /> : error ? <AlertCircle className="text-red-600" /> : <Sparkles className="text-amber-600" />}
    <p>{t(`boost.${key}`)}</p>
  </div>;
}
