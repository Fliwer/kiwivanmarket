import { useEffect, useState } from 'react';
import { MapPin, Search, ChevronDown, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CITIES = ['Auckland', 'Christchurch', 'Queenstown', 'Wellington', 'Hamilton', 'Tauranga', 'Rotorua', 'Dunedin'];
const BUDGETS = [10000, 15000, 20000, 30000, 50000];

export default function HomeSearch({ location, priceMax, onSearch }) {
  const { t, i18n } = useTranslation();
  const [city, setCity] = useState(location);
  const [budget, setBudget] = useState(priceMax);

  // Keep the form in sync with the detailed filters, including custom budgets.
  useEffect(() => { setCity(location); }, [location]);
  useEffect(() => { setBudget(priceMax); }, [priceMax]);
  const budgetLabel = (value) => t('marketplace.up_to', {
    amount: new Intl.NumberFormat(i18n.language).format(value),
  });
  const selectClass = 'w-full appearance-none bg-transparent pl-8 pr-7 py-1 text-base font-semibold text-slate-900 outline-none';

  return (
    <form
      role="search"
      aria-label={t('marketplace.search_label')}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch({ location: city, priceMax: Number(budget) });
      }}
      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
    >
      <div className="rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-600">
        <label htmlFor="home-city" className="block pl-8 mb-0.5 text-xs font-semibold text-slate-600">{t('marketplace.city')}</label>
        <div className="relative">
          <MapPin size={18} className="absolute left-0 top-1.5 text-emerald-700" aria-hidden="true" />
          <select id="home-city" value={city} onChange={(event) => setCity(event.target.value)} className={selectClass}>
            <option value="all">{t('marketplace.all_locations')}</option>
            {!CITIES.includes(city) && city !== 'all' && <option value={city}>{city}</option>}
            {CITIES.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-0 top-2 text-slate-500 pointer-events-none" aria-hidden="true" />
        </div>
      </div>
      <div className="rounded-xl px-3 py-2 border-t sm:border-t-0 sm:border-l border-slate-200 focus-within:ring-2 focus-within:ring-emerald-600">
        <label htmlFor="home-budget" className="block pl-8 mb-0.5 text-xs font-semibold text-slate-600">{t('marketplace.budget')}</label>
        <div className="relative">
          <Wallet size={18} className="absolute left-0 top-1.5 text-emerald-700" aria-hidden="true" />
          <select id="home-budget" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className={selectClass}>
            <option value={500000}>{t('marketplace.any_budget')}</option>
            {!BUDGETS.includes(budget) && budget !== 500000 && <option value={budget}>{budgetLabel(budget)}</option>}
            {BUDGETS.map((value) => <option key={value} value={value}>{budgetLabel(value)}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-0 top-2 text-slate-500 pointer-events-none" aria-hidden="true" />
        </div>
      </div>
      <button type="submit" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-base font-bold text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition-colors">
        <Search size={19} aria-hidden="true" />
        {t('marketplace.search')}
      </button>
    </form>
  );
}
