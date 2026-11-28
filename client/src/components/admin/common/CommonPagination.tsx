"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface CommonPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
  itemName?: string;
  onPageChange: (page: number) => void;
}

export default function CommonPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize = 10,
  itemName = "results",
  onPageChange,
}: CommonPaginationProps) {
  if (totalCount === 0) return null;

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers
  const pages: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="p-4 sm:px-6 border-t border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
      <div className="text-xs text-gray-500 font-medium">
        Showing {startIdx} to {endIdx} of {totalCount} {itemName}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
            title="Previous page"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          {/* Page buttons */}
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-gray-400">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isCurrent
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Next */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
            title="Next page"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
