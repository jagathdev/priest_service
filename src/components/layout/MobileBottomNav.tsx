"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Hide on these paths completely
const HIDDEN_ON_PATHS = ["/puja", "/chadhava", "/homa", "/sankalp", "/payment"];

function ExploreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px] mb-1 text-gray-800">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="8" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="16" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="15.5" cy="15.5" r="2" stroke="currentColor" strokeWidth="2" />
      <path d="M17 17l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PujaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[24px] w-[24px] mb-1 text-gray-800">
      <path d="M12 2C12 2 9 6 9 9.5a3.5 3.5 0 007 0C16 6 12 2 12 2z" fill="currentColor" />
      <path d="M7 14h10M6 17h12M5 20h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function HomaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[24px] w-[24px] mb-1 text-gray-800">
      <path d="M12 3C12 3 8 7 8 10.5a4 4 0 008 0C16 7 12 3 12 3z" fill="currentColor" opacity="0.8" />
      <path d="M12 8c0 0-2 2-2 3.5a2 2 0 004 0C14 10 12 8 12 8z" fill="#f97316" />
      <path d="M4 17h16M6 20h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

  return (
    <nav
      data-mobile-bottom-nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-200 bg-white lg:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <Link href="/" className="flex flex-col items-center justify-center flex-1 h-full text-gray-800 active:bg-gray-50">
        <ExploreIcon />
        <span className="text-[11px] font-medium tracking-wide">Explore</span>
      </Link>
      <Link href="/puja" className="flex flex-col items-center justify-center flex-1 h-full text-gray-800 active:bg-gray-50">
        <PujaIcon />
        <span className="text-[11px] font-medium tracking-wide">Puja</span>
      </Link>
      <Link href="/homa" className="flex flex-col items-center justify-center flex-1 h-full text-gray-800 active:bg-gray-50">
        <HomaIcon />
        <span className="text-[11px] font-medium tracking-wide">Homa</span>
      </Link>
    </nav>
  );
}
