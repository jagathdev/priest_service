"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  SparklesIcon,
  FireIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Pujas", href: "/admin/pujas", icon: SparklesIcon },
  { name: "Homas", href: "/admin/homas", icon: FireIcon },
  { name: "Orders & Bookings", href: "/admin/orders", icon: ShoppingBagIcon },
  { name: "Payments & Revenue", href: "/admin/payments", icon: CreditCardIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000"}/api/admin/logout`, { method: "POST" });
      if (res.ok) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#069e5d] px-4 py-3 text-white shadow-md z-40 relative">
        <span className="font-bold text-lg">Admin Panel</span>
        <button onClick={() => setIsOpen(true)} className="p-1 hover:bg-white/10 rounded-md transition-colors">
          <Bars3Icon className="h-7 w-7" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-gray-200 bg-white transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="relative">
          <Link
            href="/admin/profile"
            onClick={() => setIsOpen(false)}
            className="flex flex-col items-center justify-center border-b border-gray-100 bg-[#069e5d] hover:bg-[#058a51] transition-colors py-6"
          >
            <div className="bg-white/20 p-2 rounded-full mb-2">
              <UserCircleIcon className="h-10 w-10 text-white" />
            </div>
            <span className="text-base font-extrabold text-white tracking-wide">Priest Admin</span>
            <span className="text-[11px] text-white/80 font-medium">Control Center</span>
          </Link>

          <button
            className="md:hidden absolute top-3 right-3 p-1.5 text-white/80 hover:bg-white/20 hover:text-white rounded-md transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center rounded-xl px-3 py-3 text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#e8f5e9] text-[#069e5d]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 shrink-0 ${
                    isActive ? "text-[#069e5d]" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full group flex items-center rounded-xl px-3 py-3 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 transition-colors mt-4"
          >
            <ArrowLeftOnRectangleIcon
              className="mr-3 h-5 w-5 shrink-0 text-red-500 group-hover:text-red-600"
              aria-hidden="true"
            />
            Logout
          </button>
        </nav>
        <div className="border-t border-gray-100 p-4 text-xs font-bold text-gray-500">
          <Link href="/dashboard" className="flex items-center hover:text-[#069e5d] transition">
            <span className="mr-2">←</span> Back to Main Site
          </Link>
        </div>
      </div>
    </>
  );
}
