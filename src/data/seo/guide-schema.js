function article(guide, slug, lang = 'en') {
  const origin = 'https://kiwivanmarket.com';
  const url = `${origin}/guide/${slug}${lang === 'en' ? '' : `?lang=${lang}`}`;
  const sources = (guide.content?.sections || []).flatMap((section) => section.items || [])
    .filter((item) => item.type === 'sources').flatMap((item) => item.items || []);
  return {
    '@context': 'https://schema.org', '@type': 'Article', '@id': `${url}#article`,
    headline: guide.title, description: guide.description, url, inLanguage: lang,
    image: guide.heroImage ? [new URL(guide.heroImage, origin).href] : undefined,
    datePublished: guide.datePublished || undefined, dateModified: guide.dateModified || undefined,
    author: { '@type': 'Organization', '@id': `${origin}/#organization`, name: 'Kiwi Van Market', url: origin },
    publisher: { '@type': 'Organization', '@id': `${origin}/#organization`, name: 'Kiwi Van Market',
      logo: { '@type': 'ImageObject', url: `${origin}/kiwi-van-logo-128.webp` } },
    mainEntityOfPage: url,
    citation: sources.length ? [...new Set(sources.map((source) => source.url))] : undefined,
  };
}

function localizedPath(path, lang = 'en') {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const url = new URL(path, 'https://kiwivanmarket.com');
  if (!/\.[a-z0-9]+$/i.test(url.pathname)) {
    if (lang === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', lang);
  }
  return url.pathname + url.search + url.hash;
}

export default { article, localizedPath };
