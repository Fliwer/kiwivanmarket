import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, BookOpen, Search, DollarSign, Shield, MapPin } from 'lucide-react';
import SeoHead from './SeoHead';
import { useHideLoader } from '../hooks/useHideLoader';
import { pagesData, seoCopy, SEO_LANGS } from '../data/seo';

// Les questions/réponses vivent dans src/data/seo/pages-data*.json — la même
// source que le prerender servi aux robots, dans la langue d'i18next. Les
// icônes suivent l'ordre des catégories (achat, vente, freedom camping, à propos).
const CATEGORY_ICONS = [
    <Search size={18} className="text-emerald-500" />,
    <DollarSign size={18} className="text-blue-500" />,
    <MapPin size={18} className="text-orange-500" />,
    <Shield size={18} className="text-purple-500" />,
];

export default function FaqPage() {
    useHideLoader();
    const { t, i18n } = useTranslation();
    const [openItems, setOpenItems] = useState({});

    const FAQS = pagesData(i18n.language).faq;
    const T = seoCopy(i18n.language).faq;
    const faqSchema = FAQS.flatMap((cat) => cat.items).map(({ q, a }) => ({ q, a }));
    // "Van Life NZ — Frequently Asked Questions" → on met en avant la fin du titre.
    const [h1Lead, h1Accent] = T.h1.split(' — ');

    const toggle = (key) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <>
            <SeoHead
                title={T.title.replace(' | Kiwi Van Market', '')}
                description={T.metaDesc}
                faqs={faqSchema}
                alternateLangs={SEO_LANGS}
                breadcrumbs={[
                    { name: seoCopy(i18n.language).common.home, path: '/' },
                    { name: T.crumb, path: '/faq' },
                ]}
            />

            <div className="min-h-screen bg-[#f8fafc]">
                {/* Hero */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white py-20 px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="clear-both" />
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <BookOpen size={14} />
                            {t('seo_pages.faq.badge')}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                            {h1Lead} — <span className="text-emerald-400">{h1Accent}</span>
                        </h1>
                        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                            {T.intro}
                        </p>
                    </div>
                </div>

                {/* FAQ Content */}
                <div className="max-w-3xl mx-auto px-4 py-12">
                    {FAQS.map((category, ci) => (
                        <div key={ci} className="mb-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                                    {CATEGORY_ICONS[ci] || CATEGORY_ICONS[0]}
                                </div>
                                <h2 className="text-xl font-black text-slate-900">{category.category}</h2>
                            </div>

                            <div className="space-y-3">
                                {category.items.map((item, qi) => {
                                    const key = `${ci}-${qi}`;
                                    const isOpen = !!openItems[key];
                                    return (
                                        <div
                                            key={qi}
                                            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                                        >
                                            <button
                                                onClick={() => toggle(key)}
                                                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                                            >
                                                <span className="font-bold text-slate-900 text-sm leading-snug pr-2">{item.q}</span>
                                                <ChevronDown
                                                    size={18}
                                                    className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-5 pt-1 border-t border-slate-50">
                                                    <p className="text-slate-600 leading-relaxed text-sm">{item.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* CTA at the bottom */}
                    <div className="mt-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-emerald-200">
                        <h3 className="text-2xl font-black mb-2">{seoCopy(i18n.language).why.ready}</h3>
                        <p className="text-emerald-100 mb-6">{seoCopy(i18n.language).why.readyText}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to="/"
                                className="bg-white text-emerald-700 font-black px-8 py-3 rounded-2xl hover:bg-emerald-50 transition-all"
                            >
                                {T.browse}
                            </Link>
                            <Link
                                to="/guides"
                                className="bg-emerald-500/30 border border-white/30 text-white font-black px-8 py-3 rounded-2xl hover:bg-emerald-500/50 transition-all flex items-center justify-center gap-2"
                            >
                                <BookOpen size={16} />
                                {T.readGuides}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
