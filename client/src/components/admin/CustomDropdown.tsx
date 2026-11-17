"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | DropdownOption)[];
  placeholder?: string;
  className?: string;
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt === "All" ? placeholder : opt } : opt
  );

  const selectedOption = normalizedOptions.find(
    (opt) => opt.value.toLowerCase() === (value || "").toLowerCase()
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
          isOpen
            ? "bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20 text-gray-900"
            : "bg-gray-50/80 hover:bg-white border-gray-200 text-gray-800 hover:border-gray-300 shadow-2xs"
        }`}
      >
        <span className="truncate max-w-[140px] sm:max-w-[180px]">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 min-w-[190px] max-w-[240px] max-h-60 overflow-y-auto rounded-2xl bg-white border border-gray-100 shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-0.5">
            {normalizedOptions.map((opt) => {
              const isSelected = (value || "").toLowerCase() === opt.value.toLowerCase();
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-800 font-extrabold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <CheckIcon className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
