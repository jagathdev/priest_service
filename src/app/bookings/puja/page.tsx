"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    }) + " (EST)";
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        {/* Page Title */}
        <h1 className="text-[22px] font-bold text-[#c0392b] mb-6">
          Order Status &amp; History
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-gray-100 animate-pulse rounded border border-gray-200" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="border border-gray-200 rounded p-16 text-center bg-[#fafafa]">
            <div className="text-5xl text-gray-200 mb-4">
              <i className="fa-solid fa-box-open"></i>
            </div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">No Orders Found</h2>
            <p className="text-gray-400 text-sm mb-6">
              You haven&apos;t booked any pujas yet.
            </p>
            <button
              onClick={() => (window.location.href = "/puja")}
              className="bg-[#e66a1f] text-white px-6 py-2.5 rounded text-sm font-bold hover:bg-[#d55f18] transition-colors"
            >
              Explore Pujas
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => {
              // Build items list — if items array exists use it, else create one from top-level fields
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

              const currSymbol =
                booking.currency === "USD"
                  ? "US $"
                  : booking.currency === "MYR"
                  ? "RM"
                  : "₹";

              return (
                <div
                  key={booking._id}
                  className="border border-gray-300 rounded bg-white overflow-hidden"
                >
                  {/* Order Number Header */}
                  <div className="px-4 py-2 bg-[#f5f5f5] border-b border-gray-200">
                    <span className="inline-block bg-[#e66a1f] text-white text-[13px] font-bold px-3 py-1 rounded-sm">
                      Order Number : {booking.orderId}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-100">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 px-5 py-4"
                      >
                        {/* Puja Image */}
                        <div className="w-16 h-16 rounded border border-gray-200 bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <i className="fa-solid fa-om text-white text-2xl"></i>
                          )}
                        </div>

                        {/* Title + Quantity */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[#e66a1f] text-sm font-semibold hover:underline cursor-pointer leading-snug">
                            {item.title}
                          </p>
                          <p className="text-gray-600 text-[13px] mt-1">
                            Quantity : {item.quantity || 1}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="text-[13px] text-gray-600 shrink-0 min-w-[120px] text-center">
                          Status :{" "}
                          <span className="font-medium text-gray-800">
                            {item.status || booking.status || "New"}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="text-[13px] font-semibold text-gray-800 shrink-0 text-right min-w-[70px]">
                          {Number(item.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer: Date + Total */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-[#fafafa]">
                    <p className="text-[#4a90d9] text-[13px] font-medium">
                      Order Date :{" "}
                      <span className="font-semibold">
                        {formatDate(booking.bookingDate)}
                      </span>
                    </p>
                    <p className="text-[#4a90d9] text-[13px] font-semibold">
                      Total Paid({currSymbol}) :{" "}
                      <span className="text-gray-800 font-bold ml-1">
                        {Number(booking.amount).toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
