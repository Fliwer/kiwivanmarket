// ============================================
// 🛡️ SECURITY UTILS - Validation & Sanitization
// ============================================
// 
// Fonctions pour valider et nettoyer les entrées utilisateur
// AVANT de les envoyer à Firestore
//
// ============================================

// ============================================
// 🧹 SANITIZATION
// ============================================

/**
 * Nettoie une chaîne de caractères pour éviter les XSS
 * Échappe les caractères HTML dangereux
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};

/**
 * Nettoie une chaîne mais garde les sauts de ligne (pour descriptions)
 */
export const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};

/**
 * Supprime tous les tags HTML d'une chaîne
 */
export const stripHtml = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
};

/**
 * Nettoie un objet récursivement
 */
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[sanitizeString(key)] = sanitizeObject(value);
  }
  return sanitized;
};

// ============================================
// ✅ VALIDATION
// ============================================

/**
 * Valide les données d'un van avant soumission
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateVanData = (data) => {
  const errors = [];

  // Titre
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required');
  } else if (data.title.length < 5) {
    errors.push('Title must be at least 5 characters');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Prix
  const price = parseInt(data.price);
  if (isNaN(price) || price <= 0) {
    errors.push('Price must be a positive number');
  } else if (price > 500000) {
    errors.push('Price seems too high (max $500,000)');
  }

  // Description
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required');
  } else if (data.description.length < 20) {
    errors.push('Description must be at least 20 characters');
  } else if (data.description.length > 5000) {
    errors.push('Description must be less than 5000 characters');
  }

  // Location
  if (!data.location || typeof data.location !== 'string') {
    errors.push('Location is required');
  } else if (data.location.length > 100) {
    errors.push('Location must be less than 100 characters');
  }

  // Année
  const year = parseInt(data.year);
  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < 1950 || year > currentYear + 1) {
    errors.push(`Year must be between 1950 and ${currentYear + 1}`);
  }

  // Kilométrage
  const mileage = parseInt(data.mileage);
  if (isNaN(mileage) || mileage < 0) {
    errors.push('Mileage must be a positive number');
  } else if (mileage > 1000000) {
    errors.push('Mileage seems too high');
  }

  // Images
  if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
    errors.push('At least one image is required');
  } else if (data.images.length > 10) {
    errors.push('Maximum 10 images allowed');
  }

  // Vérifier que les URLs d'images sont valides
  if (data.images && Array.isArray(data.images)) {
    for (const url of data.images) {
      if (!isValidImageUrl(url)) {
        errors.push('Invalid image URL detected');
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide les données d'un message
 */
export const validateMessageData = (data) => {
  const errors = [];

  if (!data.text || typeof data.text !== 'string') {
    errors.push('Message text is required');
  } else if (data.text.trim().length === 0) {
    errors.push('Message cannot be empty');
  } else if (data.text.length > 2000) {
    errors.push('Message must be less than 2000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide une URL d'image
 */
export const isValidImageUrl = (url) => {
  if (typeof url !== 'string') return false;

  // Accepter seulement Cloudinary et Firebase Storage
  const allowedDomains = [
    'res.cloudinary.com',
    'firebasestorage.googleapis.com',
  ];

  try {
    const parsedUrl = new URL(url);
    return allowedDomains.some(domain => parsedUrl.hostname.includes(domain));
  } catch {
    return false;
  }
};

/**
 * Valide une adresse email
 */
export const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Valide un numéro de téléphone NZ
 */
export const isValidNZPhone = (phone) => {
  if (typeof phone !== 'string') return false;
  // Formats acceptés: 021 123 4567, +64 21 123 4567, 0211234567
  const phoneRegex = /^(\+64|0)[2-9]\d{7,9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

// ============================================
// 🔒 RATE LIMITING (côté client - indicatif)
// ============================================

const rateLimitMap = new Map();

/**
 * Vérifie si une action est rate-limitée
 * ATTENTION: Ceci est côté client et peut être contourné
 * Le vrai rate limiting doit être côté serveur
 */
export const isRateLimited = (action, maxPerMinute = 10) => {
  const now = Date.now();
  const key = action;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }

  const timestamps = rateLimitMap.get(key);

  // Nettoyer les timestamps de plus d'une minute
  const recentTimestamps = timestamps.filter(t => now - t < 60000);
  rateLimitMap.set(key, recentTimestamps);

  if (recentTimestamps.length >= maxPerMinute) {
    return true; // Rate limited
  }

  recentTimestamps.push(now);
  return false;
};

/**
 * Enregistre une action pour le rate limiting
 */
export const recordAction = (action) => {
  if (!rateLimitMap.has(action)) {
    rateLimitMap.set(action, []);
  }
  rateLimitMap.get(action).push(Date.now());
};

// ============================================
// 📝 HELPERS
// ============================================

/**
 * Prépare les données d'un van pour Firestore
 * Valide, nettoie et formate
 */
export const prepareVanDataForFirestore = (rawData, userId) => {
  // Validation
  const validation = validateVanData(rawData);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Nettoyage et formatage
  return {
    title: sanitizeString(rawData.title),
    price: parseInt(rawData.price),
    location: sanitizeString(rawData.location),
    region: sanitizeString(rawData.region || 'North Island'),
    year: parseInt(rawData.year),
    mileage: parseInt(rawData.mileage),
    type: sanitizeString(rawData.type || 'Van'),
    description: sanitizeText(rawData.description),
    capacity: parseInt(rawData.capacity) || 2,
    selfContained: Boolean(rawData.selfContained),
    selfContainedType: rawData.selfContained ? sanitizeString(rawData.selfContainedType) : null,
    equipment: sanitizeObject(rawData.equipment || {}),
    buyBack: Boolean(rawData.buyBack),
    buyBackPrice: rawData.buyBack ? parseInt(rawData.buyBackPrice) || 0 : null,
    buyBackDuration: rawData.buyBack ? parseInt(rawData.buyBackDuration) : null,
    buyBackMaxKm: rawData.buyBack && rawData.buyBackMaxKm ? parseInt(rawData.buyBackMaxKm) : null,
    buyBackConditions: rawData.buyBack ? sanitizeText(rawData.buyBackConditions) : '',
    wofExpiry: rawData.wofExpiry || null,
    regoExpiry: rawData.regoExpiry || null,
    customFeatures: sanitizeText(rawData.customFeatures || ''),
    imageUrl: rawData.images?.[0] || '',
    images: rawData.images || [],
    seller: {
      uid: userId,
      // Ne pas inclure d'infos sensibles côté client
    },
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Prépare un message pour Firestore
 */
export const prepareMessageForFirestore = (text, senderId, senderName) => {
  const validation = validateMessageData({ text });
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  return {
    text: sanitizeText(text.trim()),
    senderId,
    senderName: sanitizeString(senderName || 'Anonymous'),
    read: false
  };
};
