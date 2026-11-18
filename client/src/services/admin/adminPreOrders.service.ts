import { apiClient } from "../api";
import { ApiResponse } from "@/types";

export interface PreOrderRecord {
  _id: string;
  name: string;
  email: string;
  phone: string;
  serviceInterest?: string;
  notes?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PreOrdersListResponse {
  success: boolean;
  preOrders: PreOrderRecord[];
  totalPreOrders: number;
  totalPages: number;
  currentPage: number;
}

export interface GetPreOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const adminPreOrdersService = {
  /**
   * Fetches pre-orders / leads with pagination & search
   */
  async getPreOrders(params: GetPreOrdersParams = {}): Promise<PreOrdersListResponse> {
    return apiClient<PreOrdersListResponse>("/api/admin/pre-orders", {
      method: "GET",
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        search: params.search,
        status: params.status,
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
  },

  /**
   * Updates a pre-order lead
   */
  async updatePreOrder(
    id: string,
    data: Partial<PreOrderRecord>
  ): Promise<ApiResponse<PreOrderRecord>> {
    return apiClient<ApiResponse<PreOrderRecord>>(`/api/admin/pre-orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Deletes a single pre-order lead
   */
  async deletePreOrder(id: string): Promise<ApiResponse<void>> {
    return apiClient<ApiResponse<void>>(`/api/admin/pre-orders/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Bulk deletes pre-order leads
   */
  async bulkDelete(ids: string[]): Promise<ApiResponse<{ deletedCount: number }>> {
    return apiClient<ApiResponse<{ deletedCount: number }>>("/api/admin/pre-orders/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  },
};
