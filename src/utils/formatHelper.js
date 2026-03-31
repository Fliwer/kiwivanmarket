
/**
 * All-purpose formatting helper for Kiwi Van Market
 */

/**
 * Formats mileage to display the exact value.
 * Example: 254800 -> 254,800
 */
export const formatMileage = (mileage) => {
  if (!mileage && mileage !== 0) return '0';
  
  return mileage.toLocaleString();
};

/**
 * Standard price formatter for NZD
 */
export const formatPrice = (price) => {
  return `NZ$${(price || 0).toLocaleString()}`;
};
