/**
 * Common Type Definitions
 * Shared across Storefront, Admin, Hooks, and Services
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginationMeta;
  meta?: {
    totalRecords?: number;
    totalPages?: number;
    currentPage?: number;
    limit?: number;
  };
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
  preset?: "all" | "today" | "7days" | "30days" | "custom";
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}
