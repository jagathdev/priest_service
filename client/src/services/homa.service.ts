import { apiClient } from './api';

export const homaService = {
  getAllHomas() {
    return apiClient('/api/homas');
  },
  getHomaById(id: string) {
    return apiClient(`/api/homas/${id}`);
  },
  getHomaBySlug(slug: string) {
    return apiClient(`/api/pooja-details/${slug}`); // assuming it shares the same endpoint, or adjust if homas has its own detail route
  },
  // Admin routes
  createHoma(payload: any) {
    return apiClient('/api/homas', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateHoma(id: string, payload: any) {
    return apiClient(`/api/homas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteHoma(id: string) {
    return apiClient(`/api/homas/${id}`, {
      method: 'DELETE',
    });
  }
};
