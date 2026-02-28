import safeStorage from './safeStorage';

/**
 * Service to handle dynamic text translation using Google's translate endpoint locally.
 * Includes local caching to minimize API calls.
 */

const TRANSLATION_CACHE_KEY = 'kiwivan_translations';

const getCache = () => {
    try {
        const cached = safeStorage.getItem(TRANSLATION_CACHE_KEY);
        return cached ? JSON.parse(cached) : {};
    } catch (e) {
        return {};
    }
};

const setCache = (cache) => {
    try {
        safeStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.error('Translation cache failed:', e);
    }
};

/**
 * Translates text to a target language.
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The target language code (e.g., 'fr', 'es').
 * @returns {Promise<string>} - The translated text.
 */
export const translateText = async (text, targetLang) => {
    if (!text || !targetLang || targetLang === 'en') return text;

    const cache = getCache();
    const cacheKey = `${targetLang}:${text}`;

    if (cache[cacheKey]) {
        return cache[cacheKey];
    }

    try {
        // Using a reliable free mirror for Google Translate
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Translation failed');

        const data = await response.json();

        // Google Translate returns an array of arrays for segments
        const translated = data[0].map(segment => segment[0]).join('');

        if (translated) {
            cache[cacheKey] = translated;
            setCache(cache);
            return translated;
        }

        return text;
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
};
