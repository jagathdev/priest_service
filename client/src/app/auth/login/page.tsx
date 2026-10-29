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
    </main>
  );
}
