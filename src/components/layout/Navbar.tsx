"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/contexts/LanguageContext";
import LoginModal from "@/components/auth/LoginModal";

// ── Sri Mandir–style account panel component ─────────────────────────────
const AccountPanel = ({ accountOpen, setAccountOpen, user, setLoginModalOpen, handleLogout, t }: any) => {
  if (!accountOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end text-left">
      {/* Dark Overlay - touch-none prevents background scroll on mobile */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity touch-none"
        onClick={() => setAccountOpen(false)}
      />

      {/* Sidebar Drawer */}
      <div className="relative w-[340px] max-w-[85vw] h-full bg-white shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out]">

        {/* Close Button */}
        <button
          onClick={() => setAccountOpen(false)}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        <div className="flex-1 overflow-y-auto pb-10 pt-2 overscroll-contain">
          {/* Login / User header */}
          {!user ? (
            <div className="px-5 py-6 border-b border-gray-100">
              <p className="text-[13px] text-gray-500 font-medium mb-3 pr-8">
                To check all available pujas &amp; offers:
              </p>
              <button
                onClick={() => { setAccountOpen(false); setLoginModalOpen(true); }}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[15px] font-bold py-3.5 rounded-xl transition-colors"
              >
                Login / Create an account
              </button>
            </div>
          ) : (
            <div className="px-5 py-6 border-b border-gray-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#6869F9] flex items-center justify-center text-white font-bold text-sm uppercase shrink-0">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-[13px] text-gray-400">Namaste 🙏</p>
                <p className="text-[15px] font-bold text-gray-900 pr-8 line-clamp-1">{user.name}</p>
              </div>
            </div>
          )}

          {/* Account Details */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="px-2 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">Account Details</p>
            {[
              { href: user ? "/profile" : "#", label: "My profile", icon: <PersonIcon /> },
              { href: user ? "/bookings/puja" : "#", label: "My Puja Bookings", icon: <BookingIcon /> },
              { href: user ? "/bookings/chadhava" : "#", label: "My Chadhava Bookings", icon: <BookingIcon /> },
              { href: user ? "/puja" : "#", label: "Book a Puja", icon: <FlameIcon />, badge: "New" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={!user ? (e) => { e.preventDefault(); setAccountOpen(false); setLoginModalOpen(true); } : undefined}
                className="flex items-center justify-between px-3 py-3.5 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 w-5 flex justify-center">{item.icon}</span>
                  <span className="text-[14px] font-semibold text-gray-700">{item.label}</span>
                  {item.badge && <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{item.badge}</span>}
                </div>
                <ChevronRight />
              </Link>
            ))}
          </div>

          {/* Explore AstroVed Services */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="px-2 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Explore AstroVed Services
            </p>
            {[
              { href: "/dashboard", label: "Home", icon: <HomeIcon /> },
              { href: "/panchang", label: "Panchang", icon: <CalendarIcon /> },
              { href: "/puja", label: "Puja Seva", icon: <FlameIcon />, badge: "New" },
              { href: "/chadhava", label: "Chadhava Seva", icon: <BowlIcon />, badge: "New" },
              { href: "/library", label: "Library", icon: <BookIcon /> },
              { href: "/temples", label: "Temples of India", icon: <TempleIcon /> },
              { href: "/astro-tools", label: "Astro Tools", icon: <StarIcon /> },
              { href: "https://AstroVed-tau.vercel.app/", label: "Store", icon: <StoreIcon />, badge: "New", external: true },
            ].map((item) => (
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-3.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 w-5 flex justify-center">{item.icon}</span>
                    <span className="text-[14px] font-semibold text-gray-700">{item.label}</span>
                    {item.badge && <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{item.badge}</span>}
                  </div>
                  <ChevronRight />
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center justify-between px-3 py-3.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 w-5 flex justify-center">{item.icon}</span>
                    <span className="text-[14px] font-semibold text-gray-700">{item.label}</span>
                    {item.badge && <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{item.badge}</span>}
                  </div>
                  <ChevronRight />
                </Link>
              )
            ))}
          </div>

          {/* Help & Support */}
          <div className="px-3 pb-3 border-t border-gray-100 pt-2">
            <p className="px-2 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">Help &amp; Support for Puja Booking</p>
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-2">
              <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-green-600"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">+91 96773 91108</p>
                <p className="text-[11px] text-gray-400">You can call us from 10:30 AM - 7:30 PM</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a href="mailto:support@astroved.com" className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors text-[13px] font-bold text-gray-700">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-red-500"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
                Email us
              </a>
              <a href="https://wa.me/9677391109" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors text-[13px] font-bold text-gray-700">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-green-500"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="currentColor" opacity=".8" /></svg>
                Whatsapp us
              </a>
            </div>

            {user && (
              <button
                onClick={handleLogout}
                className="mt-2 w-full py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" className="inline h-4 w-4 mr-2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {t("account.logout")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

type SupportedLanguage = "en" | "hi" | "ta" | "te" | "kn";

// All nav items (used in desktop nav only)
const navKeys = [
  { key: "home", path: "/dashboard" },
  { key: "puja", path: "/puja" },
  { key: "chadhava", path: "/chadhava" },
  { key: "panchang", path: "/panchang" },
  { key: "temples", path: "/temples" },
  { key: "library", path: "/library" },
  { key: "astroTools", path: "/astro-tools" },
  { key: "store", path: "https://AstroVed-tau.vercel.app/", external: true },
];

const languageFullNames: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
  ta: "தமிழ்",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ",
};

export default function Navbar() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useTranslation();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close account panel on route change
  useEffect(() => { setAccountOpen(false); }, [pathname]);

  // Lock body scroll when panel is open
  useEffect(() => {
    if (accountOpen || langOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [accountOpen, langOpen]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.authenticated) setUser(d.user); else setUser(null); })
      .catch(() => setUser(null));
  }, [pathname]);

  const isActivePath = (path: string) =>
    pathname === path || (path !== "/dashboard" && pathname?.startsWith(path + "/"));

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/dashboard";
  };

  const handleLoginSuccess = () => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.authenticated) setUser(d.user); })
      .catch(() => { });
  };

  const isFullLanguagePage =
    pathname === "/" || pathname === "/dashboard" ||
    pathname === "/puja" || pathname?.startsWith("/puja/");

  const languageCodes = isFullLanguagePage
    ? ["en", "hi", "ta", "te", "kn"]
    : ["en", "hi"];


  return (
    <>
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} onSuccess={handleLoginSuccess} />

      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4.5 sm:px-6 lg:px-10">

          {/* ── Logo ── */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0" aria-label="AstroVed Home">
            <img src="/images/logo.svg" alt="AstroVed" className="h-9 sm:h-10 lg:h-12 w-auto object-contain" />
          </Link>

          {/* ── Desktop Nav (lg+) ── */}
          <nav aria-label="Main navigation" className="hidden lg:flex flex-1 justify-center">
            <ul className="flex items-center gap-8 xl:gap-10 text-base xl:text-[17px] font-bold text-[#1a1a1a]">
              <li>
                <Link href="/dashboard" className={isActivePath("/dashboard") ? "text-[#069e5d] font-extrabold border-b-2 border-[#069e5d] pb-1" : "transition-colors hover:text-[#069e5d] uppercase"}>
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/puja" className={isActivePath("/puja") ? "text-[#069e5d] font-extrabold border-b-2 border-[#069e5d] pb-1" : "transition-colors hover:text-[#069e5d] uppercase"}>
                  PUJA
                </Link>
              </li>
              <li>
                <Link href="/chadhava" className={isActivePath("/chadhava") ? "text-[#069e5d] font-extrabold border-b-2 border-[#069e5d] pb-1" : "transition-colors hover:text-[#069e5d] uppercase"}>
                  SEVAS
                </Link>
              </li>
              <li>
                <button onClick={() => setAccountOpen(true)} className="uppercase transition-colors hover:text-[#069e5d]">
                  ACCOUNT
                </button>
              </li>
            </ul>
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-3 sm:gap-5">

            {/* WhatsApp Button */}
            <a href="https://wa.me/9677391109" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full border-2 border-[#069e5d] hover:bg-green-50 active:scale-95 transition-all shadow-sm">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#069e5d]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
              <div className="flex flex-col text-left leading-none">
                <span className="text-xs text-gray-500 font-medium">Need Help?</span>
                <span className="text-sm font-extrabold text-[#069e5d] mt-0.5">WhatsApp</span>
              </div>
            </a>

            {/* Language pill */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => { setLangOpen((p) => !p); setAccountOpen(false); }}
                className="flex items-center gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-full border-2 border-[#069e5d] bg-white text-[#069e5d] text-base font-bold hover:bg-green-50 active:scale-95 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{languageFullNames[language] || "English"}</span>
                <svg className={`w-4 h-4 transition-transform ${langOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 mt-2 z-90 bg-white rounded-xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.12)] overflow-hidden min-w-[140px]">
                  <div className="py-1">
                    {languageCodes.map((code) => (
                      <button
                        key={code}
                        onClick={() => { setLanguage(code as SupportedLanguage); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${language === code ? "text-green-600 bg-green-50 font-bold" : "text-gray-700 hover:bg-gray-50 font-medium"}`}
                      >
                        {languageFullNames[code]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <AccountPanel
              accountOpen={accountOpen}
              setAccountOpen={setAccountOpen}
              user={user}
              setLoginModalOpen={setLoginModalOpen}
              handleLogout={handleLogout}
              t={t}
            />
          </div>
        </div>
      </header>
    </>
  );
}

// ── Small SVG helpers 
function ChevronRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-gray-300 shrink-0">
      <path d="M7.5 4.5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PersonIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" /><path d="M5 19a7 7 0 0114 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
}
function BookingIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function StoreIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
}
function HomeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function FlameIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function BowlIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M4 10h16M3 14h18M5 18h14M8 22h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function BookIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function TempleIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M12 2L2 12h3v8h14v-8h3L12 2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 22V12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function StarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
