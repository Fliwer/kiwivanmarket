import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Heart, Plus, MessageCircle, User, Menu } from 'lucide-react';
import MessageBadge from './MessageBadge';

export default function BottomNavigation({
    currentUser,
    favoritesCount,
    setShowAuthModal,
    setShowFavorites,
    showMobileMenu,
    setShowMobileMenu
}) {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;
    const isVanPage = location.pathname.startsWith('/van/');

    if (isVanPage) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-3 pb-[calc(1rem+env(safe-area-inset-bottom))] z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between max-w-md mx-auto relative">
                
                {/* Explore / Home */}
                <button 
                    onClick={() => {
                        if (location.pathname === '/') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                            navigate('/');
                        }
                    }}
                    className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Search size={22} strokeWidth={isActive('/') ? 3 : 2} />
                    <span className="text-[10px] font-bold">Explore</span>
                </button>

                {/* Favorites */}
                <button 
                    onClick={() => currentUser ? setShowFavorites(true) : setShowAuthModal(true)}
                    className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 relative"
                >
                    <Heart size={22} className={favoritesCount > 0 ? "fill-red-500 text-red-500" : ""} strokeWidth={2} />
                    <span className="text-[10px] font-bold">{t('header.favorites') || 'Favorites'}</span>
                </button>

                {/* Sell CTA (Center Floating Button) */}
                <div className="relative -top-6 flex flex-col items-center">
                    <button 
                        onClick={() => navigate('/sell')}
                        className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 border-4 border-white active:scale-95 transition-all"
                    >
                        <Plus size={28} strokeWidth={3} />
                    </button>
                    <span className="text-[10px] font-bold text-slate-900 mt-1">Sell Van</span>
                </div>

                {/* Messages */}
                <button 
                    onClick={() => currentUser ? navigate('/messages') : setShowAuthModal(true)}
                    className={`flex flex-col items-center gap-1 relative ${isActive('/messages') ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <div className="relative">
                        <MessageCircle size={22} strokeWidth={isActive('/messages') ? 3 : 2} />
                        <MessageBadge />
                    </div>
                    <span className="text-[10px] font-bold">{t('header.messages') || 'Messages'}</span>
                </button>

                {/* Profile / Menu */}
                <button 
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className={`flex flex-col items-center gap-1 ${showMobileMenu ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {currentUser ? (
                         <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-200 font-bold text-xs uppercase overflow-hidden">
                             {currentUser.photoURL ? <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover"/> : currentUser.displayName?.[0] || 'U'}
                         </div>
                    ) : (
                        <User size={22} strokeWidth={showMobileMenu ? 3 : 2} />
                    )}
                    <span className="text-[10px] font-bold">{currentUser ? 'Profile' : 'Log In'}</span>
                </button>

            </div>
        </div>
    );
}
