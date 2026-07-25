
/**
 * All-purpose formatting helper for Kiwi Van Market
 */

/**
 * Formats mileage as a full number with thousands separators.
 * Example: 254800 -> 254,800
 */
export const formatMileage = (mileage) => {
  if (!mileage && mileage !== 0) return '0';
  return Math.round(mileage).toLocaleString();
};

/**
 * Standard price formatter for NZD
 */
export const formatPrice = (price) => {
  return `NZ$${(price || 0).toLocaleString()}`;
};

/**
 * Format phone number for WhatsApp links (wa.me)
 * Handles auto-correcting local NZ numbers (021 -> 6421)
 * and keeps international format clean.
 */
export const formatWhatsAppNumber = (phone) => {
  if (!phone) return '';
  
  let cleaned = phone.replace(/\D/g, '');
  
  // If it starts with '00' (international prefix), replace with nothing and leave the country code
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  // If it starts with a single '0' (local number), assume NZ (+64)
  else if (cleaned.startsWith('0')) {
    cleaned = '64' + cleaned.substring(1); 
  }
  
  return cleaned;
};

