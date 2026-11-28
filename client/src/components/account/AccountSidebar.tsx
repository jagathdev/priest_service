"use client";

import React from "react";
import {
  User as UserIcon,
  Flame,
  Calendar,
  Wallet,
  Heart,
  MapPin,
  Info,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import { formatIndianPhoneNumber } from "@/lib/phoneFormatter";

export interface AccountTabItem {
  id: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

export const ACCOUNT_TABS: AccountTabItem[] = [
  {
    id: "profile",
    label: "Profile",
    icon: (active: boolean) => (
      <UserIcon className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "bookings",
    label: "My Bookings",
    icon: (active: boolean) => (
      <Flame className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "subscriptions",
    label: "My Subscriptions",
    icon: (active: boolean) => (
      <Calendar className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: (active: boolean) => (
      <Wallet className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "wishlist",
    label: "Wishlist",
    icon: (active: boolean) => (
      <Heart className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "address",
    label: "Saved Address",
    icon: (active: boolean) => (
      <MapPin className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "about",
    label: "About",
    icon: (active: boolean) => (
      <Info className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "support",
    label: "Support",
    icon: (active: boolean) => (
      <HelpCircle className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
];

interface AccountSidebarProps {
  user: any;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onLogout: () => void;
  isDrawer?: boolean;
  onCloseDrawer?: () => void;
}

export default function AccountSidebar({
  user,
  activeTab,
  onSelectTab,
  onLogout,
  isDrawer = false,
  onCloseDrawer,
}: AccountSidebarProps) {
  const content = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Drawer Header (if drawer) */}
      {isDrawer && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 shrink-0">
          <span className="font-bold text-gray-800 text-sm">Account Menu</span>
          <button
            onClick={onCloseDrawer}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Top User Summary */}
      <div className="flex items-center gap-3 pb-3 mb-2 border-b border-gray-100 shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#F47820] flex items-center justify-center shrink-0">
          <UserIcon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-gray-900 truncate">
            {user?.name || "Devotee"}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {user?.mobileNumber ? formatIndianPhoneNumber(user.mobileNumber) : (user?.phone ? formatIndianPhoneNumber(user.phone) : (user?.email || "Devotee"))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs List - Scrollable if screen is short */}
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 pr-1 py-1">
        {ACCOUNT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              onSelectTab(tab.id);
              if (isDrawer && onCloseDrawer) onCloseDrawer();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer shrink-0 ${activeTab === tab.id
              ? "bg-primary text-white font-bold shadow-xs"
              : "text-gray-700 font-medium hover:bg-gray-50"
              }`}
          >
            {tab.icon(activeTab === tab.id)}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Logout Button - Always visible & pinned at the bottom */}
      <div className="pt-3 border-t border-gray-100 shrink-0 mt-auto bg-white">
        <button
          type="button"
          onClick={() => {
            onLogout();
            if (isDrawer && onCloseDrawer) onCloseDrawer();
          }}
          className="border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100/70 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition w-full cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  if (isDrawer) {
    return content;
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs">
      {content}
    </div>
  );
}
