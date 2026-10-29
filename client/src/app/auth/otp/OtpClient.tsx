"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Mail, Loader2 } from "lucide-react";
const DEFAULT_COUNTRY = { name: "India", isoCode: "IN", dialCode: "91" };


import { authService } from "@/services/auth.service";
import type { LoginMethod, OtpPayload } from "@/types/auth";
import { useUser } from "@/contexts/UserContext";

const RESEND_SECONDS = 30;

function AstroVedMark({ size = 48 }: { size?: number }) {
  return (
    <Image src="/icons/Fav-Icon.png" alt="AstroVed Logo" width={size} height={size} />
  );
}

function parseOtpContext(params: URLSearchParams): OtpPayload | null {
  const method = params.get("method") as LoginMethod | null;
  const isoCode = params.get("country") ?? "";
  const number = (params.get("number") ?? "").replace(/[^0-9]/g, "");
  const email = params.get("email") ?? "";

  if (method === "email") {
    if (!email) return null;
    return {
      method,
      email,
    };
  }

  if (method !== "phone" && method !== "whatsapp") return null;
  if (!isoCode || !number) return null;

  const country = DEFAULT_COUNTRY;

  return {
    method,
    country,
    number,
  };
}

export default function OtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const otpPayload = useMemo(() => {
    if (!searchParams) return null;
    return parseOtpContext(new URLSearchParams(searchParams.toString()));
  }, [searchParams]);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS);
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const { setUser } = useUser();

  useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  // const redirectAfterLogin = () => {
  //   const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/dashboard";
  //   router.push(callbackUrl);
  // };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!otpPayload) {
      setError("Missing OTP session. Please try again.");
      return;
    }

    const otpValue = otp.trim();
    if (!/^[0-9]{4,8}$/.test(otpValue)) {
      setError("Enter the OTP sent to your number");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyOtpLegacy({ ...otpPayload, otp: otpValue });
      if (res.data && res.data.user) {
        const authToken = res.data.token || (res as any).token;
        if (authToken) {
          localStorage.setItem("token", authToken);
          document.cookie = `token=${authToken}; path=/; max-age=604800;`;
        }
        setUser(res.data.user);
        document.cookie = "userLogin=true; path=/; max-age=" + 60 * 60 * 24 * 7;
        localStorage.setItem("mockUser", JSON.stringify(res.data.user));
        // redirectAfterLogin();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpPayload || resendSeconds > 0) return;
    setError("");
    setLoading(true);
    try {
      await authService.sendOtpLegacy(otpPayload);
      setOtp("");
      setResendSeconds(RESEND_SECONDS);
      otpInputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeContact = () => {
    const method = otpPayload?.method ?? "whatsapp";
    router.push(`/auth/login?method=${encodeURIComponent(method)}`);
  };

  const isEmail = otpPayload?.method === "email";
  const summary = otpPayload
    ? isEmail
      ? otpPayload.email
      : `+${otpPayload.country?.dialCode} ${otpPayload.number}`
    : null;

  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f3f0ff 0%, #eae8ff 50%, #f0f4ff 100%)" }}
    >
      {/* Background blobs */}
      <div className="pointer-events-none absolute right-0 top-0 h-[700px] w-[700px] -translate-y-1/2 translate-x-1/3 rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle, #6869F9, transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/3 translate-y-1/2 rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle, #4546d4, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-2xl px-4 py-12">
        <div className="w-full overflow-hidden rounded-3xl shadow-[0_30px_80px_rgba(104,105,249,0.25)] flex" style={{ minHeight: 460 }}>

          {/* Left branded panel */}
          <div
            className="hidden md:flex w-[220px] flex-shrink-0 flex-col items-start justify-between p-8"
            style={{ background: "linear-gradient(145deg, #6869F9 0%, #4546d4 100%)" }}
          >
            <div>
              <AstroVedMark size={52} />
              <h2 className="mt-5 text-white font-bold text-2xl leading-tight">Verify OTP</h2>
              <p className="mt-3 text-white/80 text-sm leading-relaxed">
                Enter the 6-digit code sent to your {isEmail ? "email" : "WhatsApp"} to continue securely.
              </p>
            </div>
            <div className="mt-8 space-y-1.5">
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                Secure & Encrypted
              </div>
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                One-time Code
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="flex-1 bg-white p-8 sm:p-10 flex flex-col">
            {/* Logo */}
            <div className="flex flex-col items-center mb-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(145deg, #6869F9 0%, #4546d4 100%)" }}
              >
                <AstroVedMark size={44} />
              </div>
              <span className="mt-2 font-bold text-primary text-base tracking-tight">AstroVed</span>
            </div>

            <h1 className="text-center text-xl font-bold text-[#1a1a2e]">
              Enter the OTP
            </h1>
            <p className="mt-1 text-center text-sm text-[#6a4e95]">
              {isEmail ? "OTP sent to your email" : "OTP sent to your WhatsApp"}
            </p>

            {/* Contact info pill */}
            {summary && (
              <div className="mt-4 mx-auto flex items-center gap-2 rounded-xl border border-[#e1d5fb] bg-[#f8f5ff] px-4 py-2.5">
                {isEmail ? (
                  <Mail className="w-4 h-4 text-primary" />
                ) : (
                  <i className="fa-brands fa-whatsapp text-base text-[#25D366]"></i>
                )}
                <span className="text-sm font-semibold text-[#342151]">{summary}</span>
                <button
                  type="button"
                  onClick={handleChangeContact}
                  className="ml-1 text-xs font-medium text-primary hover:underline"
                >
                  Change
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5 flex-1 flex flex-col">
              {/* Single flexible OTP input */}
              <div className="flex justify-center">
                <input
                  ref={otpInputRef}
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter OTP"
                  className="w-full max-w-[260px] h-14 rounded-xl border-2 border-primary bg-[#f0efff] text-center text-2xl font-bold text-[#342151] outline-none tracking-widest transition-all focus:ring-2 focus:ring-[#ddd1ff]"
                />
              </div>

              {/* Resend timer */}
              <div className="flex justify-center">
                {resendSeconds > 0 ? (
                  <p className="text-sm text-[#6f53a3]">
                    Resend OTP in{" "}
                    <span className="font-bold text-primary">
                      {String(Math.floor(resendSeconds / 60)).padStart(2, "0")}:{String(resendSeconds % 60).padStart(2, "0")}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading || !otpPayload}
                    className="text-sm font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-[#a288cf]"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-500">
                  {error}
                </p>
              )}

              <div className="flex-1" />

              <button
                id="otp-submit-btn"
                type="submit"
                disabled={loading || otp.trim().length < 4 || !otpPayload}
                className="w-full rounded-xl px-4 py-3.5 text-base font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={
                  !loading && otp.trim().length >= 4 && otpPayload
                    ? { background: "linear-gradient(135deg, #6869F9 0%, #4546d4 100%)", boxShadow: "0 10px 24px rgba(104,105,249,0.35)" }
                    : { background: "#c4b8f0" }
                }
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Verifying...
                  </span>
                ) : (
                  "Submit"
                )}
              </button>

              <p className="text-center text-xs text-[#9b7ec8]">
                By proceeding, you agree to AstroVed&apos;s{" "}
                <Link href="/terms" className="font-semibold text-primary hover:underline">
                  Terms and Conditions
                </Link>{" "}
                And{" "}
                <Link href="/privacy" className="font-semibold text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
