// ============================================================================
// Edge Middleware — deux rôles, tous deux liés au SEO d'une SPA :
//
// 1. Prerender de la HOME pour les crawlers. Nécessaire car les rewrites
//    vercel.json ne s'appliquent pas à "/" : le filesystem (index.html) gagne
//    toujours. Le middleware, lui, s'exécute AVANT le filesystem.
//
// 2. Vrai 404 sur les URLs inconnues. Sans ça, le fallback SPA sert index.html
//    en HTTP 200 pour n'importe quoi ("soft 404" en Search Console) : vans
//    supprimés, vieux liens, fautes de frappe... tout revient en 200 et pollue
//    l'index. On ne 404 QUE ce qui ne ressemble à aucune route de App.js ;
//    en cas de doute on laisse passer.
//
// ⚠️  Toute nouvelle route dans src/App.js doit être ajoutée à KNOWN_ROUTES,
//    sinon elle renvoie 404 (page complète, pas le shell React).
// ============================================================================

// Exclus du middleware : les fonctions api/, les internes Vercel, et tout
// chemin avec une extension (assets, sitemaps, robots.txt, .html...).
export const config = {
  matcher: ['/((?!api/|_vercel/|_next/|.*\\..*).*)'],
};

const BOT_RE = /(googlebot|google-inspectiontool|bingbot|duckduckbot|yandex|baiduspider|applebot|gptbot|oai-searchbot|chatgpt|claudebot|claude-web|claude-searchbot|anthropic|perplexity|ccbot|amazonbot|bytespider|meta-externalagent|facebookexternalhit|twitterbot|linkedinbot|slackbot|whatsapp|telegrambot|discordbot|pinterestbot|google-extended)/i;

// Miroir des <Route path> de src/App.js. Les segments dynamiques acceptent
// n'importe quoi : c'est la fonction prerender-* correspondante qui renvoie le
// 404 fin (slug inconnu) côté bots.
const KNOWN_ROUTES = [
  /^\/$/,
  /^\/sell$/,
  /^\/guides$/,
  /^\/faq$/,
  /^\/contact$/,
  /^\/why$/,
  /^\/buyback-calculator$/,
  /^\/campervan-prices-nz$/,
  /^\/messages$/,
  /^\/my-listings$/,
  /^\/profile$/,
  /^\/embed\/buyback-calculator$/,
  /^\/van\/[^/]+$/,
  /^\/brand\/[^/]+$/,
  /^\/location\/[^/]+$/,
  /^\/guide\/[^/]+$/,
  /^\/search\/[^/]+$/,
  /^\/faq\/[^/]+\/[^/]+$/,
];

const NEXT = () => new Response(null, { headers: { 'x-middleware-next': '1' } });

// Normalisation défensive : React Router est insensible à la casse et tolère
// le slash final, donc on ne doit pas 404 "/Sell/" alors que "/sell" existe.
function normalizePath(pathname) {
  let p = pathname.toLowerCase();
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found | Kiwi Van Market</title>
<meta name="robots" content="noindex">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
<style>
body{font-family:system-ui,sans-serif;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;color:#1e293b;text-align:center;padding:24px}
h1{font-size:1.75rem;margin:0 0 8px}p{color:#64748b;margin:0 0 24px}
a{display:inline-block;margin:6px;padding:12px 20px;border-radius:12px;background:#059669;color:#fff;text-decoration:none;font-weight:700}
a.alt{background:#fff;color:#059669;border:2px solid #059669}
</style>
</head>
<body>
<main>
<h1>This page doesn't exist</h1>
<p>The van may have been sold, or the link is out of date.</p>
<a href="/">Browse campervans for sale</a>
<a class="alt" href="/guides">Read the buying guides</a>
</main>
</body>
</html>`;

export default function middleware(request) {
  try {
    const url = new URL(request.url);
    const path = normalizePath(url.pathname);
    const isBot = BOT_RE.test(request.headers.get('user-agent') || '');

    // 1. Home prerendue pour les crawlers (comportement historique). On
    //    transmet ?lang=fr pour la version francaise (sinon la query serait
    //    perdue dans le rewrite).
    if (path === '/' && isBot) {
      const target = new URL('/api/prerender-home', request.url);
      const lang = url.searchParams.get('lang');
      if (lang) target.searchParams.set('lang', lang);
      return new Response(null, {
        headers: { 'x-middleware-rewrite': target.toString() },
      });
    }

    // 2. Route connue → on laisse Vercel faire (rewrites bots, puis SPA).
    if (KNOWN_ROUTES.some((re) => re.test(path))) return NEXT();

    // 3. Inconnue → vrai 404, pour tout le monde. Un humain a une vraie page
    //    au lieu d'un shell vide, Google arrête de compter un soft 404.
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch (e) {
    // En cas de pépin, on laisse passer : les humains ne doivent JAMAIS
    // être impactés par ce middleware.
    return NEXT();
  }
}
