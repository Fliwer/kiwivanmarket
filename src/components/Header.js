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
    HelpCircle,
    Clock,
    LogOut,
    User,
    Mail
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
        <header className="sticky top-0 z-50 w-full px-4 py-3">
            <div className="max-w-7xl mx-auto glass-effect rounded-[2rem] px-6 py-2 transition-all duration-300">
                <div className="flex items-center justify-between h-14">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg bg-[#f7eedd] overflow-hidden transition-transform group-hover:scale-110">
                            <img src="/kiwi-van-logo-48.webp" alt="Kiwi Van Market" className="w-8 h-8 object-contain" width="32" height="32" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">KiwiVan</h1>
                            <p className="text-[10px] uppercase tracking-widest font-black text-emerald-600 leading-none">Market</p>
                        </div>
                    </Link>

                    {/* Navigation - Desktop Central */}
                    <nav className="hidden md:flex items-center gap-1 ml-6">
                        <Link
                            to="/guides"
                            className="px-4 py-2 text-slate-600 font-medium hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all flex items-center gap-2 text-sm"
                        >
                            <BookOpen size={16} />
                            <span>Guides</span>
                        </Link>

                        <Link
                            to="/buyback-calculator"
                            className="px-4 py-2 text-slate-600 font-medium hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all flex items-center gap-2 text-sm"
                        >
                            <Calculator size={16} />
                            <span>Calculator</span>
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
                                                    {t('header.my_listings') || 'My Listings'}
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

                    {/* Mobile Controls */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={() => navigate('/sell')}
                            className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                            title="Add Van"
                        >
                            <Plus size={20} />
                        </button>
                        <button
                            onClick={() => currentUser ? navigate('/messages') : setShowAuthModal(true)}
                            className="p-2 text-slate-600 relative"
                        >
                            <MessageCircle size={22} />
                            <MessageBadge />
                        </button>
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-2xl shadow-lg transition-transform active:scale-90"
                        >
                            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden pt-4 pb-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <Link
                                to="/guides"
                                onClick={() => setShowMobileMenu(false)}
                                className="bg-slate-50 p-4 rounded-3xl flex flex-col items-center gap-2 border border-slate-100"
                            >
                                <div className="p-3 bg-white rounded-2xl shadow-sm"><BookOpen size={20} className="text-emerald-600" /></div>
                                <span className="text-xs font-bold text-slate-800">Guides</span>
                            </Link>
                            <Link
                                to="/buyback-calculator"
                                onClick={() => setShowMobileMenu(false)}
                                className="bg-slate-50 p-4 rounded-3xl flex flex-col items-center gap-2 border border-slate-100"
                            >
                                <div className="p-3 bg-white rounded-2xl shadow-sm"><Calculator size={20} className="text-emerald-600" /></div>
                                <span className="text-xs font-bold text-slate-800">Calculator</span>
                            </Link>
                        </div>

                        <div className="px-1 mb-6">
                            <Link
                                to="/contact"
                                onClick={() => setShowMobileMenu(false)}
                                className="w-full bg-slate-50 p-4 rounded-3xl flex items-center gap-4 border border-slate-100"
                            >
                                <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600"><Mail size={20} /></div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-slate-800">Need Help?</p>
                                    <p className="text-[10px] text-slate-400">Contact our support team</p>
                                </div>
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {!currentUser ? (
                                <button
                                    onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold shadow-xl active:scale-95 transition-all"
                                >
                                    <Users size={20} />
                                    <span>{t('header.signin')}</span>
                                </button>
                            ) : (
                                <>
                                    <div className="p-2 bg-slate-50 rounded-[1.5rem] border border-slate-100 mb-4">
                                        <button
                                            onClick={() => { navigate('/profile'); setShowMobileMenu(false); }}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 font-semibold"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white"><User size={20} /></div>
                                            <span>My Profile</span>
                                        </button>
                                        <button
                                            onClick={() => { navigate('/my-listings'); setShowMobileMenu(false); }}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 font-semibold border-t border-slate-100"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm transition-transform active:scale-95">
                                                <MapPin size={20} />
                                            </div>
                                            <span>{t('header.my_listings') || 'My Listings'}</span>
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => { logout(); setShowMobileMenu(false); }}
                                        className="w-full py-4 text-red-600 font-bold bg-red-50 rounded-[1.5rem] flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={20} />
                                        <span>Sign Out</span>
                                    </button>
                                </>
                            )}
                            <div className="pt-4 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <CurrencySelector />
                                    <LanguageSelector />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header >
    );
}
