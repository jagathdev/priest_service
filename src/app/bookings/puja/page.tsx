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
            <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex flex-col gap-1.5">

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
                </svg>
                <span>My Bookings</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>My Subscriptions</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Wallet</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Wishlist</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Saved Address</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Language</span>
              </button>

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
                  <div className="w-8 h-8 rounded-full bg-[#701a28] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
                    </svg>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                    Bookings <span className="text-gray-500 font-medium text-lg">({bookings.length})</span>
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilter("All")}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 border ${filter === "All"
                      ? "border-[#069e5d] text-[#069e5d] bg-white"
                      : "border-transparent text-gray-600 bg-gray-100 hover:bg-gray-200"
                      } transition shadow-sm`}
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
                    className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 border ${filter === "Ongoing"
                      ? "border-[#069e5d] text-[#069e5d] bg-white"
                      : "border-transparent text-gray-600 bg-gray-100 hover:bg-gray-200"
                      } transition shadow-sm`}
                  >
                    Ongoing
                  </button>
                  <button
                    onClick={() => setFilter("Complete")}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 border ${filter === "Complete"
                      ? "border-[#069e5d] text-[#069e5d] bg-white"
                      : "border-transparent text-gray-600 bg-gray-100 hover:bg-gray-200"
                      } transition shadow-sm`}
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          className="bg-white rounded-2xl border border-[#a7f3d0] shadow-sm hover:shadow-md transition-all p-5 flex flex-col relative"
                        >
                          {/* Top: Date and Booking ID */}
                          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(booking.bookingDate)}
                            </div>
                            <div className="text-sm font-semibold text-gray-600">
                              Booking: <span className="text-[#3498db]">#{booking.orderId}</span>
                            </div>
                          </div>

                          {items.map((item, idx) => (
                            <div key={idx} className="mb-6 flex-1">
                              <div className="flex gap-4 items-center">
                                {/* Image */}
                                <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-lg overflow-hidden shrink-0 relative bg-gray-100 border border-gray-100">
                                  {item.imageUrl ? (
                                    <Image src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                                      <i className="fa-solid fa-om text-white text-2xl"></i>
                                    </div>
                                  )}
                                  {/* Optional small overlay tag */}
                                  <div className="absolute top-1 left-1 bg-white rounded flex flex-col items-center px-1 py-0.5 border border-amber-200">
                                    <span className="text-[7px] font-bold text-amber-600 leading-none">Rahu Shanti</span>
                                    <span className="text-[7px] font-bold text-gray-800 leading-none">Rudrabhishek</span>
                                  </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-[#069e5d] font-bold text-[15px] sm:text-[17px] mb-1.5 truncate">{item.title}</h3>
                                  <div className="flex items-center gap-1.5 text-gray-700 text-xs sm:text-sm font-semibold">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
                                    </svg>
                                    <span className="truncate">Shri Rahu Temple, Paithani,</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Progress Tracker Bottom */}
                          <div className="flex items-start justify-between relative mt-4 pt-4 border-t border-gray-50 border-dashed pb-2">
                            {/* Horizontal connecting line */}
                            <div className="absolute top-9 left-[15%] right-[25%] h-[2px] bg-[#f0e6e1] z-0"></div>

                            {/* Step 1: Booked */}
                            <div className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                              <div className="w-10 h-10 rounded-full bg-white border-[2.5px] border-[#069e5d] flex items-center justify-center text-[#069e5d] bg-[#f0fdf4]">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="text-center">
                                <p className="text-[13px] font-extrabold text-gray-900 leading-tight">Booked</p>
                                <div className="flex items-center justify-center gap-1 mt-0.5">
                                  <span className="text-[11px] text-gray-600 font-bold">{formatDate(booking.bookingDate)}</span>
                                  <div className="w-3.5 h-3.5 rounded-full bg-[#069e5d] text-white flex items-center justify-center shrink-0">
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Step 2: Scheduled */}
                            <div className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                              <div className="w-10 h-10 rounded-full bg-[#fcf9f8] border-[2.5px] border-[#f0e6e1] flex items-center justify-center text-gray-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                              </div>
                              <div className="text-center">
                                <p className="text-[13px] font-bold text-gray-400 leading-tight">Puja Scheduled</p>
                                <p className="text-[11px] text-gray-400 font-bold mt-0.5">on {getScheduledDate(booking.bookingDate)}</p>
                              </div>
                            </div>

                            {/* Step 3: Video */}
                            <div className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                              <button className="bg-[#f0e6e1] text-[#9c9189] text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-not-allowed mt-1.5">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 4l12 6-12 6V4z" />
                                </svg>
                                Puja Video
                              </button>
                              <p className="text-[9px] text-[#9c9189] font-bold text-center leading-tight mt-1 px-2">
                                Available only after<br />puja performed
                              </p>
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

