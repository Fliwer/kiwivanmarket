import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, ArrowRight, AlertTriangle, Share2, Copy, Check, Clock,
  Calculator, ChevronDown, MessageCircle, Facebook, Download,
} from 'lucide-react';
import SeoHead from './SeoHead';
import BuybackCalculator from './BuybackCalculator';
import { GUIDES } from '../constants/guides';
import { useHideLoader } from '../hooks/useHideLoader';

// ============================================================================
// GuidePage v2 — machine à lire ET à convertir
// Colonne article éditoriale + rail droit sticky (CTA annonces, sommaire,
// articles liés). Blocs : texte, image, callout, checklist, steps numérotés,
// tableau, FAQ, CTA inline. Footer de partage. Un seul h1 par page.
// ============================================================================

const GuideSchema = ({ guide, url }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    image: guide.heroImage,
    url,
    author: { '@type': 'Organization', name: 'Kiwi Van Market' },
    publisher: {
      '@type': 'Organization',
      name: 'Kiwi Van Market',
      logo: { '@type': 'ImageObject', url: 'https://kiwivanmarket.com/kiwi-van-logo-128.webp' },
    },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
  };
  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
};

// ── Encadré fin à bordure gauche ────────────────────────────────────────────
function TipBox({ label, children, tone = 'emerald' }) {
  const tones = {
    emerald: 'border-emerald-400 bg-emerald-50/70 text-emerald-900',
    amber: 'border-amber-400 bg-amber-50/80 text-amber-900',
    blue: 'border-sky-400 bg-sky-50/70 text-sky-900',
  };
  return (
    <aside className={`border-l-4 rounded-r-xl px-5 py-4 my-6 ${tones[tone]}`}>
      {label && <p className="text-[11px] font-black uppercase tracking-widest mb-1.5 opacity-80">{label}</p>}
      <div className="text-[15px] leading-relaxed font-medium">{children}</div>
    </aside>
  );
}

