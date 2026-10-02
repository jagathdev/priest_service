import { apiClient } from './api';
import type { AuthUser, EmailLoginPayload, OtpPayload, VerifyOtpPayload, SignupPayload } from '@/types/auth';

export const authService = {
  // Mobile OTP flow
  sendOtp(payload: OtpPayload) {
    const backendPayload = {
      mobileNumber: payload.number || (payload as any).mobileNumber
    };
    return apiClient('/api/otp/sendOtp', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
  },

  verifyOtp(payload: VerifyOtpPayload) {
    const backendPayload = {
      mobileNumber: payload.number || (payload as any).mobileNumber,
      otp: payload.otp
    };
    return apiClient('/api/otp/verifyOtp', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
  },

  // Fallback if needed
  loginWithEmail(payload: EmailLoginPayload) {
    return apiClient('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  signupUser(payload: SignupPayload) {
    return apiClient('/api/users/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  getProfile(userId: string) {
    return apiClient(`/api/users/profile/${userId}`, {
      method: 'GET',
    });
  },

  updateProfile(payload: any) {
    return apiClient('/api/users/updateProfile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
};
