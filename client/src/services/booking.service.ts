import { apiClient } from './api';

export const bookingService = {
  createOrder(payload: any) {
    return apiClient('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  verifyPayment(payload: any) {
    return apiClient('/api/payments/verify', { // Assuming you might have a verify route
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  previewOrder(payload: any) {
    return apiClient('/api/orders/preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getUserOrders() {
    return apiClient('/api/orders/user'); 
  },
  getAllOrders() {
    return apiClient('/api/orders'); // Admin
  }
};
