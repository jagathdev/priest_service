"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageNumbers: (number | string)[];
  totalItems?: number;
  startIndex?: number;
  endIndex?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageNumbers,
  totalItems,
  startIndex,
  endIndex,
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white border-t border-gray-100 rounded-b-2xl">
      {/* Items Count Summary */}
      {totalItems !== undefined && startIndex !== undefined && endIndex !== undefined && (
        <div className="text-xs font-semibold text-gray-500">
          Showing <span className="text-gray-900 font-bold">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
          <span className="text-gray-900 font-bold">{endIndex}</span> of{" "}
          <span className="text-gray-900 font-bold">{totalItems}</span> records
        </div>
      )}

      {/* Page Navigation Buttons */}
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {pageNumbers.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`dots-${idx}`} className="px-2 text-xs font-bold text-gray-400">
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[32px] h-8 px-2 text-xs font-bold rounded-lg transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Next page"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
