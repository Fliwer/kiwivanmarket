import React from 'react';
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
    User
} from 'lucide-react';
import LanguageSelector from './LanguageSelector'; // Wait, LanguageSelector is in App.js currently
import NotificationBell from './NotificationBell';
import MessageBadge from './MessageBadge'; // Also in App.js

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

    return (
        <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-lg sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden" style={{ backgroundColor: '#f7eedd' }}>
                            <img src="/kiwi-van-logo-48.webp" alt="Kiwi Van Market" className="w-9 h-9 object-contain" width="36" height="36" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold">Kiwi Van Market</h1>
                            <p className="text-xs text-white/80">Buy & Sell Campervans 🇳🇿</p>
                        </div>
                    </div>

                    {/* Boutons d'action - Desktop */}
                    <div className="hidden md:flex items-center gap-3 ml-10">
                        <Link
                            to="/guide/buying-campervan-nz"
                            className="bg-white/20 text-white px-3 py-2 rounded-xl font-semibold hover:bg-white/30 transition flex items-center gap-2 text-sm"
                        >
                            <BookOpen size={18} />
                            <span className="hidden lg:inline">Guides</span>
                        </Link>

                        <Link
                            to="/buyback-calculator"
                            className="bg-white/20 text-white px-3 py-2 rounded-xl font-semibold hover:bg-white/30 transition flex items-center gap-2 text-sm"
                        >
                            <Calculator size={18} />
                            <span className="hidden lg:inline">Calculator</span>
                        </Link>

                        <button
                            onClick={() => navigate('/sell')}
                            className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-semibold hover:bg-emerald-50 transition flex items-center gap-2 text-sm shadow-md"
                        >
                            <Plus size={18} />
                            <span>Sell your van</span>
                        </button>
                    </div>

                    {/* Barre de recherche - Desktop */}
                    <div className="hidden lg:flex flex-1 max-w-md mx-6">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search campervans..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-12 py-2.5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/70 focus:bg-white focus:text-gray-800 focus:placeholder-gray-400 focus:border-white outline-none transition-all text-sm"
                                aria-label="Search campervans"
                            />
                            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70" aria-hidden="true" />
                        </div>
                    </div>

                    {/* Navigation Icons - Desktop */}
                    <div className="hidden md:flex items-center gap-1">
                        <LanguageSelector />

                        {currentUser && (
                            <NotificationBell
                                user={currentUser}
                                onNotificationClick={(notif) => {
                                    if (notif.type === 'new_message') {
                                        setShowMessagingPage(true);
                                    }
                                }}
                            />
                        )}

                        <button
                            onClick={() => currentUser ? setShowFavorites(true) : setShowAuthModal(true)}
                            className="relative flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                            title="My Favorites"
                            aria-label={t('header.favorites')}
                        >
                            <Heart size={22} className={favoritesCount > 0 ? "text-red-400 fill-red-400" : "text-white"} />
                            <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">{t('header.favorites')}</span>
                        </button>

                        <button
                            onClick={() => currentUser ? setShowMessagingPage(true) : setShowAuthModal(true)}
                            className="relative flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                            title="My Messages"
                            aria-label={t('header.messages')}
                        >
                            <MessageCircle size={22} className="text-white" />
                            <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">{t('header.messages')}</span>
                            <MessageBadge />
                        </button>

                        {!currentUser ? (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                            >
                                <Users size={22} className="text-white" />
                                <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">{t('header.signin')}</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowUserMenu(true)}
                                className="flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                            >
                                <div className="w-6 h-6 bg-white text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">
                                    {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">{t('header.profile')}</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={() => currentUser ? setShowMessagingPage(true) : setShowAuthModal(true)}
                            className="w-12 h-12 flex items-center justify-center relative shrink-0"
                            aria-label={t('header.messages')}
                        >
                            <MessageCircle size={24} />
                            <MessageBadge />
                        </button>
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-xl shrink-0"
                            aria-label="Toggle menu"
                            aria-expanded={showMobileMenu}
                        >
                            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {showMobileMenu && (
                    <div className="md:hidden py-4 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <Link
                                to="/guide/buying-campervan-nz"
                                onClick={() => setShowMobileMenu(false)}
                                className="bg-white/10 p-3 rounded-xl flex flex-col items-center gap-1"
                            >
                                <BookOpen size={20} />
                                <span className="text-xs font-semibold">Guides</span>
                            </Link>
                            <button
                                onClick={() => { setShowBuybackCalculator(true); setShowMobileMenu(false); }}
                                className="bg-white/10 p-3 rounded-xl flex flex-col items-center gap-1"
                            >
                                <Calculator size={20} />
                                <span className="text-xs font-semibold">Calculator</span>
                            </button>
                        </div>

                        <div className="space-y-1">
                            {!currentUser ? (
                                <button
                                    onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-white text-emerald-600 rounded-xl font-bold shadow-lg"
                                >
                                    <Users size={20} />
                                    <span>{t('header.signin')}</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { setShowUserProfile(true); setShowMobileMenu(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition"
                                    >
                                        <Users size={20} />
                                        <span>My Profile</span>
                                    </button>
                                    <button
                                        onClick={() => { navigate('/my-listings'); setShowMobileMenu(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition"
                                    >
                                        <MapPin size={20} />
                                        <span>My Listings</span>
                                    </button>
                                    {isAdmin && (
                                        <button
                                            onClick={() => { setShowAdminDashboard(true); setShowMobileMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition text-yellow-300"
                                        >
                                            <Settings size={20} />
                                            <span>Admin Dashboard</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { logout(); setShowMobileMenu(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-white/10 rounded-xl transition"
                                    >
                                        <X size={20} />
                                        <span>Sign Out</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
