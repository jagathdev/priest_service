"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { adminService } from "@/services/admin.service";
import { useUser } from "@/contexts/UserContext";

export default function LoginMethods() {
  const router = useRouter();
  const { setUser } = useUser();

  const [step, setStep] = useState<"input" | "otp">("input");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [waitTimer, setWaitTimer] = useState(0);

  // Admin login states
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("role") === "admin") {
      setIsAdmin(true);
    }
  }, []);

  // Auto-focus input
  useEffect(() => {
    if (step === "input") {
      setTimeout(() => phoneInputRef.current?.focus(), 100);
    } else {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Resend countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Rate limit wait countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "input" && waitTimer > 0) {
      interval = setInterval(() => {
        setWaitTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, waitTimer]);

  const redirectAfterLogin = () => {
    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/dashboard";
    window.location.href = callbackUrl;
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdmin) {
      setError("");
      setLoading(true);
      try {
        const data = await adminService.login({ email, password });
        if (data.success || data.token) {
          const token = data.token || "";
          document.cookie = `adminToken=${token}; path=/; max-age=86400`;
          window.location.href = "/admin";
          return;
        }
        const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/admin";
        window.location.href = callbackUrl;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Admin login failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    const cleanNumber = mobileNumber.replace(/\D/g, "");
    if (cleanNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authService.sendOtpLegacy({
        method: "whatsapp",
        country: { isoCode: "IN", dialCode: "+91", name: "India" } as any,
        number: cleanNumber,
      } as any);

      setStep("otp");
      setResendTimer(30);
    } catch (err: any) {
      const errMsg = err.message || "Failed to send OTP";
      setError(errMsg);
      const match = errMsg.match(/try again after (\d+)s/i);
      if (match && match[1]) {
        setWaitTimer(parseInt(match[1], 10));
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent, directOtp?: string) => {
    if (e) e.preventDefault();
    const cleanOtp = (directOtp || otp).trim();
    if (cleanOtp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const verifyRes = await authService.verifyOtpLegacy({
        method: "whatsapp",
        country: { isoCode: "IN", dialCode: "+91", name: "India" } as any,
        number: mobileNumber.replace(/\D/g, ""),
        otp: cleanOtp,
      } as any);

      if (verifyRes.data && verifyRes.data.user) {
        const u = verifyRes.data.user;
        const authToken = verifyRes.data.token || (verifyRes as any).token;
        const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
        const secureSuffix = isHttps ? "; Secure; SameSite=Lax" : "; SameSite=Lax";
        if (authToken) {
          localStorage.setItem("token", authToken);
          document.cookie = `token=${authToken}; path=/; max-age=604800${secureSuffix};`;
        }
        document.cookie = `userLogin=true; path=/; max-age=604800${secureSuffix};`;
        localStorage.setItem("mockUser", JSON.stringify(u));
        setUser(u);
        redirectAfterLogin();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setError(err.message || "Error verifying OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);
    try {
      await authService.sendOtpLegacy({
        method: "whatsapp",
        country: { isoCode: "IN", dialCode: "+91", name: "India" } as any,
        number: mobileNumber.replace(/\D/g, ""),
      } as any);
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // If Admin Login
  if (isAdmin) {
    return (
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-stone-100">
        <h2 className="text-2xl font-serif font-semibold text-center text-[#232323] mb-6 tracking-tight">
          Admin Login
        </h2>
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example.gmail.com"
              className="w-full text-sm font-medium text-gray-900 border border-stone-300 rounded-xl px-4 py-3 outline-none focus:border-stone-800"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full text-sm font-medium text-gray-900 border border-stone-300 rounded-xl px-4 py-3 outline-none focus:border-stone-800 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-red-500 font-semibold text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#14395C] hover:bg-[#0f2d4a] text-white font-bold text-sm py-3 px-6 rounded-full transition-all mt-4"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  // OTP Verification Step
  if (step === "otp") {
    return (
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-stone-100">
        <h2 className="text-2xl font-serif font-semibold text-center text-[#232323] mb-2 tracking-tight">
          Enter OTP
        </h2>
        <p className="text-xs text-stone-600 text-center mb-6">
          OTP sent to <span className="font-bold text-gray-900">+91 {mobileNumber}</span>{" "}
          <button
            type="button"
            onClick={() => setStep("input")}
            className="text-success font-bold underline ml-1 hover:text-emerald-700 cursor-pointer"
          >
            Change
          </button>
        </p>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            ref={otpInputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setOtp(val);
              if (val.length === 6) {
                handleVerifyOtp(undefined, val);
              }
            }}
            placeholder="Enter 6-digit OTP"
            className="w-full text-center text-xl font-bold tracking-[0.4em] py-3.5 border border-emerald-500 rounded-2xl outline-none bg-green-50/50 text-gray-900 font-mono"
          />

          <div className="text-center">
            {resendTimer > 0 && (
              <span className="text-xs text-stone-500 font-medium">
                Resend OTP in <span className="text-success font-bold">{resendTimer}s</span>
              </span>
            )}
            {resendTimer <= 0 && (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-xs text-success font-bold underline hover:text-emerald-700 cursor-pointer"
              >
                Resend OTP
              </button>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-500 font-semibold text-center mt-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={otp.length !== 6 || loading}
            className="w-full bg-success hover:bg-[#009644] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base py-3.5 px-6 rounded-full flex items-center justify-center relative shadow-md transition-all mt-4 cursor-pointer"
          >
            <span>{loading ? "Verifying..." : "Verify & Continue"}</span>
            <div className="absolute right-3.5 w-8 h-8 rounded-full bg-white text-success flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </button>
        </form>
      </div>
    );
  }

  // Standard Mobile Number Input Step
  return (
    <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-stone-100">
      <h2 className="text-2xl font-serif font-semibold text-center text-[#232323] mb-6 tracking-tight">
        Login or signup
      </h2>

      <form onSubmit={handleSendOtp} className="space-y-4">
        <div className="border border-stone-300 focus-within:border-emerald-600 rounded-2xl flex items-center px-4 py-3.5 bg-white transition-all shadow-2xs">
          <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-stone-200 mr-3">
            <span className="text-lg leading-none select-none">🇮🇳</span>
            <span className="text-sm font-bold text-gray-800">+91</span>
            <svg className="w-3 h-3 text-gray-500 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>

          <input
            ref={phoneInputRef}
            type="tel"
            inputMode="numeric"
            placeholder="Mobile number"
            maxLength={10}
            value={mobileNumber}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              setMobileNumber(digits.slice(0, 10));
            }}
            className="w-full text-base font-medium text-gray-900 outline-none bg-transparent placeholder:text-stone-400 font-sans"
            autoComplete="tel"
          />
        </div>

        {error && !waitTimer && (
          <p className="text-xs text-red-500 font-semibold text-center mt-1">
            {error}
          </p>
        )}

        {waitTimer > 0 && (
          <p className="text-xs text-stone-500 font-medium text-center mt-2">
            Please wait <span className="font-bold text-success">{waitTimer}s</span> before requesting another OTP.
          </p>
        )}

        <button
          type="submit"
          disabled={mobileNumber.length !== 10 || loading || waitTimer > 0}
          className="w-full bg-success hover:bg-[#009644] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base py-3.5 px-6 rounded-full flex items-center justify-center relative shadow-md transition-all mt-6 cursor-pointer"
        >
          <span>{loading ? "Sending..." : "Continue"}</span>
          <div className="absolute right-3.5 w-8 h-8 rounded-full bg-white text-success flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </button>

        <p className="text-[12px] text-stone-500 text-center leading-relaxed pt-2">
          By tapping &quot;Continue&quot;, you agree to receive notifications, and our{" "}
          <Link href="/terms" className="text-blue-600 underline font-medium hover:text-blue-700">
            terms and conditions
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
