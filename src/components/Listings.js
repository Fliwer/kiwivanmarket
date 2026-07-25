import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen, ArrowRight, ArrowUpDown, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import VanCard from './VanCard';
import { getLongTailSlugsForVan, LONG_TAIL_PAGE_MAP } from '../constants/seoLongTailPages';

const PAGE_SIZE = 24;
const LISTINGS_PAGE_KEY = 'kiwiVanMarket_listingsPage';
const RETURN_SCROLL_KEY = 'kiwiVanMarket_returnScrollY';
const RETURN_PATH_KEY = 'kiwiVanMarket_returnPath';

// Build a compact list of page buttons, with ellipsis for large counts.
// e.g. getPageNumbers(5, 10) -> [1, '…', 4, 5, 6, '…', 10]
function getPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) pages.push('…');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('…');
    pages.push(total);
    return pages;
}

export default function Listings({
    loading,
    filteredVans,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    formatPrice,
    setShowAuthModal,
    onPageChange
}) {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const restoredScrollRef = useRef(false);
    const [currentPage, setCurrentPage] = useState(() => {
        if (typeof window === 'undefined') return 1;
        const saved = Number(window.sessionStorage.getItem(LISTINGS_PAGE_KEY));
        return Number.isInteger(saved) && saved > 0 ? saved : 1;
    });

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
    ).slice(0, 8);
    const totalPages = Math.max(1, Math.ceil(filteredVans.length / PAGE_SIZE));
    const pageStart = (currentPage - 1) * PAGE_SIZE;
    const pageEnd = pageStart + PAGE_SIZE;
    const paginatedVans = filteredVans.slice(pageStart, pageEnd);

    // Notify the parent of the current page (used to hide the hero past page 1)
    useEffect(() => {
        if (onPageChange) onPageChange(currentPage);
    }, [currentPage, onPageChange]);

    // Change page + scroll back to the top of the listings.
    // Deferred so the scroll happens AFTER React re-renders (the hero hides on
    // page > 1, which shifts the layout) — and instant for reliability.
    const goToPage = (p) => {
        const target = Math.min(totalPages, Math.max(1, p));
        if (target === currentPage) return;
        if (typeof window !== 'undefined') {
            // Scroll to top BEFORE the page change so the hero hiding (page > 1)
            // doesn't trigger scroll-anchoring that fights the scroll. Re-assert
            // once more after the layout settles, for reliability.
            window.scrollTo(0, 0);
            setTimeout(() => window.scrollTo(0, 0), 60);
        }
        setCurrentPage(target);
    };

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(LISTINGS_PAGE_KEY, String(currentPage));
        }
    }, [currentPage]);

    useEffect(() => {
        if (loading || restoredScrollRef.current || typeof window === 'undefined') return;
        const returnPath = window.sessionStorage.getItem(RETURN_PATH_KEY);
        const savedScroll = Number(window.sessionStorage.getItem(RETURN_SCROLL_KEY));

        if (returnPath === '/' && Number.isFinite(savedScroll) && savedScroll >= 0) {
            requestAnimationFrame(() => {
                window.scrollTo({ top: savedScroll, behavior: 'auto' });
                window.sessionStorage.removeItem(RETURN_SCROLL_KEY);
                window.sessionStorage.removeItem(RETURN_PATH_KEY);
                restoredScrollRef.current = true;
            });
            return;
        }

        restoredScrollRef.current = true;
    }, [loading, filteredVans.length, currentPage]);

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

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                            >
                                ✕ {t('listings.clear', 'Clear')}
                            </button>
                        )}
                        {/* Tri — version épurée (icône + chevron custom, sans gros label) */}
                        <div className="relative">
                            <ArrowUpDown size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 pl-10 pr-9 py-2.5 cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all shadow-sm"
                                aria-label={t('listings.sort_by', 'Sort listings')}
                            >
                                <option value="newest">{t('listings.sort_newest', 'Newest first')}</option>
                                <option value="price-asc">{t('listings.sort_price_asc', 'Lowest price')}</option>
                                <option value="price-desc">{t('listings.sort_price_desc', 'Highest price')}</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                        {paginatedVans.map((van, index) => {
                            const globalIndex = pageStart + index;
                            return (
                            <div
                                key={van.id}
                                className={`animate-fade-in-up stagger-${(index % 6) + 1}`}
                            >
                                <VanCard
                                    van={van}
                                    formatPrice={formatPrice}
                                    priority={globalIndex < 3}
                                    setShowAuthModal={setShowAuthModal}
                                />
                            </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-slate-500 font-medium">
                                Showing {Math.min(pageStart + 1, filteredVans.length)}-{Math.min(pageEnd, filteredVans.length)} of {filteredVans.length} vans
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    aria-label="Previous page"
                                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-black text-base leading-none disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                                >
                                    ‹
                                </button>
                                {getPageNumbers(currentPage, totalPages).map((p, i) => (
                                    p === '…' ? (
                                        <span key={`ellipsis-${i}`} className="px-2 text-slate-400 font-bold select-none">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => goToPage(p)}
                                            aria-current={p === currentPage ? 'page' : undefined}
                                            className={`min-w-[40px] px-3 py-2 rounded-xl text-sm font-black transition ${p === currentPage
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            {p}
                                        </button>
                                    )
                                ))}
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    aria-label="Next page"
                                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-black text-base leading-none disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    )}

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
