import React, { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calculator, ArrowRight, ChevronDown, SlidersHorizontal, CarFront, Info } from 'lucide-react';
import SeoHead from './SeoHead';
import { pagesData, seoCopy, seoLang, SEO_LANGS } from '../data/seo';
import ownershipCost from '../data/seo/ownership-cost';

const EXAMPLE = { purchase: '12000', resale: '9500', days: '90', inspection: '250', repairs: '1000', insurance: '600', administration: '300', rentalDaily: '', rentalExtras: '' };
const DURATIONS = [30, 60, 90, 180];

export default function BuybackCalculator({ isEmbedded = false }) {
  const { i18n } = useTranslation();
  const lang = seoLang(i18n.language);
  const B = pagesData(lang).buyback;
  const T = seoCopy(lang).buyback;
  const U = B.ui;
  const id = useId();
  const [inputs, setInputs] = useState(EXAMPLE);
  const result = useMemo(() => ownershipCost.calculate(inputs), [inputs]);
  const expenseValues = ownershipCost.COST_FIELDS.map(key => Number(inputs[key]));
  const expenseTotal = expenseValues.every(value => Number.isFinite(value) && value >= 0)
    ? expenseValues.reduce((sum, value) => sum + value, 0) : null;
  const href = path => lang === 'fr' ? `${path}?lang=fr` : path;
  const money = value => new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 2 }).format(value);
  const input = (key, primary = false) => <div key={key} className={`space-y-2 ${primary && key === 'days' ? 'col-span-2 sm:col-span-1' : ''}`}>
    <label htmlFor={`${id}-${key}`} className={`block text-sm font-semibold text-slate-700 ${primary && key !== 'days' ? 'min-h-[40px] sm:min-h-0' : ''}`}>{U.fields[key]}{key === 'days' ? '' : ' (NZD)'}</label>
    <input id={`${id}-${key}`} type="number" min={key === 'days' ? 1 : 0} step={key === 'days' ? 1 : '0.01'} inputMode={key === 'days' ? 'numeric' : 'decimal'}
      value={inputs[key]} onChange={event => setInputs(values => ({ ...values, [key]: event.target.value }))}
      className={`w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${primary ? 'px-3 py-4 text-2xl font-bold tracking-tight' : 'px-3 py-3 text-base font-semibold'}`} />
  </div>;
  const Heading = isEmbedded ? 'h2' : 'h1';
  const SectionHeading = isEmbedded ? 'h3' : 'h2';

  return <div className={isEmbedded ? 'py-5' : 'min-h-screen bg-slate-50 px-4 py-9 sm:px-6 sm:py-14'}>
    {!isEmbedded && <SeoHead title={B.seoTitle} description={B.seoDesc} alternateLangs={SEO_LANGS} faqs={B.faqs}
      breadcrumbs={[{ name: seoCopy(lang).common.home, path: href('/') }, { name: T.crumb, path: href('/buyback-calculator') }]} />}
    <div className="mx-auto max-w-6xl">
      <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700"><Calculator size={17} />{U.eyebrow}</div>
      <Heading className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">{B.h1}</Heading>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">{B.intro}</p>

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-12">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:col-span-7">
          <SectionHeading className="text-lg font-bold text-slate-900">{U.inputsTitle}</SectionHeading>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{U.exampleShort}</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">{['purchase', 'resale', 'days'].map(key => input(key, true))}</div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">{U.fields.resale} : {U.resaleHint}</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {DURATIONS.map(days => <button key={days} type="button" aria-pressed={Number(inputs.days) === days}
              onClick={() => setInputs(values => ({ ...values, days: String(days) }))}
              className={`min-h-[40px] rounded-xl border px-1 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${Number(inputs.days) === days ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {days} {U.daysUnit}
            </button>)}
          </div>

          <details className="group mt-6 border-t border-slate-100">
            <summary className="flex min-h-[64px] cursor-pointer list-none flex-wrap items-center gap-2 py-4 text-sm [&::-webkit-details-marker]:hidden">
              <SlidersHorizontal size={17} className="shrink-0 text-slate-500" />
              <span className="font-semibold text-slate-800">{U.expensesTitle}</span>
              <span className="ml-auto font-bold text-slate-800">{expenseTotal === null ? '—' : money(expenseTotal)}</span>
              <ChevronDown size={16} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              <span className="w-full pl-6 text-xs text-slate-500">{U.expensesIncluded}</span>
            </summary>
            <div className="grid gap-4 pb-4 sm:grid-cols-2">{ownershipCost.COST_FIELDS.map(key => input(key))}</div>
            <p className="pb-5 text-xs leading-relaxed text-slate-500">{U.expensesNote}</p>
          </details>
          <details className="group border-t border-slate-100">
            <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-2 py-4 text-sm [&::-webkit-details-marker]:hidden">
              <CarFront size={17} className="shrink-0 text-slate-500" />
              <span className="font-semibold text-slate-800">{U.rentalTitle}</span>
              <span className="ml-auto text-xs text-slate-500">{U.optional}</span>
              <ChevronDown size={16} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid gap-4 sm:grid-cols-2">{['rentalDaily', 'rentalExtras'].map(key => input(key))}</div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">{U.rentalNote}</p>
            {inputs.rentalDaily !== '' && <button type="button" onClick={() => setInputs(values => ({ ...values, rentalDaily: '', rentalExtras: '' }))}
              className="mt-3 min-h-[40px] text-sm font-semibold text-slate-600 underline underline-offset-4">{U.removeRental}</button>}
          </details>
        </section>

        <section aria-live="polite" className="overflow-hidden rounded-3xl bg-slate-900 text-white shadow-lg lg:sticky lg:top-24 lg:col-span-5">
          <div className="p-6 sm:p-7">
            <SectionHeading className="text-sm font-semibold text-emerald-300">{U.resultsTitle}</SectionHeading>
            {result ? <>
              <dl className="mt-6">
                <dt className="text-sm text-slate-300">{U.dailyMain}</dt>
                <dd className="mt-2 flex flex-wrap items-baseline gap-x-2"><span className="break-words text-4xl font-black tracking-tight sm:text-5xl">{money(result.daily)}</span><span className="text-sm text-slate-400">{U.perDay}</span></dd>
                <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                  <dt className="max-w-[60%] text-sm text-slate-300">{U.tripTotal}</dt>
                  <dd className="text-xl font-bold">{money(result.ownership)}</dd>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <dt className="max-w-[60%] text-xs text-slate-400">{U.cashTitle}</dt>
                  <dd className="text-sm font-semibold text-slate-200">{money(result.cashRequired)}</dd>
                </div>
              </dl>
              {result.rental !== null && <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-300">{U.rentalTotal}</p>
                <p className="mt-1 text-xl font-bold">{money(result.rental)}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{result.difference > 0 ? U.buyLower : result.difference < 0 ? U.rentLower : U.equal}</p>
              </div>}
            </> : <p role="status" className="mt-5 text-sm leading-relaxed text-amber-200">{U.invalid}</p>}
            <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-slate-400">{U.resultNote}</p>
          </div>
          {!isEmbedded && <Link className="flex min-h-[52px] items-center justify-between gap-3 bg-emerald-700 px-6 py-4 text-sm font-semibold text-white transition hover:bg-emerald-800" to={href('/campervan-prices-nz')}>
            {T.pricesLink}<ArrowRight size={18} className="shrink-0" />
          </Link>}
        </section>
      </div>

      <details className="group mt-7 rounded-2xl border border-slate-200 bg-white px-5 sm:px-7">
        <summary className="flex min-h-[64px] cursor-pointer list-none items-center gap-3 text-sm font-semibold text-slate-700 [&::-webkit-details-marker]:hidden"><Info size={18} className="text-slate-400" />{U.methodTitle}<ChevronDown size={17} className="ml-auto text-slate-400 transition-transform group-open:rotate-180" /></summary>
        <div className="space-y-5 border-t border-slate-100 py-6 text-sm leading-relaxed text-slate-600">
          <p>{U.example}</p><p>{B.explainer}</p><p>{U.formula}</p><p>{U.limits}</p>
          <h3 className="text-base font-bold text-slate-900">{B.factorsTitle}</h3>
          {B.factors.map(factor => <div key={factor.name}><h4 className="font-semibold text-slate-900">{factor.name}</h4><p className="mt-1">{factor.text}</p></div>)}
          <h3 className="text-base font-bold text-slate-900">{seoCopy(lang).common.faqTitle}</h3>
          {B.faqs.map(({ q, a }) => <details key={q} className="border-b border-slate-100 pb-3"><summary className="cursor-pointer font-semibold text-slate-800">{q}</summary><p className="pt-2">{a}</p></details>)}
          <Link className="inline-flex items-center gap-2 font-semibold text-emerald-800 underline underline-offset-4" to={href('/guide/buying-campervan-nz')}>{U.buyingGuide}<ArrowRight size={16} /></Link>
        </div>
      </details>
    </div>
  </div>;
}
