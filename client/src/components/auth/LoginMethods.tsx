"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { DEFAULT_COUNTRY } from "@/lib/auth/countries";
import { authService } from "@/services/authService";

type LoginMethod = "email" | "phone" | "whatsapp";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10,15}$/;

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m5 7 6.2 4.8a1.3 1.3 0 0 0 1.6 0L19 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M12 3.5A8.5 8.5 0 0 0 4.8 16.7L3.5 20.5l3.9-1.2A8.5 8.5 0 1 0 12 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="none" />
      <path d="M9.3 8.8c.2-.5.5-.5.7-.5.2 0 .4 0 .6.5.2.6.7 1.6.8 1.7.1.1.1.2 0 .4-.1.2-.2.4-.3.5-.1.1-.2.2-.3.4-.1.1-.2.3 0 .5.2.2.7 1.2 1.8 1.9 1.4.9 2 .8 2.3.7.4-.1 1.2-1.1 1.3-1.5.1-.3.2-.3.3-.3.1 0 1 .4 1.2.5.2.1.3.2.3.3 0 .1-.2 1.1-.9 1.8-.8.8-1.9 1.2-2.6 1.1-.7-.1-2.1-.5-3.8-2.1-1.9-1.7-2.4-3.3-2.5-4.1-.1-.8.3-1.6.8-2.1Z" />
    </svg>
  );
}

// AstroVed Logo mark (A shape from their SVG)
function AstroVedMark({ size = 48 }: { size?: number }) {
  return (
    <img src="/icons/Fav-Icon.png" alt="AstroVed Logo" width={size} height={size} />
  );
}

