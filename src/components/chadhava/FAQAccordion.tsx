"use client";
import React, { useState } from 'react';

interface FAQAccordionProps {
  question: string;
  answer: string;
}

export function FAQAccordion({ question, answer }: FAQAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-[#ececec] bg-white">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group px-4 md:px-0"
      >
        <span className={`text-base font-semibold transition-colors duration-300 ${isOpen ? 'text-[#0f8f62]' : 'text-[#111827] group-hover:text-[#0f8f62]'}`}>
          {question}
        </span>
        <i className={`fa-solid fa-chevron-down text-[#6b7280] text-xs transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#0f8f62]' : ''}`}></i>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out px-4 md:px-0 ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-[#6b7280] text-sm leading-relaxed pr-8">
          {answer}
        </p>
      </div>
    </div>
  );
}
