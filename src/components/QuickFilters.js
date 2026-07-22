import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search,
    Shield,
    CheckCircle,
    X,
    Filter,
    ChevronDown,
    SlidersHorizontal,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const BRAND_OPTIONS = [
    { value: 'toyota', label: 'Toyota' },
    { value: 'nissan', label: 'Nissan' },
    { value: 'mazda', label: 'Mazda' },
    { value: 'mitsubishi', label: 'Mitsubishi' },
    { value: 'ford', label: 'Ford' },
    { value: 'mercedes', label: 'Mercedes' },
    { value: 'hyundai', label: 'Hyundai' },
    { value: 'volkswagen', label: 'Volkswagen' },
];
const MILEAGE_OPTIONS = [
    { value: 0, label: 'Any mileage' },
    { value: 100000, label: 'Under 100,000 km' },
    { value: 150000, label: 'Under 150,000 km' },
    { value: 200000, label: 'Under 200,000 km' },
    { value: 250000, label: 'Under 250,000 km' },
    { value: 300000, label: 'Under 300,000 km' },
];
const SLEEPS_OPTIONS = [
    { value: 0, label: 'Any' },
    { value: 2, label: '2+ people' },
    { value: 3, label: '3+ people' },
    { value: 4, label: '4+ people' },
];