export default function LoginMethods() {
  const [method, setMethod] = useState<LoginMethod>("whatsapp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isIndian, setIsIndian] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    // 1. Check if admin path requested via URL
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");
    if (role === "admin") {
      setIsAdmin(true);
      setMethod("email");
      setDetecting(false);
      return;
    }

    // 2. Dynamically detect country using GeoIP
    async function detectCountry() {
      try {
        const res = await fetch("/api/auth/geoip");
        const data = await res.json();
        if (data && data.country) {
          setDetectedCountry(data.country);
          // Indian users → WhatsApp OTP; Foreign users → Email OTP
          if (data.country === "IN") {
            setIsIndian(true);
            setMethod("whatsapp");
          } else {
            setIsIndian(false);
            setMethod("email");
          }
        } else {
          // Default: Indian
          setIsIndian(true);
          setMethod("whatsapp");
        }
      } catch (err) {
        console.error("GeoIP detection failed:", err);
        setIsIndian(true);
        setMethod("whatsapp");
      } finally {
        setDetecting(false);
      }
    }
    detectCountry();
  }, []);

  const isValid = useMemo(() => {
    if (method === "email") {
      if (isAdmin) {
        return emailRegex.test(email) && password.length > 0;
      }
      return emailRegex.test(email);
    }
    if (method === "phone") return phoneRegex.test(phone);
    return phoneRegex.test(whatsapp);
  }, [method, email, password, phone, whatsapp, isAdmin]);

  const placeholder =
    method === "email"
      ? "Enter your email address"
      : method === "phone"
        ? "Enter your phone number"
        : "Enter your WhatsApp number";

  const value =
    method === "email" ? email : method === "phone" ? phone : whatsapp;

  const setValue = (nextValue: string) => {
    if (method === "email") {
      setEmail(nextValue);
      return;
    }

    let digitsOnly = nextValue.replace(/[^0-9]/g, "");

    // Auto-strip leading "91" if the user entered it (since +91 is already pre-selected) or if length is 12
    if ((digitsOnly.startsWith("91") && digitsOnly.length > 10) || digitsOnly.length === 12) {
      digitsOnly = digitsOnly.slice(2);
    }

    // Limit to 10 digits for Indian mobile numbers
    const finalValue = digitsOnly.slice(0, 10);

    if (method === "phone") {
      setPhone(finalValue);
      return;
    }
    setWhatsapp(finalValue);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (method === "email" && isAdmin) {
        const data = await authService.loginWithEmail({ email, password });

        if (data.isAdmin) {
          window.location.href = "/admin";
          return;
        }

        const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/dashboard";
        window.location.href = callbackUrl;
        return;
      }

      if (method === "email") {
        // Foreign user Email OTP flow
        await authService.sendOtp({
          method: "email",
          email,
        } as any);

        const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
        const params = new URLSearchParams({
          method: "email",
          email,
        });

        if (callbackUrl) params.set("callbackUrl", callbackUrl);

        window.location.href = `/auth/otp?${params.toString()}`;
        return;
      }

      // Indian Mobile/WhatsApp OTP flow
      const number = method === "whatsapp" ? whatsapp : phone;
      await authService.sendOtp({
        method,
        country: DEFAULT_COUNTRY,
        number,
      });

      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
      const params = new URLSearchParams({
        method,
        country: DEFAULT_COUNTRY.isoCode,
        number,
      });

      if (callbackUrl) params.set("callbackUrl", callbackUrl);

      window.location.href = `/auth/otp?${params.toString()}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (detecting) {
    return (
      <div className="w-full max-w-[460px] mx-auto overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(104,105,249,0.25)] flex flex-col items-center justify-center p-10" style={{ minHeight: 380 }}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#6869F9]"></div>
        <p className="mt-4 text-[#6869F9] text-sm font-medium">Configuring secure login...</p>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-[460px] mx-auto overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(104,105,249,0.25)] flex flex-col p-8 sm:p-10"
      style={{ minHeight: 480 }}
    >
      {/* Logo circle (like Sri Mandir modal) */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"

        >
          <AstroVedMark size={44} />
        </div>
      </div>

        {/* Heading */}
        <h1 className="text-center text-xl font-bold text-[#1a1a2e] leading-snug">
          {isAdmin
            ? "Admin Login"
            : isIndian
              ? "Login to continue"
              : "Login to continue your booking"}
        </h1>
        <p className="mt-1.5 text-center text-sm text-[#6a4e95]">
          {isAdmin
            ? "Access the administrative control center."
            : isIndian
              ? "We will send an OTP to your WhatsApp number"
              : "All booking updates will be sent to your email"}
        </p>

        {/* Method tabs — only shown if not admin */}
        {!isAdmin && (
          <div className="mt-5 flex rounded-xl bg-[#f3f0ff] p-1">
            {isIndian ? (
              // Indian user: WhatsApp only (matching the original phone tab style)
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all text-[#6869F9] bg-white shadow-sm"
              >
                <WhatsappIcon />
                WhatsApp OTP
              </button>
            ) : (
              // Foreign user: Email only
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all text-[#6869F9] bg-white shadow-sm"
              >
                <MailIcon />
                Email OTP
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 flex-1 flex flex-col">
          <div>
            <label className="block text-sm font-medium text-[#5a3b8a] mb-1.5">
              {method === "email" ? "Email" : "WhatsApp Number"}
            </label>
            <div className="flex items-center rounded-xl border border-[#d8c9fb] bg-[#fcfaff] px-4 py-3 transition-all duration-300 focus-within:border-[#6869F9] focus-within:ring-2 focus-within:ring-[#ddd1ff]">
              {method !== "email" && (
                <span className="mr-2 flex items-center gap-1.5 text-sm font-semibold text-[#6869F9] bg-[#eee9ff] px-2 py-0.5 rounded-md">
                  <Image src="/images/flag.png" alt="India Flag" width={20} height={14} className="rounded-[2px] object-cover" />
                  +{DEFAULT_COUNTRY.dialCode}
                </span>
              )}
              <input
                id="login-input"
                type={method === "email" ? "email" : "tel"}
                inputMode={method === "email" ? "email" : "numeric"}
                autoComplete={method === "email" ? "email" : "tel"}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={placeholder}
                maxLength={method === "email" ? undefined : 16}
                className="w-full bg-transparent text-base text-[#342151] outline-none placeholder:text-[#a288cf]"
              />
              {value && (
                <button
                  type="button"
                  onClick={() => setValue("")}
                  className="ml-2 text-[#a288cf] hover:text-[#6869F9] transition-colors"
                  aria-label="Clear input"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {method === "email" && isAdmin && (
            <div>
              <label className="block text-sm font-medium text-[#5a3b8a] mb-1.5">
                Password
              </label>
              <div className="relative flex items-center rounded-xl border border-[#d8c9fb] bg-[#faf8ff] px-4 py-3 transition-all duration-300 focus-within:border-[#6869F9] focus-within:ring-2 focus-within:ring-[#e0dcff]">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-base text-[#342151] outline-none placeholder:text-[#a288cf] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-[#a288cf] hover:text-[#5a3b8a] transition-colors"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-500">
              {error}
            </p>
          )}

          {method === "email" && isAdmin && (
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-[#6869F9] transition-colors duration-300 hover:text-[#5657e8]"
              >
                Forgot password?
              </Link>
            </div>
          )}

          <div className="flex-1" />

          <button
            id="login-submit-btn"
            type="submit"
            disabled={!isValid || loading}
            className={`w-full rounded-xl px-4 py-3.5 text-base font-semibold text-white transition-all duration-500 ${isValid && !loading
              ? "shadow-[0_10px_24px_rgba(104,105,249,0.35)] hover:brightness-110"
              : "cursor-not-allowed opacity-50"
              }`}
            style={
              isValid && !loading
                ? { background: "linear-gradient(135deg, #6869F9 0%, #4546d4 100%)" }
                : { background: "#c4b8f0" }
            }
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : isAdmin ? (
              "Sign In"
            ) : (
              "Get OTP"
            )}
          </button>

          {!isAdmin && (
            <p className="text-center text-xs text-[#9b7ec8]">
              By proceeding you agree to the{" "}
              <Link href="/terms" className="font-semibold text-[#6869F9] hover:underline">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-[#6869F9] hover:underline">
                Privacy Policy
              </Link>{" "}
              of AstroVed
            </p>
          )}
        </form>
    </div>
  );
}
