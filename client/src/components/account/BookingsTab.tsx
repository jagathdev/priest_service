"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

export default function BookingsTab() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function fetchOrders() {
      if (!user?._id && !user?.id) return;
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
        const res = await fetch(`${baseUrl}/api/orders/user/${user._id || user.id}`);
        const data = await res.json();
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
    }
    
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [user]);

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
            <span className="text-xs font-bold bg-stone-100 text-stone-600 px-3 py-1 rounded-full">Booking ID <span className="text-[#f15a29]">#{selectedOrder.orderNumber || selectedOrder._id.slice(-6).toUpperCase()}</span></span>
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
                <p className="text-sm font-semibold text-stone-800">{new Date(selectedOrder.bookingDate || selectedOrder.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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
              const bookingDate = new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
              const scheduledDate = new Date(order.bookingDate || order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-[20px] border border-[#a8d5c0] p-5 hover:shadow-sm transition relative w-full cursor-pointer"
                >
                {/* Card Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-[13px] sm:text-[15px]">
                    <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{bookingDate}</span>
                  </div>
                  <div className="font-bold text-gray-800 text-[13px] sm:text-[15px]">
                    Booking: <span className="text-[#3b82f6]">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>

                <hr className="border-gray-100 mb-5" />

                {/* Card Body */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-24 h-16 sm:w-28 sm:h-18 bg-gray-200 rounded-lg overflow-hidden shrink-0 relative border border-gray-100 flex items-center justify-center">
                    {order.image ? (
                      <img src={order.image} alt={order.itemName || order.pooja} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                        <i className="fa-solid fa-om text-white text-2xl"></i>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[16px] sm:text-[18px] font-bold text-success mb-1">{order.itemName || order.pooja || "Sacred Puja Service"}</h3>
                    {order.temple ? (
                      <div className="flex items-center gap-1.5 text-gray-700 font-bold text-[13px] sm:text-[15px]">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        <span>{order.temple}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-gray-700 font-bold text-[13px] sm:text-[15px]">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        <span>Shri Rahu Temple, Paithani,</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Tracker */}
                <div className="relative max-w-[380px] mt-8 pb-2">
                  <div className={`absolute top-6 left-12 right-1/2 h-[3px] -z-10 ${order.orderStatus === 'scheduled' || order.orderStatus === 'performed' || order.orderStatus === 'completed' ? 'bg-success' : 'bg-[#eadecd]'}`}></div>
                  <div className={`absolute top-6 left-1/2 right-14 h-[3px] -z-10 ${order.orderStatus === 'performed' || order.orderStatus === 'completed' ? 'bg-success' : 'bg-[#eadecd]'}`}></div>

                  <div className="flex justify-between items-start text-center">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center w-24">
                      <div className="w-12 h-12 rounded-full border-[2px] border-success bg-white flex items-center justify-center mb-2 z-10 shadow-sm relative">
                        <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4" />
                        </svg>
                      </div>
                      <p className="text-[12px] font-extrabold text-gray-900 leading-tight">Booked</p>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className="text-[11px] font-bold text-gray-600">{bookingDate}</span>
                        <div className="w-3.5 h-3.5 rounded-full bg-success text-white flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center w-24">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 z-10 shadow-[0_0_0_4px_white] ${order.orderStatus === 'scheduled' || order.orderStatus === 'performed' || order.orderStatus === 'completed' ? 'border-[2px] border-success bg-white' : 'bg-[#fae8e3]'}`}>
                        <svg className={`w-6 h-6 ${order.orderStatus === 'scheduled' || order.orderStatus === 'performed' || order.orderStatus === 'completed' ? 'text-success' : 'text-[#a3948e]'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8 2 8 8 8 8s-4 0-4 4c0 3 4 5 8 8 4-3 8-5 8-8 0-4-4-4-4-4s0-6-4-6zm0 13c-2 0-4-1-5-2 1 1 3 2 5 2s4-1 5-2c-1 1-3 2-5 2z" />
                        </svg>
                      </div>
                      <p className={`text-[12px] font-bold leading-tight ${order.orderStatus === 'scheduled' || order.orderStatus === 'performed' || order.orderStatus === 'completed' ? 'text-gray-900' : 'text-[#a8a19d]'}`}>Puja Scheduled</p>
                      <p className={`text-[11px] font-bold mt-0.5 ${order.orderStatus === 'scheduled' || order.orderStatus === 'performed' || order.orderStatus === 'completed' ? 'text-gray-600' : 'text-[#a8a19d]'}`}>
                        on {scheduledDate}
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center w-28">
                      <div className="h-12 flex items-center justify-center mb-2 z-10 shadow-[0_0_0_4px_white]">
                        {order.orderStatus === 'performed' || order.orderStatus === 'completed' ? (
                          <a href={order.videoLink || "#"} target="_blank" rel="noreferrer" className="px-4 py-1.5 rounded-full bg-success text-white font-bold text-[12px] flex items-center gap-1.5 hover:bg-green-700 transition" onClick={(e) => e.stopPropagation()}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                            Watch Video
                          </a>
                        ) : (
                          <div className="px-4 py-1.5 rounded-full bg-[#fae8e3] text-[#a3948e] font-bold text-[12px] flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                            Puja Video
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-[#a8a19d] leading-tight mt-0.5">
                        {order.orderStatus === 'performed' || order.orderStatus === 'completed' ? "Recording is ready" : "Available only after puja performed"}
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
