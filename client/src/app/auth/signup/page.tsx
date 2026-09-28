"use client";

import Link from "next/link";
import { useState } from "react";
import { DEFAULT_COUNTRY } from "@/lib/auth/countries";
import CountryPhoneField from "@/components/auth/CountryPhoneField";
import type { CountryOption } from "@/types/auth";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    isWhatsappNumber: false,
    password: "",
    confirmPassword: "",
  });
  const [country, setCountry] = useState<CountryOption>(DEFAULT_COUNTRY);

  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePhone = (phone: string, dialCode: string) => {
    if (!phone) return "Mobile number is required";
    const maxLen = dialCode === "91" ? 10 : 15;
    const minLen = dialCode === "91" ? 10 : 7;
    if (phone.length < minLen || phone.length > maxLen) {
      return dialCode === "91"
        ? "Please enter a valid 10-digit Indian mobile number"
        : `Please enter a valid mobile number (${minLen}–${maxLen} digits)`;
    }
    if (dialCode === "91" && !/^[6-9]/.test(phone)) {
      return "Indian mobile numbers must start with 6, 7, 8, or 9";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPhoneTouched(true);

    const pErr = validatePhone(formData.phone, country.dialCode);
    if (pErr) {
      setPhoneError(pErr);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country,
          isWhatsappNumber: formData.isWhatsappNumber,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      // Redirect to login on success
      window.location.href = "/auth/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#fdfaff] overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] rounded-full bg-linear-to-br from-[#ede8ff] to-transparent opacity-60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-[600px] h-[600px] rounded-full bg-linear-to-tr from-[#e8e0ff] to-transparent opacity-50 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl px-4 py-10">
        <div className="w-full rounded-3xl border border-[#ddcff9] bg-white/95 px-6 py-8 shadow-[0_24px_70px_rgba(91,33,182,0.18)] backdrop-blur sm:px-10 sm:py-10">
          <h1 className="text-center text-4xl font-semibold tracking-tight text-[#2e1b53]">Create Account</h1>
          <p className="mt-3 text-center text-base text-[#6a4e95]">Join AstroVed to explore sacred traditions.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#5a3b8a]">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter your first name"
                  className="mt-2 h-12 w-full rounded-xl border border-[#d8c9fb] bg-[#fcfaff] px-4 text-base text-[#342151] outline-none placeholder:text-[#a288cf] focus:border-[#F47820] focus:ring-2 focus:ring-[#ddd1ff] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5a3b8a]">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter your last name"
                  className="mt-2 h-12 w-full rounded-xl border border-[#d8c9fb] bg-[#fcfaff] px-4 text-base text-[#342151] outline-none placeholder:text-[#a288cf] focus:border-[#F47820] focus:ring-2 focus:ring-[#ddd1ff] transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5a3b8a]">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="mt-2 h-12 w-full rounded-xl border border-[#d8c9fb] bg-[#fcfaff] px-4 text-base text-[#342151] outline-none placeholder:text-[#a288cf] focus:border-[#F47820] focus:ring-2 focus:ring-[#ddd1ff] transition-all"
                />
              </div>

              <div>
                <CountryPhoneField
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(phone) => {
                    setFormData({ ...formData, phone });
                    if (phoneTouched) {
                      setPhoneError(validatePhone(phone, country.dialCode));
                    }
                  }}
                  country={country}
                  onCountryChange={(newCountry) => {
                    setCountry(newCountry);
                    if (phoneTouched) {
                      setPhoneError(validatePhone(formData.phone, newCountry.dialCode));
                    }
                  }}
                  placeholder="Enter mobile number"
                />
                {phoneTouched && phoneError && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                    </svg>
                    {phoneError}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-[#6a4e95]">
                <input
                  type="checkbox"
                  checked={formData.isWhatsappNumber}
                  onChange={(e) => setFormData({ ...formData, isWhatsappNumber: e.target.checked })}
                  className="h-4 w-4 rounded border-[#8d849c] accent-[#1f1f1f]"
                />
                This is also my WhatsApp number
              </label>

              <div>
                <label className="block text-sm font-medium text-[#5a3b8a]">Password</label>
                <div className="relative mt-2 flex items-center rounded-xl border border-[#d8c9fb] bg-[#fcfaff] px-4 transition-all duration-300 focus-within:border-[#F47820] focus-within:ring-2 focus-within:ring-[#ddd1ff]">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a password"
                    className="h-12 w-full bg-transparent text-base text-[#342151] outline-none placeholder:text-[#a288cf] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-[#a288cf] hover:text-[#5a3b8a] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5a3b8a]">Confirm Password</label>
                <div className="relative mt-2 flex items-center rounded-xl border border-[#d8c9fb] bg-[#fcfaff] px-4 transition-all duration-300 focus-within:border-[#F47820] focus-within:ring-2 focus-within:ring-[#ddd1ff]">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="h-12 w-full bg-transparent text-base text-[#342151] outline-none placeholder:text-[#a288cf] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 p-1 text-[#a288cf] hover:text-[#5a3b8a] transition-colors"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 h-12 w-full rounded-xl bg-linear-to-r from-[#F47820] via-[#1f1f1f] to-[#F47820] px-4 text-base font-semibold text-white shadow-[0_12px_28px_rgba(104,105,249,0.22)] transition-all hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6f53a3]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[#000000] underline decoration-[#9898ff] underline-offset-4 transition-colors duration-300 hover:text-[#4647c4]"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Subtle Pattern */}
      <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="58" stroke="#1f1f1f" strokeWidth="2" strokeDasharray="10 10" />
          <path d="M60 20L65 55L100 60L65 65L60 100L55 65L20 60L55 55L60 20Z" fill="#1f1f1f" />
        </svg>
      </div>
    </main>
  );
}


