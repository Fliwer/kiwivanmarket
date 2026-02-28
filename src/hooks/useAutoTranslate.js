import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText } from '../utils/translationService';

/**
 * Custom hook to automatically translate text when the language changes.
 * @param {string} initialText - The source text to translate.
 * @returns {Object} - { translatedText, loading, error }
 */
export const useAutoTranslate = (initialText) => {
    const { i18n } = useTranslation();
    const [translatedText, setTranslatedText] = useState(initialText);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleTranslation = async () => {
            const currentLang = i18n.language?.split('-')[0] || 'en';

            if (currentLang === 'en') {
                setTranslatedText(initialText);
                return;
            }

            setLoading(true);
            try {
                const result = await translateText(initialText, currentLang);
                setTranslatedText(result);
            } catch (error) {
                console.error('AutoTranslate error:', error);
                setTranslatedText(initialText);
            } finally {
                setLoading(false);
            }
        };

        handleTranslation();
    }, [initialText, i18n.language]);

    return { translatedText, loading };
};
