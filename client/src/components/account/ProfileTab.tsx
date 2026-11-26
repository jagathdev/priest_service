"use client";

import React, { useState } from "react";
import {
  User as UserIcon,
  Phone,
  Mail,
  Edit2,
  Building,
  Heart,
  MapPin,
  Loader2,
  Check,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { formatIndianPhoneNumber } from "@/lib/phoneFormatter";

interface ProfileTabProps {
  onNavigateTab: (tabId: string) => void;
  bookingsCount: number | null;
  loadingBookings: boolean;
  wishlistCount: number;
  loadingWishlist: boolean;
  addressesCount: number;
  loadingAddresses: boolean;
}

export default function ProfileTab({
  onNavigateTab,
  bookingsCount,
  loadingBookings,
  wishlistCount,
  loadingWishlist,
  addressesCount,
  loadingAddresses,
}: ProfileTabProps) {
  const { user, setUser } = useUser();
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const getUserAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const match = document.cookie.match(/(?:^|;\s*)(?:token|adminToken)=([^;]+)/);
    const cookieToken = match ? decodeURIComponent(match[1]) : null;
    const localToken = localStorage.getItem("token");
    const token = cookieToken || localToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

      const res = await fetch(`${baseUrl}/api/users/updateProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getUserAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user?.id || user?._id,
          name: (formData.name || "").trim(),
          email: (formData.email || "").trim(),
          mobileNumber: (formData.mobileNumber || formData.phone || "").trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...user, ...data.data };
        setUser(updatedUser);
        setShowEditModal(false);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Section Title Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#F47820] text-white flex items-center justify-center shrink-0">
          <UserIcon className="w-4 h-4" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight">
          Profile Details
        </h1>
      </div>

      {/* Profile Card Container */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 sm:p-10 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-10">
        {/* Left: Avatar */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#F47820] flex items-center justify-center shrink-0 relative z-10">
          <UserIcon className="w-16 h-16 text-white" />
        </div>

        {/* Right: Form or Details */}
        <div className="flex-1 w-full relative z-10">
          {showEditModal ? (
            <div className="max-w-md">
              <div className="mb-4">
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder=""
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-primary transition"
                />
              </div>
              <div className="mb-5">
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder=""
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="flex items-center gap-2 text-gray-500 mb-6">
                <Phone className="w-4 h-4 shrink-0" />
                <span className="text-[13px] font-medium">Mobile number can&apos;t be changed here.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(user || {});
                    setShowEditModal(false);
                  }}
                  className="px-6 py-2.5 rounded-full border border-gray-200 text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-primary text-white text-[14px] font-bold hover:bg-[#008F4C] transition"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 w-full">
              <div className="w-full">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight capitalize">
                    {user?.name || "Enter your name"}
                  </h2>

                  {/* Mobile: Edit button */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(user || {});
                      setShowEditModal(true);
                    }}
                    className="sm:hidden border border-primary text-primary hover:bg-slate-50 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition shrink-0 shadow-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-semibold inline-block mt-1">
                  Devotee
                </span>

                <div className="mt-4 space-y-1.5 text-xs sm:text-sm text-gray-600 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {user?.mobileNumber || user?.phone
                        ? formatIndianPhoneNumber(user.mobileNumber || user.phone)
                        : "+91 XXXXXXXXXX"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="h-5 flex items-center">{user?.email || "Add your email"}</span>
                  </div>
                </div>
              </div>

              {/* Desktop / Tablet: Edit button */}
              <button
                type="button"
                onClick={() => {
                  setFormData(user || {});
                  setShowEditModal(true);
                }}
                className="hidden sm:flex border border-primary text-primary hover:bg-slate-50 text-xs font-bold px-4 py-1.5 rounded-full items-center gap-1.5 transition self-start shadow-xs shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3 Quick Shortcut Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Card 1: My Bookings */}
        <div
          onClick={() => onNavigateTab("bookings")}
          className="cursor-pointer bg-[#fdf2f0] border border-[#fce4e0] rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-danger shrink-0 shadow-2xs">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span>My Bookings</span>
                {loadingBookings ? (
                  <span className="inline-flex items-center text-[10px] text-gray-400 font-normal">
                    <Loader2 className="animate-spin h-3 w-3 text-gray-500 inline mr-0.5" />
                  </span>
                ) : (
                  <span>({bookingsCount ?? 0})</span>
                )}
              </h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight">View your all puja bookings and History</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 ml-2">
            ➔
          </div>
        </div>

        {/* Card 2: My Wishlist */}
        <div
          onClick={() => onNavigateTab("wishlist")}
          className="cursor-pointer bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-danger shrink-0 shadow-2xs">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span>My Wishlist</span>
                {loadingWishlist ? (
                  <span className="inline-flex items-center text-[10px] text-gray-400 font-normal">
                    <Loader2 className="animate-spin h-3 w-3 text-gray-500 inline mr-0.5" />
                  </span>
                ) : (
                  <span>({wishlistCount})</span>
                )}
              </h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight">View your saved pujas and services</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 ml-2">
            ➔
          </div>
        </div>

        {/* Card 3: My Addresses */}
        <div
          onClick={() => onNavigateTab("address")}
          className="cursor-pointer bg-[#F1F5F9] border border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary shrink-0 shadow-2xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span>My Addresses</span>
                {loadingAddresses ? (
                  <span className="inline-flex items-center text-[10px] text-gray-400 font-normal">
                    <Loader2 className="animate-spin h-3 w-3 text-gray-500 inline mr-0.5" />
                  </span>
                ) : (
                  <span>({addressesCount})</span>
                )}
              </h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight">Manage your saved delivery addresses</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 ml-2">
            ➔
          </div>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-[#F1F5F9] border border-[#CBD5E1] text-primary text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 mt-6">
        <Check className="w-4 h-4 text-primary" strokeWidth={3} />
        <span>Your personal information is protected and securely stored.</span>
      </div>
    </>
  );
}
