import { useState, useMemo } from "react";

export interface UsePaginationOptions {
  totalItems: number;
  initialPage?: number;
  initialLimit?: number;
}

export interface UsePaginationReturn {
  page: number;
  limit: number;
  totalPages: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canNext: boolean;
  canPrev: boolean;
  startIndex: number;
  endIndex: number;
  pageNumbers: (number | string)[];
}

export function usePagination({
  totalItems,
  initialPage = 1,
  initialLimit = 10,
}: UsePaginationOptions): UsePaginationReturn {
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / limit));
  }, [totalItems, limit]);

  const safeSetPage = (newPage: number) => {
    if (newPage < 1) setPage(1);
    else if (newPage > totalPages) setPage(totalPages);
    else setPage(newPage);
  };

  const nextPage = () => safeSetPage(page + 1);
  const prevPage = () => safeSetPage(page - 1);

  const canNext = page < totalPages;
  const canPrev = page > 1;

  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);

  // Generate page numbers with ellipsis [1, '...', 4, 5, 6, '...', 10]
  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }, [totalPages, page]);

  return {
    page,
    limit,
    totalPages,
    setPage: safeSetPage,
    setLimit,
    nextPage,
    prevPage,
    canNext,
    canPrev,
    startIndex,
    endIndex,
    pageNumbers,
  };
}
