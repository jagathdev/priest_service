"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/contexts/LanguageContext";
import LoginModal from "@/components/auth/LoginModal";
import { useUser } from "@/contexts/UserContext";

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
              { href: user ? "/account" : "#", label: "My profile", icon: <PersonIcon /> },
              { href: user ? "/bookings/puja" : "#", label: "My Puja Bookings", icon: <BookingIcon /> },
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
              { href: "/puja", label: "Puja Seva", icon: <FlameIcon />, badge: "New" },
              { href: "/homa", label: "Homa Seva", icon: <FlameIcon />, badge: "New" },
            ].map((item) => (
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
  { key: "homa", path: "/homa" },
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
  const { user, setUser } = useUser();
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
    if (typeof window !== "undefined") {
      const isUserLogin = document.cookie.includes("userLogin=true");
      if (!isUserLogin) {
        setUser(null);
      }
    }
  }, [pathname, setUser]);

  const isActivePath = (path: string) =>
    pathname === path || (path === "/" && pathname === "/dashboard") || (path === "/dashboard" && pathname === "/") || (path !== "/" && path !== "/dashboard" && pathname?.startsWith(path + "/"));

  const handleLogout = async () => {
    document.cookie = "userLogin=false; path=/; max-age=0;";
    setUser(null);
    window.location.href = "/";
  };

  const handleLoginSuccess = () => {
    // User Context is updated by LoginModal directly
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
        <div className="mx-auto flex max-w-[1350px] items-center justify-between px-4 py-3 sm:py-3.5 sm:px-6 lg:px-10 xl:py-5.5">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="AstroVed Home">
            <img src="https://cdn.astroved.com/images/priestservice/priest-services.jpg" alt="AstroVed" className="h-9 sm:h-10 lg:h-11 w-auto object-contain" />
          </Link>

          {/* ── Desktop Nav (lg+) ── */}
          <nav aria-label="Main navigation" className="hidden lg:flex flex-1 justify-center">
            <ul className="flex items-center gap-10 xl:gap-12 text-base xl:text-[17px] font-bold text-[#1a1a1a] tracking-wider">
              <li>
                <Link href="/" className={isActivePath("/") ? "text-[#F47820] font-extrabold border-b-2 border-[#F47820] pb-1" : "transition-colors hover:text-[#F47820] uppercase"}>
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/puja" className={isActivePath("/puja") ? "text-[#F47820] font-extrabold border-b-2 border-[#F47820] pb-1" : "transition-colors hover:text-[#F47820] uppercase"}>
                  PUJA
                </Link>
              </li>
              {/* <li>
                <Link href="/homa" className={isActivePath("/homa") ? "text-[#F47820] font-extrabold border-b-2 border-[#F47820] pb-1" : "transition-colors hover:text-[#F47820] uppercase"}>
                  HOMAS
                </Link>
              </li> */}
              <li>
                <Link href="/account" className={isActivePath("/account") || isActivePath("/profile") ? "text-[#F47820] font-extrabold border-b-2 border-[#F47820] pb-1" : "transition-colors hover:text-[#F47820] uppercase"}>
                  ACCOUNT
                </Link>
              </li>
            </ul>
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2.5 sm:gap-4">

            {/* Desktop / Tablet WhatsApp Button */}
            <a
              href="https://wa.me/9677391109"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center justify-center gap-2.5 w-[140px] sm:w-[160px] h-10 sm:h-12 rounded-full border-2 border-[#F47820] hover:bg-orange-50 active:scale-95 transition-all shadow-sm shrink-0"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#F47820]" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.285-.143-1.688-.833-1.949-.929-.261-.095-.451-.143-.641.143-.19.285-.736.929-.903 1.118-.166.19-.332.214-.618.071-.285-.143-1.206-.444-2.298-1.418-.85-.758-1.424-1.694-1.59-1.979-.166-.285-.018-.439.125-.581.128-.128.285-.333.428-.499.143-.166.19-.285.285-.476.095-.19.047-.357-.024-.499-.071-.143-.641-1.546-.879-2.117-.232-.557-.468-.48-.642-.489-.166-.008-.356-.008-.546-.008-.19 0-.499.071-.76.356-.261.285-.998.976-.998 2.38 0 1.403 1.022 2.759 1.164 2.949.143.19 2.013 3.074 4.877 4.31.682.295 1.214.471 1.629.603.684.218 1.307.187 1.8.118.549-.083 1.688-.69 1.925-1.356.237-.666.237-1.236.166-1.356-.071-.119-.261-.19-.546-.333z" /></svg>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Need Help?</span>
                <span className="text-xs sm:text-sm font-extrabold text-[#F47820] mt-0.5">WhatsApp</span>
              </div>
            </a>

            {/* Small Screen Circular WhatsApp Icon Button */}
            <a
              href="https://wa.me/9677391109"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#F47820] text-[#25D366] hover:bg-orange-50 active:scale-95 transition-all shadow-sm shrink-0"
              aria-label="WhatsApp Support"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.285-.143-1.688-.833-1.949-.929-.261-.095-.451-.143-.641.143-.19.285-.736.929-.903 1.118-.166.19-.332.214-.618.071-.285-.143-1.206-.444-2.298-1.418-.85-.758-1.424-1.694-1.59-1.979-.166-.285-.018-.439.125-.581.128-.128.285-.333.428-.499.143-.166.19-.285.285-.476.095-.19.047-.357-.024-.499-.071-.143-.641-1.546-.879-2.117-.232-.557-.468-.48-.642-.489-.166-.008-.356-.008-.546-.008-.19 0-.499.071-.76.356-.261.285-.998.976-.998 2.38 0 1.403 1.022 2.759 1.164 2.949.143.19 2.013 3.074 4.877 4.31.682.295 1.214.471 1.629.603.684.218 1.307.187 1.8.118.549-.083 1.688-.69 1.925-1.356.237-.666.237-1.236.166-1.356-.071-.119-.261-.19-.546-.333z" /></svg>
            </a>

            {/* Language Pill Dropdown */}
            {/* <div className="relative shrink-0" ref={langRef}>
              <button
                onClick={() => { setLangOpen((p) => !p); setAccountOpen(false); }}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-9 sm:h-11 rounded-full border-2 border-[#F47820] bg-white text-[#F47820] text-xs sm:text-sm font-bold hover:bg-orange-50 active:scale-95 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 text-[#F47820]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 012 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{languageFullNames[language] || "English"}</span>
                <svg className={`w-3.5 h-3.5 transition-transform ${langOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm transition-colors ${language === code ? "text-[#F47820] bg-orange-50 font-bold" : "text-gray-700 hover:bg-gray-50 font-medium"}`}
                      >
                        {languageFullNames[code]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div> */}

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
