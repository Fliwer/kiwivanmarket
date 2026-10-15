import React, { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calculator, ArrowRight, Info } from 'lucide-react';
import SeoHead from './SeoHead';
import { pagesData, seoCopy, seoLang, SEO_LANGS } from '../data/seo';
import ownershipCost from '../data/seo/ownership-cost';

const EXAMPLE = { purchase: '12000', resale: '9500', days: '90', inspection: '250', repairs: '1000', insurance: '600', administration: '300', rentalDaily: '', rentalExtras: '' };

export default function BuybackCalculator({ isEmbedded = false }) {
  const { i18n } = useTranslation();
  const lang = seoLang(i18n.language);
  const B = pagesData(lang).buyback;
  const T = seoCopy(lang).buyback;
  const U = B.ui;
  const id = useId();
  const [inputs, setInputs] = useState(EXAMPLE);
  const result = useMemo(() => ownershipCost.calculate(inputs), [inputs]);
  const href = (path) => lang === 'fr' ? `${path}?lang=fr` : path;
  const money = (value) => new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 2 }).format(value);
  const input = (key) => <div key={key} className="space-y-2">
    <label htmlFor={`${id}-${key}`} className="block text-sm font-semibold text-slate-700">{U.fields[key]}{key === 'days' ? '' : ' (NZD)'}</label>
    <input id={`${id}-${key}`} type="number" min={key === 'days' ? 1 : 0} step={key === 'days' ? 1 : '0.01'} inputMode="decimal"
      value={inputs[key]} onChange={(event) => setInputs((values) => ({ ...values, [key]: event.target.value }))}
      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
  </div>;
  const stat = (label, value) => <div className="rounded-xl border border-emerald-100 bg-white p-5"><dt className="text-sm text-slate-600">{label}</dt><dd className="mt-2 text-2xl font-bold text-slate-900 break-words">{money(value)}</dd></div>;
  const Heading = isEmbedded ? 'h2' : 'h1';
  return <div className={isEmbedded ? 'py-5' : 'min-h-screen bg-slate-50 px-5 py-12 sm:py-16'}>
    {!isEmbedded && <SeoHead title={B.seoTitle} description={B.seoDesc} alternateLangs={SEO_LANGS} faqs={B.faqs}
      breadcrumbs={[{ name: seoCopy(lang).common.home, path: href('/') }, { name: T.crumb, path: href('/buyback-calculator') }]} />}
    <div className="mx-auto max-w-5xl">
      <Calculator className="mb-5 text-emerald-700" size={30} />
      <Heading className="mb-5 text-3xl sm:text-4xl font-black text-slate-900">{B.h1}</Heading>
      <p className="max-w-3xl text-lg leading-relaxed text-slate-600">{B.intro}</p>
      <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">{U.example}</p>
      <div className="mt-8 grid gap-7 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <h2 className="mb-5 text-xl font-bold">{U.inputsTitle}</h2>
          <div className="grid gap-5 sm:grid-cols-2">{['purchase', 'resale', 'days', ...ownershipCost.COST_FIELDS].map(input)}</div>
          <p className="mt-5 text-sm text-slate-500">{U.expensesNote}</p>
          <h3 className="mt-8 mb-4 font-bold">{U.rentalTitle}</h3>
          <div className="grid gap-5 sm:grid-cols-2">{['rentalDaily', 'rentalExtras'].map(input)}</div>
          <p className="mt-4 text-sm text-slate-500">{U.rentalNote}</p>
        </div>
        <section aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-7">
          <h2 className="mb-5 text-xl font-bold">{U.resultsTitle}</h2>
          {result ? <>
            <dl className="grid gap-4">{stat(U.ownership, result.ownership)}{stat(U.daily, result.daily)}{stat(U.cashRequired, result.cashRequired)}
              {result.rental !== null && <>{stat(U.rentalTotal, result.rental)}{stat(U.difference, result.difference)}</>}
            </dl>
            {result.rental !== null && <p className="mt-4 text-sm leading-relaxed text-emerald-950">{result.difference > 0 ? U.buyLower : result.difference < 0 ? U.rentLower : U.equal}</p>}
            <p className="mt-5 text-sm leading-relaxed text-slate-600">{U.formula}</p>
          </> : <p className="text-amber-950">{U.invalid}</p>}
          <div className="mt-6 flex gap-3 text-sm leading-relaxed text-slate-600"><Info className="mt-1 shrink-0" size={18} /><p>{U.limits}</p></div>
        </section>
      </div>
      <section className="mt-10 space-y-5">
        <h2 className="text-2xl font-bold">{B.factorsTitle}</h2>
        <p className="leading-relaxed text-slate-600">{B.explainer}</p>
        {B.factors.map((factor) => <div key={factor.name}><h3 className="font-bold text-slate-900">{factor.name}</h3><p className="mt-1 leading-relaxed text-slate-600">{factor.text}</p></div>)}
      </section>
      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-bold">{seoCopy(lang).common.faqTitle}</h2>
        <div className="divide-y divide-slate-200 border-y border-slate-200">{B.faqs.map(({ q, a }) => <details key={q} className="py-4"><summary className="cursor-pointer font-semibold text-slate-900">{q}</summary><p className="pt-3 leading-relaxed text-slate-600">{a}</p></details>)}</div>
      </section>
      <div className="mt-9 flex flex-col items-start gap-4 font-semibold text-emerald-800">
        <Link className="inline-flex items-center gap-2 underline underline-offset-4" to={href('/campervan-prices-nz')}>{T.pricesLink}<ArrowRight size={17} /></Link>
        <Link className="underline underline-offset-4" to={href('/guide/buying-campervan-nz')}>{U.buyingGuide}</Link>
      </div>
    </div>
  </div>;
}
