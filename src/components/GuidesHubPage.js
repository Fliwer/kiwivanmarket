import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, ArrowRight, CheckCircle, Search, Rocket, MapPin } from 'lucide-react';
import SeoHead from './SeoHead';
import { GUIDES } from '../constants/guides';

export default function GuidesHubPage() {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || 'en';

    // Fermer le loader initial
    useEffect(() => {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 500);
        }
        window.scrollTo(0, 0);
    }, []);

    // Récupérer les guides pour la langue actuelle
    const localizedGuides = GUIDES[currentLang] || GUIDES.en || {};

    // Filtrer les doublons (aliases) pour ne garder que les guides uniques
    const uniqueGuides = Object.entries(localizedGuides).filter(([key, guide]) => {
        return !['how-to-buy-campervan-nz', 'how-to-inspect-a-van'].includes(key);
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <SeoHead
                title={t('guides.hub.seo_title')}
                description={t('guides.hub.seo_description')}
                type="website"
            />

            {/* Hero Section */}
            <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30">
                        <BookOpen size={18} />
                        <span className="text-sm font-semibold uppercase tracking-wider">{t('guides.hub.badge')}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                        {t('guides.hub.title_1')} <br />
                        <span className="text-emerald-100">{t('guides.hub.title_2')}</span>
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                        {t('guides.hub.subtitle')}
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-2 text-emerald-50 text-sm bg-black/10 px-4 py-2 rounded-lg">
                            <CheckCircle size={16} /> {t('guides.hub.tag_updated')}
                        </div>
                        <div className="flex items-center gap-2 text-emerald-50 text-sm bg-black/10 px-4 py-2 rounded-lg">
                            <CheckCircle size={16} /> {t('guides.hub.tag_verified')}
                        </div>
                    </div>
                </div>
            </header>

            {/* Internal Navigation / Filters */}
            <div className="max-w-7xl mx-auto px-4 -mt-10">
                <div className="bg-white rounded-3xl shadow-xl p-8 grid md:grid-cols-3 gap-8 border border-emerald-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Search size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{t('guides.hub.card_1_title')}</h3>
                            <p className="text-xs text-gray-500">{t('guides.hub.card_1_desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-l border-r border-gray-100 px-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600">
                            <Rocket size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{t('guides.hub.card_2_title')}</h3>
                            <p className="text-xs text-gray-500">{t('guides.hub.card_2_desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{t('guides.hub.card_3_title')}</h3>
                            <p className="text-xs text-gray-500">{t('guides.hub.card_3_desc')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guides Grid */}
            <main className="max-w-7xl mx-auto px-4 mt-16">
                <div className="mb-10 flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900">{t('guides.hub.grid_title')}</h2>
                    <div className="h-1 bg-emerald-500 w-24 rounded-full mt-2 lg:hidden" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {uniqueGuides.map(([slug, guide]) => (
                        <Link
                            key={slug}
                            to={`/guide/${slug}`}
                            className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row h-full"
                        >
                            {/* Image Container */}
                            <div className="sm:w-2/5 relative h-64 sm:h-auto overflow-hidden">
                                <img
                                    src={guide.heroImage}
                                    alt={guide.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Content Container */}
                            <div className="sm:w-3/5 p-8 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors leading-tight">
                                        {guide.title}
                                    </h3>
                                    <p className="text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                                        {guide.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-4 transition-all uppercase text-sm tracking-widest">
                                    {t('guides.hub.read_btn')} <ArrowRight size={18} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Suggest a guide CTA */}
                <section className="mt-20 bg-gray-900 rounded-3xl p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t('guides.hub.cta_title')}</h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                            {t('guides.hub.cta_subtitle')}
                        </p>
                        <a
                            href="mailto:kiwivanmarket.contact@gmail.com"
                            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg"
                        >
                            {t('guides.hub.cta_btn')}
                        </a>
                    </div>
                </section>
            </main>

            {/* Simple Navigation back to top */}
            <div className="fixed bottom-8 right-8 z-40">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-50"
                >
                    ↑
                </button>
            </div>
        </div>
    );
}
