import React from 'react';
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
}) {
    const { i18n, t } = useTranslation();
    const location = useLocation();

    let normalizedPath = location.pathname;
    if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
        normalizedPath = normalizedPath.slice(0, -1);
    }
    normalizedPath = normalizedPath.toLowerCase();

    const currentLang = i18n.language ? i18n.language.split('-')[0] : 'en';
    // ✅ Canonical TOUJOURS vers l'URL propre, sans ?lang=. Les variantes
    // ?lang=fr/es servent le même HTML côté serveur (traduction 100% client),
    // donc les canoniser séparément créait des signaux de contenu dupliqué
    // (8 pages « en double sans canonique » dans Search Console).
    const computedCanonicalUrl = `${ORIGIN}${normalizedPath}`;
    const fullTitle = title
        ? `${title} | Kiwi Van Market`
        : `${t('header.subtitle')} | Kiwi Van Market`;
    const metaDesc = description || t('hero.subtitle');
    const ogImage = image || `${ORIGIN}/og-image.jpg`;
    const mergedKeywords = keywords && Array.isArray(keywords)
        ? keywords.join(', ')
        : (keywords || "buy campervan New Zealand, campervans for sale NZ, backpacker van NZ, acheter un van nouvelle zelande, campervan a vendre NZ, motorhome for sale New Zealand, Toyota Hiace for sale NZ, self contained van for sale NZ, buy van Auckland");
    const finalCanonicalUrl = canonicalUrl || computedCanonicalUrl;

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
                {/* Plus d'alternates vers ?lang=fr/es : ces variantes servent le
                    même HTML (traduction client) → elles créaient des doublons.
                    On ne déclare que la version canonique anglaise. */}
                {!noindex && <link rel="alternate" hreflang="en" href={`${ORIGIN}${normalizedPath}`} />}
                {!noindex && <link rel="alternate" hreflang="x-default" href={`${ORIGIN}${normalizedPath}`} />}

                {/* ── Open Graph ──────────────────────────────────────── */}
                <meta property="og:type" content={type} />
                <meta property="og:url" content={finalCanonicalUrl} />
                <meta property="og:title" content={fullTitle} />
                <meta property="og:description" content={metaDesc} />
                <meta property="og:locale" content={currentLang === 'fr' ? 'fr_FR' : 'en_NZ'} />
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
