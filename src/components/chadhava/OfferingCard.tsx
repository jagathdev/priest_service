"use client";
import React from 'react';
import { AddButton } from './AddButton';
import { useCurrency } from '@/contexts/CurrencyContext';

export interface Offering {
  id: string;
  name: string;
  price: number;
  priceINR?: number;
  priceUSD?: number;
  priceMYR?: number;
  description: string;
  imageUrl?: string;
}

interface OfferingCardProps {
  offering: Offering;
  qty: number;
  onToggle: (off: Offering) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

export function OfferingCard({ offering, qty, onToggle, onUpdateQty }: OfferingCardProps) {
  const { currency, currencySymbol } = useCurrency();
  const dynamicPrice = (offering as any)[`price${currency}`] ?? offering.price;

  return (
    <div className="py-5 md:py-6 flex flex-row items-center justify-between gap-3 md:gap-6 border-b border-[#ececec] group hover:bg-[#f8f8f8] transition-colors duration-300 px-0 md:px-6">
      <div className="flex-1 pr-2 md:pr-6">
        <h3 className="text-[14px] md:text-lg font-bold text-[#111] leading-tight mb-1 md:mb-1.5">{offering.name}</h3>
        <p className="text-[#555] text-[12px] md:text-sm mb-2 md:mb-3 leading-[1.5] md:leading-relaxed">
           <span className="opacity-90">{offering.description.startsWith('✓') ? offering.description.substring(1).trim() : offering.description}</span>
        </p>
        <div className="text-[15px] md:text-lg font-bold text-[#0f8f62]">{currencySymbol}{dynamicPrice}</div>
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
