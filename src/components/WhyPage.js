import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SeoHead from './SeoHead';
import { pagesData, seoCopy, seoLang, SEO_LANGS } from '../data/seo';

export default function WhyPage() {
  const { i18n } = useTranslation();
  const lang = seoLang(i18n.language);
  const W = pagesData(lang).why;
  const T = seoCopy(lang).why;
  const href = (path) => lang === 'fr' ? `${path}?lang=fr` : path;
  const linkStyle = 'inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700';
  return (
    <div className="min-h-screen bg-slate-50">
      <SeoHead title={W.seoTitle} description={W.seoDesc} alternateLangs={SEO_LANGS}
        breadcrumbs={[{ name: seoCopy(lang).common.home, path: href('/') }, { name: T.crumb, path: href('/why') }]} />
      <section className="bg-white border-b border-slate-200 px-5 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black leading-tight text-slate-900 mb-6">{W.h1}</h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mb-8">{W.intro}</p>
          <Link className={linkStyle} to={href('/')}>{T.explore}<ArrowRight size={18} /></Link>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-5 py-12 space-y-14">
        <section className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 sm:p-9">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{W.storyTitle}</h2>
          <p className="text-slate-700 leading-relaxed text-lg">{W.storyText}</p>
        </section>
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">{W.pillarsTitle}</h2>
          <p className="text-slate-600 mb-7">{W.pillarsSubtitle}</p>
          <div className="grid md:grid-cols-3 gap-5">{W.pillars.map((p) => <article key={p.title} className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold mb-3">{p.title}</h3><p className="text-slate-600 leading-relaxed mb-5">{p.desc}</p>
            <ul className="space-y-3">{p.items.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-600"><CheckCircle size={16} className="shrink-0 text-emerald-600 mt-0.5" />{item}</li>)}</ul>
          </article>)}</div>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">{W.editorialTitle}</h2>
          <p className="text-slate-600 leading-relaxed mb-5">{W.editorialText}</p>
          <div className="flex flex-col items-start gap-3 font-semibold text-emerald-800 underline underline-offset-4">
            <Link to={href('/guide/buying-campervan-nz')}>{T.guideBuy}</Link>
            <Link to={href('/campervan-prices-nz')}>{T.pricesLink}</Link>
            <Link to={href('/contact')}>{W.contactLabel}</Link>
          </div>
        </section>
        <section id="top10" className="scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">{W.top10Title}</h2>
          <p className="text-slate-600 leading-relaxed mb-7">{W.top10Subtitle}</p>
          <div className="grid sm:grid-cols-2 gap-5">{W.top10.map((van) => <article key={van.name} className="rounded-2xl bg-white border border-slate-200 p-6">
            <h3 className="text-xl font-bold mb-4">{van.path ? <Link className="text-emerald-800 underline underline-offset-4" to={href(van.path)}>{van.name}</Link> : van.name}</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed">{van.pros.map((p) => <li key={p}>{p}</li>)}</ul>
          </article>)}</div>
        </section>
        <section className="rounded-2xl bg-emerald-900 p-7 sm:p-10 text-white">
          <h2 className="text-2xl font-bold mb-3">{T.ready}</h2><p className="text-emerald-100 mb-6">{T.readyText}</p>
          <div className="flex flex-wrap gap-4"><Link className={linkStyle} to={href('/')}>{T.explore}</Link><Link className={linkStyle} to={href('/sell')}>{T.listFree}</Link></div>
        </section>
      </div>
    </div>
  );
}
