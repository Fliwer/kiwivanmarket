import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Composant SEO global pour gérer les balises meta, titre et hreflang
 * @param {string} title - Titre de la page (sera suffixé par "| Kiwi Van Market")
 * @param {string} description - Description meta
 * @param {string} image - URL de l'image (pour OG/Twitter)
 * @param {string} type - Type OG (website, article, product...)
 */
export default function SeoHead({ title, description, image, type = 'website' }) {
    const { i18n, t } = useTranslation();
    const location = useLocation();

    // Base URL
    const origin = 'https://kiwivanmarket.com';
    const currentPath = location.pathname;
    const currentLang = i18n.language ? i18n.language.split('-')[0] : 'en';

    // Canonical URL logic: No ?lang=en for the default language
    const canonicalUrl = currentLang === 'en'
        ? `${origin}${currentPath}`
        : `${origin}${currentPath}?lang=${currentLang}`;

    // Supported languages
    const languages = ['en', 'fr', 'es'];

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title ? `${title} | Kiwi Van Market` : t('header.subtitle') + ' | Kiwi Van Market'}</title>
            <meta name="description" content={description || t('hero.subtitle')} />
            <link rel="canonical" href={canonicalUrl} />
            <html lang={currentLang} />

            {/* Hreflang Tags pour SEO International */}
            {languages.map(lang => (
                <link
                    key={lang}
                    rel="alternate"
                    hreflang={lang}
                    href={lang === 'en' ? `${origin}${currentPath}` : `${origin}${currentPath}?lang=${lang}`}
                />
            ))}
            {/* x-default pour la version par défaut (Anglais) */}
            <link rel="alternate" hreflang="x-default" href={`${origin}${currentPath}`} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={title ? `${title} | Kiwi Van Market` : 'Kiwi Van Market'} />
            <meta property="og:description" content={description || t('hero.subtitle')} />
            <meta property="og:locale" content={currentLang} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonicalUrl} />
            <meta property="twitter:title" content={title ? `${title} | Kiwi Van Market` : 'Kiwi Van Market'} />
            <meta property="twitter:description" content={description || t('hero.subtitle')} />
            {image && <meta property="twitter:image" content={image} />}
        </Helmet>
    );
}
