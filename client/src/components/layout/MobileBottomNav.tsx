"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Paths where bottom nav is hidden (e.g. checkout / payment)
const HIDDEN_ON_PATHS = ["/sankalp", "/payment", "/auth", "/admin"];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`h-[22px] w-[22px] mb-0.5 ${active ? "text-[#14395C]" : "text-gray-500"}`}>
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
    <svg viewBox="0 0 24 24" fill="none" className={`h-[22px] w-[22px] mb-0.5 ${active ? "text-[#14395C]" : "text-gray-500"}`}>
      {/* Diya / Flame */}
      <path
        d="M12 3c0 0-2.5 2.5-2.5 4.5a2.5 2.5 0 005 0C14.5 5.5 12 3 12 3z"
        fill={active ? "#14395C" : "#6b7280"}
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



function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`h-[22px] w-[22px] mb-0.5 ${active ? "text-[#14395C]" : "text-gray-500"}`}>
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
  const isAccountActive = pathname?.startsWith("/account") || pathname?.startsWith("/profile");

  return (
    <nav
      data-mobile-bottom-nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col border-t border-gray-200/90 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:hidden"
    >
      {/* Icon + label row — always exactly 64px tall */}
      <div className="flex h-16 items-center justify-around w-full">
        {/* HOME */}
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center flex-1 h-full active:bg-gray-50 transition-colors"
        >
          <HomeIcon active={isHomeActive} />
          <span
            className={`text-[11px] font-bold tracking-wider uppercase ${isHomeActive ? "text-[#14395C]" : "text-gray-500"
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
            className={`text-[11px] font-bold tracking-wider uppercase ${isPujaActive ? "text-[#14395C]" : "text-gray-500"
              }`}
          >
            PUJA
          </span>
        </Link>

        {/* ACCOUNT */}
        <Link
          href="/account"
          className="flex flex-col items-center justify-center flex-1 h-full active:bg-gray-50 transition-colors"
        >
          <AccountIcon active={isAccountActive} />
          <span
            className={`text-[11px] font-bold tracking-wider uppercase ${isAccountActive ? "text-[#14395C]" : "text-gray-500"
              }`}
          >
            ACCOUNT
          </span>
        </Link>
      </div>

      {/* Safe-area spacer — absorbs gesture nav bar height on Samsung/iPhone */}
      <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} className="w-full bg-white" />
    </nav>
  );
}
