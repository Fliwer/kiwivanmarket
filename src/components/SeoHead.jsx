import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ORIGIN = 'https://kiwivanmarket.com';

// ─── Schema.org sub-components ────────────────────────────────────────────────

function OrganizationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${ORIGIN}/#organization`,
        "name": "Kiwi Van Market",
        "url": ORIGIN,
        "logo": {
            "@type": "ImageObject",
            "url": `${ORIGIN}/kiwi-van-logo-128.webp`,
            "width": 128,
            "height": 128
        },
        "description": "The #1 campervan marketplace in New Zealand. Buy or sell campervans, motorhomes, and vans peer-to-peer with zero commission.",
        "contactPoint": {
            "@type": "ContactPoint",
            "email": "kiwivanmarket.contact@gmail.com",
            "contactType": "customer service",
            "availableLanguage": ["English", "French"]
        },
        "areaServed": { "@type": "Country", "name": "New Zealand" },
        "sameAs": ["https://www.facebook.com/kiwivanmarket"]
    };
    return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}

function AutoDealerSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "@id": `${ORIGIN}/#dealer`,
        "name": "Kiwi Van Market",
        "url": ORIGIN,
        "image": `${ORIGIN}/og-image.jpg`,
        "priceRange": "$$",
        "telephone": "",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Auckland",
            "addressCountry": "NZ"
        }
    };
    return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}

function WebSiteSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${ORIGIN}/#website`,
        "url": ORIGIN,
        "name": "Kiwi Van Market",
        "description": "Buy and sell campervans in New Zealand — Free listings, no commissions.",
        "publisher": { "@id": `${ORIGIN}/#organization` },
        "potentialAction": {
            "@type": "SearchAction",
            "target": { "@type": "EntryPoint", "urlTemplate": `${ORIGIN}/?search={search_term_string}` },
            "query-input": "required name=search_term_string"
        },
        "inLanguage": ["en", "fr"]
    };
    return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}

function WebPageSchema({ name, description, canonicalUrl }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        "url": canonicalUrl,
        "name": name,
        "description": description,
        "isPartOf": { "@id": `${ORIGIN}/#website` },
        "inLanguage": ["en", "fr", "es"]
    };
    return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}

function FAQSchema({ faqs }) {
    if (!faqs || faqs.length === 0) return null;
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(({ q, a }) => ({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": { "@type": "Answer", "text": a }
        }))
    };
    return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}

function BreadcrumbSchema({ breadcrumbs }) {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": crumb.name,
            "item": `${ORIGIN}${crumb.path}`
        }))
    };
    return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}

// ─── Main SeoHead ─────────────────────────────────────────────────────────────

/**
 * @param {string}  title
 * @param {string}  description
 * @param {string}  image
 * @param {string}  type          OG type (website, article, product)
 * @param {boolean} noindex
 * @param {Array}   faqs          [{ q, a }] — renders FAQPage schema
 * @param {Array}   breadcrumbs   [{ name, path }] — renders BreadcrumbList schema
 * @param {boolean} isHomepage    renders WebSite + Organization schema
 */
