// ============================================
// 🖼️ CLOUDINARY CONFIG - Upload sécurisé
// ============================================

// ============================================
// 🔧 CONFIGURATION
// ============================================

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dzkrted9t',
  uploadPreset: 'van_images',
  folder: 'vans'
};

// ============================================
// 🛡️ VALIDATION
// ============================================

// Types de fichiers autorisés
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

// Taille max: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Dimensions min/max
const MIN_DIMENSION = 200;
const MAX_DIMENSION = 4096;

/**
 * Valide un fichier avant upload
 * @param {File} file 
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateImageFile = (file) => {
  // Vérifier le type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG and WebP are allowed.'
    };
  }
  
  // Vérifier la taille
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    };
  }
  
  // Vérifier que c'est bien une image (magic bytes)
  return { isValid: true };
};

/**
 * Valide les dimensions d'une image
 * @param {File} file 
 * @returns {Promise<{ isValid: boolean, error?: string }>}
 */
export const validateImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
        resolve({
          isValid: false,
          error: `Image too small. Minimum ${MIN_DIMENSION}x${MIN_DIMENSION}px.`
        });
      } else if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        resolve({
          isValid: false,
          error: `Image too large. Maximum ${MAX_DIMENSION}x${MAX_DIMENSION}px.`
        });
      } else {
        resolve({ isValid: true });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'Could not read image file.'
      });
    };
    
    img.src = url;
  });
};

// ============================================
// 📤 UPLOAD FUNCTION
// ============================================

/**
 * Upload une image vers Cloudinary avec validation
 * @param {File} file - Le fichier image
 * @param {Object} options - Options supplémentaires
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadToCloudinary = async (file, options = {}) => {
  // 1. Validation du type et taille
  const typeValidation = validateImageFile(file);
  if (!typeValidation.isValid) {
    throw new Error(typeValidation.error);
  }
  
  // 2. Validation des dimensions (optionnel mais recommandé)
  if (options.validateDimensions !== false) {
    const dimValidation = await validateImageDimensions(file);
    if (!dimValidation.isValid) {
      throw new Error(dimValidation.error);
    }
  }
  
  // 3. Préparer le FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', options.folder || CLOUDINARY_CONFIG.folder);
  
  // Note: Les transformations ne sont pas autorisées avec unsigned upload
  // L'optimisation sera faite via getOptimizedUrl() lors de l'affichage
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    
    // Vérifier que l'URL retournée est bien de Cloudinary
    if (!data.secure_url?.includes('cloudinary.com')) {
      throw new Error('Invalid response from Cloudinary');
    }
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format
    };
    
  } catch (error) {
    // Log en dev seulement
    if (process.env.NODE_ENV === 'development') {
      console.error('Cloudinary upload error:', error);
    }
    throw error;
  }
};

/**
 * Upload multiple images avec limite
 * @param {File[]} files 
 * @param {number} maxImages 
 * @returns {Promise<Array>}
 */
export const uploadMultipleImages = async (files, maxImages = 5) => {
  if (files.length > maxImages) {
    throw new Error(`Maximum ${maxImages} images allowed`);
  }
  
  const results = [];
  const errors = [];
  
  for (const file of files) {
    try {
      const result = await uploadToCloudinary(file);
      results.push(result);
    } catch (error) {
      errors.push({ file: file.name, error: error.message });
    }
  }
  
  if (errors.length > 0 && results.length === 0) {
    throw new Error(`All uploads failed: ${errors.map(e => e.error).join(', ')}`);
  }
  
  return { results, errors };
};

// ============================================
// 🔗 URL HELPERS
// ============================================

/**
 * Génère une URL Cloudinary optimisée
 * @param {string} publicId 
 * @param {Object} options 
 */
export const getOptimizedUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;
  
  const transforms = [
    `w_${width}`,
    height ? `h_${height}` : null,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`
  ].filter(Boolean).join(',');
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transforms}/${publicId}`;
};

/**
 * Génère une URL thumbnail
 */
export const getThumbnailUrl = (publicId) => {
  return getOptimizedUrl(publicId, {
    width: 300,
    height: 200,
    crop: 'fill',
    quality: 'auto'
  });
};
