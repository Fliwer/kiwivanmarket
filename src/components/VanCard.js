import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { getThumbnail } from '../utils/imageOptimizer';

// Carousel de photos pour la card
const ImageCarousel = ({ images, title, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const allImages = images?.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800'];

  const goTo = (index, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    setCurrentIndex(index);
  };

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

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      e.stopPropagation();
      e.preventDefault();
      if (diff > 0) {
        // Swipe left -> next
        setCurrentIndex((prev) => (prev + 1) % allImages.length);
      } else {
        // Swipe right -> prev
        setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="relative group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={getThumbnail(allImages[currentIndex])}
        alt={`${title} - ${currentIndex + 1}`}
        className="w-full h-56 object-cover transition-opacity duration-300"
        loading="lazy"
        draggable={false}
      />

      {/* Navigation arrows - always visible on mobile, hover on desktop */}
      {allImages.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
            aria-label="Next image"
          >
            <ChevronRight size={20} className="text-gray-700" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {allImages.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => goTo(idx, e)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-white w-5'
                    : 'bg-white/70 w-2 hover:bg-white/90'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
            {allImages.length > 5 && (
              <span className="text-white text-xs font-semibold ml-1 drop-shadow">+{allImages.length - 5}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Composant VanCard complet
export default function VanCard({ van, formatPrice }) {
  const { toggleFavorite, isFavorite } = useFavorites();

  const images = van.images?.length > 0
    ? van.images
    : (van.imageUrl ? [van.imageUrl] : null);

  return (
    <Link
      to={`/van/${van.id}`}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1 block"
    >
      <div className="relative">
        <ImageCarousel images={images} title={van.title} />

        {/* Favorite button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(van.id); }}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition z-20"
        >
          <Heart size={20} className={isFavorite(van.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
        </button>

        {/* Buy-Back badge */}
        {van.buyBack && (
          <div className="absolute bottom-12 left-3 bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
            <Shield size={12} />
            Buy-Back
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice ? formatPrice(van.price) : `$${(van.price || 0).toLocaleString()}`}
          </div>
          {van.selfContained && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              Self-Contained
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{van.title}</h3>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <span>{van.year}</span>
          <span>-</span>
          <span>{(van.mileage || 0).toLocaleString()} km</span>
          <span>-</span>
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {van.location}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className={`rounded-lg px-3 py-2 ${van.wofExpiry && new Date(van.wofExpiry).getTime() ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className={`text-[10px] font-semibold uppercase ${van.wofExpiry && new Date(van.wofExpiry).getTime() ? 'text-emerald-600' : 'text-gray-400'}`}>WOF until</div>
            <div className={`text-sm font-bold ${van.wofExpiry && new Date(van.wofExpiry).getTime() ? 'text-emerald-700' : 'text-gray-400'}`}>
              {van.wofExpiry && new Date(van.wofExpiry).getTime() ? new Date(van.wofExpiry).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' }) : 'Not specified'}
            </div>
          </div>
          <div className={`rounded-lg px-3 py-2 ${van.regoExpiry && new Date(van.regoExpiry).getTime() ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className={`text-[10px] font-semibold uppercase ${van.regoExpiry && new Date(van.regoExpiry).getTime() ? 'text-blue-600' : 'text-gray-400'}`}>REGO until</div>
            <div className={`text-sm font-bold ${van.regoExpiry && new Date(van.regoExpiry).getTime() ? 'text-blue-700' : 'text-gray-400'}`}>
              {van.regoExpiry && new Date(van.regoExpiry).getTime() ? new Date(van.regoExpiry).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' }) : 'Not specified'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-gray-100">
          {van.buyBack && (
            <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
              <Shield size={12} />
              Buy-Back Guarantee
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
