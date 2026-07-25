import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, Car, Shield, MapPin, BookOpen } from 'lucide-react';
import SeoHead from './SeoHead';
import ExpertBadge from './guides/ExpertBadge';
import { GUIDES } from '../constants/guides';
import { useHideLoader } from '../hooks/useHideLoader';

// Guide mis en avant en tête du hub (le plus stratégique).
const FEATURED_SLUG = 'buying-campervan-nz';

// Catégories éditoriales — regroupent les guides par intention.
// Libellés localisés inline (en/fr/es) pour éviter de toucher aux locales JSON.
const CATEGORIES = [
    {
        id: 'buying',
        icon: Car,
        slugs: ['buying-campervan-nz', 'campervan-buyer-checklist', 'how-to-inspect-campervan-nz', 'top-10-best-vans-nz'],
        label: { en: 'Buying a van', fr: 'Acheter un van', es: 'Comprar una van' },
    },
    {
        id: 'admin',
        icon: Shield,
        slugs: ['wof-rego-ruc-insurance-nz', 'selling-campervan-nz'],
        label: { en: 'Rules & reselling', fr: 'Règles & revente', es: 'Reglas y reventa' },
    },
    {
        id: 'road',
        icon: MapPin,
        slugs: ['freedom-camping-nz', 'winter-camping-nz', 'south-island-road-trip', 'best-vanlife-apps-nz'],
        label: { en: 'Life on the road', fr: 'La vie sur la route', es: 'La vida en la ruta' },
    },
];

// Estimation de temps de lecture à partir du volume de contenu.
const readMin = (guide) => {
    const words = JSON.stringify(guide?.content || {}).split(/\s+/).length;
    return Math.max(3, Math.round(words / 220));
};

export default function GuidesHubPage() {
    useHideLoader();
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.language || 'en').split('-')[0];
    const langSuffix = currentLang === 'en' ? '' : `?lang=${currentLang}`;
    const catLabel = (c) => c.label[currentLang] || c.label.en;

    const guides = GUIDES[currentLang] || GUIDES.en || {};
    const guideUrl = (slug) => `/guide/${slug}${langSuffix}`;

    const featured = guides[FEATURED_SLUG] ? [FEATURED_SLUG, guides[FEATURED_SLUG]] : Object.entries(guides)[0];
    const featuredSlug = featured?.[0];

    // Tous les slugs listés dans une catégorie (pour l'ItemList + éviter les orphelins).
    const allListed = CATEGORIES.flatMap((c) => c.slugs).filter((s) => guides[s]);
    const readLabel = (min) => t('guides.hub.min_read', { count: min, defaultValue: `${min} min read` });

    return (
        <div className="min-h-screen bg-white pb-24">
            <SeoHead
                title={t('guides.hub.seo_title')}
                description={t('guides.hub.seo_description')}
                type="website"
            />

            {/* ItemList Schema */}
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'ItemList',
                    name: `${t('guides.hub.title_1')} ${t('guides.hub.title_2')}`,
                    numberOfItems: allListed.length,
                    itemListElement: allListed.map((slug, index) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        item: {
                            '@type': 'Article',
                            headline: guides[slug].title,
                            url: `https://kiwivanmarket.com/guide/${slug}`,
                            image: guides[slug].heroImage,
                            author: { '@type': 'Organization', name: 'Kiwi Van Market' },
                        },
                    })),
                })}
            </script>

            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 md:pt-20 pb-10">
                <div className="flex items-center gap-2.5 mb-4 text-emerald-700">
                    <BookOpen size={18} />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">{t('guides.hub.breadcrumb_guide', { defaultValue: 'Guides' })}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight max-w-3xl">
                    {t('guides.hub.title_1')} <span className="text-emerald-600">{t('guides.hub.title_2')}</span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-slate-500 max-w-2xl leading-relaxed">
                    {t('guides.hub.subtitle')}
                </p>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6">

                {/* ── Guide à la une ──────────────────────────────────── */}
                {featured && (
                    <Link
                        to={guideUrl(featuredSlug)}
                        className="group grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                        <div className="relative h-64 lg:h-auto overflow-hidden bg-slate-100">
                            <img
                                src={featured[1].heroImage}
                                alt={featured[1].title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4">
                                <ExpertBadge className="bg-white/95 shadow-sm" />
                            </div>
                        </div>
                        <div className="p-7 lg:p-12 flex flex-col justify-center">
                            <div className="flex items-center gap-3 text-emerald-700 mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest">{t('guides.hub.featured_story', { defaultValue: 'Featured' })}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                                    <Clock size={13} /> {readLabel(readMin(featured[1]))}
                                </span>
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors">
                                {featured[1].title}
                            </h2>
                            <p className="mt-4 text-slate-500 leading-relaxed line-clamp-3">
                                {featured[1].description}
                            </p>
                            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-slate-900 group-hover:gap-3 transition-all">
                                {t('guides.hub.read_full', { defaultValue: 'Read the guide' })}
                                <ArrowRight size={18} className="text-emerald-500" />
                            </span>
                        </div>
                    </Link>
                )}

                {/* ── Catégories ──────────────────────────────────────── */}
                {CATEGORIES.map((cat) => {
                    const items = cat.slugs
                        .filter((slug) => guides[slug] && slug !== featuredSlug)
                        .map((slug) => [slug, guides[slug]]);
                    if (items.length === 0) return null;
                    const Icon = cat.icon;
                    return (
                        <section key={cat.id} className="mt-16">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Icon size={18} />
                                </span>
                                <h2 className="text-xl font-semibold text-slate-900">{catLabel(cat)}</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map(([slug, guide]) => (
                                    <Link key={slug} to={guideUrl(slug)} className="group flex flex-col rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
                                        <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                                            <img
                                                src={guide.heroImage}
                                                alt={guide.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
                                                <Clock size={12} /> {readLabel(readMin(guide))}
                                            </span>
                                            <h3 className="text-base font-semibold text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                                                {guide.title}
                                            </h3>
                                            <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">
                                                {guide.description}
                                            </p>
                                            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 group-hover:gap-2.5 transition-all">
                                                {t('guides.hub.continue_reading', { defaultValue: 'Read' })}
                                                <ArrowRight size={14} className="text-emerald-500" />
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    );
                })}

                {/* ── CTA marketplace ─────────────────────────────────── */}
                <section className="mt-20 rounded-3xl bg-emerald-900 text-white p-8 sm:p-12 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
                        {currentLang === 'fr' ? 'Prêt à trouver votre van ?' : currentLang === 'es' ? '¿Listo para encontrar tu van?' : 'Ready to find your van?'}
                    </h2>
                    <p className="text-emerald-200/80 max-w-md mx-auto mb-7 leading-relaxed">
                        {currentLang === 'fr'
                            ? 'Des campervans vendus par de vrais propriétaires, partout en Nouvelle-Zélande.'
                            : currentLang === 'es'
                                ? 'Campervans publicadas por dueños reales por toda Nueva Zelanda.'
                                : 'Campervans listed by real owners across New Zealand.'}
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-white text-emerald-900 px-7 py-3.5 rounded-xl font-semibold hover:bg-emerald-50 transition active:scale-95"
                    >
                        {currentLang === 'fr' ? 'Voir les annonces' : currentLang === 'es' ? 'Ver anuncios' : 'Browse campervans'}
                        <ArrowRight size={18} />
                    </Link>
                </section>
            </main>

            {/* Scroll-to-top */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-white text-slate-900 rounded-full shadow-xl border border-slate-200 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
                aria-label="Back to top"
            >
                <ArrowRight size={20} className="-rotate-90" />
            </button>
        </div>
    );
}
