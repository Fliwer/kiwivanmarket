/**
 * Safe Storage Access
 * 
 * Prevents the app from crashing in environments where localStorage/sessionStorage 
 * is restricted or unavailable (e.g., Instagram In-App Browser, Safari Private Mode).
 */

const safeStorage = {
    getItem: (key) => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(key);
            }
        } catch (e) {
            console.warn(`Error reading ${key} from localStorage:`, e);
        }
        return null;
    },

    setItem: (key, value) => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, value);
            }
        } catch (e) {
            console.warn(`Error writing ${key} to localStorage:`, e);
        }
    },

    removeItem: (key) => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(key);
            }
        } catch (e) {
            console.warn(`Error removing ${key} from localStorage:`, e);
        }
    },

    clear: () => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.clear();
            }
        } catch (e) {
            console.warn('Error clearing localStorage:', e);
        }
    }
};

export const safeSessionStorage = {
    getItem: (key) => {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                return window.sessionStorage.getItem(key);
            }
        } catch (e) {
            console.warn(`Error reading ${key} from sessionStorage:`, e);
        }
        return null;
    },

    setItem: (key, value) => {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                window.sessionStorage.setItem(key, value);
            }
        } catch (e) {
            console.warn(`Error writing ${key} to sessionStorage:`, e);
        }
    },

    removeItem: (key) => {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                window.sessionStorage.removeItem(key);
            }
        } catch (e) {
            console.warn(`Error removing ${key} from sessionStorage:`, e);
        }
    },

    clear: () => {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                window.sessionStorage.clear();
            }
        } catch (e) {
            console.warn('Error clearing sessionStorage:', e);
        }
    }
};

export default safeStorage;
