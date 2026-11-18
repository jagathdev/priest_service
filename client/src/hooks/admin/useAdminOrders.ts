import { useState, useCallback, useEffect } from "react";
import { OrderItemRecord, OrderStatus } from "@/types";
import { adminOrdersService, GetOrdersParams } from "@/services/admin/adminOrders.service";

export interface UseAdminOrdersOptions {
  initialLimit?: number;
}

export function useAdminOrders(options: UseAdminOrdersOptions = {}) {
  const [orders, setOrders] = useState<OrderItemRecord[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(options.initialLimit || 10);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("all");
  const [serviceType, setServiceType] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: GetOrdersParams = {
        page: currentPage,
        limit,
        search: search.trim() || undefined,
        status: status !== "all" ? status : undefined,
        serviceType: serviceType !== "all" ? serviceType : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await adminOrdersService.getOrders(params);

      if (res && res.orders) {
        setOrders(res.orders);
        setTotalOrders(res.totalOrders || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err: any) {
      console.error("[useAdminOrders] Error fetching orders:", err);
      setError(err?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search, status, serviceType, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await adminOrdersService.updateOrder(orderId, { orderStatus: newStatus });
      await fetchOrders();
      return true;
    } catch (err: any) {
      console.error("[useAdminOrders] Error updating status:", err);
      throw err;
    }
  };

  const bulkUpdateStatus = async (orderIds: string[], newStatus: OrderStatus) => {
    try {
      await adminOrdersService.bulkUpdateStatus(orderIds, newStatus);
      await fetchOrders();
      return true;
    } catch (err: any) {
      console.error("[useAdminOrders] Error bulk updating:", err);
      throw err;
    }
  };

  return {
    orders,
    totalOrders,
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
    serviceType,
    setServiceType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    refresh: fetchOrders,
    updateOrderStatus,
    bulkUpdateStatus,
  };
}
