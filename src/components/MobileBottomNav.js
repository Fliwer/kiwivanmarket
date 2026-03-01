import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, Heart, MessageCircle, User } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

/**
 * MobileBottomNav — Premium native-app feel bottom navigation bar for mobile.
 * Displayed on screens smaller than md (768px).
 */
export default function MobileBottomNav({
    currentUser,
    favoritesCount,
    setShowFavorites,
    setShowAuthModal,
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { unreadCount } = useNotifications();

    const isActive = (path) => location.pathname === path;

    const handleFavorites = () => {
        if (!currentUser) return setShowAuthModal(true);
        setShowFavorites(true);
    };

    const handleMessages = () => {
        if (!currentUser) return setShowAuthModal(true);
        navigate('/messages');
    };

    const handleProfile = () => {
        if (!currentUser) return setShowAuthModal(true);
        navigate('/profile');
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom">
            {/* Frosted glass background */}
            <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200/70 shadow-[0_-4px_30px_rgba(0,0,0,0.08)]">
                <div className="flex items-stretch h-16 px-2">

                    {/* Browse */}
                    <button
                        onClick={() => navigate('/')}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 rounded-xl mx-0.5 ${isActive('/') ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        <div className={`p-1.5 rounded-xl transition-all ${isActive('/') ? 'bg-emerald-50' : ''}`}>
                            <Home size={21} strokeWidth={isActive('/') ? 2.5 : 1.8} />
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide ${isActive('/') ? 'text-emerald-600' : 'text-slate-400'}`}>Browse</span>
                    </button>

                    {/* Favorites */}
                    <button
                        onClick={handleFavorites}
                        className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 rounded-xl mx-0.5 text-slate-400 relative"
                    >
                        <div className="p-1.5 relative">
                            <Heart size={21} strokeWidth={1.8} className={favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''} />
                            {favoritesCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                                    {favoritesCount > 9 ? '9+' : favoritesCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold tracking-wide">Favorites</span>
                    </button>

                    {/* Sell — CTA button in the center */}
                    <div className="flex-1 flex flex-col items-center justify-center -mt-5 mx-1">
                        <button
                            onClick={() => navigate('/sell')}
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/40 flex items-center justify-center transition-all active:scale-90 hover:shadow-emerald-500/60 border-4 border-white"
                        >
                            <PlusCircle size={26} strokeWidth={2} className="text-white" />
                        </button>
                        <span className="text-[10px] font-bold tracking-wide text-emerald-600 mt-1">Sell</span>
                    </div>

                    {/* Messages */}
                    <button
                        onClick={handleMessages}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 rounded-xl mx-0.5 relative ${isActive('/messages') ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        <div className={`p-1.5 rounded-xl relative transition-all ${isActive('/messages') ? 'bg-emerald-50' : ''}`}>
                            <MessageCircle size={21} strokeWidth={isActive('/messages') ? 2.5 : 1.8} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide ${isActive('/messages') ? 'text-emerald-600' : 'text-slate-400'}`}>Messages</span>
                    </button>

                    {/* Profile */}
                    <button
                        onClick={handleProfile}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 rounded-xl mx-0.5 ${isActive('/profile') ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        {currentUser ? (
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm transition-all ${isActive('/profile') ? 'bg-emerald-600 shadow-md' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                                {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                            </div>
                        ) : (
                            <div className={`p-1.5 rounded-xl transition-all ${isActive('/profile') ? 'bg-emerald-50' : ''}`}>
                                <User size={21} strokeWidth={isActive('/profile') ? 2.5 : 1.8} />
                            </div>
                        )}
                        <span className={`text-[10px] font-bold tracking-wide ${isActive('/profile') ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {currentUser ? 'Profile' : 'Sign In'}
                        </span>
                    </button>

                </div>
            </div>
        </nav>
    );
}
