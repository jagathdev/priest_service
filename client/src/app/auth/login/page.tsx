"use client";

import LoginMethods from "@/components/auth/LoginMethods";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #f3f0ff 0%, #eae8ff 50%, #f0f4ff 100%)" }}>
      {/* Decorative Background Elements — AstroVed Blue Theme */}
      <div
        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #6869F9 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #4546d4 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #F47820 0%, transparent 60%)" }}
      />

      <div className="relative z-10 w-full max-w-2xl px-4 py-12 flex justify-center items-center">
        <LoginMethods />
      </div>

      {/* Subtle Bottom Pattern */}
      <div className="absolute bottom-10 left-10 opacity-10 pointer-events-none">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="58" stroke="#6869F9" strokeWidth="2" strokeDasharray="10 10" />
          <circle cx="60" cy="60" r="40" stroke="#6869F9" strokeWidth="1" />
          <path d="M60 20V40M60 80V100M20 60H40M80 60H100" stroke="#6869F9" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute top-10 right-10 opacity-10 pointer-events-none">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" stroke="#F47820" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="40" cy="40" r="24" stroke="#F47820" strokeWidth="1" />
        </svg>
      </div>
    </main>
  );
}
