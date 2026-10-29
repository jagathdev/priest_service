"use client";

import React, { useState } from "react";
import { X, Search, Check, ArrowRight } from "lucide-react";

export interface FilterGroup {
  label: string;
  options: { value: string }[];
}

export type FilterState = Record<string, string[]>;

export const defaultFilters: FilterState = {
  Deity: [],
  Tithis: [],
  Dosha: [],
  Benefits: [],
  Location: [],
};

/** Checks if a puja matches the given filter selections and search query */
export function matchesPujaFilters(
  puja: any,
  filters: FilterState,
  searchQuery: string = "",
  filterGroups: FilterGroup[] = []
): boolean {
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    const searchMatches = [puja.title, puja.shortTitle, puja.subtitle, puja.description, puja.location, puja.badge]
      .filter(Boolean)
      .some((text) => text?.toLowerCase().includes(q));
    if (!searchMatches) return false;
  }

  const fieldMapping: Record<string, string> = {
    Deity: "deity",
    Tithis: "tithis",
    Dosha: "dosha",
    Benefits: "benefit",
    Benefit: "benefit",
    Location: "filterLocation",
  };

  for (const group of filterGroups) {
    const selectedValues = filters[group.label];
    if (!selectedValues || selectedValues.length === 0) continue;

    const groupMatches = selectedValues.some((selectedValue) => {
      const fieldName = fieldMapping[group.label];
      const savedValue = fieldName ? puja[fieldName] : undefined;

      if (typeof savedValue === "string" && savedValue.trim()) {
        if (savedValue.trim().toLowerCase() === selectedValue.toLowerCase()) {
          return true;
        }
      }

      if ((group.label === "Benefits" || group.label === "Benefit") && Array.isArray(puja.details?.benefits)) {
        if (
          puja.details.benefits.some(
            (b: any) =>
              b?.title?.toLowerCase().includes(selectedValue.toLowerCase()) ||
              b?.description?.toLowerCase().includes(selectedValue.toLowerCase())
          )
        ) {
          return true;
        }
      }

      if (group.label === "Location") {
        const filterLoc = puja.filterLocation || puja.location;
        if (typeof filterLoc === "string" && (filterLoc.toLowerCase() === selectedValue.toLowerCase() || filterLoc.toLowerCase().includes(selectedValue.toLowerCase()))) {
          return true;
        }
      }

      return false;
    });

    if (!groupMatches) return false;
  }
  return true;
}

