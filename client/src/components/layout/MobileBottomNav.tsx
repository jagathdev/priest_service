"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { Home, Flame, User } from "lucide-react";

// Paths where bottom nav is hidden (e.g. checkout / payment)
const HIDDEN_ON_PATHS = ["/sankalp", "/payment", "/auth", "/admin"];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <Home
      className={`h-[22px] w-[22px] mb-0.5 ${active ? "text-[#14395C]" : "text-gray-500"}`}
      strokeWidth={active ? 2.5 : 2}
    />
  );
}

function PujaIcon({ active }: { active: boolean }) {
  return (
    <Flame
      className={`h-[22px] w-[22px] mb-0.5 ${active ? "text-[#14395C] fill-[#14395C]/20" : "text-gray-500"}`}
      strokeWidth={active ? 2.5 : 2}
    />
  );
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <User
      className={`h-[22px] w-[22px] mb-0.5 ${active ? "text-[#14395C]" : "text-gray-500"}`}
      strokeWidth={active ? 2.5 : 2}
    />
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
          href="/"
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