// ── Blocs de contenu ────────────────────────────────────────────────────────
function GuideItem({ item, lang }) {
  if (item.type === 'image') {
    return (
      <figure className="my-8">
        <img src={item.url} alt={item.caption || ''} loading="lazy" className="w-full rounded-xl border border-slate-200" />
        {item.caption && <figcaption className="mt-3 text-sm text-slate-400 font-medium">{item.caption}</figcaption>}
      </figure>
    );
  }

  if (item.type === 'callout') {
    return (
      <TipBox tone={item.variant === 'warning' ? 'amber' : 'blue'} label={item.title}>
        {item.text}
      </TipBox>
    );
  }

  // Étapes numérotées — le format « checklist article » ultra-scannable
  if (item.type === 'steps') {
    return (
      <ol className="my-8 space-y-5 list-none">
        {(item.items || []).map((s, i) => (
          <li key={i} className="flex gap-4">
            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-[13px] font-black flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-[15.5px] leading-[1.75] text-slate-600">
              <strong className="text-slate-900 font-bold">{s.title}</strong>
              {s.title && s.text ? ' — ' : ''}
              {s.text}
            </p>
          </li>
        ))}
      </ol>
    );
  }

  // CTA inline — l'action au moment où le lecteur en a besoin
  if (item.type === 'cta') {
    const inner = (
      <>
        <span className="flex items-center gap-2.5">
          {item.download && <Download size={17} className="shrink-0" />}
          {item.text}
        </span>
        <ArrowRight size={17} className="shrink-0 group-hover:translate-x-1 transition-transform" />
      </>
    );
    const cls = 'my-6 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 font-bold text-emerald-900 text-[15px] hover:bg-emerald-100/70 transition group';
    return item.href
      ? <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
      : <Link to={item.to || '/'} className={cls}>{inner}</Link>;
  }

  if (item.type === 'checklist') {
    return (
      <div className="my-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
        <p className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-[15px]">{item.title}</p>
        <ul className="px-5 py-4 space-y-2.5">
          {(item.items || []).map((li, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-600">
              <Check size={17} strokeWidth={3} className="text-emerald-500 mt-0.5 shrink-0" />
              <span>{li}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (item.type === 'table') {
    return (
      <div className="my-8">
        {item.title && <p className="font-bold text-slate-900 mb-3 text-[15px]">{item.title}</p>}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  {(item.headers || []).map((h, i) => (
                    <th key={i} className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap border-b border-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(item.rows || []).map((row, ri) => (
                  <tr key={ri} className={ri > 0 ? 'border-t border-slate-100' : ''}>
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-4 py-3.5 text-sm leading-relaxed align-top ${ci === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {item.caption && <p className="mt-2.5 text-[13px] text-slate-400">{item.caption}</p>}
      </div>
    );
  }

  if (item.type === 'faq') {
    return (
      <div className="my-6 divide-y divide-slate-200 border-y border-slate-200">
        {(item.items || []).map((f, i) => (
          <details key={i} className="group py-1">
            <summary className="cursor-pointer list-none py-4 flex items-start justify-between gap-4 font-semibold text-slate-900 text-[16px] leading-snug">
              {f.q}
              <ChevronDown size={18} className="mt-1 shrink-0 text-slate-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="pb-5 text-[15px] leading-relaxed text-slate-600 max-w-prose">{f.a}</p>
          </details>
        ))}
      </div>
    );
  }

  // Bloc texte standard : H3 + paragraphe
  return (
    <div className="my-8">
      {item.title && <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{item.title}</h3>}
      {item.text && <p className="text-[16px] leading-[1.75] text-slate-600">{item.text}</p>}
      {item.expertTip && (
        <TipBox tone="emerald" label={lang === 'fr' ? '💡 Astuce de pro' : '💡 Pro tip'}>
          {item.expertTip}
        </TipBox>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function GuidePage() {
  useHideLoader();
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en').split('-')[0];

  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const sectionRefs = useRef([]);

  const langGuides = GUIDES[currentLang] || GUIDES.en;
  const guide = langGuides[slug] || GUIDES.en[slug];
  const url = `https://kiwivanmarket.com/guide/${slug}`;

  const readingTime = (() => {
    if (!guide) return 5;
    const words = JSON.stringify(guide.content).split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  })();

  const shareText = guide ? `${guide.title} — ${url}` : url;
  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: guide.title, text: guide.description, url: window.location.href }); }
      catch (_) { /* annulé */ }
    } else { handleCopy(); }
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
      const pos = window.scrollY + 160;
      const idx = sectionRefs.current.findIndex((ref) => {
        if (!ref) return false;
        return pos >= ref.offsetTop && pos < ref.offsetTop + ref.offsetHeight;
      });
      if (idx !== -1) setActiveSection(idx);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug, currentLang]);

  if (!guide) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-10 max-w-md">
          <div className="text-6xl mb-6">📖</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">{t('guides.page.not_found_title')}</h1>
          <p className="text-slate-500 mb-8">{t('guides.page.not_found_desc')}</p>
          <Link to="/guides" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-500 transition">
            <ArrowLeft size={18} />
            {t('guides.page.back')}
          </Link>
        </div>
      </div>
    );
  }

  const { content } = guide;
  const updatedLabel = new Date().toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-NZ', { month: 'long', year: 'numeric' });

  const guideFaqs = (content.sections || [])
    .flatMap((s) => s.items || [])
    .filter((i) => i.type === 'faq')
    .flatMap((i) => i.items || [])
    .map((f) => ({ q: f.q, a: f.a }));

  const related = Object.entries(langGuides).filter(([s]) => s !== slug).slice(0, 3);
  const relatedReadTime = (g) => Math.max(1, Math.ceil(JSON.stringify(g.content).split(/\s+/).length / 200));

  const scrollToSection = (idx) => sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      <SeoHead
        title={guide.title}
        description={guide.description}
        image={guide.heroImage}
        type="article"
        faqs={guideFaqs}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
          { name: guide.title, path: `/guide/${slug}` },
        ]}
      />
      <GuideSchema guide={guide} url={url} />

      <div className="bg-white pt-16 md:pt-6">
        <div
          className="fixed top-0 left-0 h-1 bg-emerald-500 z-[100] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-2 md:pt-4">
          <div className="lg:flex lg:gap-12 xl:gap-16">
          {/* Colonne gauche : en-tête + article (le rail s'aligne sur le titre) */}
          <div className="flex-1 max-w-[46rem] min-w-0">
          {/* ── En-tête d'article ── */}
          <header>
            <nav className="flex items-center gap-2 text-[13px] font-semibold text-slate-400 mb-6">
              <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/guides" className="hover:text-emerald-600 transition-colors">{t('guides.backToList', 'Guides')}</Link>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-[2.6rem] font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-5">
              {guide.title}
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed mb-6">{guide.description}</p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-8 text-[13px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-[#f7eedd] flex items-center justify-center overflow-hidden">
                  <img src="/kiwi-van-logo-48.webp" alt="" className="w-4 h-4 object-contain" />
                </span>
                Kiwi Van Market
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <Clock size={14} />
                {t('guides.hub.min_read', { count: readingTime })}
              </span>
              <span className="text-slate-400">{currentLang === 'fr' ? 'Mis à jour' : 'Updated'} {updatedLabel}</span>
            </div>

            <img
              src={guide.heroImage}
              alt={guide.title}
              fetchPriority="high"
              className="w-full aspect-[16/9] object-cover rounded-2xl border border-slate-200"
            />
          </header>

            {/* ── Article ── */}
            <article className="mt-10 md:mt-14">

              {/* Sommaire mobile repliable */}
              <details className="lg:hidden mb-8 rounded-xl border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between text-sm font-bold text-slate-700">
                  {currentLang === 'fr' ? 'Sommaire' : 'On this page'}
                  <ChevronDown size={16} className="text-slate-400" />
                </summary>
                <ul className="px-4 pb-3 space-y-1">
                  {content.sections.map((section, idx) => (
                    <li key={idx}>
                      <button
                        onClick={(e) => { e.target.closest('details').removeAttribute('open'); scrollToSection(idx); }}
                        className="text-left text-sm text-slate-600 hover:text-emerald-700 py-1 font-medium"
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>

              {content.intro && (
                <p className="text-[17px] md:text-lg leading-[1.8] text-slate-700 mb-12 pb-10 border-b border-slate-100">
                  {content.intro}
                </p>
              )}

              {content.sections && content.sections.map((section, idx) => (
                <React.Fragment key={idx}>
                  <section ref={(el) => (sectionRefs.current[idx] = el)} className="scroll-mt-28 mb-14">
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="text-[13px] font-black text-emerald-500 tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                      <h2 className="text-2xl md:text-[1.7rem] font-extrabold text-slate-900 tracking-tight leading-tight">{section.title}</h2>
                    </div>
                    {section.items.map((item, itemIdx) => (
                      <GuideItem key={itemIdx} item={item} lang={currentLang} />
                    ))}
                  </section>

                  {((slug === 'buying-campervan-nz' && idx === 3) ||
                    (slug === 'selling-campervan-nz' && idx === 2)) && (
                      <div className="mb-14 rounded-2xl bg-slate-900 text-white p-6 md:p-10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />
                        <div className="relative z-10 mb-8">
                          <p className="inline-flex items-center gap-2 text-emerald-400 text-[11px] font-black uppercase tracking-widest mb-3">
                            <Calculator size={14} />
                            {currentLang === 'fr' ? 'Outil gratuit' : 'Free tool'}
                          </p>
                          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                            {currentLang === 'fr' ? 'Estimez votre valeur de revente' : 'Estimate your resale value'}
                          </h2>
                          <p className="text-slate-400 text-[15px]">
                            {currentLang === 'fr' ? 'Basé sur la saisonnalité réelle du marché NZ.' : 'Based on real NZ market seasonality.'}
                          </p>
                        </div>
                        <BuybackCalculator isEmbedded={true} />
                      </div>
                    )}
                </React.Fragment>
              ))}

              {content.warnings && (
                <section className="mb-14">
                  <div className="flex items-baseline gap-3 mb-6">
                    <AlertTriangle size={18} className="text-amber-500 self-center" />
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {currentLang === 'fr' ? 'Points de vigilance' : 'Crucial warnings'}
                    </h2>
                  </div>
                  {content.warnings.map((warning, idx) => (
                    <TipBox key={idx} tone="amber">{warning}</TipBox>
                  ))}
                </section>
              )}

              {/* Footer de partage — « Found this helpful? » */}
              <div className="rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                  <p className="font-bold text-slate-900">{currentLang === 'fr' ? 'Ce guide vous a aidé ?' : 'Found this helpful?'}</p>
                  <p className="text-sm text-slate-500">{currentLang === 'fr' ? 'Partagez-le à un ami qui prépare son trip NZ.' : 'Share it with a friend planning their NZ trip.'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                    target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition"
                  >
                    <MessageCircle size={18} />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                    target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition"
                  >
                    <Facebook size={18} />
                  </a>
                  <button
                    onClick={handleCopy} aria-label="Copy link"
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${copied ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                  <button
                    onClick={handleShare} aria-label="Share"
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition sm:hidden"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* CTA final */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-7 md:p-9 mb-20">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {content.cta?.title || (currentLang === 'fr' ? 'Prêt à trouver votre van ?' : 'Ready to find your van?')}
                </h2>
                <p className="text-[15px] text-slate-600 leading-relaxed mb-5 max-w-lg">
                  {content.cta?.text || (currentLang === 'fr'
                    ? 'Parcourez les campervans à vendre partout en Nouvelle-Zélande — WOF, REGO et certification self-contained affichés sur chaque annonce.'
                    : 'Browse campervans for sale across New Zealand — WOF, REGO and self-contained status shown on every listing.')}
                </p>
                <Link
                  to={content.cta?.buttonLink || '/'}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-500 transition active:scale-95"
                >
                  {content.cta?.buttonText || (currentLang === 'fr' ? 'Voir les annonces' : 'Browse campervans')}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          </div>{/* fin colonne gauche */}

            {/* ── Rail droit sticky : conversion + navigation ── */}
            <aside className="hidden lg:block w-[300px] shrink-0">
              <div className="sticky top-24 space-y-5 pb-16">

                {/* CTA principal — toujours visible pendant la lecture */}
                <div className="rounded-2xl bg-emerald-900 text-white p-6">
                  <h4 className="font-extrabold text-lg leading-snug mb-1.5">
                    {currentLang === 'fr' ? 'Prêt à trouver votre van ?' : 'Ready to find your van?'}
                  </h4>
                  <p className="text-emerald-200/80 text-[13px] leading-relaxed mb-4">
                    {currentLang === 'fr'
                      ? 'Des campervans vendus par de vrais propriétaires, partout en NZ.'
                      : 'Campervans listed by real owners across New Zealand.'}
                  </p>
                  <Link
                    to="/"
                    className="block text-center bg-white text-emerald-900 font-bold rounded-xl px-4 py-2.5 text-sm hover:bg-emerald-50 transition active:scale-95"
                  >
                    {currentLang === 'fr' ? 'Voir les annonces →' : 'Browse vans →'}
                  </Link>
                </div>

                {/* Sommaire compact */}
                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    {currentLang === 'fr' ? 'Sur cette page' : 'On this page'}
                  </p>
                  <ul className="space-y-0.5">
                    {content.sections.map((section, idx) => (
                      <li key={idx}>
                        <button
                          onClick={() => scrollToSection(idx)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] leading-snug transition ${activeSection === idx
                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                            : 'text-slate-500 hover:text-slate-900 font-medium'}`}
                        >
                          {section.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Articles liés */}
                {related.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
                      {currentLang === 'fr' ? 'Articles liés' : 'Related articles'}
                    </p>
                    <div className="space-y-4">
                      {related.map(([s, g]) => (
                        <Link key={s} to={`/guide/${s}`} className="flex gap-3 group">
                          <img
                            src={g.heroImage}
                            alt=""
                            loading="lazy"
                            className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                              {g.title}
                            </p>
                            <p className="text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                              <Clock size={11} />
                              {t('guides.hub.min_read', { count: relatedReadTime(g) })}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* Guides liés (mobile — le rail droit est desktop-only) */}
        <div className="lg:hidden max-w-3xl mx-auto px-5 sm:px-6 pb-16">
          {related.length > 0 && (
            <div className="border-t border-slate-100 pt-8">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">
                {currentLang === 'fr' ? 'À lire ensuite' : 'Keep reading'}
              </p>
              <div className="grid sm:grid-cols-3 gap-5">
                {related.map(([s, g]) => (
                  <Link key={s} to={`/guide/${s}`} className="group flex sm:block gap-4">
                    <img
                      src={g.heroImage}
                      alt={g.title}
                      loading="lazy"
                      className="w-24 sm:w-full aspect-square sm:aspect-[16/10] object-cover rounded-xl border border-slate-200 sm:mb-3 shrink-0"
                    />
                    <p className="text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-3 self-center">
                      {g.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Retour en haut */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className={`fixed bottom-6 right-6 w-11 h-11 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-lg flex items-center justify-center transition-all duration-300 z-[90] hover:border-slate-400 active:scale-95 ${scrollProgress > 20 ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}
        >
          <ArrowLeft size={18} className="rotate-90" />
        </button>
      </div>
    </>
  );
}
