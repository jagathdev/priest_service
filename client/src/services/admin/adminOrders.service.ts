import { apiClient } from "../api";
import { OrderItemRecord, OrderStatus, ApiResponse, PaginatedResponse } from "@/types";

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  serviceType?: string;
}

export interface OrdersListResponse {
  success: boolean;
  orders: OrderItemRecord[];
  totalOrders: number;
  totalPages: number;
  currentPage: number;
}

export const adminOrdersService = {
  /**
   * Fetches paginated list of orders with filters
   */
  async getOrders(params: GetOrdersParams = {}): Promise<OrdersListResponse> {
    return apiClient<OrdersListResponse>("/api/admin/orders", {
      method: "GET",
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        search: params.search,
        status: params.status,
        startDate: params.startDate,
        endDate: params.endDate,
        serviceType: params.serviceType,
      },
    });
  },

  /**
   * Fetches full single order details
   */
  async getOrderById(orderId: string): Promise<ApiResponse<OrderItemRecord>> {
    return apiClient<ApiResponse<OrderItemRecord>>(`/api/admin/orders/${orderId}`, {
      method: "GET",
    });
  },

  /**
   * Updates an order (status, notes, video link, etc.)
   */
  async updateOrder(
    orderId: string,
    updates: Partial<OrderItemRecord>
  ): Promise<ApiResponse<OrderItemRecord>> {
    return apiClient<ApiResponse<OrderItemRecord>>(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  /**
   * Bulk updates order status
   */
  async bulkUpdateStatus(
    orderIds: string[],
    orderStatus: OrderStatus
  ): Promise<ApiResponse<{ modifiedCount: number }>> {
    return apiClient<ApiResponse<{ modifiedCount: number }>>("/api/admin/orders/bulk-status", {
      method: "POST",
      body: JSON.stringify({ orderIds, orderStatus }),
    });
  },

  /**
   * Triggers order confirmation email resend
   */
  async resendConfirmationEmail(orderId: string): Promise<ApiResponse<void>> {
    return apiClient<ApiResponse<void>>(`/api/admin/orders/${orderId}/resend-email`, {
      method: "POST",
    });
  },
};
