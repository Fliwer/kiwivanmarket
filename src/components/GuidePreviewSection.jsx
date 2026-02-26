import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Clock, Star, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GUIDES } from '../constants/guides';

// Top guides to feature on the home page
const FEATURED_SLUGS = [
    'buying-campervan-nz',
    'selling-campervan-nz',
    'how-to-inspect-campervan-nz',
];

const READING_TIMES = [12, 8, 10];

export default function GuidePreviewSection() {
    const { i18n } = useTranslation();
    const currentLang = (i18n.language || 'en').split('-')[0];
    const localizedGuides = GUIDES[currentLang] || GUIDES.en || {};

    // Build the featured guides list
    const featured = FEATURED_SLUGS
        .map((slug, i) => {
            const guide = localizedGuides[slug];
            if (!guide) return null;
            return { slug, guide, readTime: READING_TIMES[i] };
        })
        .filter(Boolean);

    if (featured.length === 0) return null;

    const [primary, ...rest] = featured;

    return (
        <section className="py-24 bg-[#FDFDFC] border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="h-px w-10 bg-emerald-500" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-1.5">
                                <BookOpen size={13} />
                                The Travel Journal
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1]">
                            Expert Guides{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 italic">
                                for NZ
                            </span>
                        </h2>
                        <p className="text-slate-500 mt-3 text-lg max-w-lg">
                            Everything you need to know about buying, selling, and living in a campervan in New Zealand.
                        </p>
                    </div>
                    <Link
                        to="/guides"
                        className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-900 text-slate-900 font-black rounded-2xl hover:bg-slate-900 hover:text-white transition-all group whitespace-nowrap"
                    >
                        All Articles
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Featured Layout: 1 big left + 2 small right */}
                <div className="grid lg:grid-cols-5 gap-8">

                    {/* Primary Feature — large card */}
                    <Link
                        to={`/guide/${primary.slug}`}
                        className="lg:col-span-3 group relative flex flex-col rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/60 border border-slate-100 hover:border-emerald-200 hover:shadow-emerald-100/60 transition-all duration-500 bg-white"
                    >
                        <div className="h-[320px] lg:h-[420px] overflow-hidden relative flex-shrink-0">
                            <img
                                src={primary.guide.heroImage}
                                alt={primary.guide.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                        <Star size={10} fill="currentColor" />
                                        Featured Guide
                                    </span>
                                    <span className="text-white/70 text-xs font-bold flex items-center gap-1">
                                        <Clock size={12} />
                                        {primary.readTime} min read
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 flex flex-col flex-1">
                            <h3 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight mb-4 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                {primary.guide.title}
                            </h3>
                            <p className="text-slate-500 leading-relaxed mb-6 line-clamp-3 flex-1">
                                {primary.guide.description}
                            </p>
                            <div className="flex items-center gap-2 font-black text-slate-900 group-hover:gap-4 transition-all">
                                <span>Read the full guide</span>
                                <ArrowRight size={18} className="text-emerald-500" />
                            </div>
                        </div>
                    </Link>

                    {/* Secondary guides — stacked */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {rest.map(({ slug, guide, readTime }) => (
                            <Link
                                key={slug}
                                to={`/guide/${slug}`}
                                className="group flex flex-col rounded-[2rem] overflow-hidden shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-emerald-200 hover:shadow-emerald-100 transition-all duration-300 bg-white flex-1"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={guide.heroImage}
                                        alt={guide.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    <span className="absolute bottom-4 left-4 text-white/80 text-xs font-bold flex items-center gap-1">
                                        <Clock size={11} />
                                        {readTime} min
                                    </span>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit mb-3">
                                        Guide
                                    </span>
                                    <h3 className="text-lg font-black text-slate-900 leading-snug mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                        {guide.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 flex-1">
                                        {guide.description}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 mt-4 group-hover:translate-x-1 transition-transform">
                                        Read more <ChevronRight size={14} className="text-emerald-500" />
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* All guides CTA card */}
                        <Link
                            to="/guides"
                            className="group relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex flex-col justify-between min-h-[140px] hover:from-emerald-900 hover:to-teal-900 transition-all duration-500 border border-transparent hover:border-emerald-500/30 shadow-lg"
                        >
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_50%,_#10b981,_transparent)]" />
                            <div className="relative z-10">
                                <BookOpen size={28} className="text-emerald-400 mb-3" />
                                <h4 className="text-white font-black text-xl mb-1">All Guides</h4>
                                <p className="text-slate-400 text-sm">Explore all expert articles</p>
                            </div>
                            <div className="relative z-10 flex items-center gap-2 text-emerald-400 font-black text-sm group-hover:gap-4 transition-all mt-4">
                                Browse all <ArrowRight size={16} />
                            </div>
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
