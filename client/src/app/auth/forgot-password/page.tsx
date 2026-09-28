"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#fdfaff] overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] rounded-full bg-linear-to-br from-[#ede8ff] to-transparent opacity-60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-[600px] h-[600px] rounded-full bg-linear-to-tr from-[#e8e0ff] to-transparent opacity-50 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-xl px-4 py-12">
        <div className="w-full rounded-3xl border border-[#ddcff9] bg-white/95 p-10 shadow-[0_30px_90px_rgba(91,33,182,0.22)] backdrop-blur sm:p-12">
          {!submitted ? (
            <>
              <h1 className="text-center text-4xl font-semibold tracking-tight text-[#2e1b53]">Reset Password</h1>
              <p className="mt-3 text-center text-base text-[#6a4e95]">Enter your email to receive a reset link.</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#5a3b8a]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="mt-2 w-full rounded-xl border border-[#d8c9fb] bg-[#faf8ff] px-4 py-3 text-base text-[#342151] outline-none placeholder:text-[#a288cf] focus:border-[#6869F9] focus:ring-2 focus:ring-[#e0dcff] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-linear-to-r from-[#6869F9] to-[#5657e8] px-4 py-3.5 text-base font-semibold text-white shadow-[0_10px_24px_rgba(104,105,249,0.35)] transition-all hover:brightness-110"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mt-6 text-3xl font-semibold text-[#2e1b53]">Check your email</h1>
              <p className="mt-3 text-base text-[#6a4e95]">
                We've sent a password reset link to <span className="font-semibold">{email}</span>.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-8 text-sm font-medium text-[#000000] hover:underline"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-[#6f53a3]">
            Back to{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[#000000] underline decoration-[#9898ff] underline-offset-4 transition-colors duration-300 hover:text-[#4647c4]"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}


