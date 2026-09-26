/**
 * AstroVed Auth API - Clean implementation based on API Documentation V4
 *
 * API Endpoints (base: https://qawebservice.astroved.com/api/UserAccount)
 *   POST AuthenticateLogin  — Send OTP (Type 2=SMS, Type 3=WhatsApp, Type 4=Email)
 *   POST VerifyOtp          — Verify OTP
 *   POST ResendOtp          — Resend OTP
 *   POST RegistrationBasedOnShop — Register new user
 */

import type { AuthUser, CountryOption, LoginMethod } from "@/types/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AstrovedLoginInfo {
  UserLogin?: string;
  CustomerId?: number;
  CustomerName?: string;
  IsMobileVerified?: boolean;
  IsEmailVerified?: boolean;
  MobileNo?: string;
  CustomerCurrency?: string;
}

interface AstrovedResponse {
  StatusCode?: number;
  Status?: string;
  Message?: string;
  loginInfo?: AstrovedLoginInfo | null;
  ErrorMessage?: string;
  FirstName?: string;
  CustomerId?: number;
  IsRegistered?: boolean;
  Email?: string;
  Password?: string;
  PhoneNumber?: string;
  Currency?: string;
}

export class AstrovedAuthError extends Error {
  statusCode: number;
  vendorStatus?: string;

