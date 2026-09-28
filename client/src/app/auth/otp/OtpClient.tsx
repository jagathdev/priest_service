"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCountryByIsoCode } from "@/lib/auth/countries";
import { authService } from "@/services/authService";
import type { LoginMethod, OtpPayload } from "@/types/auth";

const RESEND_SECONDS = 30;

function AstroVedMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="white" fillOpacity="0.15" />
      <path d="M28 8c-.12-.03-.14.06-.17.14-.19.54-.57.97-.76 1.52-.15.42-.55.74-.77 1.14-.62 1.16-1.38 2.23-2.02 3.37-.65 1.17-1.26 2.37-1.96 3.5-1.91 3.1-3.63 6.31-5.51 9.43-.68 1.12-1.33 2.25-1.98 3.39-.2.35-.52.4-.87.4-1.34 0-2.68.03-4.02-.01-.87-.02-1.73.13-2.59.12-.5-.01-.6-.13-.34-.53.76-1.16 1.37-2.4 2.09-3.58.9-1.49 1.81-2.97 2.59-4.53.55-1.1 1.3-2.09 1.92-3.16.88-1.51 1.76-3.02 2.57-4.57.47-.87.96-1.74 1.54-2.56.64-.89 1.1-1.9 1.65-2.85.91-1.61 1.8-3.24 2.76-4.83.52-.87 1.08-1.72 1.56-2.62.31-.59.7-1.13 1-1.71.87-1.66 2-3.17 2.85-4.85.04-.08.07-.17.12-.24.14-.18.08-.58.31-.56.22.02.38.34.51.57 1.1 2.07 2.45 4 3.5 6.1.73 1.45 1.67 2.78 2.5 4.18a98.7 98.7 0 0 1 2.02 3.56c.62 1.17 1.26 2.34 2.1 3.36.18.22.1.47.23.7 1.06 1.73 2.03 3.51 3.1 5.23.96 1.53 1.78 3.16 2.69 4.72 1.43 2.44 2.88 4.87 4.31 7.31.08.14.17.29.2.44.05.23-.04.41-.31.38-2.09-.21-4.19-.07-6.28-.07-.77 0-1.17-.24-1.56-.92-1.97-3.5-4.02-6.95-6.03-10.42C32.97 21.97 30.97 18.5 28.7 15c-.12-.2-.21-.43-.47-.5h.01Z" fill="white" />
      <path d="M34 35.6c-.07.43-.4.66-.65.93-.65.67-1.31 1.33-1.96 1.99-.96.99-1.91 1.98-2.87 2.97-.21.22-.37.17-.59-.04a1044 1044 0 0 0-5.35-5.38c-.26-.26-.29-.44-.07-.78a44.2 44.2 0 0 0 1.57-2.67c.77-1.46 1.66-2.85 2.5-4.27.47-.78.99-1.53 1.34-2.4.15-.37.43-.19.57.05a70.8 70.8 0 0 1 1.46 2.47c1.09 1.97 2.15 3.95 3.37 5.84.27.41.46.87.68 1.3Z" fill="#F47820" />
    </svg>
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

  const country = getCountryByIsoCode(isoCode);

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

  useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const redirectAfterLogin = () => {
    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/dashboard";
    window.location.href = callbackUrl;
  };

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
      await authService.verifyOtp({ ...otpPayload, otp: otpValue });
      redirectAfterLogin();
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
      await authService.resendOtp(otpPayload);
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
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Secure & Encrypted
              </div>
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
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
              <span className="mt-2 font-bold text-[#6869F9] text-base tracking-tight">AstroVed</span>
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
                  <svg className="w-4 h-4 text-[#6869F9]" viewBox="0 0 24 24" fill="none">
                    <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.7" />
                    <path d="m5 7 6.2 4.8a1.3 1.3 0 0 0 1.6 0L19 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-[#6869F9]" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3.5A8.5 8.5 0 0 0 4.8 16.7L3.5 20.5l3.9-1.2A8.5 8.5 0 1 0 12 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  </svg>
                )}
                <span className="text-sm font-semibold text-[#342151]">{summary}</span>
                <button
                  type="button"
                  onClick={handleChangeContact}
                  className="ml-1 text-xs font-medium text-[#6869F9] hover:underline"
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
                  className="w-full max-w-[260px] h-14 rounded-xl border-2 border-[#6869F9] bg-[#f0efff] text-center text-2xl font-bold text-[#342151] outline-none tracking-widest transition-all focus:ring-2 focus:ring-[#ddd1ff]"
                />
              </div>

              {/* Resend timer */}
              <div className="flex justify-center">
                {resendSeconds > 0 ? (
                  <p className="text-sm text-[#6f53a3]">
                    Resend OTP in{" "}
                    <span className="font-bold text-[#6869F9]">
                      {String(Math.floor(resendSeconds / 60)).padStart(2, "0")}:{String(resendSeconds % 60).padStart(2, "0")}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading || !otpPayload}
                    className="text-sm font-semibold text-[#6869F9] hover:underline disabled:cursor-not-allowed disabled:text-[#a288cf]"
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
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Submit"
                )}
              </button>

              <p className="text-center text-xs text-[#9b7ec8]">
                By proceeding, you agree to AstroVed&apos;s{" "}
                <Link href="/terms" className="font-semibold text-[#6869F9] hover:underline">
                  Terms and Conditions
                </Link>{" "}
                And{" "}
                <Link href="/privacy" className="font-semibold text-[#6869F9] hover:underline">
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
