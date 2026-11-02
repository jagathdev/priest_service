import React from "react";

interface PriceTagProps {
  sellingPrice: number | string | null;
  listPrice?: number | string | null;
  currencyPrefix?: string;
  className?: string;
  sellingPriceClassName?: string;
  listPriceClassName?: string;
  badgeClassName?: string;
  showBadge?: boolean;
  perBookingLabel?: boolean;
  /**
   * If true (default), struck-out list price appears on the LEFT of the selling price:
   * e.g. "₹1,000  ₹1" (struck-out list on the left, selling price on the right)
   * If false, list price appears on the right.
   */
  listPricePosition?: "left" | "right";
}

/**
 * Reusable PriceTag component:
 * - Always displays the Selling Price clearly.
 * - If listPrice exists and is GREATER than sellingPrice, displays listPrice struck out (line-through).
 * - By default listPricePosition="left" puts the struck-out list price on the left side:
 *   e.g. ~₹1,000~ ₹1
 * - If listPrice is equal to or less than sellingPrice, the struck out listPrice is hidden.
 */
export default function PriceTag({
  sellingPrice,
  listPrice,
  currencyPrefix = "₹",
  className = "flex items-baseline gap-2 flex-wrap",
  sellingPriceClassName = "font-black text-gray-900",
  listPriceClassName = "text-stone-400 line-through decoration-red-500/80 decoration-2 text-xs font-semibold",
  badgeClassName = "text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md",
  showBadge = false,
  perBookingLabel = false,
  listPricePosition = "left",
}: PriceTagProps) {
  const numSelling = sellingPrice !== null && sellingPrice !== undefined && sellingPrice !== ""
    ? Number(sellingPrice)
    : null;

  const numList = listPrice !== null && listPrice !== undefined && listPrice !== ""
    ? Number(listPrice)
    : null;


  if (numSelling === null || isNaN(numSelling)) {
    return <span className={sellingPriceClassName}>Price on request</span>;
  }

  const hasDiscount = numList !== null && !isNaN(numList) && numList > numSelling;
  const discountPercent = hasDiscount && numList
    ? Math.round(((numList - numSelling) / numList) * 100)
    : 0;

  const listPriceElement = hasDiscount ? (
    <span className={listPriceClassName}>
      {currencyPrefix}{numList!.toLocaleString("en-IN")}
    </span>
  ) : null;

  const sellingPriceElement = (
    <span className={sellingPriceClassName}>
      {currencyPrefix}{numSelling.toLocaleString("en-IN")}
    </span>
  );

  return (
    <div className={className}>
      {listPricePosition === "left" && listPriceElement}
      {sellingPriceElement}
      {listPricePosition === "right" && listPriceElement}

      {hasDiscount && showBadge && discountPercent > 0 && (
        <span className={badgeClassName}>
          {discountPercent}% OFF
        </span>
      )}

      {perBookingLabel && (
        <span className="text-[11px] text-gray-500 font-medium block w-full -mt-0.5">
          Per Booking
        </span>
      )}
    </div>
  );
}
