import { apiClient } from './api';

export const adminService = {
  getStats() {
    return apiClient('/api/admin/stats');
  },
  login(payload: any) {
    return apiClient('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getContent() {
    return apiClient('/api/admin/content');
  },
  updateContent(payload: any) {
    return apiClient('/api/admin/content', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
};
