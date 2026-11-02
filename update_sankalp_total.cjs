const fs = require('fs');

let s = fs.readFileSync('client/src/app/sankalp/page.tsx', 'utf8');

// 1. Calculate list totals:
// Find lines around finalPrice calculation:
const oldCalc = `  const extraParticipantFee = extraParticipantCount * 300;
  const offeringsTotal = selectedOfferings.reduce((sum, item) => sum + (Number(item.priceINR ?? item.price) || 0), 0);
  const finalPrice = basePrice + extraParticipantFee + offeringsTotal;`;

const newCalc = `  const extraParticipantFee = extraParticipantCount * 300;
  const offeringsTotal = selectedOfferings.reduce((sum, item) => sum + (Number(item.priceINR ?? item.price) || 0), 0);
  const finalPrice = basePrice + extraParticipantFee + offeringsTotal;

  // Total list price / MRP calculation:
  // (package list price or selling price) + Convenience (25) + Pandit (150) + Photo/Video (500) + extra participants + offerings list price
  const packageListPrice = Number(selectedPackage?.listPriceINR ?? selectedPackage?.listPrice) || basePrice;
  const offeringsListTotal = selectedOfferings.reduce((sum, item) => {
    const lPrice = Number(item.listPriceINR ?? item.listPrice);
    return sum + (lPrice && lPrice > 0 ? lPrice : (Number(item.priceINR ?? item.price) || 0));
  }, 0);
  const totalListPrice = packageListPrice + 25 + 150 + 500 + extraParticipantFee + offeringsListTotal;
  const totalActualAmount = appliedPromo ? appliedPromo.finalAmount : finalPrice;
  const totalSavings = totalListPrice > totalActualAmount ? (totalListPrice - totalActualAmount) : 0;`;

if (s.includes(oldCalc)) {
  s = s.replace(oldCalc, newCalc);
} else {
  const oldCalcCRLF = oldCalc.replace(/\n/g, '\r\n');
  const newCalcCRLF = newCalc.replace(/\n/g, '\r\n');
  s = s.replace(oldCalcCRLF, newCalcCRLF);
}

// 2. Replace Total row in Order Summary:
const oldTotalRow = `<div className="mt-3 flex justify-between border-t pt-3 text-sm font-bold">
                      <span>Total</span>
                      <span>₹{appliedPromo ? appliedPromo.finalAmount : finalPrice}</span>
                    </div>`;

const newTotalRow = `<div className="mt-3 flex flex-col border-t pt-3">
                      <div className="flex justify-between items-baseline text-sm font-bold">
                        <span className="text-stone-900 font-extrabold">Total</span>
                        <div className="flex items-baseline gap-2">
                          {totalListPrice > totalActualAmount && (
                            <span className="text-xs sm:text-sm font-bold text-stone-400 line-through decoration-red-500 decoration-1.5">
                              ₹{totalListPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                          <span className="text-base sm:text-lg font-black text-stone-900">
                            ₹{totalActualAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      {totalSavings > 0 && (
                        <div className="flex justify-end mt-1">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            You save ₹{totalSavings.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </div>`;

if (s.includes(oldTotalRow)) {
  s = s.replace(oldTotalRow, newTotalRow);
  fs.writeFileSync('client/src/app/sankalp/page.tsx', s, 'utf8');
  console.log('Successfully updated Total row in sankalp/page.tsx (LF)');
} else {
  const oldTotalRowCRLF = oldTotalRow.replace(/\n/g, '\r\n');
  const newTotalRowCRLF = newTotalRow.replace(/\n/g, '\r\n');
  if (s.includes(oldTotalRowCRLF)) {
    s = s.replace(oldTotalRowCRLF, newTotalRowCRLF);
    fs.writeFileSync('client/src/app/sankalp/page.tsx', s, 'utf8');
    console.log('Successfully updated Total row in sankalp/page.tsx (CRLF)');
  } else {
    console.log('Could not find oldTotalRow');
  }
}