  constructor(message: string, statusCode = 502, vendorStatus?: string) {
    super(message);
    this.name = "AstrovedAuthError";
    this.statusCode = statusCode;
    this.vendorStatus = vendorStatus;
  }
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TIMEOUT_MS = Number(process.env.ASTROVED_AUTH_TIMEOUT_MS ?? 10000);

function getConfig() {
  const baseUrl = (
    process.env.ASTROVED_AUTH_API_BASE_URL ?? "https://qawebservice.astroved.com/api/UserAccount"
  ).replace(/\/$/, "");
  const token =
    process.env.ASTROVED_AUTH_API_TOKEN?.trim() ||
    process.env.ASTROVED_API_TOKEN?.trim();
  if (!token) throw new AstrovedAuthError("AstroVed auth token is not configured", 500);
  return { baseUrl, token };
}

// ---------------------------------------------------------------------------
// Core HTTP helper
// ---------------------------------------------------------------------------

async function callApi(path: string, body: Record<string, unknown>): Promise<AstrovedResponse> {
  const { baseUrl, token } = getConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });

    const data = (await res.json().catch(() => null)) as AstrovedResponse | null;

    // Log for debugging
    console.log(`[astroved] ${path}:`, JSON.stringify({
      StatusCode: data?.StatusCode,
      Status: data?.Status,
      Message: data?.Message,
      hasLoginInfo: !!data?.loginInfo,
    }));

    if (!res.ok) {
      throw new AstrovedAuthError(
        data?.Message || data?.ErrorMessage || `Request failed with HTTP ${res.status}`,
        res.status,
        data?.Status ?? undefined
      );
    }

    if (!data) throw new AstrovedAuthError("Empty response from AstroVed", 502);

    return data;
  } catch (err) {
    if (err instanceof AstrovedAuthError) throw err;
    if (err instanceof Error && err.name === "AbortError")
      throw new AstrovedAuthError("AstroVed request timed out", 504);
    throw new AstrovedAuthError("Unable to reach AstroVed service", 502);
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Response validators
// ---------------------------------------------------------------------------

/** Returns true if the API accepted the OTP-send request */
function isOtpSendSuccess(data: AstrovedResponse): boolean {
  return data.StatusCode === 200 && data.Status === "OK";
}

/** Returns true if this is a "number not found" error */
function isNotFound(data: AstrovedResponse): boolean {
  return (
    data.StatusCode === 404 ||
    data.Status === "NotFound" ||
    (data.Message ?? "").toLowerCase().includes("not linked to any account")
  );
}

/** Returns true if rate-limited */
function isRateLimited(data: AstrovedResponse): boolean {
  return data.StatusCode === 429;
}

function throwForStatus(data: AstrovedResponse, fallbackMsg: string) {
  const msg = data.Message || data.ErrorMessage || fallbackMsg;
  if (isRateLimited(data)) throw new AstrovedAuthError(msg, 429, data.Status ?? undefined);
  throw new AstrovedAuthError(msg, 400, data.Status ?? undefined);
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function normalizeCountryCode(country: CountryOption | string): string {
  const value = typeof country === "string" ? country : country.dialCode;
  const digits = String(value ?? "").replace(/[^0-9]/g, "");
  return digits ? `+${digits}` : "+91";
}

export function normalizeCurrency(currency?: string): "INR" | "USD" | "MYR" {
  const v = String(currency ?? "").toUpperCase();
  if (v === "USD" || v === "MYR") return v;
  return "INR";
}

export function mapLoginInfoToUser(
  loginInfo: AstrovedLoginInfo,
  opts: { country?: CountryOption; loginProvider: LoginMethod }
): AuthUser {
  const customerId = loginInfo.CustomerId ? String(loginInfo.CustomerId) : undefined;
  const id = customerId || loginInfo.UserLogin || loginInfo.MobileNo || "astroved-user";
  return {
    id,
    customerId,
    name: loginInfo.CustomerName || loginInfo.UserLogin || "AstroVed User",
    email: loginInfo.UserLogin || undefined,
    phone: loginInfo.MobileNo || undefined,
    country: opts.country,
    currency: normalizeCurrency(loginInfo.CustomerCurrency),
    loginProvider: opts.loginProvider,
  };
}

// ---------------------------------------------------------------------------
// Registration (silent, for new users)
// ---------------------------------------------------------------------------

export async function registerWithAstroved(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  country: CountryOption;
  isWhatsappNumber: boolean;
  currency: "INR" | "USD" | "MYR";
}): Promise<AstrovedResponse> {
  const apiUrl =
    process.env.REGISTRATION_API_URL?.trim() ||
    `${(process.env.ASTROVED_AUTH_API_BASE_URL ?? "https://qawebservice.astroved.com/api/UserAccount").replace(/\/$/, "")}/RegistrationBasedOnShop`;
  const token =
    process.env.ASTROVED_AUTH_API_TOKEN?.trim() ||
    process.env.ASTROVED_API_TOKEN?.trim();
  if (!token) throw new AstrovedAuthError("AstroVed registration token is not configured", 500);

  const countryCode = normalizeCountryCode(payload.country); // "+91"
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        FirstName: payload.firstName,
        LastName: payload.lastName,
        UserName: payload.email,
        Password: payload.password,
        PhoneNumber: `${countryCode}|${payload.phone}`, // "+91|9876543210" per API docs
        ShopName: "AstroVed",
        Currency: payload.currency,
        IsWhatsappNumber: payload.isWhatsappNumber,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    const data = (await res.json().catch(() => null)) as AstrovedResponse | null;
    console.log("[astroved] Registration:", JSON.stringify({ IsRegistered: data?.IsRegistered, ErrorMessage: data?.ErrorMessage }));

    if (!res.ok) {
      throw new AstrovedAuthError(
        data?.ErrorMessage || data?.Message || `Registration failed with HTTP ${res.status}`,
        res.status,
        data?.Status ?? undefined
      );
    }

    if (data?.ErrorMessage) {
      throw new AstrovedAuthError(data.ErrorMessage, 400, data.Status ?? undefined);
    }

    return data ?? {};
  } catch (err) {
    if (err instanceof AstrovedAuthError) throw err;
    if (err instanceof Error && err.name === "AbortError")
      throw new AstrovedAuthError("Registration request timed out", 504);
    throw new AstrovedAuthError("Unable to reach registration service", 502);
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Send OTP  (AuthenticateLogin)
//
// Per API docs:
//   WhatsApp: { Type: 3, CountryCode: "+91", MobileNo: "number" }
//   SMS:      { Type: 2, CountryCode: "+91", MobileNo: "number" }
//   Email:    { UserName: "email", Password: "", Type: 4 }
//
// This function tries BOTH "+91" and "91" country code formats because some
// user accounts in AstroVed's DB were stored without the "+" prefix.
// ---------------------------------------------------------------------------

export async function sendOtp(payload: {
  method: "phone" | "whatsapp" | "email";
  country?: CountryOption;
  number?: string;
  email?: string;
}): Promise<{ message: string }> {
  // --- Email OTP ---
  if (payload.method === "email") {
    const data = await callApi("AuthenticateLogin", {
      UserName: payload.email,
      Password: "",
      Type: 4,
    });
    if (isOtpSendSuccess(data)) return { message: data.Message || "OTP sent to your email" };
    if (isRateLimited(data)) throw new AstrovedAuthError(data.Message || "Too many requests", 429, data.Status ?? undefined);
    throwForStatus(data, "Failed to send email OTP");
  }

  // --- WhatsApp / SMS OTP ---
  // API Type: 3 = WhatsApp, 2 = SMS
  const type = payload.method === "whatsapp" ? 3 : 2;
  const countryCodePlus = normalizeCountryCode(payload.country!); // "+91"
  const countryCodeNoPlus = countryCodePlus.replace("+", "");     // "91"
  const mobileNo = payload.number!;

  // Try "+91" first (as specified in API docs)
  const attempt1 = await callApi("AuthenticateLogin", {
    Type: type,
    CountryCode: countryCodePlus,
    MobileNo: mobileNo,
  });

  if (isOtpSendSuccess(attempt1)) {
    return { message: attempt1.Message || "OTP sent successfully" };
  }

  if (isRateLimited(attempt1)) {
    throw new AstrovedAuthError(attempt1.Message || "Too many requests. Please try again later.", 429, attempt1.Status ?? undefined);
  }

  if (!isNotFound(attempt1)) {
    // If WhatsApp failed with something unexpected, we can try SMS if it's a WhatsApp request, else throw
    if (payload.method === "phone") {
      throwForStatus(attempt1, "Failed to send OTP");
    }
  }

  // "+91" returned NotFound (or failed for WhatsApp) — try "91" (without plus) for legacy accounts
  const attempt2 = await callApi("AuthenticateLogin", {
    Type: type,
    CountryCode: countryCodeNoPlus,
    MobileNo: mobileNo,
  });

  if (isOtpSendSuccess(attempt2)) {
    return { message: attempt2.Message || "OTP sent successfully" };
  }

  if (isRateLimited(attempt2)) {
    throw new AstrovedAuthError(attempt2.Message || "Too many requests. Please try again later.", 429, attempt2.Status ?? undefined);
  }

  // If WhatsApp fails on the legacy format (e.g., StatusCode 0), Astroved's WhatsApp sender is broken for this number.
  // Fall back to SMS (Type 2) on the legacy format to ensure the user actually gets an OTP.
  if (payload.method === "whatsapp") {
    console.log(`[astroved] WhatsApp OTP delivery failed for ${mobileNo}. Falling back to SMS (Type 2)...`);
    const smsFallback = await callApi("AuthenticateLogin", {
      Type: 2,
      CountryCode: countryCodeNoPlus,
      MobileNo: mobileNo,
    });

    if (isOtpSendSuccess(smsFallback)) {
      return { message: "WhatsApp delivery unavailable. OTP sent via SMS instead." };
    }

    if (isRateLimited(smsFallback)) {
      throw new AstrovedAuthError(smsFallback.Message || "Too many requests.", 429, smsFallback.Status ?? undefined);
    }
  }

  // Both formats returned NotFound — signal caller that number is not registered
  throw new AstrovedAuthError(
    attempt1.Message || "This number is not registered. Creating your account...",
    404,
    "NotFound"
  );
}

// ---------------------------------------------------------------------------
// Verify OTP  (VerifyOtp)
//
// Per API docs:
//   { Type: 3, CountryCode: "+91", MobileNo: "number", OTP: "code" }
//
// We try "+91" then "91" in case the account was stored with the legacy format.
// ---------------------------------------------------------------------------

export async function verifyOtp(payload: {
  method: "phone" | "whatsapp" | "email";
  country?: CountryOption;
  number?: string;
  email?: string;
  otp: string;
}): Promise<AstrovedLoginInfo> {
  // --- Email OTP Verify ---
  if (payload.method === "email") {
    const data = await callApi("VerifyOtp", {
      Type: 4,
      CountryCode: "",
      MobileNo: "",
      OTP: payload.otp,
      UserName: payload.email,
    });
    if (data.loginInfo) return data.loginInfo;
    throw new AstrovedAuthError(data.Message || "Invalid OTP. Please try again.", 401, data.Status ?? undefined);
  }

  // --- WhatsApp / SMS OTP Verify ---
  const type = payload.method === "whatsapp" ? 3 : 2;
  const countryCodePlus = normalizeCountryCode(payload.country!);
  const countryCodeNoPlus = countryCodePlus.replace("+", "");
  const mobileNo = payload.number!;

  // Try "+91" first (API docs spec)
  const attempt1 = await callApi("VerifyOtp", {
    Type: type,
    CountryCode: countryCodePlus,
    MobileNo: mobileNo,
    OTP: payload.otp,
  });

  if (attempt1.loginInfo) return attempt1.loginInfo;

  // If "+91" didn't give loginInfo but also isn't ExpectationFailed, it's a real error
  if (attempt1.Status !== "ExpectationFailed" && attempt1.StatusCode !== 417) {
    throw new AstrovedAuthError(
      attempt1.Message || "Invalid OTP. Please try again.",
      401,
      attempt1.Status ?? undefined
    );
  }

  // "+91" returned ExpectationFailed — try "91" (legacy accounts)
  console.log("[astroved] VerifyOtp with +91 returned ExpectationFailed — retrying with 91 (legacy format)...");
  const attempt2 = await callApi("VerifyOtp", {
    Type: type,
    CountryCode: countryCodeNoPlus,
    MobileNo: mobileNo,
    OTP: payload.otp,
  });

  if (attempt2.loginInfo) return attempt2.loginInfo;

  // If WhatsApp fails with ExpectationFailed on legacy format, it means the OTP was likely sent via SMS fallback.
  // We must verify using SMS (Type 2).
  if (payload.method === "whatsapp" && attempt2.StatusCode === 417) {
    console.log("[astroved] WhatsApp VerifyOtp failed. Falling back to SMS VerifyOtp (Type 2)...");
    const smsFallback = await callApi("VerifyOtp", {
      Type: 2,
      CountryCode: countryCodeNoPlus,
      MobileNo: mobileNo,
      OTP: payload.otp,
    });

    if (smsFallback.loginInfo) return smsFallback.loginInfo;

    // If SMS fallback failed with 417, it's a real account error
    if (smsFallback.StatusCode === 417) {
      throw new AstrovedAuthError("Something went wrong with your account. Please contact support.", 400, smsFallback.Status ?? undefined);
    }

    throw new AstrovedAuthError(smsFallback.Message || "Invalid OTP. Please try again.", 401, smsFallback.Status ?? undefined);
  }

  // Both failed — report the clearest error
  const msg = attempt2.Message || attempt1.Message || "Invalid OTP. Please try again.";
  if (attempt2.StatusCode === 417) {
    throw new AstrovedAuthError("Something went wrong with your account. Please contact support.", 400, attempt2.Status ?? undefined);
  }
  throw new AstrovedAuthError(msg, 401, attempt2.Status ?? undefined);
}

// ---------------------------------------------------------------------------
// Resend OTP  (ResendOtp)
//
// Per API docs:
//   { Type: 3, CountryCode: "+91", MobileNo: "number" }
// ---------------------------------------------------------------------------

export async function resendOtp(payload: {
  method: "phone" | "whatsapp" | "email";
  country?: CountryOption;
  number?: string;
  email?: string;
}): Promise<{ message: string }> {
  if (payload.method === "email") {
    // Resend for email = re-call AuthenticateLogin with Type 4
    const data = await callApi("AuthenticateLogin", {
      UserName: payload.email,
      Password: "",
      Type: 4,
    });
    if (isOtpSendSuccess(data)) return { message: data.Message || "OTP resent to your email" };
    throwForStatus(data, "Failed to resend email OTP");
  }

  const type = payload.method === "whatsapp" ? 3 : 2;
  const countryCodePlus = normalizeCountryCode(payload.country!);
  const countryCodeNoPlus = countryCodePlus.replace("+", "");
  const mobileNo = payload.number!;

  // Try "+91" first
  const attempt1 = await callApi("ResendOtp", {
    Type: type,
    CountryCode: countryCodePlus,
    MobileNo: mobileNo,
  });

  if (isOtpSendSuccess(attempt1)) return { message: attempt1.Message || "OTP resent successfully" };
  if (isRateLimited(attempt1)) {
    throw new AstrovedAuthError(attempt1.Message || "Too many requests. Please try again later.", 429, attempt1.Status ?? undefined);
  }

  if (!isNotFound(attempt1)) throwForStatus(attempt1, "Failed to resend OTP");

  // Try "91" for legacy accounts
  const attempt2 = await callApi("ResendOtp", {
    Type: type,
    CountryCode: countryCodeNoPlus,
    MobileNo: mobileNo,
  });

  if (isOtpSendSuccess(attempt2)) return { message: attempt2.Message || "OTP resent successfully" };
  if (isRateLimited(attempt2)) {
    throw new AstrovedAuthError(attempt2.Message || "Too many requests. Please try again later.", 429, attempt2.Status ?? undefined);
  }

  // If WhatsApp fails on the legacy format, fall back to SMS
  if (payload.method === "whatsapp") {
    console.log(`[astroved] WhatsApp OTP resend failed for ${mobileNo}. Falling back to SMS (Type 2)...`);
    const smsFallback = await callApi("ResendOtp", {
      Type: 2,
      CountryCode: countryCodeNoPlus,
      MobileNo: mobileNo,
    });

    if (isOtpSendSuccess(smsFallback)) {
      return { message: "WhatsApp delivery unavailable. OTP resent via SMS instead." };
    }

    if (isRateLimited(smsFallback)) {
      throw new AstrovedAuthError(smsFallback.Message || "Too many requests.", 429, smsFallback.Status ?? undefined);
    }
  }

  throwForStatus(attempt2, "Failed to resend OTP");
  throw new AstrovedAuthError("Failed to resend OTP", 500); // unreachable, satisfies TS
}

// ---------------------------------------------------------------------------
// Password login (kept for admin login)
// ---------------------------------------------------------------------------

export async function authenticatePasswordLogin(payload: {
  email: string;
  password: string;
}): Promise<AstrovedLoginInfo> {
  const data = await callApi("AuthenticateLogin", {
    UserName: payload.email,
    Password: payload.password,
    Type: 1,
  });
  if (data.loginInfo) return data.loginInfo;
  throw new AstrovedAuthError(data.Message || "Invalid email or password", 401, data.Status ?? undefined);
}

// ---------------------------------------------------------------------------
// Legacy exports — kept so other parts of the codebase don't break
// ---------------------------------------------------------------------------
export { sendOtp as requestOtp };
export { verifyOtp as verifyOtpWithAstroved };
export { resendOtp as resendOtpWithAstroved };

export type AstrovedLoginType = 1 | 2 | 3 | 4;
export function getAstrovedLoginType(method: LoginMethod): AstrovedLoginType {
  if (method === "phone") return 2;
  if (method === "whatsapp") return 3;
  if (method === "email") return 4;
  return 1;
}
