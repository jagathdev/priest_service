"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

interface User {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  placeOfBirth?: string;
  occupation?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<User>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          setFormData(data.user);
        } else {
          // Default demo user if not logged in for visual demo
          const defaultUser = {
            name: "Jagath",
            email: "sundari62005@gmail.com",
            phone: "+91 9360270984",
          };
          setUser(defaultUser);
          setFormData(defaultUser);
        }
        setLoading(false);
      })
      .catch(() => {
        const defaultUser = {
          name: "Jagath",
          email: "sundari62005@gmail.com",
          phone: "+91 9360270984",
        };
        setUser(defaultUser);
        setFormData(defaultUser);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/");
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setUser((prev) => ({ ...prev, ...formData }));
      setSaving(false);
      setShowEditModal(false);
    }, 500);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-[#fafafc]">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#069e5d]" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fafafc] pb-16 font-sans">
        
        {/* ── Breadcrumb Bar ── */}
        <div className="border-b border-gray-150 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition">HOME</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-900 font-bold">Account</span>
          </div>
        </div>

        {/* ── Main Container: Sidebar + Content ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* ── Left Sidebar Navigation (Matching Image 3) ── */}
            <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex flex-col gap-1.5">
              
              {/* Profile (Active Tab) */}
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === "profile"
                    ? "bg-[#069e5d] text-white shadow-xs"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </button>

              {/* My Bookings */}
              <Link
                href="/bookings/puja"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
                </svg>
                <span>My Bookings</span>
              </Link>

              {/* My Subscriptions */}
              <button
                type="button"
                onClick={() => setActiveTab("subscriptions")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>My Subscriptions</span>
              </button>

              {/* Wallet */}
              <button
                type="button"
                onClick={() => setActiveTab("wallet")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Wallet</span>
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() => setActiveTab("wishlist")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Wishlist</span>
              </button>

              {/* Saved Address */}
              <button
                type="button"
                onClick={() => setActiveTab("address")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Saved Address</span>
              </button>

              {/* Language */}
              <button
                type="button"
                onClick={() => setActiveTab("language")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Language</span>
              </button>

              {/* About */}
              <Link
                href="/about"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>About</span>
              </Link>

              {/* Support */}
              <Link
                href="/contact"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Support</span>
              </Link>

              {/* Bottom Logout Button (Matching Image 3) */}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 border border-[#069e5d] text-[#069e5d] hover:bg-green-50 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition w-full"
              >
                <svg className="w-4 h-4 text-[#069e5d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </aside>

            {/* ── Right Main Content Area (Matching Image 3) ── */}
            <div className="flex-1 w-full">

              {/* Section Title Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#701a28] text-white flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#5b1422] tracking-tight">
                  Profile Details
                </h1>
              </div>

              {/* Profile Card Container (Matching Image 3) */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-8 relative overflow-hidden">
                
                {/* Decorative Mandala Background Watermark */}
                <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                  <svg className="w-64 h-64 text-[#701a28]" fill="currentColor" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" fill="none" />
                    <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                </div>

                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 relative z-10">
                  
                  {/* Left: Avatar + Details */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Circle Avatar */}
                    <div className="w-24 h-24 rounded-full bg-[#701a28] text-white flex items-center justify-center text-4xl font-bold border-4 border-amber-100 shadow-inner shrink-0">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {user?.name || "Jagath"}
                      </h2>
                      <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-semibold inline-block mt-1">
                        Devotee
                      </span>

                      <div className="mt-4 space-y-1.5 text-xs sm:text-sm text-gray-600 font-medium">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{user?.phone || "+91 9360270984"}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{user?.email || "sundari62005@gmail.com"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Edit Button */}
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="border border-[#069e5d] text-[#069e5d] hover:bg-green-50 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition self-start shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* ── 3 Quick Shortcut Cards Row (Matching Image 3) ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                
                {/* Card 1: My Bookings */}
                <Link
                  href="/bookings/puja"
                  className="bg-[#fdf2f0] border border-[#fce4e0] rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#701a28] shrink-0 shadow-2xs">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">My Bookings (1)</h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-tight">View your all puja bookings and History</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#069e5d] text-white flex items-center justify-center text-xs font-bold shrink-0 ml-2">
                    ➔
                  </div>
                </Link>

                {/* Card 2: My Subscriptions */}
                <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">My Subscriptions (0)</h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-tight">Manage your active subscriptions</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#069e5d] text-white flex items-center justify-center text-xs font-bold shrink-0 ml-2">
                    ➔
                  </div>
                </div>

                {/* Card 3: My Addresses */}
                <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#069e5d] shrink-0 shadow-2xs">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">My Addresses (0)</h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-tight">Manage your saved delivery addresses</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#069e5d] text-white flex items-center justify-center text-xs font-bold shrink-0 ml-2">
                    ➔
                  </div>
                </div>
              </div>

              {/* ── Green Security Banner (Matching Image 3) ── */}
              <div className="bg-[#e8f5e9] border border-[#c8e6c9] text-[#069e5d] text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 mt-6">
                <svg className="w-4 h-4 text-[#069e5d]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Your personal information is protected and securely stored.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit Profile Modal ── */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Edit Profile</h3>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#069e5d]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#069e5d]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className="w-full border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#069e5d]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#069e5d] text-white text-xs font-bold hover:bg-[#058a51] transition"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
