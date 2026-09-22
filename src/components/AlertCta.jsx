import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, X, CheckCircle, Loader2 } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { useAuth } from '../AuthContext';

// Alerte acheteur sans compte : email + critères → Cloud Function createAlert.
// Un backpacker regarde et repart ; l'alerte est ce qui le fait revenir quand
// le bon van est publié (4,5 % de retour à J+7 avant ça).
//
// <AlertCta defaults={{ location: 'auckland', brand: 'toyota-hiace', priceMax: 15000, selfContained: true }} variant="banner" />
// variant : "banner" (bloc pleine largeur) | "inline" (petit bouton)

const CITIES = ['auckland', 'christchurch', 'wellington', 'queenstown', 'hamilton', 'tauranga', 'rotorua', 'dunedin', 'nelson'];
const BRANDS = ['toyota-hiace', 'nissan-caravan', 'mazda-bongo', 'mitsubishi-delica', 'ford-transit', 'mercedes-sprinter'];
const BUDGETS = [8000, 10000, 12000, 15000, 18000, 22000, 30000];
const cap = (s) => s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function AlertCta({ defaults = {}, variant = 'banner', source = 'unknown', className = '' }) {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({
    location: defaults.location || '',
    brand: defaults.brand || '',
    priceMax: defaults.priceMax || '',
    selfContained: !!defaults.selfContained,
  });

  const openModal = () => {
    setEmail(currentUser?.email || '');
    setError('');
    setDone(null);
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.location && !form.brand && !form.priceMax && !form.selfContained) {
      setError(t('alerts.err_criteria'));
      return;
    }
    setBusy(true);
    try {
      const createAlert = httpsCallable(functions, 'createAlert');
      const res = await createAlert({
        email,
        criteria: { ...form, priceMax: form.priceMax ? Number(form.priceMax) : null },
        lang: (i18n.language || 'en').split('-')[0],
        source,
      });
      setDone(res.data?.label || '');
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'alert_created', { source, location: form.location || undefined, brand: form.brand || undefined });
      }
    } catch (err) {
      const msg = err?.message || '';
      setError(msg.includes('email') ? t('alerts.err_email') : msg.includes('Max') ? t('alerts.err_max') : t('alerts.err_generic'));
    } finally {
      setBusy(false);
    }
  };

  const trigger = variant === 'inline' ? (
    <button type="button" onClick={openModal} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition ${className}`}>
      <Bell size={16} /> {t('alerts.cta_short')}
    </button>
  ) : (
    <div className={`bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center gap-5 shadow-xl shadow-emerald-200/60 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"><Bell size={24} /></div>
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-xl font-black leading-tight">{t('alerts.banner_title')}</h3>
        <p className="text-emerald-50 text-sm mt-1">{t('alerts.banner_text')}</p>
      </div>
      <button type="button" onClick={openModal} className="bg-white text-emerald-700 font-black px-6 py-3 rounded-2xl hover:bg-emerald-50 transition shrink-0">
        {t('alerts.cta')}
      </button>
    </div>
  );

  return (
    <>
      {trigger}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4" onClick={() => setOpen(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><Bell size={20} className="text-emerald-600" /> {t('alerts.modal_title')}</h3>
                <p className="text-sm text-slate-500 mt-1">{t('alerts.modal_text')}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700" aria-label="Close"><X size={20} /></button>
            </div>

            {done !== null ? (
              <div className="text-center py-4">
                <CheckCircle size={44} className="text-emerald-600 mx-auto mb-3" />
                <p className="font-black text-slate-900 text-lg">{t('alerts.done_title')}</p>
                <p className="text-sm text-slate-500 mt-1">{t('alerts.done_text', { label: done })}</p>
                <button type="button" onClick={() => setOpen(false)} className="mt-6 bg-emerald-600 text-white font-bold px-6 py-3 rounded-2xl">{t('alerts.close')}</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-bold text-slate-600">
                    {t('alerts.city')}
                    <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800 bg-white">
                      <option value="">{t('alerts.any')}</option>
                      {CITIES.map((c) => <option key={c} value={c}>{cap(c)}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-bold text-slate-600">
                    {t('alerts.brand')}
                    <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800 bg-white">
                      <option value="">{t('alerts.any')}</option>
                      {BRANDS.map((b) => <option key={b} value={b}>{cap(b)}</option>)}
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <label className="text-xs font-bold text-slate-600">
                    {t('alerts.budget')}
                    <select value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800 bg-white">
                      <option value="">{t('alerts.any')}</option>
                      {BUDGETS.map((b) => <option key={b} value={b}>{`≤ NZ$${b.toLocaleString('en-NZ')}`}</option>)}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 pb-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.selfContained} onChange={(e) => setForm({ ...form, selfContained: e.target.checked })} className="w-4 h-4 accent-emerald-600" />
                    🟢 Self-contained
                  </label>
                </div>
                <label className="block text-xs font-bold text-slate-600">
                  {t('alerts.email')}
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800" />
                </label>
                {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
                <button type="submit" disabled={busy} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition">
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <Bell size={18} />} {t('alerts.submit')}
                </button>
                <p className="text-[11px] text-slate-400 text-center">{t('alerts.privacy')}</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
