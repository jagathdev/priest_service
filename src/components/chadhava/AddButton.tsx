"use client";
import React from 'react';

interface AddButtonProps {
  qty: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function AddButton({ qty, onAdd, onIncrement, onDecrement }: AddButtonProps) {
  if (qty === 0) {
    return (
      <button 
        onClick={onAdd}
        className="bg-white text-[#0f8f62] border border-[#0f8f62] px-5 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#0f8f62] hover:text-white transition-all duration-300 w-[84px] flex items-center justify-center shadow-sm"
      >
        <span className="text-lg font-light leading-none mr-1 mb-[2px]">+</span> Add
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between w-[84px] bg-[#0f8f62] text-white px-2 py-1.5 rounded-lg text-sm font-semibold shadow-md transition-all duration-300">
       <button onClick={onDecrement} className="w-6 flex items-center justify-center hover:scale-110 transition-transform">−</button>
       <span className="text-center">{qty}</span>
       <button onClick={onIncrement} className="w-6 flex items-center justify-center hover:scale-110 transition-transform">+</button>
    </div>
  );
}
