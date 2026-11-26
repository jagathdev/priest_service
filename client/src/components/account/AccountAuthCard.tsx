"use client";

import React, { useState, useEffect } from "react";
import { Check, ShieldCheck, Clock, Loader2, ArrowRight } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useUser } from "@/contexts/UserContext";

export default function AccountAuthCard() {
  const { setUser } = useUser();
  const [directPhone, setDirectPhone] = useState("");
  const [directOtp, setDirectOtp] = useState("");
  const [directStep, setDirectStep] = useState<"phone" | "otp">("phone");
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState("");
  const [directResendTimer, setDirectResendTimer] = useState(30);
  const [directWaitTimer, setDirectWaitTimer] = useState(0);

  // Wait timer countdown for input step
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (directWaitTimer > 0) {
      interval = setInterval(() => {
        setDirectWaitTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [directWaitTimer]);

  // Direct login resend timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (directStep === "otp" && directResendTimer > 0) {
      interval = setInterval(() => {
        setDirectResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [directStep, directResendTimer]);

  const handleDirectSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = directPhone.replace(/\D/g, "");
    if (cleanNumber.length !== 10) {
      setDirectError("Please enter a valid 10-digit mobile number");
      return;
    }
    setDirectError("");
    setDirectOtp("");
    setDirectLoading(true);
    try {
      await authService.sendOtpLegacy({
        method: "whatsapp",
        country: { isoCode: "IN", dialCode: "+91", name: "India" } as any,
        number: cleanNumber,
      } as any);
      setDirectStep("otp");
      setDirectResendTimer(30);
      setDirectWaitTimer(0);
    } catch (err: any) {
      const msg = err.message || "";
      const match = msg.match(/wait (\d+) seconds/i);
      if (match) {
        setDirectWaitTimer(parseInt(match[1], 10));
        setDirectError("");
      } else {
        setDirectError(msg || "Failed to send OTP. Please try again.");
      }
    } finally {
      setDirectLoading(false);
    }
  };

  const handleDirectVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = directOtp.trim();
    if (cleanOtp.length !== 6) {
      setDirectError("Please enter the 6-digit OTP");
      return;
    }
    setDirectError("");
    setDirectLoading(true);
    try {
      const verifyRes = await authService.verifyOtpLegacy({
        method: "whatsapp",
        country: { isoCode: "IN", dialCode: "+91", name: "India" } as any,
        number: directPhone.replace(/\D/g, ""),
        otp: cleanOtp,
      } as any);

      if (verifyRes.data && verifyRes.data.user) {
        const u = verifyRes.data.user;
        const authToken = verifyRes.data.token || (verifyRes as any).token;
        if (authToken) {
          localStorage.setItem("token", authToken);
          document.cookie = `token=${authToken}; path=/; max-age=604800;`;
        }
        document.cookie = "userLogin=true; path=/; max-age=604800;";
        localStorage.setItem("mockUser", JSON.stringify(u));
        setUser(u);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setDirectError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setDirectLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 sm:my-12">
      <div className="bg-white rounded-3xl border border-stone-250 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-5">
        {/* Left Branding Panel (2 Cols) */}
        <div className="md:col-span-2 bg-[#FBF7F0] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#EADBCC] relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04] bg-center bg-no-repeat bg-contain z-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Ccircle cx='250' cy='250' r='240' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#980000] bg-[#980000]/10 px-3 py-1 rounded-full inline-block mb-3">
              Devotee Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] leading-tight mb-2">
              Sign In with Mobile
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed font-medium mb-6">
              Enter your WhatsApp mobile number to access your bookings, saved addresses, and sacred ritual updates.
            </p>
          </div>

          <div className="space-y-3.5 my-4 sm:my-6 relative z-10">
            <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              </div>
              <span>Book Poojas &amp; Homas with ease</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              </div>
              <span>Stay updated on your bookings</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              </div>
              <span>Personalized rituals for your family</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              </div>
              <span>Keep devotee details securely saved</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8DAC5] text-[11px] text-stone-500 flex items-center gap-1.5 relative z-10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Quick &amp; secure OTP login</span>
          </div>
        </div>

        {/* Right Form Side (3 Cols) */}
        <div className="md:col-span-3 p-5 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {directStep === "phone" ? "Sign In to Your Account" : "Verify OTP"}
            </h3>
            <p className="text-gray-500 text-xs mb-5 sm:mb-6">
              {directStep === "phone"
                ? "Enter your mobile number to receive a 6-digit one-time password."
                : `Enter the 6-digit verification code sent to +91 ${directPhone}.`}
            </p>

            {directError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{directError}</span>
              </div>
            )}

            {directWaitTimer > 0 && directStep === "phone" && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                <span>
                  Please wait <strong className="font-bold text-amber-950">{directWaitTimer}s</strong> before requesting another OTP.
                </span>
              </div>
            )}

            {directStep === "phone" ? (
              <form onSubmit={handleDirectSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex items-center rounded-xl border border-gray-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 overflow-hidden bg-white transition shadow-2xs">
                    <span className="px-2.5 sm:px-3.5 py-3 text-xs font-bold text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center gap-1 shrink-0 select-none">
                      <span>+91</span>
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={directPhone}
                      onChange={(e) => setDirectPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile number"
                      autoFocus
                      className="w-full min-w-0 px-3 py-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs sm:placeholder:text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={directLoading || directPhone.replace(/\D/g, "").length !== 10 || directWaitTimer > 0}
                  className="w-full bg-[#00B05F] hover:bg-[#009651] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition shadow-xs hover:shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {directLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : directWaitTimer > 0 ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Please wait {directWaitTimer}s</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-gray-400 text-center pt-2">
                  By continuing, you agree to Priest Services Terms &amp; Privacy Policy.
                </p>
              </form>
            ) : (
              <form onSubmit={handleDirectVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setDirectStep("phone");
                        setDirectOtp("");
                        setDirectError("");
                      }}
                      className="text-xs text-emerald-600 hover:underline font-bold"
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={directOtp}
                    onChange={(e) => setDirectOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    autoFocus
                    className="w-full px-4 py-3 text-center text-xl tracking-[0.4em] font-mono font-bold text-gray-900 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition shadow-2xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={directLoading || directOtp.trim().length !== 6}
                  className="w-full bg-[#00B05F] hover:bg-[#009651] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition shadow-xs hover:shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {directLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1 text-xs">
                  {directResendTimer > 0 ? (
                    <span className="text-gray-400 font-medium">Resend in {directResendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDirectSendOtp}
                      disabled={directLoading}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
