"use client";

import React, { useRef } from "react";

export interface TabItem {
  id: string;
  label: string;
}

interface DetailStickyTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabClick: (id: string) => void;
}

export default function DetailStickyTabs({ tabs, activeTab, onTabClick }: DetailStickyTabsProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6">
        <div
          ref={scrollRef}
          className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-2.5 text-xs sm:text-sm font-extrabold whitespace-nowrap"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabClick(tab.id)}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#C2410C] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
