import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Edit2, Pause, Play, CheckCircle, Trash2 } from 'lucide-react';

export default function ListingOwnerPanel({ van, isUpdating, onToggleSold, onTogglePause, onDelete }) {
  const { t } = useTranslation();
  const status = van.status === 'sold' ? 'sold' : van.status === 'paused' ? 'paused' : 'active';
  const badge = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    paused: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    sold: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  };
  const dot = { active: 'bg-emerald-500', paused: 'bg-amber-500', sold: 'bg-slate-400' };
  const secondary = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-xs font-medium sm:gap-2 sm:px-3.5 sm:text-sm text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-wait disabled:opacity-50';

  return <section aria-label={t('my_listings.dashboard')} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <LayoutDashboard size={18} aria-hidden="true" />
        </span>
        <h2 className="text-sm font-semibold leading-5 text-slate-800 sm:text-base">{t('my_listings.dashboard')}</h2>
      </div>
      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${badge[status]}`}>
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
        {t(`my_listings.status_${status}`)}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex sm:flex-wrap sm:items-center sm:px-5">
      <Link to={`/sell?edit=${van.id}`} aria-disabled={isUpdating || undefined} tabIndex={isUpdating ? -1 : undefined}
        onClick={(event) => { if (isUpdating) event.preventDefault(); }}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 aria-disabled:opacity-50">
        <Edit2 size={16} className="shrink-0" aria-hidden="true" />{t('my_listings.edit')}
      </Link>
      <button type="button" onClick={onTogglePause} disabled={isUpdating} className={secondary}>
        {status === 'paused' ? <Play size={16} className="shrink-0" aria-hidden="true" /> : <Pause size={16} className="shrink-0" aria-hidden="true" />}
        {t(status === 'paused' ? 'my_listings.resume' : 'my_listings.pause')}
      </button>
      <button type="button" onClick={onToggleSold} disabled={isUpdating}
        className={status === 'sold' ? secondary : 'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-2.5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:border-emerald-700 hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-wait disabled:opacity-50 sm:gap-2 sm:px-3.5 sm:text-sm'}>
        <CheckCircle size={16} className="shrink-0" aria-hidden="true" />{t(status === 'sold' ? 'my_listings.reactivate' : 'my_listings.mark_as_sold')}
      </button>
      <button type="button" onClick={onDelete} disabled={isUpdating}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-wait disabled:opacity-50 sm:ml-auto">
        <Trash2 size={16} className="shrink-0" aria-hidden="true" />{t('my_listings.delete')}
      </button>
    </div>
  </section>;
}
