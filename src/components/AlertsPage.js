import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Bell, BellOff, Trash2, Search, ArrowLeft } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useSavedSearches } from '../hooks/useSavedSearches';

export default function AlertsPage() {
  const { currentUser } = useAuth();
  const { searches, loading, removeSearch, toggleActive } = useSavedSearches();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Helmet>
        <title>My Alerts | Kiwi Van Market</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm mb-6 transition">
          <ArrowLeft size={18} /> Back to listings
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600"><Bell size={24} /></div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Alerts</h1>
            <p className="text-sm text-slate-500">Get an email the moment a matching van is listed.</p>
          </div>
        </div>

        {!currentUser ? (
          <div className="mt-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12">
            <Bell size={56} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-700 mb-2">Sign in to manage your alerts</h2>
            <p className="text-slate-500 mb-6">Save a search from the listings page to start getting alerts.</p>
            <Link to="/" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition">
              Browse vans
            </Link>
          </div>
        ) : loading ? (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600"></div>
          </div>
        ) : searches.length === 0 ? (
          <div className="mt-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12">
            <Search size={56} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-700 mb-2">No alerts yet</h2>
            <p className="text-slate-500 mb-6">
              On the listings page, set your filters and tap <strong>“🔔 Notify me”</strong> to create your first alert.
            </p>
            <Link to="/" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition">
              Browse vans
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {searches.map((s) => (
              <div
                key={s.id}
                className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between gap-4 ${!s.active ? 'opacity-60' : ''}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md ${s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {s.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 truncate mt-1">{s.label}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(s.id, s.active)}
                    title={s.active ? 'Pause alert' : 'Resume alert'}
                    className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
                  >
                    {s.active ? <BellOff size={18} /> : <Bell size={18} />}
                  </button>
                  <button
                    onClick={() => removeSearch(s.id)}
                    title="Delete alert"
                    className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
