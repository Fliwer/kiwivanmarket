
/**
 * All-purpose formatting helper for Kiwi Van Market
 */

/**
 * Formats mileage with the 'xxx' suffix requested by the user.
 * Example: 254800 -> 254 xxx
 */
export const formatMileage = (mileage) => {
  if (!mileage && mileage !== 0) return '0 xxx';
  
  // Only the thousands are shown, replaced the rest by 'xxx'
  const thousands = Math.floor(mileage / 1000);
  return `${thousands.toLocaleString()} xxx`;
};

/**
 * Standard price formatter for NZD
 */
export const formatPrice = (price) => {
  return `NZ$${(price || 0).toLocaleString()}`;
};
