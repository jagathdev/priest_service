"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Paths where bottom nav is hidden (e.g. checkout / payment)
const HIDDEN_ON_PATHS = ["/sankalp", "/payment", "/auth", "/admin"];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`h-[22px] w-[22px] mb-0.5 ${active ? "text-[#15803d]" : "text-gray-500"}`}>
      <path
        d="M3 9.5L12 3l9 6.5V20a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 20V9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21V12h6v9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PujaIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`h-[22px] w-[22px] mb-0.5 ${active ? "text-[#15803d]" : "text-gray-500"}`}>
      {/* Diya / Flame */}
      <path
        d="M12 3c0 0-2.5 2.5-2.5 4.5a2.5 2.5 0 005 0C14.5 5.5 12 3 12 3z"
        fill={active ? "#15803d" : "#6b7280"}
      />
      <path
        d="M6 14c0 3.314 2.686 6 6 6s6-2.686 6-6H6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 20v1.5h6V20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SevasIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`h-[22px] w-[22px] mb-0.5 ${active ? "text-[#15803d]" : "text-gray-500"}`}>
      {/* Gift Box / Sevas */}
      <rect x="3" y="8" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v12M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 8C6 8 5 6.8 5 5.5S6.5 3 8 4.5L12 8L16 4.5C17.5 3 19 4.2 19 5.5S18 8 16.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`h-[22px] w-[22px] mb-0.5 ${active ? "text-[#15803d]" : "text-gray-500"}`}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname() ?? "";

  const shouldHide = HIDDEN_ON_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    if (!shouldHide) {
      document.body.classList.add("has-mobile-nav");
    } else {
      document.body.classList.remove("has-mobile-nav");
    }
    return () => {
      document.body.classList.remove("has-mobile-nav");
    };
  }, [shouldHide]);

  if (shouldHide) return null;

  const isHomeActive = pathname === "/" || pathname === "/dashboard";
  const isPujaActive = pathname?.startsWith("/puja");
  const isSevasActive = pathname?.startsWith("/homa") || pathname?.startsWith("/sevas");
  const isAccountActive = pathname?.startsWith("/account") || pathname?.startsWith("/profile");

  return (
    <nav
      data-mobile-bottom-nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-200/90 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:hidden pb-[env(safe-area-inset-bottom)]"
    >
      {/* HOME */}
      <Link
        href="/dashboard"
        className="flex flex-col items-center justify-center flex-1 h-full active:bg-gray-50 transition-colors"
      >
        <HomeIcon active={isHomeActive} />
        <span
          className={`text-[11px] font-bold tracking-wider uppercase ${
            isHomeActive ? "text-[#15803d]" : "text-gray-500"
          }`}
        >
          HOME
        </span>
      </Link>

      {/* PUJA */}
      <Link
        href="/puja"
        className="flex flex-col items-center justify-center flex-1 h-full active:bg-gray-50 transition-colors"
      >
        <PujaIcon active={isPujaActive} />
        <span
          className={`text-[11px] font-bold tracking-wider uppercase ${
            isPujaActive ? "text-[#15803d]" : "text-gray-500"
          }`}
        >
          PUJA
        </span>
      </Link>

      {/* SEVAS */}
      <Link
        href="/homa"
        className="flex flex-col items-center justify-center flex-1 h-full active:bg-gray-50 transition-colors"
      >
        <SevasIcon active={isSevasActive} />
        <span
          className={`text-[11px] font-bold tracking-wider uppercase ${
            isSevasActive ? "text-[#15803d]" : "text-gray-500"
          }`}
        >
          SEVAS
        </span>
      </Link>

      {/* ACCOUNT */}
      <Link
        href="/account"
        className="flex flex-col items-center justify-center flex-1 h-full active:bg-gray-50 transition-colors"
      >
        <AccountIcon active={isAccountActive} />
        <span
          className={`text-[11px] font-bold tracking-wider uppercase ${
            isAccountActive ? "text-[#15803d]" : "text-gray-500"
          }`}
        >
          ACCOUNT
        </span>
      </Link>
    </nav>
  );
}
