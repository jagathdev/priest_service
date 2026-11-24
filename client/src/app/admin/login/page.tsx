"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {

  Eye,
  EyeOff,
  Loader2,
  ClipboardList,
  PackageCheck,
  Users2,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { adminService } from "@/services/admin.service";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if already authenticated via cookie
  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
      if (match && match[1]) {
        router.push("/admin");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await adminService.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (data.success || data.token) {
        const token = data.token || "";
        // Store in Http-compatible adminToken cookie (1 day)
        document.cookie = `adminToken=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
        try {
          localStorage.removeItem("adminToken");
        } catch { }

        window.location.href = "/admin";
        return;
      }

      setError(data.message || "Invalid administrative credentials.");
    } catch (err: any) {
      console.error("Admin login error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please verify your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto lg:h-screen lg:w-screen lg:overflow-hidden flex items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-[#eaf2ed] via-[#f2f7f4] to-[#e4ede8] select-none">

      {/* Subtle Ambient Decorative Blobs */}
      <div className="fixed top-1/4 -left-20 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-20 right-1/4 w-96 h-96 rounded-full bg-[#00A859]/10 blur-3xl pointer-events-none" />

      {/* Main Single Card Container: allows vertical scroll on mobile/tablet screens while maintaining seamless fit on desktop */}
      <div className="relative z-10 w-full max-w-[960px] lg:max-h-[92vh] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white/80 p-3 sm:p-4 flex flex-col md:flex-row items-stretch gap-3 md:gap-4 my-auto">

        {/* LEFT COLUMN: Premium Emerald Panel */}
        <div className="w-full md:w-[48%] lg:w-[50%] rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-[#00A859] via-[#008f4c] to-[#014f2b] p-5 sm:p-6 lg:p-7 text-white flex flex-col justify-between relative overflow-hidden shrink-0 shadow-md">

          {/* Glassmorphic Background Rings */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-emerald-300/10 blur-2xl pointer-events-none" />

          {/* Top: Official Priest Services Logo Badge + Sacred Om */}
          <div className="relative z-10 flex items-center justify-between gap-3 mb-2 md:mb-0">
            <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-xs border border-white/40 flex items-center">
              <Image
                src="/images/admin/priest-services-logo.png"
                alt="Priest Services Logo"
                width={190}
                height={45}
                priority
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>

            <span className="text-amber-200/90 text-xl font-serif select-none">ॐ</span>
          </div>

          {/* Center Heading Section (Exact Requested Copy) */}
          <div className="relative z-10 my-1 md:my-auto py-1 space-y-1">
            <span className="text-[11px] font-bold text-amber-200 tracking-wider uppercase">
              Welcome to
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-[1.7rem] font-black tracking-tight leading-tight text-white">
              Priest Services Admin Portal
            </h1>
            <p className="text-[11px] sm:text-xs text-emerald-50/90 leading-relaxed font-normal">
              Manage your complete Puja &amp; Homa booking operations from one powerful dashboard.
            </p>
            <div className="pt-0.5">
              <span className="text-[10px] font-bold text-amber-300/90 tracking-wide">
                Your Centralized Management Platform
              </span>
            </div>
          </div>

          {/* 4 Chosen Core Operations (Single-line rounded pill capsules with clean vector icons) */}
          <div className="relative z-10 space-y-2 pt-2 border-t border-white/15">
            {/* 1. Puja & Homa Management */}
            <div className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 px-3.5 py-2 sm:py-2.5 rounded-xl backdrop-blur-xs transition">
              <ClipboardList className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="text-xs font-semibold text-white truncate">
                Puja &amp; Homa Management
              </span>
            </div>

            {/* 2. Orders & Booking Management */}
            <div className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 px-3.5 py-2 sm:py-2.5 rounded-xl backdrop-blur-xs transition">
              <PackageCheck className="w-4 h-4 text-emerald-200 shrink-0" />
              <span className="text-xs font-semibold text-white truncate">
                Orders &amp; Booking Management
              </span>
            </div>

            {/* 3. Customer & User Management */}
            <div className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 px-3.5 py-2 sm:py-2.5 rounded-xl backdrop-blur-xs transition">
              <Users2 className="w-4 h-4 text-sky-200 shrink-0" />
              <span className="text-xs font-semibold text-white truncate">
                Customer &amp; User Management
              </span>
            </div>

            {/* 4. Revenue & Business Reports */}
            <div className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 px-3.5 py-2 sm:py-2.5 rounded-xl backdrop-blur-xs transition">
              <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-white truncate">
                Revenue &amp; Business Reports
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Modern White Login Panel */}
        <div className="w-full md:w-[52%] lg:w-[50%] px-4 sm:px-8 lg:px-9 py-5 sm:py-7 flex flex-col justify-center my-auto">

          {/* Header with Circular Temple Gopuram Crest */}
          <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-100 to-emerald-50 border border-emerald-200/80 flex items-center justify-center mb-2.5 shadow-xs">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-[#00A859]"
              >
                <path d="M12 2L15 7H9L12 2Z" fill="currentColor" fillOpacity="0.3" />
                <path d="M7 7H17V10H7V7Z" />
                <path d="M5 10H19V14H5V10Z" />
                <path d="M3 14H21V22H3V14Z" />
                <path d="M10 22V16H14V22" />
              </svg>
            </div>

            <span className="text-[11px] font-extrabold tracking-widest text-[#00A859] uppercase mb-0.5">
              Priest Services
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Please enter your admin credentials to access your account
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200/90 rounded-xl text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:border-[#00A859] focus:ring-2 focus:ring-[#00A859]/20 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 sm:py-3 pr-10 bg-gray-50 border border-gray-200/90 rounded-xl text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:border-[#00A859] focus:ring-2 focus:ring-[#00A859]/20 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00A859] p-1 rounded-md transition cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00A859] to-[#008f4c] hover:from-[#008f4c] hover:to-[#046c3b] active:scale-[0.99] text-white text-sm font-extrabold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Security Badge */}
          <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-center gap-1.5 text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-medium">
              Secure Administrative Control Center • Priest Services
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
