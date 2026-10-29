"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  X,
  User as UserIcon,
  Calendar,
  Flame,
  ChevronRight,
  Home,
  Phone,
  Mail,
  MessageCircle,
  LogOut
} from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import { useUser } from "@/contexts/UserContext";
import priestServiceLogo from "../../../public/images/priest-services-logo.png";

const AccountPanel = ({ accountOpen, setAccountOpen, user, setLoginModalOpen, handleLogout }: any) => {
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
          <X className="h-5 w-5" />
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
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm uppercase shrink-0">
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
              { href: user ? "/account" : "#", label: "My profile", icon: <UserIcon className="h-5 w-5" /> },
              { href: user ? "/bookings/puja" : "#", label: "My Puja Bookings", icon: <Calendar className="h-5 w-5" /> },
              { href: user ? "/puja" : "#", label: "Book a Puja", icon: <Flame className="h-5 w-5" />, badge: "New" },
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
                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
              </Link>
            ))}
          </div>

          {/* Explore AstroVed Services */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="px-2 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Explore AstroVed Services
            </p>
            {[
              { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
              { href: "/puja", label: "Puja Seva", icon: <Flame className="h-5 w-5" />, badge: "New" },
              // { href: "/homa", label: "Homa Seva", icon: <Flame className="h-5 w-5" />, badge: "New" },
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
                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
              </Link>
            ))}
          </div>

          {/* Help & Support */}
          <div className="px-3 pb-3 border-t border-gray-100 pt-2">
            <p className="px-2 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">Help &amp; Support for Puja Booking</p>
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-2">
              <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">+91 96773 91108</p>
                <p className="text-[11px] text-gray-400">You can call us from 10:30 AM - 7:30 PM</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a href="mailto:support@astroved.com" className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors text-[13px] font-bold text-gray-700">
                <Mail className="h-4 w-4 text-red-500" />
                Email us
              </a>
              <a href="https://wa.me/919566777645" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors text-[13px] font-bold text-gray-700">
                <MessageCircle className="h-4 w-4 text-green-500" />
                Whatsapp us
              </a>
            </div>

            {user && (
              <button
                onClick={handleLogout}
                className="mt-2 w-full py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default function Navbar() {
  const pathname = usePathname();
  const { user, setUser, isLoginModalOpen, openLoginModal, closeLoginModal } = useUser();
  const [langOpen, setLangOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

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
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      const timer = setTimeout(() => {
        setAccountOpen(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

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
      const isUserLoginCookie = document.cookie.includes("userLogin=true");
      const hasToken = Boolean(localStorage.getItem("token") || localStorage.getItem("adminToken") || document.cookie.match(/(?:^|;\s*)(?:token|adminToken)=/));
      const hasUser = Boolean(localStorage.getItem("mockUser"));
      if (!isUserLoginCookie && !hasToken && !hasUser) {
        setUser(null);
      }
    }
  }, [pathname, setUser]);

  const isActivePath = (path: string) =>
    pathname === path || (path !== "/" && pathname?.startsWith(path + "/"));

  const handleLogout = async () => {
    document.cookie = "userLogin=false; path=/; max-age=0;";
    setUser(null);
    window.location.href = "/";
  };

  const handleLoginSuccess = () => {
    // User Context is updated by LoginModal directly
  };


  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} onSuccess={handleLoginSuccess} />

      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1350px] items-center justify-between px-4 py-3 sm:py-3.5 sm:px-6 md:px-8 lg:px-10 xl:py-4">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="AstroVed Home">
            <Image
              src={priestServiceLogo}
              alt="AstroVed"
              width={180}
              height={44}
              className="h-9 sm:h-10 lg:h-11 w-auto object-contain"
              priority
            />
          </Link>

          {/* ── Desktop Nav (lg+) ── */}
          <nav aria-label="Main navigation" className="hidden lg:flex flex-1 justify-center">
            <ul className="flex items-center gap-10 xl:gap-12 text-base xl:text-[17px] font-bold text-[#1a1a1a] tracking-wider">
              <li>
                <Link href="/" className={isActivePath("/") ? "text-[#14395C] font-extrabold border-b-2 border-[#14395C] pb-1" : "transition-colors hover:text-[#14395C] uppercase"}>
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/puja" className={isActivePath("/puja") ? "text-[#14395C] font-extrabold border-b-2 border-[#14395C] pb-1" : "transition-colors hover:text-[#14395C] uppercase"}>
                  PUJA
                </Link>
              </li>
              {/* <li>
                <Link href="/homa" className={isActivePath("/homa") ? "text-[#14395C] font-extrabold border-b-2 border-[#14395C] pb-1" : "transition-colors hover:text-[#14395C] uppercase"}>
                  HOMAS
                </Link>
              </li> */}
              <li>
                <Link href="/account" className={isActivePath("/account") || isActivePath("/profile") ? "text-[#14395C] font-extrabold border-b-2 border-[#14395C] pb-1" : "transition-colors hover:text-[#14395C] uppercase"}>
                  ACCOUNT
                </Link>
              </li>
            </ul>
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2.5 sm:gap-4">

            {/* Desktop / Tablet WhatsApp Button */}
            <a
              href="https://wa.me/919566777645"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center justify-center gap-2.5 w-[140px] sm:w-[160px] h-10 sm:h-12 rounded-full bg-[#14395C] hover:bg-[#0f2d4a] active:scale-95 text-white transition-all shadow-sm shrink-0"
            >
              {/* <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> */}
              <i className="fa-brands fa-whatsapp text-2xl text-[#25D366]"></i>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] sm:text-xs text-slate-200 font-medium">Need Help?</span>
                <span className="text-xs sm:text-sm font-extrabold text-white mt-0.5">WhatsApp</span>
              </div>
            </a>

            {/* Small Screen WhatsApp Icon Button (No outer border, enlarged icon) */}
            <a
              href="https://wa.me/919566777645"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden flex items-center justify-center p-1 text-[#25D366] hover:opacity-90 active:scale-95 transition-all shrink-0"
              aria-label="WhatsApp Support"
            >
              {/* <MessageCircle className="w-8 h-8 text-[#25D366]" /> */}
              <i className="fa-brands fa-whatsapp text-2xl text-[#25D366]"></i>
            </a>

            <AccountPanel
              accountOpen={accountOpen}
              setAccountOpen={setAccountOpen}
              user={user}
              setLoginModalOpen={openLoginModal}
              handleLogout={handleLogout}
            />
          </div>
        </div>
      </header>
    </>
  );
}

