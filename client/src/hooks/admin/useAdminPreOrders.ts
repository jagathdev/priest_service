import { useState, useCallback, useEffect } from "react";
import { PreOrderRecord, adminPreOrdersService, GetPreOrdersParams } from "@/services/admin/adminPreOrders.service";

export interface UseAdminPreOrdersOptions {
  initialLimit?: number;
}

export function useAdminPreOrders(options: UseAdminPreOrdersOptions = {}) {
  const [leads, setLeads] = useState<PreOrderRecord[]>([]);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(options.initialLimit || 10);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: GetPreOrdersParams = {
        page: currentPage,
        limit,
        search: search.trim() || undefined,
        status: status !== "all" ? status : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await adminPreOrdersService.getPreOrders(params);

      if (res && res.preOrders) {
        setLeads(res.preOrders);
        setTotalLeads(res.totalPreOrders || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err: any) {
      console.error("[useAdminPreOrders] Error fetching leads:", err);
      setError(err?.message || "Failed to load pre-orders");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search, status, startDate, endDate]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const deleteLead = async (id: string) => {
    try {
      await adminPreOrdersService.deletePreOrder(id);
      await fetchLeads();
      return true;
    } catch (err: any) {
      console.error("[useAdminPreOrders] Error deleting lead:", err);
      throw err;
    }
  };

  const bulkDeleteLeads = async (ids: string[]) => {
    try {
      await adminPreOrdersService.bulkDelete(ids);
      await fetchLeads();
      return true;
    } catch (err: any) {
      console.error("[useAdminPreOrders] Error bulk deleting leads:", err);
      throw err;
    }
  };

  return {
    leads,
    totalLeads,
    totalPages,
    currentPage,
    setCurrentPage,
    limit,
    setLimit,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    refresh: fetchLeads,
    deleteLead,
    bulkDeleteLeads,
  };
}
