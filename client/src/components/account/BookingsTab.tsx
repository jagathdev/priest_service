"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import { request } from "@/lib/api-client";

const formatBookingId = (order: any) => {
  if (order?.orderNumber) {
    const clean = String(order.orderNumber).trim();
    if (clean.startsWith("#")) return clean;
    if (clean.includes("-")) {
      const parts = clean.split("-");
      return `#${parts[parts.length - 1]}`;
    }
    return `#${clean}`;
  }
  if (order?._id) {
    return `#${String(order._id).slice(-6).toUpperCase()}`;
  }
  return "#200627";
};

const formatCardDate = (dateVal: any, fallback = "25 Sept 2026") => {
  if (!dateVal) return fallback;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return fallback;
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function BookingsTab() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filter, setFilter] = useState("All");

  const fetchOrders = useCallback(async () => {
    if (!user?._id && !user?.id) return;
    try {
      const data = await request<any>(`/api/orders/user/${user._id || user.id}`);
      if (data.success) {
        setOrders(data.data);
        
        // Also update selectedOrder if it exists to reflect new status
        setSelectedOrder((prev: any) => {
          if (!prev) return null;
          const updated = data.data.find((o: any) => o._id === prev._id);
          return updated || prev;
        });
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Polling logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    const hasPending = orders.some((o) => o.paymentStatus === "pending" || o.orderStatus === "pending");
    
    if (hasPending) {
      interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchOrders();
        }
      }, 20000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orders, fetchOrders]);

  if (loading) {
    return <div className="p-8 text-center text-stone-500 font-medium">Loading your bookings...</div>;
  }

  if (selectedOrder) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => setSelectedOrder(null)} className="flex items-center text-sm font-bold text-stone-500 hover:text-success transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Bookings
        </button>

        <div>
          <h2 className="text-3xl font-extrabold text-[#5c1b1c] font-serif mb-2">Puja Booking Details</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-stone-100 text-stone-600 px-3 py-1 rounded-full">Booking ID <span className="text-[#2563eb] font-extrabold">{formatBookingId(selectedOrder)}</span></span>
          </div>
        </div>

        <div className="bg-[#fdfaf8] border border-orange-100 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="bg-[#5c1b1c] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">{selectedOrder.orderStatus || 'ONGOING'}</span>
          </div>

          <div className="mb-6">
            <span className="text-[10px] font-extrabold text-[#f15a29] bg-orange-100 px-2.5 py-1 rounded-md uppercase tracking-wider mb-3 inline-block">• In Progress</span>
            <h3 className="text-xl font-bold text-[#5c1b1c] font-serif">{selectedOrder.itemName || selectedOrder.pooja}</h3>
            <p className="text-sm text-stone-500 font-medium mt-1">Performed with personalized sankalpam in your family's name.</p>
          </div>

          <div className="grid grid-cols-2 gap-y-6">
            {selectedOrder.temple && (
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-[#f15a29] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Temple</p>
                  <p className="text-sm font-semibold text-stone-800">{selectedOrder.temple}</p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-[#f15a29] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase">Puja Date</p>
                <p className="text-sm font-semibold text-stone-800">{formatCardDate(selectedOrder.bookingDate || selectedOrder.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <span className="inline-flex items-center text-xs font-bold text-stone-600 bg-white border border-stone-200 rounded-full px-4 py-2 shadow-sm">
              Video available after the puja
            </span>
          </div>
        </div>

        {/* Devotee Details */}
        <div className="border border-stone-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#5c1b1c] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h4 className="font-bold text-stone-800">Devotee Details</h4>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {(selectedOrder.participants || []).map((p: any, i: number) => (
              <span key={i} className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-full text-xs font-bold text-stone-700 capitalize">
                {p.name || p}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
            {selectedOrder.gotra && (
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Gotra</p>
                <p className="text-sm font-semibold text-stone-800">{selectedOrder.gotra}</p>
              </div>
            )}
            {selectedOrder.wish && (
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Sankalpam</p>
                <p className="text-sm font-semibold text-stone-800">{selectedOrder.wish}</p>
              </div>
            )}
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="border border-stone-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#5c1b1c] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h4 className="font-bold text-stone-800">Puja Journey</h4>
          </div>

          <div className={`space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 ${selectedOrder.orderStatus === 'completed' || selectedOrder.orderStatus === 'performed' ? 'before:bg-success' : selectedOrder.orderStatus === 'scheduled' ? 'before:bg-gradient-to-b before:from-success before:via-success before:to-stone-200' : 'before:bg-gradient-to-b before:from-success before:via-stone-200 before:to-stone-200'}`}>

            <div className="relative flex items-center justify-end md:justify-between md:odd:flex-row-reverse group is-active">
              <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-success text-white shadow shrink-0 z-10">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 border border-stone-100 rounded-xl bg-stone-50">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1">Step 1</div>
                <h5 className="font-bold text-stone-800">Booking Confirmed</h5>
                <p className="text-xs text-stone-500 font-medium mt-1">{new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • Payment received</p>
              </div>
            </div>

            <div className="relative flex items-center justify-end md:justify-between md:odd:flex-row-reverse group is-active">
              <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-success text-white shadow shrink-0 z-10">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 border border-stone-100 rounded-xl bg-stone-50">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1">Step 2</div>
                <h5 className="font-bold text-stone-800">Sankalpam Details Submitted</h5>
                <p className="text-xs text-stone-500 font-medium mt-1">Devotee names & gotra noted</p>
              </div>
            </div>

            <div className={`relative flex items-center justify-end md:justify-between md:odd:flex-row-reverse group ${selectedOrder.orderStatus === 'scheduled' || selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? 'is-active' : ''}`}>
              <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow shrink-0 z-10 ${selectedOrder.orderStatus === 'scheduled' || selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? 'bg-success text-white' : 'bg-white'}`}>
                {selectedOrder.orderStatus === 'scheduled' || selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                )}
              </div>
              <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 border border-stone-100 rounded-xl ${selectedOrder.orderStatus === 'scheduled' || selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? 'bg-stone-50' : 'bg-white opacity-60'}`}>
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1">Step 3</div>
                <h5 className="font-bold text-stone-800">Puja Scheduled</h5>
                <p className="text-xs text-stone-500 font-medium mt-1">Muhurat - {selectedOrder.scheduledDate ? new Date(selectedOrder.scheduledDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date(selectedOrder.bookingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>

            <div className={`relative flex items-center justify-end md:justify-between md:odd:flex-row-reverse group ${selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? 'is-active' : ''}`}>
              <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow shrink-0 z-10 ${selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? 'bg-success text-white' : 'bg-white'}`}>
                {selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                )}
              </div>
              <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 border border-stone-100 rounded-xl ${selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? 'bg-stone-50' : 'bg-white opacity-60'}`}>
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1">Step 4</div>
                <h5 className="font-bold text-stone-800">Video Delivered</h5>
                {selectedOrder.videoLink && (selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed') ? (
                  <a href={selectedOrder.videoLink} target="_blank" rel="noreferrer" className="text-xs text-success font-bold mt-1 inline-block underline">Watch Recording</a>
                ) : (
                  <p className="text-xs text-stone-500 font-medium mt-1">Available after the puja</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === "All") return true;
    if (filter === "Ongoing") return o.orderStatus !== "completed" && o.orderStatus !== "cancelled";
    if (filter === "Complete") return o.orderStatus === "completed";
    return true;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 min-h-[500px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
            Bookings <span className="text-gray-500 font-medium text-lg ml-1">({orders.length})</span>
          </h2>
          <button onClick={fetchOrders} className="ml-2 p-1.5 rounded-full hover:bg-stone-100 transition-colors text-stone-500" aria-label="Refresh bookings" title="Refresh">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter("All")}
            className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border transition ${filter === "All"
              ? "border-success text-success bg-white shadow-sm"
              : "border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0]"
              }`}
          >
            All
            {filter === "All" && (
              <div className="w-4 h-4 rounded-full bg-success text-white flex items-center justify-center">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
          <button
            onClick={() => setFilter("Ongoing")}
            className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border transition ${filter === "Ongoing"
              ? "border-2 border-black text-[#1d3557] bg-[#e5e7eb] shadow-sm"
              : "border-2 border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0]"
              }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setFilter("Complete")}
            className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border transition ${filter === "Complete"
              ? "border-2 border-black text-[#1d3557] bg-[#e5e7eb] shadow-sm"
              : "border-2 border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0]"
              }`}
          >
            Complete
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <p className="text-stone-500 font-medium">You have no active bookings.</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
            {filteredOrders.map((order, idx) => {
              const bookingDate = formatCardDate(order.createdAt || order.bookingDate);
              const scheduledDate = formatCardDate(order.bookingDate || order.scheduledDate || order.createdAt, "12 Oct 2026");
              const bookingId = formatBookingId(order);
              const serviceImg = order.image || order.serviceImage || order.imageUrl || "/images/Ganesh-Chaturthi-Mahapuja.jpg";
              const serviceTitle = order.itemName || order.pooja || order.serviceTitle || "Rahu Shanti Rudrabhishek";
              const templeLocation = order.temple || order.templeLocation || "Shri Rahu Temple, Paithani,";

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-[24px] sm:rounded-3xl border border-[#cfead9] p-5 sm:p-6 hover:shadow-md transition relative w-full cursor-pointer"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 font-bold text-gray-800 text-[14px] sm:text-[15px]">
                      <svg className="w-4 h-4 text-gray-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{bookingDate}</span>
                    </div>
                    <div className="font-bold text-gray-800 text-[14px] sm:text-[15px]">
                      Booking: <span className="text-[#2563eb] font-extrabold">{bookingId}</span>
                    </div>
                  </div>

                  <hr className="border-gray-100 my-4" />

                  {/* Card Body - Dynamic Image and Service Details */}
                  <div className="flex items-start gap-3.5 sm:gap-4 mb-6">
                    <div className="w-24 h-16 sm:w-28 sm:h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative border border-gray-100 shadow-xs flex items-center justify-center">
                      <img
                        src={serviceImg}
                        alt={serviceTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/Ganesh-Chaturthi-Mahapuja.jpg";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[16px] sm:text-[18px] font-extrabold text-[#009b46] leading-snug mb-1.5 line-clamp-2">
                        {serviceTitle}
                      </h3>
                      <div className="flex items-center gap-1.5 text-gray-800 font-bold text-[13px] sm:text-[14px]">
                        <svg className="w-4 h-4 text-gray-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v3" />
                          <path d="M7 6l5-3 5 3v2H7V6z" />
                          <path d="M5 10h14v11H5V10z" />
                          <path d="M10 21v-5a2 2 0 0 1 4 0v5" />
                        </svg>
                        <span className="truncate">{templeLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Tracker Stepper */}
                  <div className="relative mt-8 pb-2">
                    {/* Connecting line behind nodes */}
                    <div className="absolute top-6 left-10 right-14 sm:left-12 sm:right-16 h-[2px] bg-[#eadfd5] -z-0"></div>

                    <div className="flex justify-between items-start text-center">
                      {/* Step 1: Booked */}
                      <div className="flex flex-col items-center w-24 sm:w-28">
                        <div className="w-12 h-12 rounded-full border-2 border-[#22c55e] bg-white flex items-center justify-center mb-2 z-10 shadow-xs relative">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="5" width="18" height="15" rx="2.5" stroke="#374151" strokeWidth="1.6" fill="#ffffff" />
                            <path d="M3 9.5h18" stroke="#ef4444" strokeWidth="1.6" />
                            <path d="M7 3v3.5M17 3v3.5" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" />
                            <circle cx="12" cy="14.5" r="2.2" fill="#3b82f6" />
                          </svg>
                        </div>
                        <p className="text-[13px] font-extrabold text-gray-900 leading-tight">Booked</p>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <span className="text-[11px] sm:text-[12px] font-bold text-gray-600">{bookingDate}</span>
                          <div className="w-3.5 h-3.5 rounded-full bg-[#009b46] text-white flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Puja Scheduled */}
                      <div className="flex flex-col items-center w-28 sm:w-32">
                        <div className="w-12 h-12 rounded-full bg-[#faebe6] flex items-center justify-center mb-2 z-10 shadow-xs">
                          <svg className="w-6 h-6 text-[#8c7b74]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.5c-.8 1.4-1.8 3-1.8 4.5 0 1.2.8 2 1.8 2s1.8-.8 1.8-2c0-1.5-1-3.1-1.8-4.5zM4 14.5c0 3.2 3.6 5.5 8 5.5s8-2.3 8-5.5H4zm-1-1.5h18c.5 0 1-.4 1-.9 0-.5-.5-.9-1-.9H3c-.5 0-1 .4-1 .9 0 .5.5.9 1 .9z" />
                          </svg>
                        </div>
                        <p className="text-[12px] sm:text-[13px] font-bold text-[#8c7b74] leading-tight">Puja Scheduled</p>
                        <p className="text-[11px] font-bold text-[#8c7b74] mt-0.5">on {scheduledDate}</p>
                      </div>

                      {/* Step 3: Puja Video */}
                      <div className="flex flex-col items-center w-28 sm:w-36">
                        <div className="h-12 flex items-center justify-center mb-2 z-10">
                          {order.orderStatus === 'performed' || order.orderStatus === 'completed' ? (
                            <a
                              href={order.videoLink || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-full bg-[#009b46] text-white font-bold text-[12px] flex items-center gap-1.5 hover:bg-green-700 transition shadow-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              <span>Watch Video</span>
                            </a>
                          ) : (
                            <div className="px-4 py-2 rounded-full bg-[#f4ebe6] text-[#8c7b74] font-bold text-[12px] flex items-center gap-1.5 shadow-xs">
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              <span>Puja Video</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-[11px] font-medium text-[#8c7b74] text-center leading-tight mt-0.5">
                          {order.orderStatus === 'performed' || order.orderStatus === 'completed'
                            ? "Recording is ready"
                            : <>Available only after<br className="hidden sm:inline" /> puja performed</>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-8">
            <p className="text-xs font-bold text-stone-400">You've reached the end of your bookings</p>
            <p className="text-[10px] font-semibold text-stone-400 mt-1">{filteredOrders.length} of {orders.length} bookings shown</p>
          </div>
        </div>
      )}
    </div>
  );
}
