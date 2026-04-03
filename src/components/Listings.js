import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import VanCard from './VanCard';
import { getLongTailSlugsForVan, LONG_TAIL_PAGE_MAP } from '../constants/seoLongTailPages';

export default function Listings({
    loading,
    filteredVans,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    formatPrice,
    setShowAuthModal
}) {
    const { t } = useTranslation();
    const { currentUser } = useAuth();

    // ItemList Schema for SEO Rich Snippets
    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": searchTerm ? `Search results for ${searchTerm}` : "Latest Campervans for Sale in New Zealand",
        "numberOfItems": filteredVans.length,
        "itemListElement": filteredVans.slice(0, 15).map((van, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Car",
                "name": van.title,
                "url": `https://kiwivanmarket.com/van/${van.id}`,
                "image": van.images?.[0] || van.imageUrl,
                "offers": {
                    "@type": "Offer",
                    "price": van.price,
                    "priceCurrency": "NZD",
                    "availability": van.status === 'sold' ? "https://schema.org/SoldOut" : "https://schema.org/InStock"
                }
            }
        }))
    };
    const autoLongTailSlugs = Array.from(
        new Set(filteredVans.slice(0, 24).flatMap((van) => getLongTailSlugsForVan(van)))
    ).slice(0, 16);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(itemListSchema)}
                </script>
            </Helmet>

            {!loading && (
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-fade-in-up">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {t('listings.recently_added')} <span className="text-emerald-600">{t('listings.recently_added_highlight')}</span>
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">
                            {filteredVans.length} {filteredVans.length === 1 ? 'exceptional van' : 'exceptional vans'} found
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                            >
                                ✕ Clear Filters
                            </button>
                        )}
                        <div className="flex items-center gap-3 bg-white p-1.5 pl-4 rounded-2xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest" id="sort-label">Sort By</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer py-2 px-4"
                                aria-label="Sort listings by"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-asc">Lowest Price</option>
                                <option value="price-desc">Highest Price</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-32 animate-fade-in-up">
                    <div className="relative inline-block">
                        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-xl text-slate-600 font-bold mt-6">Searching the best vans...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredVans.map((van, index) => (
                            <div
                                key={van.id}
                                className={`animate-fade-in-up stagger-${(index % 6) + 1}`}
                            >
                                <VanCard
                                    van={van}
                                    formatPrice={formatPrice}
                                    priority={index < 3}
                                    setShowAuthModal={setShowAuthModal}
                                />
                            </div>
                        ))}
                    </div>

                    {autoLongTailSlugs.length > 0 && (
                        <div className="mt-10 bg-white border border-slate-100 rounded-2xl p-5">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                                More precise searches from current listings
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {autoLongTailSlugs.map((slug) => (
                                    <Link
                                        key={slug}
                                        to={`/search/${slug}`}
                                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition"
                                    >
                                        {LONG_TAIL_PAGE_MAP[slug]?.heading || slug}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredVans.length === 0 && (
                        <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 animate-fade-in-up">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Search size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">No vans found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your filters or search term to discover more adventures.</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-8 text-emerald-600 font-bold hover:underline"
                            >
                                Reset all filters
                            </button>
                        </div>
                    )}

                    {/* ===== ACCOUNT CREATION BANNER (Growth Hack) ===== */}
                    {filteredVans.length > 0 && !currentUser && (
                        <div className="mt-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                            
                            <div className="relative z-10 flex-1 text-center md:text-left">
                                <span className="inline-block bg-white/20 text-emerald-50 px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-4 backdrop-blur-sm border border-white/20 shadow-sm animate-pulse">
                                    Free Account
                                </span>
                                <h3 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
                                    Never miss a good deal
                                </h3>
                                <p className="text-emerald-100 text-lg max-w-xl mx-auto md:mx-0 font-medium">
                                    Create a free account to contact sellers instantly, save your favorite vans, and secure the best campervan for your road trip.
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => setShowAuthModal(true)}
                                className="relative z-10 flex-shrink-0 bg-white text-emerald-600 font-black text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all outline-none border-2 border-transparent hover:border-emerald-200"
                            >
                                Create Free Account
                            </button>
                        </div>
                    )}

                    {/* ===== GUIDE BANNER ===== */}
                    {filteredVans.length > 0 && (
                        <div className="mt-16 relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-white/5">
                            {/* Decorative glow */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_#10b981,_transparent_60%)]" />
                            <div className="relative z-10 flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <BookOpen size={22} className="text-emerald-400" />
                                    <span className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em]">Expert Guides</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-white leading-snug mb-2">
                                    First time buying a van in NZ?
                                </h3>
                                <p className="text-slate-400 text-base max-w-lg">
                                    Read our expert guides on WOF, REGO, self-contained certification, and how to inspect a van before buying.
                                </p>
                            </div>
                            <Link
                                to="/guides"
                                className="relative z-10 flex-shrink-0 inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-emerald-900/30 transition-all group active:scale-95"
                            >
                                <BookOpen size={20} />
                                Read the Guides
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
