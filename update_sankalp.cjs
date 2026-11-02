const fs = require('fs');

let s = fs.readFileSync('client/src/app/sankalp/page.tsx', 'utf8');

// 1. Add PriceTag and getStartingListPriceINR import
if (!s.includes('import PriceTag')) {
  s = s.replace(
    'import { getStartingPriceINR } from "@/lib/pricing";',
    'import { getStartingPriceINR, getStartingListPriceINR } from "@/lib/pricing";\nimport PriceTag from "@/components/ui/PriceTag";'
  );
}

// 2. In packagesList: preserve listPriceINR
s = s.replace(
  'priceINR: pkg.priceINR ?? pkg.price ?? (queryAmount ? Number(queryAmount) : pujaData?.price || 501),',
  'priceINR: pkg.priceINR ?? pkg.price ?? (queryAmount ? Number(queryAmount) : pujaData?.price || 501),\n          listPriceINR: pkg.listPriceINR ?? pkg.listPrice,'
);

// 3. In offerings display (around line 902):
const oldOfferingPrice = '<div className="font-extrabold text-[#f15a29] text-sm">₹{offering.priceINR || offering.price || 0}</div>';
const newOfferingPrice = `<div>
                                <PriceTag
                                  sellingPrice={offering.priceINR || offering.price || 0}
                                  listPrice={offering.listPriceINR ?? offering.listPrice}
                                  sellingPriceClassName="font-extrabold text-[#f15a29] text-sm"
                                  listPriceClassName="text-xs font-bold text-stone-400 line-through decoration-red-500 decoration-1.5 ml-1"
                                  className="flex items-baseline gap-1 flex-wrap justify-end"
                                />
                              </div>`;

if (s.includes(oldOfferingPrice)) {
  s = s.replace(oldOfferingPrice, newOfferingPrice);
}

// 4. In Order Summary Breakdown (around line 971-974):
const oldSummaryPrice = `<div className="flex justify-between items-center">
                      <span className="font-medium">{packageName}</span>
                      <span className="font-extrabold text-[#980000]">₹{basePrice}</span>
                    </div>`;

const newSummaryPrice = `<div className="flex justify-between items-center">
                      <span className="font-medium">{packageName}</span>
                      <PriceTag
                        sellingPrice={basePrice}
                        listPrice={selectedPackage?.listPriceINR ?? selectedPackage?.listPrice ?? getStartingListPriceINR(pujaData)}
                        sellingPriceClassName="font-extrabold text-[#980000]"
                        listPriceClassName="text-xs font-semibold text-stone-400 line-through decoration-red-500 decoration-1.5 ml-1"
                        className="flex items-baseline gap-1 flex-wrap justify-end"
                      />
                    </div>`;

if (s.includes(oldSummaryPrice)) {
  s = s.replace(oldSummaryPrice, newSummaryPrice);
}

fs.writeFileSync('client/src/app/sankalp/page.tsx', s, 'utf8');
console.log('Successfully updated sankalp page with PriceTag');

