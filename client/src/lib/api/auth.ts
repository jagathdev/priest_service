import type { EmailLoginPayload, OtpPayload, SignupPayload, VerifyOtpPayload } from "@/types/auth";
import { authService } from "@/services/authService";

export function loginWithEmail(payload: EmailLoginPayload) {
  return authService.loginWithEmail(payload);
}

export function sendOtp(payload: OtpPayload) {
  return authService.sendOtp(payload);
}

export function resendOtp(payload: OtpPayload) {
  return authService.resendOtp(payload);
}

export function verifyOtp(payload: VerifyOtpPayload) {
  return authService.verifyOtp(payload);
}

export function signupUser(payload: SignupPayload) {
  return authService.signupUser(payload);
}

export function logoutUser() {
  return authService.logoutUser();
}
