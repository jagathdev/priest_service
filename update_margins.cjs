const fs = require('fs');

['client/src/app/puja/[slug]/PujaDetailClient.tsx', 'client/src/app/homa/[slug]/HomaDetailClient.tsx'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');

  // Replace package card listPriceClassName to remove ml-1 and add mr-1:
  c = c.replaceAll(
    'listPriceClassName="text-xs font-bold text-stone-400 line-through decoration-red-500 decoration-1.5 ml-1"',
    'listPriceClassName="text-xs font-bold text-stone-400 line-through decoration-red-500 decoration-1.5 mr-1"'
  );

  // Replace bottom sticky bar listPriceClassName:
  c = c.replaceAll(
    'listPriceClassName="text-xs sm:text-sm font-semibold text-slate-300 line-through decoration-red-400 decoration-1.5 ml-1 whitespace-nowrap"',
    'listPriceClassName="text-xs sm:text-sm font-semibold text-slate-300 line-through decoration-red-400 decoration-1.5 mr-1.5 whitespace-nowrap"'
  );

  fs.writeFileSync(file, c, 'utf8');
  console.log('Updated list price margin in', file);
});

// Update sankalp/page.tsx:
let s = fs.readFileSync('client/src/app/sankalp/page.tsx', 'utf8');
s = s.replaceAll(
  'listPriceClassName="text-xs font-bold text-stone-400 line-through decoration-red-500 decoration-1.5 ml-1"',
  'listPriceClassName="text-xs font-bold text-stone-400 line-through decoration-red-500 decoration-1.5 mr-1.5"'
);
s = s.replaceAll(
  'listPriceClassName="text-xs font-semibold text-stone-400 line-through decoration-red-500 decoration-1.5 ml-1"',
  'listPriceClassName="text-xs font-semibold text-stone-400 line-through decoration-red-500 decoration-1.5 mr-1.5"'
);
fs.writeFileSync('client/src/app/sankalp/page.tsx', s, 'utf8');
console.log('Updated list price margin in sankalp/page.tsx');

