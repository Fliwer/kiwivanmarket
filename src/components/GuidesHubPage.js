import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, ArrowRight, CheckCircle, Search, Rocket, MapPin, Clock, Star } from 'lucide-react';
import SeoHead from './SeoHead';
import LanguageSelector from './LanguageSelector';
import ExpertBadge from './guides/ExpertBadge';
import { GUIDES } from '../constants/guides';

export default function GuidesHubPage() {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.language || 'en').split('-')[0];

    useEffect(() => {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 500);
        }
        window.scrollTo(0, 0);
    }, []);

    const localizedGuides = GUIDES[currentLang] || GUIDES.en || {};
    const uniqueGuides = Object.entries(localizedGuides).filter(([key]) => {
        return !['how-to-buy-campervan-nz', 'how-to-inspect-a-van'].includes(key);
    });

    return (
        <div className="min-h-screen bg-[#FDFDFC] pb-24">
            <SeoHead
                title={t('guides.hub.seo_title')}
                description={t('guides.hub.seo_description')}
                type="website"
            />

            {/* Premium Editorial Header */}
            <header className="relative bg-white pt-24 pb-20 overflow-hidden border-b border-gray-100">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/50 -skew-x-12 translate-x-1/4 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="h-px w-12 bg-emerald-600" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">The Travel Journal</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
                                {t('guides.hub.title_1')} <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 italic">
                                    {t('guides.hub.title_2')}
                                </span>
                            </h1>
                            <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                                {t('guides.hub.subtitle')}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                                <LanguageSelector />
                            </div>
                            <div className="flex items-center gap-4 px-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Expert" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-slate-400">Verified by 12 Experts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-6 mt-20">

                {/* Featured Content Logic (First Guide highlight) */}
                {uniqueGuides.length > 0 && (
                    <div className="mb-24">
                        <Link
                            to={`/guide/${uniqueGuides[0][0]}`}
                            className="group relative flex flex-col lg:flex-row bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/60 border border-slate-100 hover:border-emerald-200 transition-all duration-500"
                        >
                            <div className="lg:w-3/5 h-[400px] lg:h-[600px] overflow-hidden relative">
                                <img
                                    src={uniqueGuides[0][1].heroImage}
                                    alt={uniqueGuides[0][1].title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-transparent to-transparent lg:hidden" />
                                <div className="absolute top-8 left-8">
                                    <ExpertBadge className="shadow-lg backdrop-blur-md bg-white/90" />
                                </div>
                            </div>

                            <div className="lg:w-2/5 p-10 lg:p-16 flex flex-col justify-center bg-white relative">
                                <div className="flex items-center gap-4 text-emerald-600 mb-6">
                                    <span className="text-xs font-black uppercase tracking-widest">{t('guides.hub.featured_story')}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Clock size={14} />
                                        <span className="text-xs font-bold uppercase">{t('guides.hub.min_read', { count: 12 })}</span>
                                    </div>
                                </div>

                                <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-8 leading-[1.2] group-hover:text-emerald-600 transition-colors">
                                    {uniqueGuides[0][1].title}
                                </h2>

                                <p className="text-slate-500 text-lg leading-relaxed mb-10 line-clamp-4">
                                    {uniqueGuides[0][1].description}
                                </p>

                                <div className="flex items-center gap-3 text-slate-900 font-black group-hover:gap-5 transition-all">
                                    <span className="border-b-4 border-emerald-500/20 group-hover:border-emerald-500 transition-all">
                                        {t('guides.hub.read_full')}
                                    </span>
                                    <ArrowRight size={20} className="text-emerald-500" />
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Remaining Guides Grid - Editorial Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {uniqueGuides.slice(1).map(([slug, guide], idx) => (
                        <Link
                            key={slug}
                            to={`/guide/${slug}`}
                            className="group flex flex-col"
                        >
                            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl shadow-slate-200/40 border border-slate-50 relative">
                                <img
                                    src={guide.heroImage}
                                    alt={guide.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    <ExpertBadge className="bg-white/95" />
                                </div>
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                            </div>

                            <div className="px-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{t('guides.hub.breadcrumb_guide', { defaultValue: 'Guides' })}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('guides.hub.min_read', { count: 8 })}</span>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors leading-tight">
                                    {guide.title}
                                </h3>

                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {guide.description}
                                </p>

                                <div className="flex items-center gap-2 text-xs font-black text-slate-900 group-hover:translate-x-1 transition-transform">
                                    {t('guides.hub.continue_reading')} <ArrowRight size={14} className="text-emerald-500" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Suggest a guide CTA - Premium Version */}
                <section className="mt-32 relative bg-slate-900 rounded-[4rem] p-12 lg:p-20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-600/20 to-transparent pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />

                    <div className="relative z-10 grid lg:grid-cols-2 items-center gap-16">
                        <div>
                            <div className="flex items-center gap-4 mb-4 text-emerald-400">
                                <Star fill="#10b981" size={20} />
                                <span className="text-sm font-black uppercase tracking-[0.3em]">Join the experts</span>
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight">
                                {t('guides.hub.cta_title')}
                            </h2>
                            <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-md">
                                {t('guides.hub.cta_subtitle')}
                            </p>
                            <a
                                href="mailto:kiwivanmarket.contact@gmail.com"
                                className="inline-flex items-center gap-4 bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-900/20 active:scale-95 text-lg"
                            >
                                {t('guides.hub.cta_btn')}
                                <ArrowRight size={20} />
                            </a>
                        </div>

                        <div className="hidden lg:grid grid-cols-2 gap-4 rotate-3 opacity-40">
                            <div className="space-y-4">
                                <div className="h-40 bg-white/5 rounded-3xl" />
                                <div className="h-64 bg-white/10 rounded-3xl" />
                            </div>
                            <div className="space-y-4 -mt-12">
                                <div className="h-64 bg-white/10 rounded-3xl" />
                                <div className="h-40 bg-white/5 rounded-3xl" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Float Nav */}
            <div className="fixed bottom-10 right-10 z-50">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-14 h-14 bg-white text-slate-900 rounded-full shadow-2xl border border-slate-100 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all group active:scale-90"
                >
                    <ArrowRight size={24} className="-rotate-90 group-hover:translate-y-[-2px] transition-transform" />
                </button>
            </div>
        </div>
    );
}