export default function SeoHead({
    title,
    description,
    image,
    keywords,
    canonicalUrl,
    type = 'website',
    noindex = false,
    faqs,
    breadcrumbs,
    isHomepage = false,
    // Langues pour lesquelles cette page a une vraie traduction indexable
    // (ex. les guides : ['en','fr','es']). Quand fourni, on émet un canonical
    // auto-référent par langue (?lang=fr/es) + des hreflang réciproques.
    alternateLangs = null,
}) {
    const { i18n, t } = useTranslation();
    const location = useLocation();

    let normalizedPath = location.pathname;
    if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
        normalizedPath = normalizedPath.slice(0, -1);
    }
    normalizedPath = normalizedPath.toLowerCase();

    const currentLang = i18n.language ? i18n.language.split('-')[0] : 'en';
    const cleanUrl = `${ORIGIN}${normalizedPath}`;

    // Pages localisées (guides) : canonical auto-référent par langue + hreflang
    // réciproques. Le prerender bots sert la traduction correspondante, donc
    // ?lang=fr/es sont de vraies pages distinctes (plus des doublons).
    // Ailleurs : canonical propre + en/x-default uniquement (comportement d'avant).
    const localized = Array.isArray(alternateLangs) && alternateLangs.length > 0;
    const langHref = (l) => (l === 'en' ? cleanUrl : `${cleanUrl}?lang=${l}`);
    const computedCanonicalUrl = localized ? langHref(currentLang) : cleanUrl;
    const fullTitle = title
        ? `${title} | Kiwi Van Market`
        : `${t('header.subtitle')} | Kiwi Van Market`;
    const metaDesc = description || t('hero.subtitle');
    const ogImage = image || `${ORIGIN}/og-image.jpg`;
    const mergedKeywords = keywords && Array.isArray(keywords)
        ? keywords.join(', ')
        : (keywords || "buy campervan New Zealand, campervans for sale NZ, backpacker van NZ, acheter un van nouvelle zelande, campervan a vendre NZ, motorhome for sale New Zealand, Toyota Hiace for sale NZ, self contained van for sale NZ, buy van Auckland");
    const finalCanonicalUrl = canonicalUrl || computedCanonicalUrl;

    // ── Injection SEO impérative ──────────────────────────────────────────
    // react-helmet-async ne réécrit pas le <head> dans cette app (constaté en
    // prod). On pose donc directement les balises SEO critiques pour garantir
    // leur présence côté client (title, description, robots, canonical,
    // hreflang, lang). On n'utilise que appendChild / setAttribute / title /
    // remove() → aucune des méthodes patchées globalement dans index.js.
    useEffect(() => {
        if (typeof document === 'undefined' || !document.head) return;
        const head = document.head;
        try {
            document.title = fullTitle;
            document.documentElement.setAttribute('lang', currentLang);

            // Met à jour la balise existante (celle d'index.html) plutôt que
            // d'en créer une seconde → évite les doublons de description/robots.
            const upsertMeta = (name, content) => {
                let el = head.querySelector(`meta[name="${name}"]`);
                if (!el) {
                    el = document.createElement('meta');
                    el.setAttribute('name', name);
                    head.appendChild(el);
                }
                el.setAttribute('content', content);
            };
            upsertMeta('description', metaDesc);
            upsertMeta('robots', noindex
                ? 'noindex, follow'
                : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

            // On purge nos anciens canonical/alternate puis on les repose
            // selon la page courante (évite les résidus lors des navigations SPA).
            head.querySelectorAll('link[data-seo]').forEach((el) => el.remove());
            const addLink = (rel, href, hreflang) => {
                const el = document.createElement('link');
                el.setAttribute('rel', rel);
                el.setAttribute('href', href);
                if (hreflang) el.setAttribute('hreflang', hreflang);
                el.setAttribute('data-seo', '');
                head.appendChild(el);
            };
            if (!noindex) {
                addLink('canonical', finalCanonicalUrl);
                if (localized) {
                    addLink('alternate', langHref('en'), 'en');
                    addLink('alternate', langHref('fr'), 'fr');
                    addLink('alternate', langHref('es'), 'es');
                    addLink('alternate', cleanUrl, 'x-default');
                } else {
                    addLink('alternate', cleanUrl, 'en');
                    addLink('alternate', cleanUrl, 'x-default');
                }
            }
        } catch (e) {
            /* silencieux : ne jamais casser le rendu pour du SEO */
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullTitle, metaDesc, finalCanonicalUrl, currentLang, noindex, localized, cleanUrl]);

    return (
        <>
            <Helmet>
                {/* ── Basic ───────────────────────────────────────────── */}
                <title>{fullTitle}</title>
                <meta name="description" content={metaDesc} />
                <meta name="author" content="Kiwi Van Market" />
                <meta name="keywords" content={mergedKeywords} />

                {/* ── Indexing / canonical ────────────────────────────── */}
                {noindex ? (
                    <meta name="robots" content="noindex, follow" />
                ) : (
                    <>
                        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
                        <link rel="canonical" href={finalCanonicalUrl} />
                    </>
                )}

                <html lang={currentLang} />

                {/* ── Hreflang ────────────────────────────────────────── */}
                {!noindex && localized && (
                    <>
                        <link rel="alternate" hreflang="en" href={langHref('en')} />
                        <link rel="alternate" hreflang="fr" href={langHref('fr')} />
                        <link rel="alternate" hreflang="es" href={langHref('es')} />
                        <link rel="alternate" hreflang="x-default" href={cleanUrl} />
                    </>
                )}
                {!noindex && !localized && (
                    <>
                        <link rel="alternate" hreflang="en" href={cleanUrl} />
                        <link rel="alternate" hreflang="x-default" href={cleanUrl} />
                    </>
                )}

                {/* ── Open Graph ──────────────────────────────────────── */}
                <meta property="og:type" content={type} />
                <meta property="og:url" content={finalCanonicalUrl} />
                <meta property="og:title" content={fullTitle} />
                <meta property="og:description" content={metaDesc} />
                <meta property="og:locale" content={currentLang === 'fr' ? 'fr_FR' : currentLang === 'es' ? 'es_ES' : 'en_NZ'} />
                <meta property="og:site_name" content="Kiwi Van Market" />
                <meta property="og:image" content={ogImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content={`${fullTitle} - Kiwi Van Market`} />

                {/* ── Twitter / X ─────────────────────────────────────── */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={finalCanonicalUrl} />
                <meta name="twitter:title" content={fullTitle} />
                <meta name="twitter:description" content={metaDesc} />
                <meta name="twitter:image" content={ogImage} />
                <meta name="twitter:image:alt" content={`${fullTitle} - Kiwi Van Market`} />
            </Helmet>

            {/* ── Schema.org structured data ───────────────────────── */}
            {isHomepage && <OrganizationSchema />}
            {isHomepage && <AutoDealerSchema />}
            {isHomepage && <WebSiteSchema />}
            {!noindex && <WebPageSchema name={fullTitle} description={metaDesc} canonicalUrl={finalCanonicalUrl} />}
            {faqs && faqs.length > 0 && <FAQSchema faqs={faqs} />}
            {breadcrumbs && breadcrumbs.length > 0 && <BreadcrumbSchema breadcrumbs={breadcrumbs} />}
        </>
    );
}
