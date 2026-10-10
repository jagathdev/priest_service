import { apiClient } from './api';
import type {
  AuthApiResponse,
  AuthUser,
  EmailLoginPayload,
  OtpPayload,
  SignupPayload,
  VerifyOtpPayload,
} from "@/types/auth";

async function requestAuth<T>(path: string, init?: RequestInit): Promise<AuthApiResponse<T>> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers, 
    },
  });

  const raw = await response.text();
  let payload: AuthApiResponse<T>;

  try {
    payload = JSON.parse(raw) as AuthApiResponse<T>;
  } catch {
    throw new Error(  
      response.ok
        ? "Invalid response from server"
        : `Request failed (${response.status}). Confirm MONGODB_URI and redeploy if this is production.`
    );
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || "Authentication request failed");
  }

  return payload;
}

export const authService = {
  loginWithEmail(payload: EmailLoginPayload) { 
    return requestAuth<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  sendOtp(payload: OtpPayload) {
    return requestAuth<{ expiresIn: number }>("/api/auth/otp/send", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  
  resendOtp(payload: OtpPayload) {
    return requestAuth<{ expiresIn: number }>("/api/auth/otp/resend", {
      method: "POST", 
      body: JSON.stringify(payload),
    });
  },

  verifyOtp(payload: VerifyOtpPayload) {
    return requestAuth<AuthUser>("/api/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  signupUser(payload: SignupPayload) {
    return requestAuth<{ userId: string }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logoutUser() {
    return requestAuth("/api/auth/logout", {
      method: "POST",
    });
  },

  getProfile(userId: string) {
    return apiClient(`/api/users/profile/${userId}`, {
      method: 'GET',
    });
  },

  updateProfile(payload: unknown) {
    return apiClient('/api/users/updateProfile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  sendOtpLegacy(payload: OtpPayload) {
    const backendPayload = {
      mobileNumber: payload.number || (payload as unknown as Record<string, string>).mobileNumber
    };
    return apiClient('/api/otp/sendOtp', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
  },

  verifyOtpLegacy(payload: VerifyOtpPayload) {
    const backendPayload = {
      mobileNumber: payload.number || (payload as unknown as Record<string, string>).mobileNumber,
      otp: payload.otp
    };
    return apiClient('/api/otp/verifyOtp', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
  }
};

