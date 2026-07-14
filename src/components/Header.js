import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    BookOpen,
    Calculator,
    Plus,
    Search,
    Heart,
    MessageCircle,
    Users,
    Menu,
    X,
    MapPin,
    Settings,
    ChevronDown,
    ChevronRight,
    HelpCircle,
    Clock,
    LogOut,
    User,
    Mail,
    Shield
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import NotificationBell from './NotificationBell';
import MessageBadge from './MessageBadge';
import CurrencySelector from './CurrencySelector';

// Note: I will move LanguageSelector, MessageBadge to their own files if they are not already.
// According to my previous list_dir, they are NOT separate files in src/components.
// They are defined inside App.js.

export default function Header({
    setShowBuybackCalculator,
    searchTerm,
    setSearchTerm,
    currentUser,
    favoritesCount,
    setShowFavorites,
    setShowAuthModal,
    setShowMessagingPage,
    setShowUserMenu,
    setShowMobileMenu,
    showMobileMenu,
    isAdmin,
    logout,
    setShowAdminDashboard,
    setShowUserProfile,
    // Components passed as props or imported if moved
    LanguageSelectorComp,
    NotificationBellComp,
    MessageBadgeComp
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showUserMenuDropdown, setShowUserMenuDropdown] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full px-2 py-1.5 md:sticky md:px-4 md:py-3">
            <div className="max-w-7xl mx-auto glass-effect rounded-xl md:rounded-[2rem] px-3 md:px-6 py-1 md:py-2 transition-all duration-300">
                <div className="flex items-center justify-between h-10 md:h-14">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg bg-[#f7eedd] overflow-hidden transition-transform group-hover:scale-110">
                            <img src="/kiwi-van-logo-48.webp" alt="Kiwi Van Market" className="w-6 h-6 object-contain" width="24" height="24" />
                        </div>
                        <div className="block">
                            <h1 className="text-base md:text-lg font-bold text-slate-900 leading-tight">KiwiVan</h1>
                            <p className="text-[9px] md:text-[10px] uppercase tracking-widest font-black text-emerald-600 leading-none">Market</p>
                        </div>
                    </Link>

                    {/* Navigation - Desktop Central */}
                    <nav className="hidden md:flex items-center gap-1 ml-6">
                        <Link
                            to="/guides"
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 rounded-xl transition-all flex items-center gap-2 text-sm border border-emerald-200/50 hover:border-emerald-300"
                        >
                            <BookOpen size={15} className="text-emerald-600" />
                            <span>{t('header.guides')}</span>
                        </Link>

                        <Link
                            to="/buyback-calculator"
                            className="px-4 py-2 text-slate-600 font-medium hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all flex items-center gap-2 text-sm"
                        >
                            <Calculator size={16} />
                            <span>{t('header.calculator')}</span>
                        </Link>
                    </nav>

                    {/* Barre de recherche - Desktop Content-Aware */}
                    <div className="hidden lg:flex flex-1 max-w-sm mx-8">
                        <div className="relative w-full group">
                            <input
                                type="text"
                                placeholder="Search campervans..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border border-transparent rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm"
                                aria-label="Search campervans"
                            />
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                    </div>

                    {/* Actions & Profile - Desktop Right */}
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => navigate('/sell')}
                            className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 mr-2"
                        >
                            <Plus size={16} />
                            <span>Sell Van</span>
                        </button>

                        <div className="h-8 w-[1px] bg-slate-200 mx-1" />

                        <div className="flex items-center gap-1">
                            <CurrencySelector />
                            <LanguageSelector />
                        </div>

                        {currentUser && (
                            <NotificationBell
                                user={currentUser}
                                onNotificationClick={(notif) => {
                                    if (notif.type === 'new_message') navigate('/messages');
                                }}
                            />
                        )}

                        <button
                            onClick={() => currentUser ? setShowFavorites(true) : setShowAuthModal(true)}
                            className="p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all relative"
                            title="Favorites"
                        >
                            <Heart size={20} className={favoritesCount > 0 ? "fill-red-500 text-red-500" : ""} />
                        </button>

                        <button
                            onClick={() => currentUser ? navigate('/messages') : setShowAuthModal(true)}
                            className="p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all relative"
                            title="Messages"
                        >
                            <MessageCircle size={20} />
                            <MessageBadge />
                        </button>

                        {!currentUser ? (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="ml-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95"
                            >
                                {t('header.signin')}
                            </button>
                        ) : (
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setShowUserMenuDropdown(v => !v)}
                                    className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm hover:scale-105 transition-transform"
                                >
                                    {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                                </button>

                                {showUserMenuDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-[100]" onClick={() => setShowUserMenuDropdown(false)} />
                                        <div className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 py-2 z-[101] overflow-hidden animate-fade-in-up">
                                            <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100">
                                                <p className="font-bold text-slate-900 truncate">{currentUser.displayName || 'Account'}</p>
                                                <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                                            </div>
                                            <div className="p-2">
                                                <button
                                                    onClick={() => { navigate('/profile'); setShowUserMenuDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-2xl transition-all"
                                                >
                                                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><User size={16} /></div>
                                                    My Profile
                                                </button>
                                                <button
                                                    onClick={() => { navigate('/my-listings'); setShowUserMenuDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-2xl transition-all"
                                                >
                                                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><MapPin size={16} /></div>
                                                    {t('menu.listings') || 'My Vans'}
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => { setShowAdminDashboard(true); setShowUserMenuDropdown(false); }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-amber-900 hover:bg-amber-50 rounded-2xl transition-all"
                                                    >
                                                        <div className="p-2 bg-amber-100 rounded-xl text-amber-600"><Settings size={16} /></div>
                                                        Admin Panel
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { navigate('/contact'); setShowUserMenuDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-2xl transition-all"
                                                >
                                                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><HelpCircle size={16} /></div>
                                                    Contact Us
                                                </button>
                                            </div>
                                            <div className="p-2 border-t border-slate-100">
                                                <button
                                                    onClick={() => { logout(); setShowUserMenuDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                                >
                                                    <div className="p-2 bg-red-100 rounded-xl text-red-600"><LogOut size={16} /></div>
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile : bouton burger clean (devise/langue déplacées dans le menu) */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            aria-label="Menu"
                            aria-expanded={showMobileMenu}
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-800 hover:bg-slate-100 active:scale-95 transition"
                        >
                            {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <>
                    {/* Fond cliquable : taper à côté ferme le menu (geste naturel mobile) */}
                    <div
                        className="md:hidden fixed inset-0 top-14 bg-slate-900/20 z-30"
                        onClick={() => setShowMobileMenu(false)}
                        aria-hidden="true"
                    />
                    <div className="md:hidden relative z-40 mt-2 bg-white rounded-3xl shadow-2xl shadow-slate-300/40 border border-slate-100 p-3 animate-in fade-in slide-in-from-top-4 duration-200">
                        {/* En-tête du menu */}
                        <div className="flex items-center justify-between mb-3 px-1.5">
                            <span className="text-base font-black text-slate-900">Menu</span>
                            <button
                                onClick={() => setShowMobileMenu(false)}
                                aria-label="Fermer le menu"
                                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-95 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Carte utilisateur */}
                        {currentUser && (
                            <button
                                onClick={() => { navigate('/profile'); setShowMobileMenu(false); }}
                                className="w-full flex items-center gap-3 p-3 mb-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 active:scale-[0.98] transition"
                            >
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0">
                                    {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{currentUser.displayName || 'Mon compte'}</p>
                                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                                </div>
                                <ChevronRight size={18} className="text-emerald-400 ml-auto flex-shrink-0" />
                            </button>
                        )}

                        {/* Accès rapides */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <Link to="/guides" onClick={() => setShowMobileMenu(false)} className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 transition active:scale-95">
                                <BookOpen size={20} className="text-emerald-600" />
                                <span className="text-xs font-bold text-slate-700">{t('header.guides', 'Guides')}</span>
                            </Link>
                            <Link to="/buyback-calculator" onClick={() => setShowMobileMenu(false)} className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 transition active:scale-95">
                                <Calculator size={20} className="text-emerald-600" />
                                <span className="text-xs font-bold text-slate-700">{t('header.calculator', 'Calculateur')}</span>
                            </Link>
                        </div>

                        {/* Liste d'actions */}
                        <div className="rounded-2xl border border-slate-100 overflow-hidden mb-3">
                            {currentUser && (
                                <button onClick={() => { navigate('/my-listings'); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition text-left">
                                    <MapPin size={18} className="text-emerald-600 flex-shrink-0" />
                                    <span className="font-semibold text-slate-700 text-sm">{t('menu.listings', 'Mes Vans')}</span>
                                    <ChevronRight size={16} className="text-slate-300 ml-auto" />
                                </button>
                            )}
                            <Link to="/contact" onClick={() => setShowMobileMenu(false)} className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition ${currentUser ? 'border-t border-slate-100' : ''}`}>
                                <Mail size={18} className="text-emerald-600 flex-shrink-0" />
                                <span className="font-semibold text-slate-700 text-sm">{t('header.help', "Besoin d'aide ?")}</span>
                                <ChevronRight size={16} className="text-slate-300 ml-auto" />
                            </Link>
                        </div>

                        {/* Devise + langue */}
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <CurrencySelector />
                            <LanguageSelector />
                        </div>

                        {/* Connexion / Déconnexion */}
                        {!currentUser ? (
                            <button
                                onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-2xl font-bold active:scale-95 transition"
                            >
                                <Users size={18} />
                                <span>{t('header.signin')}</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => { logout(); setShowMobileMenu(false); }}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 rounded-2xl font-bold active:scale-95 transition"
                            >
                                <LogOut size={18} />
                                <span>{t('header.signout', 'Se déconnecter')}</span>
                            </button>
                        )}
                    </div>
                    </>
                )}

            </div>
        </header >
    );
}
