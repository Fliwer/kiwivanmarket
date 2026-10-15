import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Shield, ChevronLeft, ChevronRight, CheckCircle, Calendar, Star, ExternalLink } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { getThumbnail } from '../utils/imageOptimizer';
import { safeDate } from '../utils/dateHelper';
import { formatMileage } from '../utils/formatHelper';
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import boostVisibility from '../utils/boostVisibility.js';
import { useBoostClock } from '../hooks/useBoostClock';
import selfContained from '../data/seo/self-contained';

const RETURN_SCROLL_KEY = 'kiwiVanMarket_returnScrollY';
const RETURN_PATH_KEY = 'kiwiVanMarket_returnPath';

// Carousel de photos pour la card
const ImageCarousel = ({ images, title, vanStatus, priority = false }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStart = useRef(null);
  const didSwipe = useRef(false);

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
    didSwipe.current = false;
  };

  const onTouchEnd = (e) => {
    // `=== null` et non `!touchStart.current` : un geste demarre a x=0 est
    // falsy et serait ignore.
    if (touchStart.current === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;

    if (Math.abs(diff) > 50) {
      // La carte entiere est un <Link>. Sans preventDefault, le navigateur
      // synthetise un click a la fin du geste : la photo change puis la fiche
      // du van s'ouvre par-dessus, et le swipe semble ne pas marcher.
      e.preventDefault();
      didSwipe.current = true;
      if (diff > 0) goNext(); // Swipe left
      else goPrev(); // Swipe right
    }
    touchStart.current = null;
  };

  // Filet de securite : si un navigateur emet quand meme le click, on l'avale
  // en phase de capture avant qu'il n'atteigne le <Link>.
  const onClickCapture = (e) => {
    if (!didSwipe.current) return;
    e.preventDefault();
    e.stopPropagation();
    didSwipe.current = false;
  };

  return (
    <div
      className="relative group overflow-hidden aspect-[16/10]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClickCapture={onClickCapture}
    >
      {/* Background for images while loading */}
      <div className="absolute inset-0 bg-slate-100 z-0" />

      <img
        src={getThumbnail(allImages[currentIndex]) || '/placeholder-van.jpg'}
        alt={`Campervan for sale NZ - ${title} ${currentIndex + 1} - Kiwi Van Market`}
        className={`relative z-10 w-full h-full object-cover transition-transform duration-700 ${vanStatus === 'sold' ? 'grayscale-[0.5] contrast-[0.8]' : 'opacity-100'}`}
        loading={priority ? "eager" : "lazy"}
        style={{
          objectPosition: 'center',
          transform: 'scale(1)',
          transformOrigin: 'center center'
        }}
      />

      {vanStatus === 'sold' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <div className="bg-red-600/90 backdrop-blur-md text-white px-8 py-3 rounded-2xl font-black text-2xl uppercase tracking-[0.2em] shadow-2xl border-2 border-white/30 rotate-[-12deg] flex items-center gap-2">
            <CheckCircle size={24} fill="currentColor" strokeWidth={3} className="text-red-100" />
            {t('marketplace.sold')}
          </div>
        </div>
      )}

      {/* Navigation arrows */}
      {allImages.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-full p-2.5 shadow-sm sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity z-10"
            aria-label={t('marketplace.previous_photo')}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-full p-2.5 shadow-sm sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity z-10"
            aria-label={t('marketplace.next_photo')}
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
  const { t, i18n } = useTranslation();
  const boostNow = useBoostClock();
  // Le vendeur a confirmé la disponibilité (email de cycle de vie) : badge visible 45 jours.
  const confirmedAtDate = safeDate(van.availabilityConfirmedAt);
  const confirmedDaysAgo = confirmedAtDate ? Math.max(0, Math.floor((Date.now() - confirmedAtDate.getTime()) / 86400000)) : null;
  const { translatedText: translatedTitle } = useAutoTranslate(van.title);

  const images = van.images?.length > 0
    ? van.images
    : (van.imageUrl ? [van.imageUrl] : null);

  const openCarJam = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!van.plateNumber) return;
    const plate = String(van.plateNumber).trim().toUpperCase();
    window.open(`https://www.carjam.co.nz/car/?plate=${plate}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Link
      to={`/van/${van.id}`}
      onClick={() => {
        try {
          window.sessionStorage.setItem(RETURN_SCROLL_KEY, String(window.scrollY || 0));
          window.sessionStorage.setItem(RETURN_PATH_KEY, `${window.location.pathname}${window.location.search}`);
        } catch {
          // Ignore storage errors (private mode / blocked storage)
        }
      }}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-emerald-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 transition-[border-color,box-shadow]"
    >
      <div className="relative shrink-0">
        <ImageCarousel
          images={images}
          title={translatedTitle}
          vanStatus={van.status}
          priority={priority}
        />

        {/* Favorite button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(van.id, setShowAuthModal); }}
          aria-label={t(isFavorite(van.id) ? 'marketplace.remove_favorite' : 'marketplace.save_favorite', { title: translatedTitle })}
          aria-pressed={isFavorite(van.id)}
          className="absolute top-3 right-3 bg-white/95 p-3 rounded-full shadow-sm hover:bg-white focus-visible:outline-emerald-700 transition-colors z-20 group/fav"
        >
          <Heart
            size={20}
            className={`transition-colors ${isFavorite(van.id) ? 'text-red-500 fill-red-500' : 'text-slate-400 group-hover/fav:text-red-400'}`}
          />
        </button>


        {/* Badges container */}
        <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-2">
          {(!van.status || van.status === 'active') && confirmedDaysAgo !== null && confirmedDaysAgo <= 45 && (
            <div className="bg-emerald-600/95 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg border border-white/30 flex items-center gap-1.5">
              <CheckCircle size={12} fill="currentColor" />
              {confirmedDaysAgo <= 1 ? t("van_card.confirmed_today") : t("van_card.confirmed_days", { count: confirmedDaysAgo })}
            </div>
          )}
          {boostVisibility.isBoostActive(van, boostNow) && <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-bold px-2 py-1 rounded-lg"><Star size={12} />{t('boost.sponsored')}</span>}
          {van.featured && !boostVisibility.isBoostActive(van, boostNow) && (
            <div className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <Star size={12} fill="currentColor" />
              {t('marketplace.promoted')}
            </div>
          )}
          {van.views > 50 && (
            <div className="bg-rose-50 text-rose-800 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <span className="text-base leading-none">🔥</span>
              {t('marketplace.popular')}
            </div>
          )}
          {van.buyBack && (
            <div className="bg-emerald-600/90 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg border border-white/20 flex items-center gap-1.5">
              <Shield size={12} fill="currentColor" />
              Buyback
            </div>
          )}
        </div>

      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 title={translatedTitle} className="font-bold text-slate-900 text-lg leading-6 group-hover:text-emerald-800 transition-colors line-clamp-2 h-12 break-words">
          {translatedTitle}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin size={15} className="text-emerald-700 shrink-0" aria-hidden="true" />
          <span>{van.location}</span>
        </div>

        <div className="flex items-center justify-between gap-3 my-4">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {formatPrice ? formatPrice(van.price) : `$${(van.price || 0).toLocaleString()}`}
          </span>
          <span className="rounded-full bg-emerald-50 p-2 text-emerald-800 group-hover:bg-emerald-100 transition-colors" aria-hidden="true">
            <ChevronRight size={20} />
          </span>
        </div>

        <div className="flex items-center gap-3 mb-4 bg-slate-50 px-3 py-2.5 rounded-xl">
          <div className="flex flex-col flex-1">
            <span className="text-xs font-medium text-slate-600">{t('van_page.year')}</span>
            <span className="text-slate-900 font-semibold">{van.year}</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-200" />
          <div className="flex flex-col flex-1">
            <span className="text-xs font-medium text-slate-600">{t('marketplace.mileage')}</span>
            <span className="text-slate-900 font-semibold">{formatMileage(van.mileage)}</span>
          </div>
        </div>

        {/* Compliance row — always visible */}
        {(van.wofExpiry || van.regoExpiry || van.selfContained) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {van.wofExpiry && (
              <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-md text-xs font-semibold">
                <Calendar size={11} className="text-slate-500" />
                WOF
                <span className="font-medium text-slate-600 ml-0.5">
                  · {safeDate(van.wofExpiry)?.toLocaleDateString('en-NZ', { month: 'short', year: '2-digit' }) || '—'}
                </span>
              </span>
            )}
            {van.regoExpiry && (
              <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-md text-xs font-semibold">
                <Calendar size={11} className="text-slate-500" />
                REGO
                <span className="font-medium text-slate-600 ml-0.5">
                  · {safeDate(van.regoExpiry)?.toLocaleDateString('en-NZ', { month: 'short', year: '2-digit' }) || '—'}
                </span>
              </span>
            )}
            {van.selfContained === true && (
              <span title={selfContained.describe(van, i18n.language)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${van.selfContainedType === 'green'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-300 text-slate-700'
                }`}>
                {selfContained.short(van, i18n.language)}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-slate-100">
          {van.plateNumber ? (
            <button
              type="button"
              onClick={openCarJam}
              className="w-full inline-flex min-h-[44px] items-center justify-between gap-2 rounded-lg text-slate-600 hover:text-blue-800 focus-visible:outline-blue-600 transition-colors"
              aria-label={t('van_page.carjam_cta_button')}
            >
              <span className="inline-flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center rounded bg-blue-700 px-2 py-1 text-[11px] font-bold text-white">
                  CarJam
                </span>
                <span className="text-xs font-medium">
                  {t('marketplace.vehicle_history')}
                </span>
              </span>
              <ExternalLink size={13} className="shrink-0" aria-hidden />
            </button>
          ) : (
            <div className="flex min-h-[44px] items-center gap-2 rounded-lg bg-amber-50 px-2.5 py-2 text-xs text-amber-900">
              <span className="font-black uppercase tracking-wide">CarJam</span>
              <span>{t('van_page.carjam_no_plate_short')}</span>
            </div>
          )}
        </div>

      </div>
    </Link>
  );
}
