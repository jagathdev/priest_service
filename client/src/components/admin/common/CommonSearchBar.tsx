"use client";

import React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface CommonSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CommonSearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "relative flex-1 max-w-md",
}: CommonSearchBarProps) {
  return (
    <div className={className}>
      <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-medium"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md cursor-pointer"
          title="Clear search"
        >
          <XMarkIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
