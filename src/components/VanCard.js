import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { getThumbnail } from '../utils/imageOptimizer';
import { safeDate } from '../utils/dateHelper';
import { useTranslation } from 'react-i18next';

// Carousel de photos pour la card
const ImageCarousel = ({ images, title, priority = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  return (
    <div className="relative group overflow-hidden h-64">
      {/* Background for images while loading */}
      <div className="absolute inset-0 bg-slate-100 z-0" />

      <img
        src={getThumbnail(allImages[currentIndex])}
        alt={`${title} - ${currentIndex + 1}`}
        className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-100"
        loading={priority ? "eager" : "lazy"}
      />

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
export default function VanCard({ van, formatPrice, priority = false }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t } = useTranslation();

  const images = van.images?.length > 0
    ? van.images
    : (van.imageUrl ? [van.imageUrl] : null);

  return (
    <Link
      to={`/van/${van.id}`}
      className="premium-card group block overflow-hidden"
    >
      <div className="relative">
        <ImageCarousel images={images} title={van.title} priority={priority} />

        {/* Favorite button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(van.id); }}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all z-20 group/fav"
        >
          <Heart
            size={20}
            className={`transition-colors ${isFavorite(van.id) ? 'text-red-500 fill-red-500' : 'text-slate-400 group-hover/fav:text-red-400'}`}
          />
        </button>

        {/* Status Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {van.featured && (
            <div className="bg-amber-400 text-amber-950 px-3 py-1 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg border border-amber-300 flex items-center gap-1.5">
              <Shield size={12} fill="currentColor" />
              Featured
            </div>
          )}
          {van.buyBack && (
            <div className="bg-emerald-500 text-white px-3 py-1 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg border border-emerald-400 flex items-center gap-1.5">
              <Shield size={12} fill="currentColor" />
              Buyback
            </div>
          )}
        </div>

        {/* Self-contained bottom-left marker */}
        {van.selfContained && (
          <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-xl flex items-center gap-1.5 border border-white/20">
            <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
            Self-Contained
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[3.5rem]">
              {van.title}
            </h3>
            <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
              <MapPin size={14} className="text-emerald-500" />
              <span className="font-medium">{van.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-500 mb-6 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
          <div className="flex flex-col flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Year</span>
            <span className="text-slate-900 font-bold">{van.year}</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-200" />
          <div className="flex flex-col flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Km</span>
            <span className="text-slate-900 font-bold">{(van.mileage || 0).toLocaleString()}</span>
          </div>
        </div>

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
