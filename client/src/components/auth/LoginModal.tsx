"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { authService } from "@/services/authService";
import { useUser } from "@/contexts/UserContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { setUser } = useUser();
  const [step, setStep] = useState<"input" | "otp">("input");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount / step change
  useEffect(() => {
    if (isOpen) {
      if (step === "input") {
        setTimeout(() => phoneInputRef.current?.focus(), 100);
      } else if (step === "otp") {
        setTimeout(() => otpInputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, step]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, step, resendTimer]);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset modal state on close
  const handleClose = () => {
    setStep("input");
    setMobileNumber("");
    setOtp("");
    setError("");
    setLoading(false);
    setResendTimer(30);
    onClose();
  };

  // ── Step 1: Send OTP handler ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = mobileNumber.replace(/\D/g, "");
    if (cleanNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";
      const sendOtpUrl = process.env.NEXT_PUBLIC_API_OTP_SEND || "/api/otp/sendOtp";

      const res = await fetch(`${baseUrl}${sendOtpUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: cleanNumber }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("otp");
        setResendTimer(30);
      } else {
        // Fallback to Next.js API route /api/auth/otp/send if Express server fails or returns error
        try {
          await authService.sendOtp({
            method: "whatsapp",
            country: { isoCode: "IN", dialCode: "+91", name: "India" } as any,
            number: cleanNumber,
          });
          setStep("otp");
          setResendTimer(30);
        } catch (fallbackErr: any) {
          setError(data.message || fallbackErr.message || "Failed to send OTP. Please try again.");
        }
      }
    } catch (err) {
      // Direct call fallback
      try {
        await authService.sendOtp({
          method: "whatsapp",
          country: { isoCode: "IN", dialCode: "+91", name: "India" } as any,
          number: cleanNumber,
        });
        setStep("otp");
        setResendTimer(30);
      } catch (fallbackErr: any) {
        setError("Network error. Could not connect to authentication server.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP handler ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 4) {
      setError("Please enter the verification OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";
      const verifyOtpUrl = process.env.NEXT_PUBLIC_API_OTP_VERIFY || "/api/otp/verifyOtp";

      const res = await fetch(`${baseUrl}${verifyOtpUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: mobileNumber.replace(/\D/g, ""), otp: cleanOtp }),
      });

      const data = await res.json();

      if (data.success) {
        document.cookie = "userLogin=true; path=/; max-age=604800;";
        const u = data.data?.user || data.user || {};
        setUser(u);
        handleClose();
        if (onSuccess) onSuccess();
      } else {
        // Fallback to Next.js API route
        try {
          const verifyRes = await authService.verifyOtp({
            method: "whatsapp",
            country: { isoCode: "IN", dialCode: "+91", name: "India" } as any,
            number: mobileNumber.replace(/\D/g, ""),
            otp: cleanOtp,
          } as any);
          const u = (verifyRes as any).user || {};
          document.cookie = "userLogin=true; path=/; max-age=604800;";
          setUser(u);
          handleClose();
          if (onSuccess) onSuccess();
        } catch (fallbackErr: any) {
          setError(data.message || fallbackErr.message || "Invalid OTP. Please try again.");
        }
      }
    } catch (err) {
      try {
        const verifyRes = await authService.verifyOtp({
          method: "whatsapp",
          country: { isoCode: "IN", dialCode: "+91", name: "India" } as any,
          number: mobileNumber.replace(/\D/g, ""),
          otp: cleanOtp,
        } as any);
        const u = (verifyRes as any).user || {};
        document.cookie = "userLogin=true; path=/; max-age=604800;";
        setUser(u);
        handleClose();
        if (onSuccess) onSuccess();
      } catch (fallbackErr: any) {
        setError("Error verifying OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP handler ──
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";
      const sendOtpUrl = process.env.NEXT_PUBLIC_API_OTP_SEND || "/api/otp/sendOtp";

      await fetch(`${baseUrl}${sendOtpUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: mobileNumber.replace(/\D/g, "") }),
      });
      setResendTimer(30);
      setOtp("");
      setError("OTP resent successfully!");
    } catch {
      setError("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Modal Dialog Box matching exact screenshot mockup */}
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.2)] transform transition-all duration-300 animate-[fadeIn_0.2s_ease-out]">
        {/* Close Button (X) */}
        <button
          onClick={handleClose}
          aria-label="Close login modal"
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100/70 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === "input" ? (
          <div>
            {/* Modal Title */}
            <h2 className="text-2xl font-serif font-semibold text-center text-[#232323] mb-6 tracking-tight">
              Login or signup
            </h2>

            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Phone Input Box matching screenshot */}
              <div className="border border-stone-300 focus-within:border-emerald-600 rounded-2xl flex items-center px-4 py-3.5 bg-white transition-all shadow-2xs">
                {/* Flag + Country Code badge */}
                <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-stone-200 mr-3">
                  <span className="text-lg leading-none select-none">🇮🇳</span>
                  <span className="text-sm font-bold text-gray-800">+91</span>
                  <svg className="w-3 h-3 text-gray-500 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Mobile Number Input */}
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

              {error && (
                <p className="text-xs text-red-500 font-semibold text-center mt-1">
                  {error}
                </p>
              )}

              {/* Continue Button with Right Arrow */}
              <button
                type="submit"
                disabled={mobileNumber.length !== 10 || loading}
                className="w-full bg-[#00b050] hover:bg-[#009644] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base py-3.5 px-6 rounded-full flex items-center justify-center relative shadow-md transition-all mt-6"
              >
                <span>{loading ? "Sending..." : "Continue"}</span>
                <div className="absolute right-3.5 w-8 h-8 rounded-full bg-white text-[#00b050] flex items-center justify-center shadow-xs">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>

              {/* Footer Terms text matching screenshot */}
              <p className="text-[12px] text-stone-500 text-center leading-relaxed pt-2">
                By tapping &quot;Continue&quot;, you agree to receive notifications, and our{" "}
                <Link href="/terms" onClick={handleClose} className="text-blue-600 underline font-medium hover:text-blue-700">
                  terms and conditions
                </Link>
                .
              </p>
            </form>
          </div>
        ) : (
          <div>
            {/* OTP Verification Header */}
            <h2 className="text-2xl font-serif font-semibold text-center text-[#232323] mb-2 tracking-tight">
              Enter OTP
            </h2>
            <p className="text-xs text-stone-600 text-center mb-6">
              OTP sent to <span className="font-bold text-gray-900">+91 {mobileNumber}</span>{" "}
              <button
                type="button"
                onClick={() => setStep("input")}
                className="text-[#00b050] font-bold underline ml-1 hover:text-emerald-700"
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
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit OTP"
                className="w-full text-center text-xl font-bold tracking-[0.4em] py-3.5 border border-emerald-500 rounded-2xl outline-none bg-green-50/50 text-gray-900 font-mono"
              />

              <div className="text-center">
                {resendTimer > 0 ? (
                  <span className="text-xs text-stone-500 font-medium">
                    Resend OTP in <span className="text-[#00b050] font-bold">{resendTimer}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-xs text-[#00b050] font-bold underline hover:text-emerald-700"
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
                disabled={otp.length < 4 || loading}
                className="w-full bg-[#00b050] hover:bg-[#009644] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base py-3.5 px-6 rounded-full flex items-center justify-center relative shadow-md transition-all mt-4"
              >
                <span>{loading ? "Verifying..." : "Verify & Continue"}</span>
                <div className="absolute right-3.5 w-8 h-8 rounded-full bg-white text-[#00b050] flex items-center justify-center shadow-xs">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
