import React from 'react';
import { useTranslation } from 'react-i18next';
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
        <div className="max-w-7xl mx-auto px-4 py-6">

            {!loading && (
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xl font-bold text-gray-800">
                        {filteredVans.length} {filteredVans.length === 1 ? 'van' : 'vans'} available
                    </p>
                    <div className="flex items-center gap-3">
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                                ✕ Clear search
                            </button>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline" id="sort-label">{t('sort.label')}</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                                aria-label="Sort listings by"
                            >
                                <option value="newest">{t('sort.newest')}</option>
                                <option value="price-asc">{t('sort.price_asc')}</option>
                                <option value="price-desc">{t('sort.price_desc')}</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-4"></div>
                    <p className="text-xl text-gray-600 font-semibold">Loading vans...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVans.map((van, index) => (
                            <VanCard
                                key={van.id}
                                van={van}
                                formatPrice={formatPrice}
                                priority={index < 3}
                            />
                        ))}
                    </div>

                    {filteredVans.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-2xl font-bold text-gray-400 mb-2">No vans found</p>
                            <p className="text-gray-500">Try adjusting your filters or search term</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
