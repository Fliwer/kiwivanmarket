// ============================================
// 🖼️ IMAGE OPTIMIZER - Réduction du Bandwidth Cloudinary
// ============================================
// 
// Ce helper transforme les URLs Cloudinary pour servir des images
// optimisées selon le contexte (thumbnail, full, etc.)
// 
// Économie estimée : 80-90% de bandwidth !
// ============================================

/**
 * Détecte si une URL est une URL Cloudinary
 * @param {string} url 
 * @returns {boolean}
 */
export const isCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com/');
};

/**
 * Extrait le public_id et le cloud_name d'une URL Cloudinary
 * @param {string} url 
 * @returns {{ cloudName: string, publicId: string } | null}
 */
const parseCloudinaryUrl = (url) => {
  if (!isCloudinaryUrl(url)) return null;
  
  try {
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
    const regex = /res\.cloudinary\.com\/([^/]+)\/image\/upload\/(?:([^/]+)\/)?(.+)/;
    const match = url.match(regex);
    
    if (match) {
      return {
        cloudName: match[1],
        // Le publicId peut déjà avoir des transformations, on garde tout après /upload/
        publicId: match[3]
      };
    }
    
    // Format alternatif sans transformations
    const simpleRegex = /res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.+)/;
    const simpleMatch = url.match(simpleRegex);
    
    if (simpleMatch) {
      return {
        cloudName: simpleMatch[1],
        publicId: simpleMatch[2]
      };
    }
    
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Génère une URL Cloudinary optimisée
 * @param {string} originalUrl - URL originale de l'image
 * @param {Object} options - Options d'optimisation
 * @returns {string} - URL optimisée
 */
export const optimizeImage = (originalUrl, options = {}) => {
  // Si ce n'est pas une URL Cloudinary, retourner telle quelle
  if (!isCloudinaryUrl(originalUrl)) {
    return originalUrl;
  }
  
  const {
    width = 800,        // Largeur max
    height = null,      // Hauteur (optionnel)
    quality = 'auto',   // Qualité auto = Cloudinary optimise
    format = 'auto',    // Format auto = WebP si supporté
    crop = 'limit',     // limit = garde l'aspect ratio, ne dépasse pas les dimensions
    gravity = 'auto',   // auto = focus intelligent
    dpr = 'auto'        // Device Pixel Ratio auto
  } = options;
  
  // Construire les transformations
  const transforms = [
    `w_${width}`,
    height ? `h_${height}` : null,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
    `dpr_${dpr}`
  ].filter(Boolean).join(',');
  
  // Parser l'URL pour reconstruire
  const parsed = parseCloudinaryUrl(originalUrl);
  
  if (!parsed) {
    return originalUrl;
  }
  
  // Reconstruire l'URL avec les transformations
  // On doit nettoyer le publicId des anciennes transformations éventuelles
  let cleanPublicId = parsed.publicId;
  
  // Si le publicId contient déjà des transformations (ex: w_800,h_600/vans/image.jpg)
  // On garde seulement la partie après les transformations
  if (cleanPublicId.includes('/')) {
    const parts = cleanPublicId.split('/');
    // Vérifier si la première partie ressemble à des transformations
    if (parts[0].includes('_') && (parts[0].includes('w_') || parts[0].includes('h_') || parts[0].includes('c_'))) {
      cleanPublicId = parts.slice(1).join('/');
    }
  }
  
  return `https://res.cloudinary.com/${parsed.cloudName}/image/upload/${transforms}/${cleanPublicId}`;
};

// ============================================
// 🎨 PRESETS D'OPTIMISATION
// ============================================

/**
 * Thumbnail pour les cards de listing (très petit, très rapide)
 * Taille: ~20-40KB au lieu de ~500KB
 */
export const getThumbnail = (url) => {
  return optimizeImage(url, {
    width: 400,
    height: 280,
    crop: 'fill',
    quality: 'auto:low',  // Qualité basse pour thumbnails
    format: 'auto'
  });
};

/**
 * Image medium pour le modal/détail
 * Taille: ~80-150KB au lieu de ~500KB
 */
export const getMediumImage = (url) => {
  return optimizeImage(url, {
    width: 800,
    quality: 'auto:good',
    format: 'auto'
  });
};

/**
 * Image large pour le carousel du modal (bonne qualité)
 * Taille: ~150-250KB au lieu de ~500KB
 */
export const getLargeImage = (url) => {
  return optimizeImage(url, {
    width: 1200,
    quality: 'auto:best',
    format: 'auto'
  });
};

/**
 * Image full HD pour vue plein écran (meilleure qualité)
 */
export const getFullImage = (url) => {
  return optimizeImage(url, {
    width: 1920,
    quality: 'auto:best',
    format: 'auto'
  });
};

/**
 * Avatar/profil (très petit)
 */
export const getAvatar = (url) => {
  return optimizeImage(url, {
    width: 100,
    height: 100,
    crop: 'fill',
    gravity: 'face',  // Focus sur le visage si c'est une photo
    quality: 'auto',
    format: 'auto'
  });
};

// ============================================
// 📊 UTILITAIRES
// ============================================

/**
 * Estime la taille d'une image après optimisation
 * (approximation basée sur des moyennes)
 */
export const estimateOptimizedSize = (originalSizeKB, targetWidth = 800) => {
  // Ratio de compression moyen avec WebP et quality:auto
  const compressionRatio = 0.15; // ~85% de réduction en moyenne
  const widthRatio = Math.min(1, targetWidth / 1920); // Ratio par rapport à full HD
  
  return Math.round(originalSizeKB * compressionRatio * widthRatio);
};

/**
 * Retourne l'URL de fallback si l'image n'existe pas
 */
export const getImageWithFallback = (url, fallback = 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800') => {
  return url || fallback;
};

// ============================================
// 🔧 COMPOSANT HELPER (pour React)
// ============================================

/**
 * Props optimisées pour une balise <img>
 * Inclut lazy loading et optimisation
 */
export const getOptimizedImageProps = (url, alt, size = 'medium') => {
  const sizeMap = {
    thumbnail: getThumbnail,
    medium: getMediumImage,
    large: getLargeImage,
    full: getFullImage,
    avatar: getAvatar
  };
  
  const optimizer = sizeMap[size] || getMediumImage;
  
  return {
    src: optimizer(url),
    alt: alt || 'Van image',
    loading: 'lazy',
    decoding: 'async',
    // Évite le layout shift
    style: { backgroundColor: '#f3f4f6' }
  };
};

export default {
  optimizeImage,
  getThumbnail,
  getMediumImage,
  getLargeImage,
  getFullImage,
  getAvatar,
  isCloudinaryUrl,
  getImageWithFallback,
  getOptimizedImageProps
};