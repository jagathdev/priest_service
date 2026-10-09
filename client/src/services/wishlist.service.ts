import { apiClient } from './api';

let getWishlistPromise: Promise<any> | null = null;
let lastFetchTime = 0;
let lastUserId = '';

export const wishlistService = {
  getWishlist(userId: string) {
    // Basic validation to prevent invalid MongoDB ObjectId errors like "admin-1"
    if (!userId || userId.length !== 24) {
      return Promise.resolve({ success: true, data: [] });
    }

    const now = Date.now();
    // Deduplicate identical requests made within 2 seconds (e.g. 6 buttons mounting at once)
    if (getWishlistPromise && lastUserId === userId && now - lastFetchTime < 2000) {
      return getWishlistPromise;
    }

    lastUserId = userId;
    lastFetchTime = now;
    getWishlistPromise = apiClient(`/api/wishlist/${userId}`);
    
    return getWishlistPromise;
  },
  updateWishlist(payload: { userId: string; serviceId: string; action: 'add' | 'remove' }) {
    // Clear cache to ensure next load gets fresh data
    getWishlistPromise = null;
    return apiClient('/api/wishlist/updateWishlist', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};
