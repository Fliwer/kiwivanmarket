// ============================================================================
// Edge Middleware — prerender de la HOME pour les crawlers.
// Nécessaire car les rewrites vercel.json ne s'appliquent pas à "/" :
// le filesystem (index.html) gagne toujours. Le middleware, lui, s'exécute
// AVANT le filesystem. Limité strictement à la racine via le matcher.
// ============================================================================

export const config = { matcher: '/' };

const BOT_RE = /(googlebot|google-inspectiontool|bingbot|duckduckbot|yandex|baiduspider|applebot|gptbot|oai-searchbot|chatgpt|claudebot|claude-web|claude-searchbot|anthropic|perplexity|ccbot|amazonbot|bytespider|meta-externalagent|facebookexternalhit|twitterbot|linkedinbot|slackbot|whatsapp|telegrambot|discordbot|pinterestbot|google-extended)/i;

export default function middleware(request) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (BOT_RE.test(ua)) {
      const url = new URL('/api/prerender-home', request.url);
      return new Response(null, {
        headers: { 'x-middleware-rewrite': url.toString() },
      });
    }
  } catch (e) {
    // En cas de pépin, on laisse passer : les humains ne doivent JAMAIS
    // être impactés par le prerender.
  }
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}
