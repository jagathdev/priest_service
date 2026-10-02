import { apiClient } from './api';

export const pujaService = {
  getAllPujas() {
    return apiClient('/api/pujas');
  },
  getPujaById(id: string) {
    return apiClient(`/api/pujas/${id}`);
  },
  getPujaBySlug(slug: string) {
    return apiClient(`/api/pooja-details/${slug}`);
  },
  // Admin routes
  createPuja(payload: any) {
    return apiClient('/api/pujas', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updatePuja(id: string, payload: any) {
    return apiClient(`/api/pujas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deletePuja(id: string) {
    return apiClient(`/api/pujas/${id}`, {
      method: 'DELETE',
    });
  }
};
