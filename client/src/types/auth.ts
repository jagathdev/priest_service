export type LoginMethod = "email" | "phone" | "whatsapp";

export interface CountryOption {
  name: string;
  isoCode: string;
  dialCode: string;
}

export interface AuthUser {
  id: string;
  customerId?: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  country?: CountryOption;
  currency?: "INR" | "USD" | "MYR";
  loginProvider?: LoginMethod;
}

export interface AuthApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  user?: AuthUser;
  isAdmin?: boolean;
}

export interface EmailLoginPayload {
  email: string;
  password: string;
}

export interface OtpPayload {
  method: LoginMethod;
  country?: CountryOption;
  number?: string;
  email?: string;
}

export interface VerifyOtpPayload extends OtpPayload {
  otp: string;
}

export interface SignupPayload {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  isWhatsappNumber?: boolean;
  /** Omit or empty when WhatsApp is the same as mobile; server defaults to phone. */
  whatsapp?: string;
  country: CountryOption;
  password: string;
  confirmPassword: string;
}
