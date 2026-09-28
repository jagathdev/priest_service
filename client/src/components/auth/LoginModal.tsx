"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { DEFAULT_COUNTRY } from "@/lib/auth/countries";
import { authService } from "@/services/authService";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Step = "input" | "otp";
type Method = "whatsapp" | "email";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10,15}$/;
const RESEND_SECS = 60;

/* ─────────────────────────────────────────────
   AstroVed Logo — uses the real navbar logo
───────────────────────────────────────────── */
function AstroVedLogo() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
      <img
        src="/icons/Fav-Icon.png"
        alt="AstroVed"
        className="w-13 p-2 h-13 rounded-full flex items-center justify-center shadow-lg"

      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Props
───────────────────────────────────────────── */
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/* ─────────────────────────────────────────────
   Main Modal Component
───────────────────────────────────────────── */
export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  /* ── Location detection ── */
  const [method, setMethod] = useState<Method>("whatsapp");
  const [detecting, setDetecting] = useState(true);
  const [isIndian, setIsIndian] = useState(true);

  /* ── Input step ── */
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [inputLoading, setInputLoading] = useState(false);

  /* ── OTP step ── */
  const [step, setStep] = useState<Step>("input");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendSecs, setResendSecs] = useState(RESEND_SECS);

  const otpInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── GeoIP detect on mount ── */
  useEffect(() => {
    if (!isOpen) return;
    async function detect() {
      try {
        const res = await fetch("/api/auth/geoip");
        const data = await res.json();
        const country = data?.country ?? "IN";
        setIsIndian(country === "IN");
        setMethod(country === "IN" ? "whatsapp" : "email");
      } catch {
        setIsIndian(true);
        setMethod("whatsapp");
      } finally {
        setDetecting(false);
      }
    }
    detect();
  }, [isOpen]);

  /* ── Focus input when modal opens ── */
  useEffect(() => {
    if (isOpen && !detecting && step === "input") {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, detecting, step]);

  /* ── Focus first OTP box when step changes ── */
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpInputRef.current?.focus(), 80);
    }
  }, [step]);

  /* ── Resend countdown ── */
  useEffect(() => {
    if (step !== "otp" || resendSecs <= 0) return;
    const t = setTimeout(() => setResendSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendSecs]);

  /* ── Prevent body scroll ── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* ── Reset on close ── */
  function handleClose() {
    setStep("input");
    setInputValue("");
    setInputError("");
    setOtp("");
    setOtpError("");
    setResendSecs(RESEND_SECS);
    onClose();
  }

  const isInputValid = useMemo(() => {
    if (method === "email") return emailRegex.test(inputValue);
    return phoneRegex.test(inputValue.replace(/\D/g, ""));
  }, [method, inputValue]);

  /* ─── Step 1: send OTP ─── */
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setInputError("");
    setInputLoading(true);
    try {
      if (method === "email") {
        await authService.sendOtp({ method: "email", email: inputValue } as any);
      } else {
        const digits = inputValue.replace(/\D/g, "");
        await authService.sendOtp({
          method: "whatsapp",
          country: DEFAULT_COUNTRY,
          number: digits,
        });
      }
      setOtp("");
      setOtpError("");
      setResendSecs(RESEND_SECS);
      setStep("otp");
    } catch (err) {
      setInputError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setInputLoading(false);
    }
  }

  /* ─── OTP state uses single string, no change handlers needed here ─── */

  /* ─── Step 2: verify OTP ─── */
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.trim();
    if (code.length < 4) { setOtpError("Enter the OTP sent to your number"); return; }
    setOtpError("");
    setOtpLoading(true);
    try {
      const payload =
        method === "email"
          ? { method: "email" as const, email: inputValue, otp: code }
          : {
            method: "whatsapp" as const,
            country: DEFAULT_COUNTRY,
            number: inputValue.replace(/\D/g, ""),
            otp: code,
          };
      await authService.verifyOtp(payload as any);
      handleClose();
      if (onSuccess) onSuccess();
      else window.location.reload();
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  }

  /* ─── Resend OTP ─── */
  async function handleResend() {
    if (resendSecs > 0) return;
    setOtpError("");
    setOtpLoading(true);
    try {
      if (method === "email") {
        await authService.resendOtp({ method: "email", email: inputValue } as any);
      } else {
        await authService.resendOtp({
          method: "whatsapp",
          country: DEFAULT_COUNTRY,
          number: inputValue.replace(/\D/g, ""),
        });
      }
      setOtp("");
      setResendSecs(RESEND_SECS);
      setTimeout(() => otpInputRef.current?.focus(), 80);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Could not resend OTP");
    } finally {
      setOtpLoading(false);
    }
  }

  if (!isOpen) return null;

  /* ─────────── RENDER ─────────── */
  const BLUE = "#6869F9";
  const BLUE_DARK = "#4546d4";

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(3px)",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Modal card — clean single-column layout */}
      <div className="relative flex flex-col items-center w-full max-w-[440px] min-h-[380px] rounded-2xl overflow-hidden bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] animate-[modalIn_0.22s_ease] p-6 sm:p-8">

        {/* ── Main white content ── */}
        <div className="flex flex-col items-center w-full relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="Close login"
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: "#f0f0f0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "#555",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            ✕
          </button>

          {/* Logo */}
          <AstroVedLogo />

          {/* ══ STEP 1 — Input ══ */}
          {step === "input" && (
            <>
              <h1
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  margin: "16px 0 4px",
                  textAlign: "center",
                  lineHeight: 1.35,
                }}
              >
                {detecting
                  ? "Loading..."
                  : isIndian
                    ? "Login to check your booking"
                    : "Login to continue your booking"}
              </h1>
              <p style={{ fontSize: 13, color: "#666", textAlign: "center", margin: "0 0 18px", lineHeight: 1.5 }}>
                {detecting
                  ? ""
                  : isIndian
                    ? "Please login with the same number that you have used for booking."
                    : "All booking updates will be sent on the logged-in email"}
              </p>

              {detecting ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: `3px solid ${BLUE}`,
                      borderTopColor: "transparent",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                </div>
              ) : (
                <form onSubmit={handleSendOtp} style={{ width: "100%" }}>
                  {/* Input field */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1.5px solid #ddd",
                      borderRadius: 8,
                      padding: "10px 14px",
                      background: "#fff",
                      marginBottom: 6,
                      gap: 8,
                    }}
                  >
                    {isIndian && (
                      <>
                        {/* Indian flag image */}
                        <img
                          src="/images/flag.png"
                          alt="India Flag"
                          style={{ width: 24, height: 16, objectFit: "cover", borderRadius: 2 }}
                        />
                        <span style={{ color: "#444", fontWeight: 500, fontSize: 15, userSelect: "none" }}>+91</span>
                        <div style={{ width: 1, height: 20, background: "#ddd" }} />
                      </>
                    )}
                    <input
                      ref={inputRef}
                      id="login-modal-input"
                      type={isIndian ? "tel" : "email"}
                      inputMode={isIndian ? "numeric" : "email"}
                      value={inputValue}
                      onChange={(e) => {
                        if (!isIndian) {
                          setInputValue(e.target.value);
                          return;
                        }
                        let digits = e.target.value.replace(/\D/g, "");
                        if ((digits.startsWith("91") && digits.length > 10) || digits.length === 12) {
                          digits = digits.slice(2);
                        }
                        setInputValue(digits.slice(0, 10));
                      }}
                      placeholder={isIndian ? "" : "Enter your email"}
                      maxLength={isIndian ? 16 : undefined}
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        fontSize: 15,
                        color: "#222",
                        background: "transparent",
                        fontFamily: "inherit",
                      }}
                      autoComplete={isIndian ? "tel" : "email"}
                    />
                  </div>

                  {inputError && (
                    <p style={{ color: "#e53935", fontSize: 12, margin: "4px 0 8px", textAlign: "center" }}>
                      {inputError}
                    </p>
                  )}

                  {/* Terms */}
                  <p style={{ fontSize: 12, color: "#888", margin: "10px 0 16px", lineHeight: 1.5 }}>
                    By proceeding you agree to the{" "}
                    <Link href="/terms" style={{ color: BLUE }} onClick={handleClose}>
                      Terms &amp; Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" style={{ color: BLUE }} onClick={handleClose}>
                      Privacy Policy
                    </Link>{" "}
                    of AstroVed
                  </p>

                  {/* Login button */}
                  <button
                    id="login-modal-submit"
                    type="submit"
                    disabled={!isInputValid || inputLoading}
                    style={{
                      width: "100%",
                      padding: "13px",
                      borderRadius: 8,
                      border: "none",
                      background: isInputValid && !inputLoading ? "#6772eaff" : "#91a2eeff",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: isInputValid && !inputLoading ? "pointer" : "not-allowed",
                      fontFamily: "inherit",
                      transition: "background 0.2s",
                    }}
                  >
                    {inputLoading ? "Sending OTP..." : "login"}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ══ STEP 2 — OTP ══ */}
          {step === "otp" && (
            <>
              <h1
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  margin: "16px 0 4px",
                  textAlign: "center",
                }}
              >
                Enter the OTP
              </h1>
              <p style={{ fontSize: 13, color: "#666", textAlign: "center", margin: "0 0 4px" }}>
                {isIndian
                  ? `OTP sent to +91 ${inputValue}`
                  : `OTP sent to ${inputValue}`}
              </p>
              <button
                type="button"
                onClick={() => setStep("input")}
                style={{ background: "none", border: "none", color: BLUE, fontSize: 13, cursor: "pointer", marginBottom: 16, fontWeight: 600 }}
              >
                Change {isIndian ? "number" : "email"}
              </button>

              <form onSubmit={handleVerifyOtp} style={{ width: "100%" }}>
                {/* Single OTP box */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <input
                    ref={otpInputRef}
                    id="otp-box-single"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter OTP"
                    style={{
                      width: "100%",
                      maxWidth: 240,
                      height: 48,
                      textAlign: "center",
                      fontSize: 20,
                      fontWeight: 700,
                      border: `1.5px solid ${BLUE}`,
                      borderRadius: 8,
                      outline: "none",
                      color: "#1a1a2e",
                      background: "#f0efff",
                      fontFamily: "inherit",
                      transition: "border-color 0.15s, background 0.15s",
                      padding: "0 16px",
                      letterSpacing: "4px",
                    }}
                  />
                </div>

                {/* Resend */}
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  {resendSecs > 0 ? (
                    <span style={{ fontSize: 13, color: "#888" }}>
                      Resend OTP in{" "}
                      <span style={{ color: BLUE, fontWeight: 700 }}>
                        {String(Math.floor(resendSecs / 60)).padStart(2, "0")}:{String(resendSecs % 60).padStart(2, "0")}
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={otpLoading}
                      style={{ background: "none", border: "none", color: BLUE, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                {otpError && (
                  <p style={{ color: "#e53935", fontSize: 12, textAlign: "center", marginBottom: 8 }}>{otpError}</p>
                )}

                {/* Submit button */}
                <button
                  id="otp-modal-submit"
                  type="submit"
                  disabled={otp.length < 4 || otpLoading}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      otp.length >= 4 && !otpLoading
                        ? `linear-gradient(135deg,${BLUE},${BLUE_DARK})`
                        : "#c4c3f8",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: otp.length >= 4 && !otpLoading ? "pointer" : "not-allowed",
                    fontFamily: "inherit",
                    transition: "background 0.2s",
                  }}
                >
                  {otpLoading ? "Verifying..." : "Submit"}
                </button>

                {/* Terms */}
                <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
                  By proceeding, you agree to AstroVed&apos;s{" "}
                  <Link href="/terms" style={{ color: BLUE }} onClick={handleClose}>Terms and Conditions</Link>
                  {" "}And{" "}
                  <Link href="/privacy" style={{ color: BLUE }} onClick={handleClose}>Privacy Policy</Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 520px) {
          .hidden-mobile-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
