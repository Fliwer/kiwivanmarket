
/**
 * All-purpose formatting helper for Kiwi Van Market
 */

/**
 * Formats mileage with the 'XXX' suffix requested by the user.
 * Example: 254800 -> 254 XXX km
 */
export const formatMileage = (mileage) => {
  if (!mileage && mileage !== 0) return '0 XXX';
  
  // Only the thousands are shown, replaced the rest by 'XXX'
  const thousands = Math.floor(mileage / 1000);
  return `${thousands.toLocaleString()} XXX`;
};

/**
 * Standard price formatter for NZD
 */
export const formatPrice = (price) => {
  return `NZ$${(price || 0).toLocaleString()}`;
};
