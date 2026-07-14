import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GUIDES } from '../constants/guides';

// Guide mis en avant dans le hero (le plus consulté).
const FEATURED_SLUG = 'buying-campervan-nz';
const FEATURED_READ_TIME = 12;

// Carte guide compacte affichée dans le hero — pensée pour le mobile, où
// l'image seule n'apporte pas d'action. Réutilise les données localisées
// de GUIDES et pointe vers le guide vedette.
export default function HeroGuideCard({ className = '' }) {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const guides = GUIDES[lang] || GUIDES.en || {};
    const guide = guides[FEATURED_SLUG];
    if (!guide) return null;

    return (
        <Link
            to={`/guide/${FEATURED_SLUG}`}
            className={`group flex items-stretch gap-3 rounded-3xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden active:scale-[0.98] transition-transform ${className}`}
            aria-label={guide.title}
        >
            <div className="relative w-24 sm:w-28 flex-shrink-0 overflow-hidden">
                <img
                    src={guide.heroImage}
                    alt={guide.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="flex flex-col justify-center py-3 pr-4 min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
                    <BookOpen size={12} />
                    {t('home.badge_guide', 'Guide')} · {FEATURED_READ_TIME} min
                </span>
                <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2 mb-1.5">
                    {guide.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 group-hover:gap-2 transition-all">
                    {t('home.read_guide', 'Read the guide')}
                    <ArrowRight size={13} />
                </span>
            </div>
        </Link>
    );
}
