"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface BookingItem {
  title: string;
  quantity: number;
  amount: string | number;
  imageUrl?: string;
  status?: string;
}

interface Booking {
  _id: string;
  orderId: string;
  amount: string | number;
  currency?: string;
  bookingDate: string;
  status: string;
  bookingType: string;
  title?: string;
  items?: BookingItem[];
}

export default function MyPujaBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/bookings/me?type=puja")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.bookings);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/");
  };

  // Generate a mock future date for scheduled
  const getScheduledDate = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 17);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "All") return true;
    if (filter === "Ongoing") return b.status !== "Completed" && b.status !== "Cancelled";
    if (filter === "Complete") return b.status === "Completed";
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fafafc] pb-16 font-sans">
        {/* Breadcrumb Bar */}
        <div className="border-b border-gray-150 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition">HOME</Link>
            <span className="text-gray-300">›</span>
            <Link href="/account" className="hover:text-gray-900 transition">Account</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-900 font-bold">My Bookings</span>
          </div>
        </div>

        {/* Main Container: Sidebar + Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* ── Left Sidebar Navigation ── */}
            <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-white rounded-2xl border border-[#fce4e0] shadow-xs p-4 flex flex-col gap-1.5">

              <Link
                href="/account"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </Link>

              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#069e5d] text-white shadow-xs transition"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <span>My Bookings</span>
              </button>

              <Link href="/account#subscriptions" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>My Subscriptions</span>
              </Link>

              <Link href="/account#wallet" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Wallet</span>
              </Link>

              <Link href="/account#wishlist" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Wishlist</span>
              </Link>

              <Link href="/account#address" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Saved Address</span>
              </Link>

              <Link href="/account#language" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Language</span>
              </Link>

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

            {/* ── Right Main Content Area ── */}
            <div className="flex-1 w-full">
              {/* Header section with Title and Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#701a28] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                    Bookings <span className="text-gray-500 font-medium text-lg">({bookings.length})</span>
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFilter("All")}
                    className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border ${filter === "All"
                      ? "border-[#069e5d] text-[#069e5d] bg-white"
                      : "border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0]"
                      } transition`}
                  >
                    All
                    {filter === "All" && (
                      <div className="w-4 h-4 rounded-full bg-[#069e5d] text-white flex items-center justify-center">
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => setFilter("Ongoing")}
                    className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border ${filter === "Ongoing"
                      ? "border-[#069e5d] text-[#069e5d] bg-white"
                      : "border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0]"
                      } transition`}
                  >
                    Ongoing
                  </button>
                  <button
                    onClick={() => setFilter("Complete")}
                    className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border ${filter === "Complete"
                      ? "border-[#069e5d] text-[#069e5d] bg-white"
                      : "border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0]"
                      } transition`}
                  >
                    Complete
                  </button>
                </div>
              </div>

              {/* Bookings List */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl border border-gray-200" />
                  ))}
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="border border-gray-200 rounded-2xl p-16 text-center bg-white shadow-sm">
                  <div className="text-5xl text-gray-200 mb-4">
                    <i className="fa-solid fa-box-open"></i>
                  </div>
                  <h2 className="text-lg font-bold text-gray-700 mb-2">No Bookings Found</h2>
                  <p className="text-gray-400 text-sm mb-6">
                    You haven&apos;t booked any pujas yet.
                  </p>
                  <Link
                    href="/puja"
                    className="bg-[#069e5d] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#058a51] transition-colors inline-block shadow-sm"
                  >
                    Explore Pujas
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-6 w-full">
                    {filteredBookings.map((booking) => {
                      const items: BookingItem[] =
                        booking.items && booking.items.length > 0
                          ? booking.items
                          : [
                            {
                              title: booking.title || "Sacred Puja Service",
                              quantity: 1,
                              amount: booking.amount,
                              status: "New",
                            },
                          ];

                      return (
                        <div
                          key={booking._id}
                          className="bg-white rounded-[20px] border border-[#a8d5c0] p-5 hover:shadow-sm transition mb-4 relative w-full"
                        >
                          {/* Card Header */}
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 font-bold text-gray-800 text-[13px] sm:text-[15px]">
                              <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(booking.bookingDate)}</span>
                            </div>
                            <div className="font-bold text-gray-800 text-[13px] sm:text-[15px]">
                              Booking: <span className="text-[#3b82f6]">#{booking.orderId}</span>
                            </div>
                          </div>

                          <hr className="border-gray-100 mb-5" />

                          {/* Card Body */}
                          {items.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 mb-6">
                              <div className="w-24 h-16 sm:w-28 sm:h-18 bg-gray-200 rounded-lg overflow-hidden shrink-0 relative border border-gray-100">
                                {item.imageUrl ? (
                                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                                    <i className="fa-solid fa-om text-white text-2xl"></i>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-[16px] sm:text-[18px] font-bold text-[#069e5d] mb-1">{item.title}</h3>
                                <div className="flex items-center gap-1.5 text-gray-700 font-bold text-[13px] sm:text-[15px]">
                                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                  </svg>
                                  <span>Shri Rahu Temple, Paithani,</span>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Progress Tracker */}
                          <div className="relative max-w-[380px] mt-8 pb-2">
                            {/* Background lines */}
                            <div className="absolute top-6 left-12 right-1/2 h-[3px] bg-[#eadecd] -z-10"></div>
                            <div className="absolute top-6 left-1/2 right-14 h-[3px] bg-[#eadecd] -z-10"></div>
                            
                            <div className="flex justify-between items-start text-center">
                              {/* Step 1 */}
                              <div className="flex flex-col items-center w-24">
                                <div className="w-12 h-12 rounded-full border-[2px] border-[#069e5d] bg-white flex items-center justify-center mb-2 z-10 shadow-sm relative">
                                  {/* calendar icon */}
                                  <svg className="w-5 h-5 text-[#069e5d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4" />
                                  </svg>
                                </div>
                                <p className="text-[12px] font-extrabold text-gray-900 leading-tight">Booked</p>
                                <div className="flex items-center justify-center gap-1 mt-0.5">
                                  <span className="text-[11px] font-bold text-gray-600">{formatDate(booking.bookingDate)}</span>
                                  <div className="w-3.5 h-3.5 rounded-full bg-[#069e5d] text-white flex items-center justify-center shrink-0">
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>

                              {/* Step 2 */}
                              <div className="flex flex-col items-center w-24">
                                <div className="w-12 h-12 rounded-full bg-[#fae8e3] flex items-center justify-center mb-2 z-10 shadow-[0_0_0_4px_white]">
                                  {/* diya icon */}
                                  <svg className="w-6 h-6 text-[#a3948e]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8 2 8 8 8 8s-4 0-4 4c0 3 4 5 8 8 4-3 8-5 8-8 0-4-4-4-4-4s0-6-4-6zm0 13c-2 0-4-1-5-2 1 1 3 2 5 2s4-1 5-2c-1 1-3 2-5 2z" />
                                  </svg>
                                </div>
                                <p className="text-[12px] font-bold text-[#a8a19d] leading-tight">Puja Scheduled</p>
                                <p className="text-[11px] font-bold text-[#a8a19d] mt-0.5">on {getScheduledDate(booking.bookingDate)}</p>
                              </div>

                              {/* Step 3 */}
                              <div className="flex flex-col items-center w-28">
                                <div className="h-12 flex items-center justify-center mb-2 z-10 shadow-[0_0_0_4px_white]">
                                  <div className="px-4 py-1.5 rounded-full bg-[#edeae8] text-[#a09691] font-bold text-[12px] flex items-center gap-1.5">
                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                    Puja Video
                                  </div>
                                </div>
                                <p className="text-[10px] font-bold text-[#a8a19d] leading-tight px-1">Available only after puja performed</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* End of Bookings Notification */}
                  <div className="mt-16 mb-8 text-center border-t border-gray-200 pt-8">
                    <p className="text-sm font-bold text-gray-600 mb-1.5">
                      You&apos;ve reached the end of your all bookings
                    </p>
                    <p className="text-xs font-semibold text-gray-400">
                      {filteredBookings.length} of {bookings.length} bookings shown
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

