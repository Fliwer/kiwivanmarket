import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import VanCard from './VanCard';

export default function Listings({
    loading,
    filteredVans,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    formatPrice
}) {
    const { t } = useTranslation();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            {!loading && (
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-fade-in-up">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            Explore <span className="text-emerald-600">Marketplace</span>
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
                                />
                            </div>
                        ))}
                    </div>

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
                </>
            )}
        </div>
    );
}
