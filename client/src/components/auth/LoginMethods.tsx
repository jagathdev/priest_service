"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { Mail, X, Eye, EyeOff, Loader2 } from "lucide-react";
import type { CountryOption } from "@/types/auth";
const DEFAULT_COUNTRY: CountryOption = { name: "India", isoCode: "IN", dialCode: "91" };
import { authService } from "@/services/auth.service";
import { adminService } from "@/services/admin.service";

type LoginMethod = "email" | "phone" | "whatsapp";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10,15}$/;

// AstroVed Logo mark (A shape from their SVG)
function AstroVedMark({ size = 48 }: { size?: number }) {
  return (
    <Image src="/icons/Fav-Icon.png" alt="AstroVed Logo" width={size} height={size} />
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

  const [_detectedCountry, setDetectedCountry] = useState<string | null>(null);
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
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
        const res = await fetch(`${baseUrl}/api/auth/geoip`);
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
        console.warn("GeoIP detection failed:", err);
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
        return email.length > 0 && password.length > 0;
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
        const data = await adminService.login({ email, password });

        if (data.success || data.token) {
          const token = data.token || "";
          // Set cookie and localStorage for authentication
          document.cookie = `adminToken=${token}; path=/; max-age=86400; SameSite=Lax`;
          try {
            localStorage.setItem("adminToken", token);
          } catch {}
          window.location.href = "/admin";
          return;
        }

        // const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/admin";
        // window.location.href = callbackUrl;
        return;
      }

      if (method === "email") {
        // Foreign user Email OTP flow
        await authService.sendOtp({
          method: "email",
          email,
        } as any);

        // const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
        // const params = new URLSearchParams({
        //   method: "email",
        //   email,
        // });

        // if (callbackUrl) params.set("callbackUrl", callbackUrl);

        // window.location.href = `/auth/otp?${params.toString()}`;
        return;
      }

      // Indian Mobile/WhatsApp OTP flow
      const number = method === "whatsapp" ? whatsapp : phone;
      await authService.sendOtp({
        method,
        country: DEFAULT_COUNTRY,
        number,
      });

      // const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
      // const params = new URLSearchParams({
      //   method,
      //   country: DEFAULT_COUNTRY.isoCode,
      //   number,
      // });

      // if (callbackUrl) params.set("callbackUrl", callbackUrl);

      // window.location.href = `/auth/otp?${params.toString()}`;
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (detecting) {
    return (
      <div className="w-full max-w-[460px] mx-auto overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(104,105,249,0.25)] flex flex-col items-center justify-center p-10" style={{ minHeight: 380 }}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-primary text-sm font-medium">Configuring secure login...</p>
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
              className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all text-primary bg-white shadow-sm"
            >
              <i className="fa-brands fa-whatsapp text-lg text-[#25D366]"></i>
              WhatsApp OTP
            </button>
          ) : (
            // Foreign user: Email only
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all text-primary bg-white shadow-sm"
            >
              <Mail className="h-5 w-5" />
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
          <div className="flex items-center rounded-xl border border-[#d8c9fb] bg-[#fcfaff] px-4 py-3 transition-all duration-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-[#ddd1ff]">
            {method !== "email" && (
              <span className="mr-2 flex items-center gap-1.5 text-sm font-semibold text-primary bg-[#eee9ff] px-2 py-0.5 rounded-md">
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
                className="ml-2 text-[#a288cf] hover:text-primary transition-colors"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {method === "email" && isAdmin && (
          <div>
            <label className="block text-sm font-medium text-[#5a3b8a] mb-1.5">
              Password
            </label>
            <div className="relative flex items-center rounded-xl border border-[#d8c9fb] bg-[#faf8ff] px-4 py-3 transition-all duration-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-[#e0dcff]">
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
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
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


        <div className="flex-1" />

        <button
          id="login-submit-btn"
          type="submit"
          disabled={!isValid || loading}
          className={`w-full rounded-xl px-4 py-3.5 text-base font-semibold text-white transition-all duration-500 ${isValid && !loading
            ? "shadow-[0_10px_24px_rgba(59,130,246,0.35)] hover:brightness-110"
            : "cursor-not-allowed opacity-50"
            }`}
          style={
            isValid && !loading
              ? { background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }
              : { background: "#93c5fd" }
          }
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
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
            <Link href="/terms" className="font-semibold text-primary hover:underline">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-semibold text-primary hover:underline">
              Privacy Policy
            </Link>{" "}
            of AstroVed
          </p>
        )}
      </form>
    </div>
  );
}
