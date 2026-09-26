"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

interface Booking {
  _id: string;
  orderId: string;
  amount: string;
  currency?: string;
  bookingDate: string;
  status: string;
  bookingType: string;
  title?: string;
}

export default function MyChadhavaBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [customSymbols, setCustomSymbols] = useState<Record<string, string>>({
    INR: "₹",
    USD: "$",
    MYR: "RM",
  });

  useEffect(() => {
    // Fetch custom currency symbols
    fetch("/api/admin/content?type=currency")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const settings = data[0];
          setCustomSymbols({
            INR: settings.inrSymbol || "₹",
            USD: settings.usdSymbol || "$",
            MYR: settings.myrSymbol || "RM",
          });
        }
      })
      .catch((err) => console.error("Error fetching dynamic currency symbols:", err));

    fetch("/api/bookings/me?type=chadhava")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.bookings);
        }
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
         <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-blue-100 text-[#6869F9] rounded-2xl flex items-center justify-center text-xl">
               <i className="fa-solid fa-box-open"></i>
            </div>
            <div>
               <h1 className="text-2xl font-bold text-gray-900">My Chadhava Bookings</h1>
               <p className="text-sm text-gray-500">History of your spiritual offerings</p>
            </div>
         </div>

         {loading ? (
            <div className="space-y-4">
               {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-3xl" />
               ))}
            </div>
         ) : bookings.length === 0 ? (
            <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100 shadow-sm">
               <div className="h-24 w-24 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                  <i className="fa-solid fa-gift"></i>
               </div>
               <h2 className="text-xl font-bold text-gray-900 mb-2">No Bookings Found</h2>
               <p className="text-gray-400 mb-8 max-w-xs mx-auto text-sm italic font-medium">You haven't made any chadhava offerings yet. Join the tradition today.</p>
               <button 
                 onClick={() => window.location.href = '/chadhava'}
                 className="bg-[#6869F9] text-white px-8 py-4 rounded-2xl font-bold uppercase transition-all hover:bg-[#5657e8]"
               >
                  Explore Chadhava
               </button>
            </div>
         ) : (
            <div className="space-y-4">
               {bookings.map((booking) => (
                  <div key={booking._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-center gap-6">
                     <div className="flex items-center gap-6">
                        <div className="h-20 w-20 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 text-3xl">
                           <i className="fa-solid fa-hands-praying"></i>
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold bg-violet-50 text-violet-600 px-2 py-0.5 rounded uppercase tracking-wider">Confirmed</span>
                              <span className="text-[10px] font-bold text-gray-400">Order ID: {booking.orderId}</span>
                           </div>
                           <h3 className="text-lg font-bold text-gray-900 uppercase">{booking.title || 'Spiritual Chadhava'}</h3>
                           <p className="text-xs text-gray-400 font-medium">Booked on {new Date(booking.bookingDate).toLocaleDateString()} at {new Date(booking.bookingDate).toLocaleTimeString()}</p>
                        </div>
                     </div>
                     <div className="text-center sm:text-right">
                        <div className="text-2xl font-black text-[#1f1f1f] mb-1">{customSymbols[booking.currency || "INR"] || "₹"} {booking.amount}</div>
                        <p className="text-[10px] font-bold text-gray-300 uppercase">Transaction ID: {booking._id.substr(-8).toUpperCase()}</p>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </main>
  );
}


