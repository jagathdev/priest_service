"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ShoppingBagIcon,
  DocumentDuplicateIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { formatIndianPhoneNumber } from "@/lib/phoneFormatter";

interface DevoteeUserDetails {
  _id: string;
  name?: string;
  email?: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  totalAmountSpent: number;
  totalOrdersCount?: number;
  status: "Active" | "Inactive";
  isVerified: boolean;
  isLoggedIn?: boolean;
  sessionStatus?: "Active" | "Offline";
  lastLoginAt?: string | null;
  sessionExpiresAt?: string | null;
  firstLoginAt?: string | null;
  utmSource?: string;
  utmCampaign?: string;
  referrer?: string;
  landingPage?: string;
  firstVisitedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  addresses?: any[];
  orders?: any[];
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();

  const [user, setUser] = useState<DevoteeUserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Copy helpers
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Edit user modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    status: "Active" as "Active" | "Inactive",
  });
  const [savingUser, setSavingUser] = useState(false);
  const [editModalError, setEditModalError] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getAdminToken = () => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)adminToken=([^;]*)/);
      if (match) return match[1];
      return "";
    } catch {
      return "";
    }
  };

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/users/${userId}`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load user details");
      }

      const resData = await res.json();
      if (resData.success && resData.data) {
        setUser(resData.data);
        setEditFormData({
          name: resData.data.name || "",
          email: resData.data.email || "",
          mobileNumber: resData.data.mobileNumber || "",
          status: resData.data.status || "Active",
        });
      } else {
        throw new Error(resData.message || "Devotee record not found");
      }
    } catch (err: any) {
      console.error("[AdminUserDetail] Error:", err);
      setError(err.message || "Failed to load user information");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleCopy = (text: string, type: "phone" | "id") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "phone") {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
    showToast("Copied to clipboard!", "success");
  };

  const handleSaveEdit = async () => {
    if (!user) return;
    setSavingUser(true);
    setEditModalError("");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/users/${user._id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(editFormData),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Failed to update user details");
      }

      showToast("Devotee details updated successfully!", "success");
      setUser((prev) => (prev ? { ...prev, ...editFormData } : prev));
      setIsEditModalOpen(false);
    } catch (err: any) {
      setEditModalError(err.message || "Failed to update user");
    } finally {
      setSavingUser(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return { datePart: "-", timePart: "" };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { datePart: "-", timePart: "" };
    const datePart = d.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { datePart, timePart };
  };

  const formatReferrerDomain = (ref?: string): string => {
    if (!ref || ref === "-" || ref === "Direct") return "-";
    try {
      const url = new URL(ref);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return ref.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || "-";
    }
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-emerald-100 text-emerald-700 border-emerald-200",
      "bg-amber-100 text-amber-700 border-amber-200",
      "bg-rose-100 text-rose-700 border-rose-200",
      "bg-blue-100 text-blue-700 border-blue-200",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="p-8 md:p-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold text-gray-500">Loading devotee details...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 md:p-16 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ExclamationCircleIcon className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Devotee Not Found</h2>
        <p className="text-xs text-gray-500">{error || "The requested devotee records could not be found."}</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Users List
        </Link>
      </div>
    );
  }

  const devoteeName = user.name || "Devotee";
  const initial = devoteeName.trim().charAt(0).toUpperCase() || "D";
  const avatarClass = getAvatarBg(devoteeName);
  const cleanPhone = (user.mobileNumber || "").replace(/\D/g, "");
  const waPhone = (user.whatsappNumber || user.mobileNumber || "").replace(/\D/g, "");

  return (
    <div className="space-y-6 max-w-[1550px] mx-auto min-h-screen pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/admin/users")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-2xs mb-2 transition cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to Users List
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Devotee Details</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Complete devotee profile, marketing attribution, login timeline, and ritual booking history.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {waPhone && (
            <a
              href={`https://wa.me/${waPhone.length === 10 ? `91${waPhone}` : waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs transition active:scale-95"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Devotee</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <PencilSquareIcon className="w-4 h-4 text-gray-300" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Profile Summary Banner Card */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold border shrink-0 ${avatarClass}`}
          >
            {initial}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight capitalize">
                {devoteeName}
              </h2>

              {/* STRICT ACTIVE / OFFLINE BADGE - NEVER "ONLINE" */}
              {user.isLoggedIn ? (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full shrink-0">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  Offline
                </span>
              )}

              {user.status === "Active" ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Account Active
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Inactive
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-mono text-gray-400">ID: {user._id}</span>
              <button
                type="button"
                onClick={() => handleCopy(user._id, "id")}
                className="text-gray-400 hover:text-gray-600 transition"
                title="Copy User ID"
              >
                {copiedId ? (
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats on Right */}
        <div className="flex items-center gap-3 sm:gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
          <div className="bg-purple-50/70 border border-purple-150 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
            <span className="text-[10.5px] font-bold text-purple-700 uppercase tracking-wider block">Total Spent</span>
            <span className="text-base font-extrabold text-purple-900">
              ₹ {user.totalAmountSpent.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-150 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
            <span className="text-[10.5px] font-bold text-emerald-700 uppercase tracking-wider block">Total Orders</span>
            <span className="text-base font-extrabold text-emerald-900">
              {user.totalOrdersCount ?? user.orders?.length ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Contact & Marketing Attribution */}
        <div className="space-y-6">
          {/* Card 1: Contact Information */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 text-emerald-600" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] text-gray-400 font-medium block mb-1">Mobile Number</span>
                  <span className="font-bold text-gray-900 text-xs">
                    {user.mobileNumber ? formatIndianPhoneNumber(user.mobileNumber) : "Not Provided"}
                  </span>
                </div>
                {user.mobileNumber && (
                  <button
                    onClick={() => handleCopy(user.mobileNumber || "", "phone")}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition"
                    title="Copy phone"
                  >
                    {copiedPhone ? (
                      <CheckIcon className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] text-gray-400 font-medium block mb-1">WhatsApp Number</span>
                  <span className="font-bold text-gray-900 text-xs">
                    {user.whatsappNumber
                      ? formatIndianPhoneNumber(user.whatsappNumber)
                      : user.mobileNumber
                      ? formatIndianPhoneNumber(user.mobileNumber)
                      : "Not Provided"}
                  </span>
                </div>
                {waPhone && (
                  <a
                    href={`https://wa.me/${waPhone.length === 10 ? `91${waPhone}` : waPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 transition"
                    title="Open WhatsApp chat"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
              <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[10.5px] text-gray-400 font-medium block">Email Address</span>
                <span className="font-semibold text-gray-800 text-xs break-all">
                  {user.email && user.email !== "N/A" ? user.email : "Not Provided"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Traffic Attribution & First Visit (FULL SLUG) */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4 text-blue-600" />
              Traffic Attribution & First-Visit
            </h3>

            <div className="space-y-3 pt-1">
              <div>
                <span className="text-[11px] text-gray-500 font-bold block mb-1.5">
                  Initial Landing Page (Full URL Slug)
                </span>
                {user.landingPage && user.landingPage !== "-" ? (
                  <a
                    href={user.landingPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-800 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 p-3 rounded-xl border border-emerald-200 break-all text-left transition flex items-center justify-between gap-3 shadow-2xs group"
                    title="Open initial landing page in new tab"
                  >
                    <span className="break-all">{user.landingPage}</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition shrink-0" />
                  </a>
                ) : (
                  <div className="font-mono text-gray-400 text-xs p-3 rounded-xl bg-gray-50 border border-gray-100">
                    -
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10.5px] text-gray-400 font-medium block mb-1">Referral Source</span>
                  <span className="font-semibold text-gray-800 text-xs break-all" title={user.referrer || "No referrer recorded"}>
                    {user.referrer || "-"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10.5px] text-gray-400 font-medium block mb-1">Traffic / UTM Source</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200 inline-block">
                    {user.utmSource || "-"}
                  </span>
                </div>
              </div>

              {user.utmCampaign && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10.5px] text-gray-400 font-medium block mb-0.5">UTM Campaign</span>
                  <span className="font-semibold text-gray-800 text-xs break-all">{user.utmCampaign}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Saved Delivery Addresses */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-rose-600" />
              Saved Prasad Delivery Addresses ({user.addresses?.length || 0})
            </h3>

            {Array.isArray(user.addresses) && user.addresses.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {user.addresses.map((addr: any, aIdx: number) => (
                  <div key={addr._id || aIdx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-150 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-xs">{addr.type || "Home"}</span>
                      {addr.isDefault && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {[addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs italic pt-1">No saved delivery addresses found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Account Timeline & Ritual Bookings */}
        <div className="space-y-6">
          {/* Card 4: Account & Login Timeline */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4 text-amber-600" />
              Account & Login Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
                <span className="text-[10.5px] text-gray-400 font-medium block">First Registered On</span>
                <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{formatDate(user.createdAt).datePart}</span>
                </div>
                {formatDate(user.createdAt).timePart && (
                  <div className="text-[10.5px] text-gray-500 font-medium flex items-center gap-1.5">
                    <ClockIcon className="w-3 h-3 text-gray-400 shrink-0" />
                    <span>{formatDate(user.createdAt).timePart}</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
                <span className="text-[10.5px] text-gray-400 font-medium block">Last Login Date & Time</span>
                {user.lastLoginAt ? (
                  <>
                    <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                      <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{formatDate(user.lastLoginAt).datePart}</span>
                    </div>
                    {formatDate(user.lastLoginAt).timePart && (
                      <div className="text-[10.5px] text-gray-500 font-medium flex items-center gap-1.5">
                        <ClockIcon className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{formatDate(user.lastLoginAt).timePart}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400 font-medium italic text-xs">Never logged in</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Session Status</span>
              <div>
                {user.isLoggedIn ? (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10.5px]">
                    Active (Logged in)
                  </span>
                ) : (
                  <span className="font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200 text-[10.5px]">
                    Offline (Logged out)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 5: Ritual Bookings & Lifetime Value */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <ShoppingBagIcon className="w-4 h-4 text-purple-600" />
                Orders & Ritual Bookings ({user.orders?.length || 0})
              </h3>
              <span className="text-xs font-extrabold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                ₹ {user.totalAmountSpent.toLocaleString("en-IN")} Total
              </span>
            </div>

            {user.orders && user.orders.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {user.orders.map((ord: any) => (
                  <Link
                    key={ord._id}
                    href={`/admin/orders/${ord._id}`}
                    className="p-3.5 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-between gap-3 hover:bg-emerald-50/50 hover:border-emerald-200 transition group block"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="font-bold text-gray-900 block truncate text-xs group-hover:text-emerald-700 transition">
                        {ord.serviceName}
                      </span>
                      <div className="flex items-center gap-2 text-[10.5px] text-gray-400 font-mono">
                        <span>{ord.orderNumber}</span>
                        {ord.createdAt && <span>• {formatDate(ord.createdAt).datePart}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-gray-900 block text-xs">
                        ₹{ord.amount}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                        {ord.orderStatus}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs italic pt-1">No ritual bookings found yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150">
              <h3 className="text-base font-bold text-gray-900">Edit User Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {editModalError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {editModalError}
              </div>
            )}

            <div className="mt-4 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-emerald-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-emerald-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={editFormData.mobileNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-emerald-500"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingUser}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {savingUser ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
