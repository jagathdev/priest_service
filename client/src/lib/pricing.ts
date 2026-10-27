/**
 * Shared utility for extracting consistent puja and homa pricing
 * across Homepage, Catalog, Detail, and Sankalp pages.
 */

export type PricingSource = Record<string, any>;

/**
 * Returns the resolved starting price in INR as a number, or null if no valid price exists.
 * Order of priority:
 * 1. packages[0].priceINR
 * 2. packages[0].price
 * 3. item.priceINR
 * 4. item.basePrice
 * 5. item.price
 */
export function getStartingPriceINR(item?: PricingSource | null): number | null {
  if (!item) return null;

  // 1. Check primary package
  const firstPkg = Array.isArray(item.packages) && item.packages.length > 0 ? item.packages[0] : null;
  if (firstPkg) {
    if (firstPkg.priceINR !== undefined && firstPkg.priceINR !== null && firstPkg.priceINR !== "") {
      const num = Number(firstPkg.priceINR);
      if (!isNaN(num) && num > 0) return num;
    }
    if (firstPkg.price !== undefined && firstPkg.price !== null && firstPkg.price !== "") {
      const num = Number(firstPkg.price);
      if (!isNaN(num) && num > 0) return num;
    }
  }

  // 2. Direct priceINR on item
  if (item.priceINR !== undefined && item.priceINR !== null && item.priceINR !== "") {
    const num = Number(item.priceINR);
    if (!isNaN(num) && num > 0) return num;
  }

  // 3. basePrice on item
  if (item.basePrice !== undefined && item.basePrice !== null && item.basePrice !== "") {
    const num = Number(item.basePrice);
    if (!isNaN(num) && num > 0) return num;
  }

  // 4. price on item
  if (item.price !== undefined && item.price !== null && item.price !== "") {
    const num = Number(item.price);
    if (!isNaN(num) && num > 0) return num;
  }

  return null;
}

/**
 * Formats starting price consistently.
 * Returns formatted string like "₹525" or fallback label like "Price on request".
 */
export function formatStartingPrice(
  item?: PricingSource | null,
  fallbackLabel = "Price on request"
): string {
  const price = getStartingPriceINR(item);
  return price !== null ? `₹${price.toLocaleString("en-IN")}` : fallbackLabel;
}
