import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, CheckCircle, Search, Rocket, MapPin } from 'lucide-react';
import SeoHead from './SeoHead';
import { GUIDES } from '../constants/guides';

export default function GuidesHubPage() {
    // Fermer le loader initial
    useEffect(() => {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 500);
        }
        window.scrollTo(0, 0);
    }, []);

    // Filtrer les doublons (aliases) pour ne garder que les guides uniques
    const uniqueGuides = Object.entries(GUIDES).filter(([key, guide]) => {
        // On ne garde que les clés qui correspondent au slug principal définit dans l'objet ou par convention
        if (key === 'how-to-buy-campervan-nz') return false;
        if (key === 'how-to-inspect-a-van') return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <SeoHead
                title="Travel & Campervan Guides New Zealand | Kiwi Van Market"
                description="Everything you need to know about buying, selling, and living in a campervan in New Zealand. Expert tips for backpackers and travellers."
                type="website"
            />

            {/* Hero Section */}
            <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30">
                        <BookOpen size={18} />
                        <span className="text-sm font-semibold uppercase tracking-wider">Knowledge Base</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                        The Ultimate New Zealand <br />
                        <span className="text-emerald-100">Campervan Guides</span>
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                        From mechanical inspections to freedom camping rules, we've got you covered for your NZ road trip adventure.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-2 text-emerald-50 text-sm bg-black/10 px-4 py-2 rounded-lg">
                            <CheckCircle size={16} /> 2025 Updated
                        </div>
                        <div className="flex items-center gap-2 text-emerald-50 text-sm bg-black/10 px-4 py-2 rounded-lg">
                            <CheckCircle size={16} /> Expert Verified
                        </div>
                    </div>
                </div>
            </header>

            {/* Internal Navigation / Filters (Optional placeholder for future) */}
            <div className="max-w-7xl mx-auto px-4 -mt-10">
                <div className="bg-white rounded-3xl shadow-xl p-8 grid md:grid-cols-3 gap-8 border border-emerald-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Search size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Expert Tips</h3>
                            <p className="text-xs text-gray-500">Mechanical & Legal advice</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-l border-r border-gray-100 px-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600">
                            <Rocket size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Growth Hacks</h3>
                            <p className="text-xs text-gray-500">Resale value & viral ads</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Travel Guide</h3>
                            <p className="text-xs text-gray-500">Freedom camping & Spots</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guides Grid */}
            <main className="max-w-7xl mx-auto px-4 mt-16">
                <div className="mb-10 flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900">Featured Guides</h2>
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
                                    Read Guide <ArrowRight size={18} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Suggest a guide CTA */}
                <section className="mt-20 bg-gray-900 rounded-3xl p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Can't find what you're looking for?</h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                            We're constantly adding new content to help you on your road trip.
                            Suggest a topic and we'll write an expert guide for you.
                        </p>
                        <a
                            href="mailto:kiwivanmarket.contact@gmail.com"
                            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg"
                        >
                            Contact Team
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
