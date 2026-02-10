/**
 * Safe Date Helper
 * 
 * Handles date parsing safely across browsers (fixes Safari 'Invalid Date' issues).
 * Handles Firestore Timestamps, ISO strings, and Date objects.
 */

export const safeDate = (value) => {
    if (!value) return null;

    try {
        // 1. Handle Firestore Timestamp
        if (value && typeof value.toDate === 'function') {
            return value.toDate();
        }

        // 2. Handle Firestore Seconds/Nanoseconds object (if not fully hydrated)
        if (value && typeof value.seconds === 'number') {
            return new Date(value.seconds * 1000);
        }

        // 3. Handle Date object
        if (value instanceof Date) {
            return value;
        }

        // 4. Handle Strings (Fix Safari ISO issues)
        if (typeof value === 'string') {
            // Fix potential space instead of T separator (Safari hates spaces in ISO)
            // e.g. "2023-01-01 12:00:00" -> "2023-01-01T12:00:00"
            let safeString = value;
            if (safeString.includes(' ') && !safeString.includes('T')) {
                safeString = safeString.replace(' ', 'T');
            }
            return new Date(safeString);
        }

        return new Date(value);
    } catch (e) {
        console.warn('Error parsing date:', value, e);
        return null;
    }
};

/**
 * Get timestamp helper for sorting
 */
export const getTimestamp = (value) => {
    const date = safeDate(value);
    return date ? date.getTime() : 0;
};
