/**
 * Shared utility for extracting consistent puja and homa pricing
 * across Homepage, Catalog, Detail, and Sankalp pages.
 * Supports both Selling Price and List Price (with strikethrough if listPrice > sellingPrice).
 */

export type PricingSource = Record<string, any>;

export interface ResolvedPriceInfo {
  sellingPrice: number | null;
  listPrice: number | null;
  hasDiscount: boolean;
  discountPercentage?: number;
}

/**
 * Returns the resolved selling price in INR as a number, or null if no valid price exists.
 * Order of priority:
 * 1. packages[0].priceINR / packages[0].price / packages[0].sellingPrice
 * 2. item.priceINR
 * 3. item.sellingPrice
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
    if (firstPkg.sellingPrice !== undefined && firstPkg.sellingPrice !== null && firstPkg.sellingPrice !== "") {
      const num = Number(firstPkg.sellingPrice);
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

  // 3. Direct sellingPrice on item
  if (item.sellingPrice !== undefined && item.sellingPrice !== null && item.sellingPrice !== "") {
    const num = Number(item.sellingPrice);
    if (!isNaN(num) && num > 0) return num;
  }

  // 4. basePrice on item
  if (item.basePrice !== undefined && item.basePrice !== null && item.basePrice !== "") {
    const num = Number(item.basePrice);
    if (!isNaN(num) && num > 0) return num;
  }

  // 5. price on item
  if (item.price !== undefined && item.price !== null && item.price !== "") {
    const num = Number(item.price);
    if (!isNaN(num) && num > 0) return num;
  }

  return null;
}

/**
 * Returns the resolved list price in INR as a number, or null if no valid list price exists.
 * Order of priority:
 * 1. packages[0].listPriceINR / packages[0].listPrice
 * 2. item.listPriceINR
 * 3. item.listPrice
 */
export function getStartingListPriceINR(item?: PricingSource | null): number | null {
  if (!item) return null;

  const firstPkg = Array.isArray(item.packages) && item.packages.length > 0 ? item.packages[0] : null;
  if (firstPkg) {
    if (firstPkg.listPriceINR !== undefined && firstPkg.listPriceINR !== null && firstPkg.listPriceINR !== "") {
      const num = Number(firstPkg.listPriceINR);
      if (!isNaN(num) && num > 0) return num;
    }
    if (firstPkg.listPrice !== undefined && firstPkg.listPrice !== null && firstPkg.listPrice !== "") {
      const num = Number(firstPkg.listPrice);
      if (!isNaN(num) && num > 0) return num;
    }
  }

  if (item.listPriceINR !== undefined && item.listPriceINR !== null && item.listPriceINR !== "") {
    const num = Number(item.listPriceINR);
    if (!isNaN(num) && num > 0) return num;
  }

  if (item.listPrice !== undefined && item.listPrice !== null && item.listPrice !== "") {
    const num = Number(item.listPrice);
    if (!isNaN(num) && num > 0) return num;
  }

  return null;
}

/**
 * Resolves both selling price and list price, and compares them:
 * - list price is only considered for strikethrough if listPrice > sellingPrice (i.e. not equal and not less)
 */
export function getPriceComparison(item?: PricingSource | null): ResolvedPriceInfo {
  const selling = getStartingPriceINR(item);
  const list = getStartingListPriceINR(item);

  const hasDiscount = Boolean(
    selling !== null &&
    list !== null &&
    list > selling
  );

  let discountPercentage: number | undefined;
  if (hasDiscount && list && selling) {
    discountPercentage = Math.round(((list - selling) / list) * 100);
  }

  return {
    sellingPrice: selling,
    listPrice: list,
    hasDiscount,
    discountPercentage,
  };
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