export default function QuickFilters({
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    showBuyBackInfo,
    setShowBuyBackInfo,
    showRegoInfo,
    setShowRegoInfo,
    showSelfContainedInfo,
    setShowSelfContainedInfo,
    showWofInfo,
    setShowWofInfo
}) {
    const { t } = useTranslation();
    const [showMobileDrawer, setShowMobileDrawer] = useState(false);

    const activeFilterCount = [
        filters.buyBack, filters.regoValid, filters.selfContained, filters.wofValid,
        ...Object.values(filters.equipment || {})
    ].filter(Boolean).length + (filters.priceMin > 0 || filters.priceMax < 500000 ? 1 : 0) + (filters.yearMin > 1990 ? 1 : 0) + (filters.location !== 'all' ? 1 : 0) + (filters.type !== 'all' ? 1 : 0) + (filters.brand && filters.brand !== 'all' ? 1 : 0) + (filters.mileageMax ? 1 : 0) + (filters.capacityMin ? 1 : 0);

    return (
        <div className="bg-transparent">
            <div className="max-w-7xl mx-auto px-4 py-4">

                {/* Search Mobile — sur mobile/tablette : UNE barre + UN bouton Filters
                    (le tiroir contient déjà tous les filtres rapides). Les pastilles
                    et le 2e bouton Filters sont réservés au desktop → épuré. */}
                <div className="lg:hidden mb-1">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                            <input
                                type="text"
                                placeholder="Search campervans..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                aria-label="Search campervans"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        {/* Mobile Filters Button */}
                        <button
                            onClick={() => setShowMobileDrawer(true)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${activeFilterCount > 0 ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-gray-200 text-gray-700'}`}
                        >
                            <SlidersHorizontal size={18} />
                            <span>Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="w-5 h-5 bg-white text-emerald-700 text-[11px] font-black rounded-full flex items-center justify-center">{activeFilterCount}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Slide-Up Filter Drawer (lg:hidden — dispo aussi sur tablette,
                    où le bouton l'ouvrait alors que le tiroir était masqué en md) */}
                {showMobileDrawer && (
                    <div className="lg:hidden fixed inset-0 z-[200] flex flex-col justify-end">
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileDrawer(false)} />
                        {/* Drawer */}
                        <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full bg-gray-300" />
                            </div>
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-black text-gray-900">Filters</h2>
                                    {activeFilterCount > 0 && (
                                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full">{activeFilterCount} active</span>
                                    )}
                                </div>
                                <button onClick={() => setShowMobileDrawer(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="px-6 pb-32 pt-4 space-y-6">

                                {/* Quick Chips Mobile */}
                                <div>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Quick Filters</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[{ key: 'buyBack', label: t('filters.buyback'), color: 'green', icon: '🛡️' }, { key: 'regoValid', label: t('filters.rego'), color: 'purple', icon: '📋' }, { key: 'selfContained', label: t('filters.self_contained'), color: 'blue', icon: '🏕️' }, { key: 'wofValid', label: t('filters.wof'), color: 'emerald', icon: '🔧' }].map(f => (
                                            <button key={f.key} onClick={() => setFilters({ ...filters, [f.key]: !filters[f.key] })}
                                                className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${filters[f.key] ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}>
                                                <span>{f.icon}</span>
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{t('filters.price_range')}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                            <input type="number" min="0" max={filters.priceMax} step="1000" value={filters.priceMin}
                                                onChange={(e) => { const val = parseInt(e.target.value) || 0; if (val <= filters.priceMax) setFilters({ ...filters, priceMin: val }); }}
                                                placeholder="Min" className="w-full pl-7 pr-3 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                                            />
                                        </div>
                                        <span className="text-gray-400 font-medium">—</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                            <input type="number" min={filters.priceMin} max="500000" step="1000" value={filters.priceMax}
                                                onChange={(e) => { const val = parseInt(e.target.value) || 50000; if (val >= filters.priceMin) setFilters({ ...filters, priceMax: val }); }}
                                                placeholder="Max" className="w-full pl-7 pr-3 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Year */}
                                <div>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{t('filters.year')}: <span className="text-emerald-600">{filters.yearMin}+</span></p>
                                    <input type="range" min="1990" max={CURRENT_YEAR} step="1" value={filters.yearMin}
                                        onChange={(e) => setFilters({ ...filters, yearMin: parseInt(e.target.value) })}
                                        className="w-full accent-emerald-500 h-2 rounded-lg" />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1990</span><span>{CURRENT_YEAR}</span></div>
                                </div>

                                {/* Location */}
                                <div>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{t('filters.location')}</p>
                                    <select value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium">
                                        <option value="all">All New Zealand</option>
                                        <optgroup label="North Island"><option value="Auckland">Auckland</option><option value="Wellington">Wellington</option><option value="Hamilton">Hamilton</option><option value="Tauranga">Tauranga</option><option value="Rotorua">Rotorua</option></optgroup>
                                        <optgroup label="South Island"><option value="Christchurch">Christchurch</option><option value="Queenstown">Queenstown</option><option value="Dunedin">Dunedin</option></optgroup>
                                    </select>
                                </div>

                                {/* Brand */}
                                <div>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{t('filters.brand') || 'Brand'}</p>
                                    <select value={filters.brand || 'all'} onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium">
                                        <option value="all">{t('filters.all_brands') || 'All Brands'}</option>
                                        {BRAND_OPTIONS.map(b => (<option key={b.value} value={b.value}>{b.label}</option>))}
                                    </select>
                                </div>

                                {/* Mileage */}
                                <div>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{t('filters.mileage') || 'Max Mileage'}</p>
                                    <select value={filters.mileageMax || 0} onChange={(e) => setFilters({ ...filters, mileageMax: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium">
                                        {MILEAGE_OPTIONS.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                                    </select>
                                </div>

                                {/* Sleeps */}
                                <div>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{t('filters.sleeps') || 'Sleeps'}</p>
                                    <select value={filters.capacityMin || 0} onChange={(e) => setFilters({ ...filters, capacityMin: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium">
                                        {SLEEPS_OPTIONS.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
                                    </select>
                                </div>

                                {/* Equipment */}
                                <div>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">🔧 {t('filters.equipment')}</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[{ key: 'doubleBed', emoji: '🛏️', label: 'Bed' }, { key: 'fridge', emoji: '🧊', label: 'Fridge' }, { key: 'gasStove', emoji: '🔥', label: 'Stove' }, { key: 'sink', emoji: '🚰', label: 'Sink' }, { key: 'toilet', emoji: '🚽', label: 'Toilet' }, { key: 'shower', emoji: '🚿', label: 'Shower' }, { key: 'solarPanel', emoji: '☀️', label: 'Solar' }, { key: 'leisureBattery', emoji: '🔋', label: 'Battery' }, { key: 'heater', emoji: '🌡️', label: 'Heater' }, { key: 'dieselHeater', emoji: '🔥', label: 'Diesel' }, { key: 'insulation', emoji: '🧥', label: 'Insulated' }, { key: 'surfRack', emoji: '🏄', label: 'Rack' }].map(item => (
                                            <button key={item.key} onClick={() => setFilters({ ...filters, equipment: { ...filters.equipment, [item.key]: !filters.equipment[item.key] } })}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl text-xs font-bold transition-all active:scale-95 ${filters.equipment[item.key] ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
                                                <span className="text-xl">{item.emoji}</span>
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* Footer: Apply + Reset */}
                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 flex gap-3">
                                {activeFilterCount > 0 && (
                                    <button onClick={() => setFilters({ priceMin: 0, priceMax: 500000, yearMin: 1990, location: 'all', type: 'all', brand: 'all', mileageMax: 0, capacityMin: 0, buyBack: false, regoValid: false, selfContained: false, wofValid: false, equipment: { doubleBed: false, fridge: false, gasStove: false, sink: false, toilet: false, solarPanel: false, leisureBattery: false, heater: false, dieselHeater: false, shower: false, insulation: false, surfRack: false } })}
                                        className="flex-1 py-4 rounded-2xl font-bold text-red-600 bg-red-50 text-sm active:scale-95 transition-all">
                                        Reset All
                                    </button>
                                )}
                                <button onClick={() => setShowMobileDrawer(false)}
                                    className="flex-1 py-4 rounded-2xl font-bold text-white bg-emerald-600 text-sm active:scale-95 transition-all shadow-lg shadow-emerald-600/30">
                                    {activeFilterCount > 0 ? `Show Results (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''})` : 'Show Results'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Filters — DESKTOP UNIQUEMENT (les pastilles doublonnaient
                    avec le tiroir mobile et créaient 2 boutons « Filters ») */}
                <div className="hidden lg:flex lg:items-center lg:justify-between gap-3">

                    <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-3 md:overflow-visible md:pb-0 md:flex-wrap">

                        {/* Buy-Back */}
                        <div className="relative w-full md:w-auto">
                            <button
                                onClick={() => setFilters({ ...filters, buyBack: !filters.buyBack })}
                                aria-pressed={filters.buyBack}
                                className={`w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 md:hover:scale-105 shadow-sm ${filters.buyBack
                                    ? 'bg-green-700 text-white shadow-md'
                                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400 hover:text-green-600'
                                    }`}>
                                <Shield size={16} className={filters.buyBack ? 'text-white' : 'text-green-500'} />
                                {t('filters.buyback')}
                            </button>
                            {showBuyBackInfo && (
                                <>
                                    <div className="fixed inset-0 z-[99] md:hidden" onClick={() => setShowBuyBackInfo(false)} />
                                    <div className="fixed left-4 right-4 top-48 md:absolute md:left-0 md:right-auto md:top-full md:mt-2 w-auto md:w-72 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-2xl z-[100]">
                                        <button onClick={() => setShowBuyBackInfo(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg md:hidden">✕</button>
                                        <div className="flex items-center gap-2 mb-2 pr-6 md:pr-0">
                                            <Shield size={18} className="text-emerald-400" />
                                            <span className="font-bold text-emerald-400">{t('filters.buyback')}</span>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed text-sm md:text-xs">
                                            {t('filters.buyback_desc')}
                                            <span className="text-white font-semibold"> Perfect for backpackers!</span>
                                        </p>
                                        <div className="hidden md:block absolute left-6 -top-2 w-4 h-4 bg-gray-900 rotate-45"></div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* REGO Valid */}
                        <div
                            className="relative w-full md:w-auto"
                        >
                            <button
                                onClick={() => setFilters({ ...filters, regoValid: !filters.regoValid })}
                                aria-pressed={filters.regoValid}
                                className={`w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 md:hover:scale-105 shadow-sm ${filters.regoValid
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400 hover:text-purple-600'
                                    }`}>
                                <CheckCircle size={16} className={filters.regoValid ? 'text-white' : 'text-purple-500'} />
                                {t('filters.rego')}
                            </button>
                            {showRegoInfo && (
                                <>
                                    <div className="fixed inset-0 z-[99] md:hidden" onClick={() => setShowRegoInfo(false)} />
                                    <div className="fixed left-4 right-4 top-48 md:absolute md:left-0 md:right-auto md:top-full md:mt-2 w-auto md:w-72 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-2xl z-[100]">
                                        <button onClick={() => setShowRegoInfo(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg md:hidden">✕</button>
                                        <div className="flex items-center gap-2 mb-2 pr-6 md:pr-0">
                                            <span className="text-purple-400 font-bold">📋 Vehicle Registration (REGO)</span>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed text-sm md:text-xs">
                                            <span className="text-white font-semibold">{t('filters.rego_desc')}</span>
                                            <span className="text-white font-semibold"> Check the sticker on the windscreen!</span>
                                        </p>
                                        <div className="hidden md:block absolute left-6 -top-2 w-4 h-4 bg-gray-900 rotate-45"></div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Self-Contained */}
                        <div
                            className="relative w-full md:w-auto"
                        >
                            <button
                                onClick={() => setFilters({ ...filters, selfContained: !filters.selfContained })}
                                aria-pressed={filters.selfContained}
                                className={`w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 md:hover:scale-105 shadow-sm ${filters.selfContained
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                                    }`}>
                                <CheckCircle size={16} className={filters.selfContained ? 'text-white' : 'text-blue-500'} />
                                <span className="md:hidden">Self-Cont</span>
                                <span className="hidden md:inline">{t('filters.self_contained')}</span>
                            </button>
                            {showSelfContainedInfo && (
                                <>
                                    <div className="fixed inset-0 z-[99] md:hidden" onClick={() => setShowSelfContainedInfo(false)} />
                                    <div className="fixed left-4 right-4 top-48 md:absolute md:left-0 md:right-auto md:top-full md:mt-2 w-auto md:w-72 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-2xl z-[100]">
                                        <button onClick={() => setShowSelfContainedInfo(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg md:hidden">✕</button>
                                        <div className="flex items-center gap-2 mb-2 pr-6 md:pr-0">
                                            <span className="text-blue-400 font-bold">🏕️ Self-Contained Certification</span>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed text-sm md:text-xs">
                                            A certified van with <span className="text-white font-semibold">toilet, fresh water & grey water tanks</span>.
                                            Required for freedom camping in most areas of NZ.
                                        </p>
                                        <div className="flex gap-3 mt-2 text-xs">
                                            <span><span className="text-green-400 font-bold">🟢 Green</span> = fixed toilet</span>
                                            <span><span className="text-blue-400 font-bold">🔵 Blue</span> = porta-potty</span>
                                        </div>
                                        <p className="text-white font-semibold text-sm md:text-xs mt-2">Essential for free camping!</p>
                                        <div className="hidden md:block absolute left-6 -top-2 w-4 h-4 bg-gray-900 rotate-45"></div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* WOF Valid */}
                        <div
                            className="relative w-full md:w-auto"
                        >
                            <button
                                onClick={() => setFilters({ ...filters, wofValid: !filters.wofValid })}
                                aria-pressed={filters.wofValid}
                                className={`w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 md:hover:scale-105 shadow-sm ${filters.wofValid
                                    ? 'bg-emerald-700 text-white shadow-md'
                                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
                                    }`}>
                                <CheckCircle size={16} className={filters.wofValid ? 'text-white' : 'text-emerald-500'} />
                                <span className="md:hidden">WOF</span>
                                <span className="hidden md:inline">{t('filters.wof')}</span>
                            </button>
                            {showWofInfo && (
                                <>
                                    <div className="fixed inset-0 z-[99] md:hidden" onClick={() => setShowWofInfo(false)} />
                                    <div className="fixed left-4 right-4 top-48 md:absolute md:left-0 md:right-auto md:top-full md:mt-2 w-auto md:w-72 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-2xl z-[100]">
                                        <button onClick={() => setShowWofInfo(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg md:hidden">✕</button>
                                        <div className="flex items-center gap-2 mb-2 pr-6 md:pr-0">
                                            <span className="text-emerald-400 font-bold">🔧 Warrant of Fitness (WOF)</span>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed text-sm md:text-xs">
                                            A <span className="text-white font-semibold">safety inspection</span> required every 6-12 months for all vehicles in NZ.
                                            It checks brakes, lights, tyres, steering and other safety features.
                                            <span className="text-white font-semibold"> You can't legally drive without a valid WOF!</span>
                                        </p>
                                        <div className="hidden md:block absolute left-6 -top-2 w-4 h-4 bg-gray-900 rotate-45"></div>
                                    </div>
                                </>
                            )}
                        </div>

                        {(filters.selfContained || filters.buyBack || filters.wofValid || filters.regoValid) && (
                            <button
                                onClick={() => setFilters({ ...filters, selfContained: false, buyBack: false, wofValid: false, regoValid: false })}
                                className="px-3 py-2 rounded-full text-sm font-semibold text-red-500 hover:bg-red-50 transition flex items-center gap-1">
                                <X size={14} />
                                {t('filters.clear')}
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        aria-expanded={showFilters}
                        aria-controls="filter-panel"
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition flex items-center gap-2 ${showFilters
                            ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'
                            }`}
                    >
                        <Filter size={16} />
                        {showFilters ? t('filters.hide_filters') : t('filters.show_filters')}
                        <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Panel Filtres Expandable */}
                {showFilters && (
                    <div id="filter-panel" className="mt-3 pt-3 border-t border-gray-200">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">

                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                    🔍 Find your perfect campervan
                                </h3>
                                {(Object.values(filters.equipment).some(v => v) || filters.priceMin > 0 || filters.priceMax < 500000 || filters.yearMin > 1980 || filters.location !== 'all' || filters.type !== 'all' || (filters.brand && filters.brand !== 'all') || filters.mileageMax || filters.capacityMin) && (
                                    <button
                                        onClick={() => setFilters({
                                            ...filters,
                                            priceMin: 0,
                                            priceMax: 500000,
                                            yearMin: 1980,
                                            location: 'all',
                                            type: 'all',
                                            brand: 'all',
                                            mileageMax: 0,
                                            capacityMin: 0,
                                            equipment: {
                                                doubleBed: false, fridge: false, gasStove: false, sink: false, toilet: false,
                                                solarPanel: false, leisureBattery: false, heater: false, dieselHeater: false,
                                                shower: false, insulation: false, surfRack: false
                                            }
                                        })}
                                        className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 px-3 py-1.5 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <X size={14} />
                                        {t('filters.reset')}
                                    </button>
                                )}
                            </div>

                            {/* Price Range & Year */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('filters.price_range')}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max={filters.priceMax}
                                                step="1000"
                                                value={filters.priceMin}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    if (val <= filters.priceMax) {
                                                        setFilters({ ...filters, priceMin: val });
                                                    }
                                                }}
                                                placeholder="Min"
                                                className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium"
                                            />
                                        </div>
                                        <span className="text-gray-400 font-medium">to</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                            <input
                                                type="number"
                                                min={filters.priceMin}
                                                max="500000"
                                                step="1000"
                                                value={filters.priceMax}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 50000;
                                                    if (val >= filters.priceMin) {
                                                        setFilters({ ...filters, priceMax: val });
                                                    }
                                                }}
                                                placeholder="Max"
                                                className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                                        <span>NZ${filters.priceMin.toLocaleString()} - ${filters.priceMax.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('filters.year')}: <span className="text-emerald-600 font-bold">{filters.yearMin}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1990"
                                        max={CURRENT_YEAR}
                                        step="1"
                                        value={filters.yearMin}
                                        onChange={(e) => setFilters({ ...filters, yearMin: parseInt(e.target.value) })}
                                        className="w-full accent-emerald-500 h-2 rounded-lg"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>1990</span>
                                        <span>{CURRENT_YEAR}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                                <div>
                                    <label htmlFor="filter-location" className="block text-sm font-semibold text-gray-700 mb-2">{t('filters.location')}</label>
                                    <select
                                        id="filter-location"
                                        value={filters.location}
                                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium">
                                        <option value="all">All New Zealand</option>
                                        <optgroup label="North Island">
                                            <option value="Auckland">Auckland</option>
                                            <option value="Wellington">Wellington</option>
                                            <option value="Hamilton">Hamilton</option>
                                            <option value="Tauranga">Tauranga</option>
                                            <option value="Rotorua">Rotorua</option>
                                        </optgroup>
                                        <optgroup label="South Island">
                                            <option value="Christchurch">Christchurch</option>
                                            <option value="Queenstown">Queenstown</option>
                                            <option value="Dunedin">Dunedin</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="filter-type" className="block text-sm font-semibold text-gray-700 mb-2">{t('filters.type')}</label>
                                    <select
                                        id="filter-type"
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium">
                                        <option value="all">All Types</option>
                                        <option value="Car">Car</option>
                                        <option value="Van">Van</option>
                                        <option value="Motorhome">Motorhome</option>
                                    </select>
                                </div>
                            </div>

                            {/* Brand, Mileage & Sleeps */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
                                <div>
                                    <label htmlFor="filter-brand" className="block text-sm font-semibold text-gray-700 mb-2">{t('filters.brand') || 'Brand'}</label>
                                    <select
                                        id="filter-brand"
                                        value={filters.brand || 'all'}
                                        onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium">
                                        <option value="all">{t('filters.all_brands') || 'All Brands'}</option>
                                        {BRAND_OPTIONS.map(b => (
                                            <option key={b.value} value={b.value}>{b.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="filter-mileage" className="block text-sm font-semibold text-gray-700 mb-2">{t('filters.mileage') || 'Max Mileage'}</label>
                                    <select
                                        id="filter-mileage"
                                        value={filters.mileageMax || 0}
                                        onChange={(e) => setFilters({ ...filters, mileageMax: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium">
                                        {MILEAGE_OPTIONS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="filter-sleeps" className="block text-sm font-semibold text-gray-700 mb-2">{t('filters.sleeps') || 'Sleeps'}</label>
                                    <select
                                        id="filter-sleeps"
                                        value={filters.capacityMin || 0}
                                        onChange={(e) => setFilters({ ...filters, capacityMin: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium">
                                        {SLEEPS_OPTIONS.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Equipment filters */}
                            <details className="group">
                                <summary className="cursor-pointer list-none">
                                    <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            🔧 {t('filters.equipment')}
                                            {Object.values(filters.equipment).some(v => v) && (
                                                <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                                                    {Object.values(filters.equipment).filter(v => v).length} selected
                                                </span>
                                            )}
                                        </span>
                                        <ChevronDown size={18} className="text-gray-500 transition-transform group-open:rotate-180" />
                                    </div>
                                </summary>
                                <div className="pt-3 pb-1">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                        {[
                                            { key: 'doubleBed', emoji: '🛏️', label: 'Double Bed' },
                                            { key: 'fridge', emoji: '🧊', label: 'Fridge' },
                                            { key: 'gasStove', emoji: '🔥', label: 'Gas Stove' },
                                            { key: 'sink', emoji: '🚰', label: 'Sink' },
                                            { key: 'toilet', emoji: '🚽', label: 'Toilet' },
                                            { key: 'shower', emoji: '🚿', label: 'Shower' },
                                            { key: 'solarPanel', emoji: '☀️', label: 'Solar Panel' },
                                            { key: 'leisureBattery', emoji: '🔋', label: 'Battery' },
                                            { key: 'heater', emoji: '🌡️', label: 'Heater' },
                                            { key: 'dieselHeater', emoji: '🔥', label: 'Diesel Heater' },
                                            { key: 'insulation', emoji: '🧥', label: 'Insulated' },
                                            { key: 'surfRack', emoji: '🏄', label: 'Surf/Bike Rack' },
                                        ].map(item => (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() => setFilters({
                                                    ...filters,
                                                    equipment: {
                                                        ...filters.equipment,
                                                        [item.key]: !filters.equipment[item.key]
                                                    }
                                                })}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${filters.equipment[item.key]
                                                    ? 'bg-emerald-700 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                                                    }`}
                                            >
                                                <span>{item.emoji}</span>
                                                <span className="text-xs">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </details>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