export function extractDynamicFilterGroups(pujas: any[]): FilterGroup[] {
  const extractValues = (key: string, altKey?: string, nestedArrayKey?: string) => {
    // Map lowercase key to canonical display string to prevent duplicates (e.g. "Ganesh" vs "ganesh")
    const map = new Map<string, string>();
    pujas.forEach((p) => {
      const val1 = p[key];
      if (typeof val1 === "string" && val1.trim()) {
        const trimmed = val1.trim();
        const lower = trimmed.toLowerCase();
        if (!map.has(lower)) {
          map.set(lower, trimmed);
        }
      }
      if (altKey) {
        const val2 = p[altKey];
        if (typeof val2 === "string" && val2.trim()) {
          const trimmed = val2.trim();
          const lower = trimmed.toLowerCase();
          if (!map.has(lower)) {
            map.set(lower, trimmed);
          }
        }
      }
      if (nestedArrayKey && Array.isArray(p[nestedArrayKey])) {
        p[nestedArrayKey].forEach((item: any) => {
          if (item?.title && typeof item.title === "string" && item.title.trim()) {
            const trimmed = item.title.trim();
            const lower = trimmed.toLowerCase();
            if (!map.has(lower)) {
              map.set(lower, trimmed);
            }
          }
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  const deities = extractValues("deity");
  const tithis = extractValues("tithis");
  const doshas = extractValues("dosha");
  const benefits = extractValues("benefit");
  // Only extract from filterLocation so that only what the admin explicitly enters/selects in the Vedic Filters section appears
  const locations = extractValues("filterLocation");

  const groups: FilterGroup[] = [];

  if (deities.length > 0) {
    groups.push({
      label: "Deity",
      options: deities.map((v) => ({ value: v })),
    });
  }
  if (tithis.length > 0) {
    groups.push({
      label: "Tithis",
      options: tithis.map((v) => ({ value: v })),
    });
  }
  if (doshas.length > 0) {
    groups.push({
      label: "Dosha",
      options: doshas.map((v) => ({ value: v })),
    });
  }
  if (benefits.length > 0) {
    groups.push({
      label: "Benefit",
      options: benefits.map((v) => ({ value: v })),
    });
  }
  if (locations.length > 0) {
    groups.push({
      label: "Location",
      options: locations.map((v) => ({ value: v })),
    });
  }

  return groups;
}

interface PujaFilterModalProps {
  filters: FilterState;
  filterGroups: FilterGroup[];
  initialTab?: string;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
}

export default function PujaFilterModal({
  filters,
  filterGroups,
  initialTab,
  onClose,
  onApply,
  onClear,
}: PujaFilterModalProps) {
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);
  const [activeTab, setActiveTab] = useState<string>(
    initialTab && filterGroups.some((g) => g.label.toLowerCase() === initialTab.toLowerCase())
      ? filterGroups.find((g) => g.label.toLowerCase() === initialTab.toLowerCase())!.label
      : filterGroups[0]?.label || ""
  );
  const [searchQuery, setSearchQuery] = useState("");

  const selectFilter = (label: string, value: string) => {
    setDraftFilters((prev) => {
      const current = prev[label] || [];
      if (current.includes(value)) {
        return { ...prev, [label]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [label]: [...current, value] };
      }
    });
  };

  const activeGroup = filterGroups.find((g) => g.label === activeTab) || filterGroups[0];
  const filteredOptions = activeGroup
    ? activeGroup.options.filter((o) =>
      o.value.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const totalSelectedCount = Object.values(draftFilters).reduce(
    (acc, curr) => acc + (curr?.length || 0),
    0
  );

  if (filterGroups.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-2.5 sm:p-4 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-[550px] h-[82vh] max-h-[580px] flex flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#ebd5c1] shrink-0 bg-white">
          <h3 className="text-lg sm:text-[22px] font-serif font-bold text-ink">Puja Filters</h3>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar */}
          <div className="w-[36%] sm:w-1/3 border-r border-[#ebd5c1] overflow-y-auto bg-stone-50/50">
            {filterGroups.map((group) => {
              const isActive = group.label === activeTab;
              const groupSelectedCount = (draftFilters[group.label] || []).length;
              return (
                <button
                  key={group.label}
                  type="button"
                  onClick={() => {
                    setActiveTab(group.label);
                    setSearchQuery("");
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-bold transition-colors relative flex items-center justify-between cursor-pointer ${isActive ? "bg-[#fcf5f3] text-[#009644]" : "text-gray-700 hover:bg-gray-100/60"
                    }`}
                >
                  <span className="truncate">{group.label}</span>
                  {groupSelectedCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#009644] text-white text-[10px] font-bold flex items-center justify-center shrink-0 ml-1">
                      {groupSelectedCount}
                    </span>
                  )}
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#009644]" />}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="w-[64%] sm:w-2/3 p-3.5 sm:p-5 overflow-y-auto relative custom-scrollbar bg-white">
            <h4 className="text-sm sm:text-base font-bold text-[#9e1c1c] mb-2.5 sm:mb-4">
              {activeGroup.label}
            </h4>

            {/* Search */}
            <div className="relative mb-3.5 sm:mb-5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeGroup.label}`}
                className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 border border-gray-200 rounded-full outline-none text-xs sm:text-sm focus:border-[#009644] transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Options */}
            <div className="space-y-3 sm:space-y-4">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = (draftFilters[activeGroup.label] || []).includes(option.value);
                  return (
                    <label key={option.value} className="flex items-start gap-2.5 cursor-pointer group select-none">
                      <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => selectFilter(activeGroup.label, option.value)}
                          className="peer w-[18px] h-[18px] appearance-none rounded-[4px] border border-gray-300 checked:bg-white checked:border-[#009644] transition-colors cursor-pointer"
                        />
                        <Check className="absolute w-3 h-3 text-transparent peer-checked:text-[#009644] pointer-events-none transition-colors" strokeWidth={3} />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-gray-900 leading-snug pt-[1px]">
                        {option.value}
                      </span>
                    </label>
                  );
                })
              ) : (
                <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No matching options found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-3.5 py-3 sm:px-6 sm:py-3.5 border-t border-[#ebd5c1] gap-2.5 sm:gap-3 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-10">
          <button
            type="button"
            onClick={() => {
              setDraftFilters(defaultFilters);
              onClear();
            }}
            className="flex-1 h-11 sm:h-12 border border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full text-xs sm:text-sm font-bold text-gray-700 transition-all text-center flex items-center justify-center shadow-xs cursor-pointer"
          >
            Clear Filter
          </button>
          <button
            type="button"
            onClick={() => onApply(draftFilters)}
            className="flex-1 h-11 sm:h-12 bg-[#14395C] hover:bg-[#0e2740] active:bg-[#0b1f33] text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#14395C]/25 active:scale-[0.99] transition-all group cursor-pointer"
          >
            <span>Apply Filter</span>
            {totalSelectedCount > 0 && (
              <span className="bg-white/25 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {totalSelectedCount}
              </span>
            )}
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:translate-x-0.5 transition-transform shrink-0" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
