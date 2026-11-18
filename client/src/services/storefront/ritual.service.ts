import { apiClient } from "../api";
import { ApiResponse } from "@/types";

export interface RitualItem {
  _id: string;
  title: string;
  name?: string;
  slug: string;
  description?: string;
  price?: number;
  featured?: boolean;
  active?: boolean;
  serviceType?: "puja" | "homa";
  category?: string;
  image?: string;
  benefits?: string[];
  packages?: Array<{
    name: string;
    price: number;
    description?: string;
  }>;
}

export const ritualService = {
  /**
   * Fetches all active pujas
   */
  async getPujas(category?: string): Promise<ApiResponse<RitualItem[]>> {
    return apiClient<ApiResponse<RitualItem[]>>("/api/pujas", {
      method: "GET",
      tokenType: "user",
      params: { category },
    });
  },

  /**
   * Fetches single puja by slug
   */
  async getPujaBySlug(slug: string): Promise<ApiResponse<RitualItem>> {
    return apiClient<ApiResponse<RitualItem>>(`/api/pujas/${slug}`, {
      method: "GET",
      tokenType: "user",
    });
  },

  /**
   * Fetches all active homas
   */
  async getHomas(category?: string): Promise<ApiResponse<RitualItem[]>> {
    return apiClient<ApiResponse<RitualItem[]>>("/api/homas", {
      method: "GET",
      tokenType: "user",
      params: { category },
    });
  },

  /**
   * Fetches single homa by slug
   */
  async getHomaBySlug(slug: string): Promise<ApiResponse<RitualItem>> {
    return apiClient<ApiResponse<RitualItem>>(`/api/homas/${slug}`, {
      method: "GET",
      tokenType: "user",
    });
  },
};
