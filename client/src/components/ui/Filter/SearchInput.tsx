"use client";

import React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  onClear,
}: SearchInputProps) {
  const handleClear = () => {
    onChange("");
    if (onClear) onClear();
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-0.5 text-gray-400 hover:text-gray-600 rounded-full transition"
          aria-label="Clear search"
        >
          <XMarkIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
