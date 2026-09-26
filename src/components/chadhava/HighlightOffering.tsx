"use client";
import React from 'react';
import { AddButton } from './AddButton';
import { Offering } from './OfferingCard';
import { useCurrency } from '@/contexts/CurrencyContext';

interface HighlightOfferingProps {
  offering: Offering;
  qty: number;
  onToggle: (off: Offering) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

export function HighlightOffering({ offering, qty, onToggle, onUpdateQty }: HighlightOfferingProps) {
  const { currency, currencySymbol } = useCurrency();
  const dynamicPrice = (offering as any)[`price${currency}`] ?? offering.price;

  return (
    <div className="py-5 md:py-6 px-3 md:px-8 flex flex-row items-center justify-between gap-3 md:gap-6 border border-[#ffe4d6] bg-gradient-to-r from-[#fff5ef] to-[#fffaf6] md:bg-[#fff4e8] rounded-[16px] group transition-colors duration-300 mt-4 md:mt-6 shadow-sm mx-0 md:mx-0">
      <div className="flex-1 pr-2 md:pr-6">
        <div className="text-[12px] md:text-xs font-bold text-[#e0662d] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
           Prasad for home
        </div>
        <h3 className="text-[14px] md:text-lg font-bold text-[#111] leading-tight mb-1 md:mb-1.5">{offering.name}</h3>
        <p className="text-[#555] text-[12px] md:text-sm mb-2 md:mb-3 leading-[1.5] md:leading-relaxed">
           <span className="opacity-90">{offering.description.startsWith('✓') ? offering.description.substring(1).trim() : offering.description}</span>
        </p>
        <div className="text-[15px] md:text-lg font-bold text-[#e0662d]">{currencySymbol}{dynamicPrice}</div>
      </div>
      <div className="flex flex-col items-center shrink-0 w-[80px] md:w-[86px] mt-1 mb-2">
        <div className="relative w-full aspect-square rounded-[14px] md:rounded-xl flex items-center justify-center">
          <img src={offering.imageUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=200&q=80"} alt={offering.name} className="w-full h-full object-cover rounded-[14px] md:rounded-xl shadow-sm border border-gray-100" />
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-10 scale-[0.9] md:scale-100">
            <AddButton 
              qty={qty} 
              onAdd={() => onToggle(offering)} 
              onIncrement={() => onUpdateQty(offering.id, 1)} 
              onDecrement={() => onUpdateQty(offering.id, -1)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
