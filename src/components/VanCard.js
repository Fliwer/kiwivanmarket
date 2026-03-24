import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Shield, ChevronLeft, ChevronRight, CheckCircle, Calendar, Star } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { getThumbnail } from '../utils/imageOptimizer';
import { safeDate } from '../utils/dateHelper';
import { formatMileage } from '../utils/formatHelper';
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '../hooks/useAutoTranslate';

// Carousel de photos pour la card
const ImageCarousel = ({ images, title, vanStatus, priority = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStart = useRef(null);

  const allImages = images?.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800'];

  const goNext = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const goPrev = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Simple swipe logic
  const onTouchStart = (e) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;

    if (diff > 50) goNext(); // Swipe left
    if (diff < -50) goPrev(); // Swipe right
    touchStart.current = null;
  };

  return (
    <div
      className="relative group overflow-hidden h-64"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background for images while loading */}
      <div className="absolute inset-0 bg-slate-100 z-0" />

      <img
        src={getThumbnail(allImages[currentIndex]) || '/placeholder-van.jpg'}
        alt={`Campervan for sale NZ - ${title} ${currentIndex + 1} - Kiwi Van Market`}
        className={`relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${vanStatus === 'sold' ? 'grayscale-[0.5] contrast-[0.8]' : 'opacity-100'}`}
        loading={priority ? "eager" : "lazy"}
      />

      {vanStatus === 'sold' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <div className="bg-red-600/90 backdrop-blur-md text-white px-8 py-3 rounded-2xl font-black text-2xl uppercase tracking-[0.2em] shadow-2xl border-2 border-white/30 rotate-[-12deg] flex items-center gap-2">
            <CheckCircle size={24} fill="currentColor" strokeWidth={3} className="text-red-100" />
            Sold
          </div>
        </div>
      )}

      {/* Navigation arrows */}
      {allImages.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-slate-900 rounded-2xl p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/30"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-slate-900 rounded-2xl p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/30"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
            {allImages.slice(0, 8).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                  ? 'bg-white w-4'
                  : 'bg-white/40 w-1.5'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Composant VanCard complet
export default function VanCard({ van, formatPrice, priority = false, setShowAuthModal }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t } = useTranslation();
  const { translatedText: translatedTitle } = useAutoTranslate(van.title);

  const images = van.images?.length > 0
    ? van.images
    : (van.imageUrl ? [van.imageUrl] : null);

  return (
    <Link
      to={`/van/${van.id}`}
      className="premium-card group block overflow-hidden"
    >
      <div className="relative">
        <ImageCarousel images={images} title={translatedTitle} vanStatus={van.status} priority={priority} />

        {/* Favorite button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(van.id, setShowAuthModal); }}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all z-20 group/fav"
        >
          <Heart
            size={20}
            className={`transition-colors ${isFavorite(van.id) ? 'text-red-500 fill-red-500' : 'text-slate-400 group-hover/fav:text-red-400'}`}
          />
        </button>


        {/* Badges container */}
        <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-2">
          {van.featured && (
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-[0_4px_15px_rgba(251,191,36,0.5)] border border-white/40 flex items-center gap-1.5 animate-pulse">
              <Star size={12} fill="currentColor" />
              Promoted
            </div>
          )}
          {van.views > 50 && (
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-[0_4px_15px_rgba(225,29,72,0.5)] border border-white/40 flex items-center gap-1.5 animate-pulse">
              <span className="text-base leading-none">🔥</span>
              Hot
            </div>
          )}
          {van.buyBack && (
            <div className="bg-emerald-600/90 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg border border-white/20 flex items-center gap-1.5">
              <Shield size={12} fill="currentColor" />
              Buyback
            </div>
          )}
        </div>

        {/* Self-contained marker */}
        {van.selfContained && (
          <div className={`absolute bottom-4 left-4 backdrop-blur-md text-white px-3 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-2xl flex items-center gap-2 border border-white/30 ${van.selfContainedType === 'blue' ? 'bg-blue-600/90' : 'bg-emerald-600/90'
            }`}>
            <span className="text-sm leading-none">{van.selfContainedType === 'blue' ? '🔵' : '🟢'}</span>
            {van.selfContainedType === 'blue' ? t('van_page.sticker_blue') : t('van_page.sticker_green')}
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[3.5rem]">
              {translatedTitle}
            </h3>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <MapPin size={14} className="text-emerald-500" />
                <span className="font-medium">{van.location}</span>
              </div>
              
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest border border-emerald-100">
                <Shield size={10} fill="currentColor" />
                Verified
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
          <div className="flex flex-col flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Year</span>
            <span className="text-slate-900 font-bold">{van.year}</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-200" />
          <div className="flex flex-col flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Km</span>
            <span className="text-slate-900 font-bold">{formatMileage(van.mileage)}</span>
          </div>
        </div>

        {/* Compliance row — always visible */}
        {(van.wofExpiry || van.regoExpiry || van.selfContained) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {van.wofExpiry && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide">
                <CheckCircle size={11} className="text-emerald-600" />
                WOF
                <span className="font-semibold normal-case tracking-normal text-emerald-600 ml-0.5">
                  · {safeDate(van.wofExpiry)?.toLocaleDateString('en-NZ', { month: 'short', year: '2-digit' }) || '✓'}
                </span>
              </span>
            )}
            {van.regoExpiry && (
              <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide">
                <Calendar size={11} className="text-blue-600" />
                REGO
                <span className="font-semibold normal-case tracking-normal text-blue-600 ml-0.5">
                  · {safeDate(van.regoExpiry)?.toLocaleDateString('en-NZ', { month: 'short', year: '2-digit' }) || '✓'}
                </span>
              </span>
            )}
            {van.selfContained && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${van.selfContainedType === 'blue'
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                }`}>
                <span className="text-[11px] leading-none">{van.selfContainedType === 'blue' ? '🔵' : '🟢'}</span>
                Self-Contained
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Price</span>
            <div className="text-2xl font-black text-slate-900">
              {formatPrice ? formatPrice(van.price) : `$${(van.price || 0).toLocaleString()}`}
            </div>
          </div>

          <div className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-200 group-hover:scale-110 group-hover:translate-x-1 transition-all">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
}
