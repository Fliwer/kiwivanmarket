// API Route Vercel - Génère le sitemap des vans dynamiquement depuis Firebase
// URL: https://kiwivanmarket.com/api/sitemap-vehicles

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'kiwivanmarket';
const BASE_URL = 'https://kiwivanmarket.com';

module.exports = async function handler(req, res) {
  try {
    // Fetch tous les vans depuis Firestore REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/vans?pageSize=1000`;

    const response = await fetch(firestoreUrl);

    if (!response.ok) {
      throw new Error(`Firestore API error: ${response.status}`);
    }

    const data = await response.json();
    const documents = data.documents || [];

    // Générer le XML du sitemap
    const today = new Date().toISOString().split('T')[0];

    const urls = documents.map(doc => {
      // Extraire l'ID du document depuis le path
      const pathParts = doc.name.split('/');
      const vanId = pathParts[pathParts.length - 1];

      // Extraire la date de mise à jour si disponible
      const updatedAt = doc.updateTime
        ? doc.updateTime.split('T')[0]
        : today;

      return `  <url>
    <loc>${BASE_URL}/van/${vanId}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    // Retourner le XML avec les bons headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Sitemap generation error:', error);

    // Retourner un sitemap vide en cas d'erreur
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error generating sitemap -->
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.status(500).send(emptySitemap);
  }
};
