import type { OtpPayload } from "@/types/auth";

interface StoredOtp extends OtpPayload {
  code: string;
  expiresAt: number;
}

const OTP_TTL_MS = 5 * 60 * 1000;
const store = globalThis as typeof globalThis & {
  AstroVedOtpStore?: Map<string, StoredOtp>;
};

const otpStore = store.AstroVedOtpStore ?? new Map<string, StoredOtp>();
store.AstroVedOtpStore = otpStore;

export const OTP_RESEND_SECONDS = 30;
const OTP_PROVIDER_TIMEOUT_MS = Number(process.env.AUTH_OTP_PROVIDER_TIMEOUT_MS ?? 5000);

export function getOtpKey(payload: Pick<OtpPayload, "method" | "country" | "number" | "email">) {
  if (payload.method === "email") {
    return `email:${payload.email}`;
  }
  return `${payload.method}:${payload.country?.dialCode}:${payload.number}`;
}

async function sendOtpWithProvider(payload: OtpPayload, code: string) {
  const endpoint = process.env.AUTH_OTP_PROVIDER_URL;

  if (!endpoint) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_OTP_PROVIDER_URL is required to send OTPs");
    }

    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OTP_PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AUTH_OTP_PROVIDER_TOKEN
          ? { Authorization: `Bearer ${process.env.AUTH_OTP_PROVIDER_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        channel: payload.method,
        countryCode: payload.country?.dialCode || "",
        phoneNumber: payload.number || "",
        otp: code,
        ttlSeconds: OTP_TTL_MS / 1000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`OTP provider failed with ${response.status}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

export async function createOtp(payload: OtpPayload) {
  const code =
    process.env.NODE_ENV === "production"
      ? String(Math.floor(100000 + Math.random() * 900000))
      : "123456";

  otpStore.set(getOtpKey(payload), {
    ...payload,
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  });

  await sendOtpWithProvider(payload, code);

  return { expiresIn: OTP_RESEND_SECONDS };
}

export function verifyStoredOtp(payload: OtpPayload, otp: string) {
  const key = getOtpKey(payload);
  const storedOtp = otpStore.get(key);

  if (!storedOtp || storedOtp.expiresAt < Date.now()) {
    otpStore.delete(key);
    return false;
  }

  const isValid = storedOtp.code === otp;

  if (isValid) {
    otpStore.delete(key);
  }

  return isValid;
}
