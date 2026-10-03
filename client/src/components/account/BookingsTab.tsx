"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

export default function BookingsTab() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?._id && !user?.id) return;
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";
        const res = await fetch(`${baseUrl}/api/orders/user/${user._id || user.id}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-stone-500 font-medium">Loading your bookings...</div>;
  }

  if (selectedOrder) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => setSelectedOrder(null)} className="flex items-center text-sm font-bold text-stone-500 hover:text-[#00b050] transition-colors">
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
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#00b050] before:via-stone-200 before:to-stone-200">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-[#00b050] text-white shadow shrink-0 z-10">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:mr-10 md:group-odd:ml-10 md:group-odd:mr-0 p-4 border border-stone-100 rounded-xl bg-stone-50">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1">Step 1</div>
                <h5 className="font-bold text-stone-800">Booking Confirmed</h5>
                <p className="text-xs text-stone-500 font-medium mt-1">{new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • Payment received</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-[#00b050] text-white shadow shrink-0 z-10">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:mr-10 md:group-odd:ml-10 md:group-odd:mr-0 p-4 border border-stone-100 rounded-xl bg-stone-50">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1">Step 2</div>
                <h5 className="font-bold text-stone-800">Sankalpam Details Submitted</h5>
                <p className="text-xs text-stone-500 font-medium mt-1">Devotee names & gotra noted</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-white shadow shrink-0 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:mr-10 md:group-odd:ml-10 md:group-odd:mr-0 p-4 border border-stone-100 rounded-xl bg-white opacity-60">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1">Step 3</div>
                <h5 className="font-bold text-stone-800">Puja Scheduled</h5>
                <p className="text-xs text-stone-500 font-medium mt-1">Muhurat - {new Date(selectedOrder.bookingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-white shadow shrink-0 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:mr-10 md:group-odd:ml-10 md:group-odd:mr-0 p-4 border border-stone-100 rounded-xl bg-white opacity-60">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1">Step 4</div>
                <h5 className="font-bold text-stone-800">Video Delivered</h5>
                <p className="text-xs text-stone-500 font-medium mt-1">Available after the puja</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 min-h-[500px]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-[#5c1b1c]">
          Bookings <span className="text-sm font-semibold text-stone-400 font-sans ml-2">({orders.length})</span>
        </h2>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 rounded-full border border-[#00b050] text-[#00b050] bg-green-50 text-sm font-bold flex items-center gap-1.5 shadow-sm">
            All <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </button>
          <button className="px-4 py-1.5 rounded-full border border-stone-200 text-stone-600 bg-stone-50 hover:bg-stone-100 text-sm font-bold transition-colors">
            Ongoing
          </button>
          <button className="px-4 py-1.5 rounded-full border border-stone-200 text-stone-600 bg-stone-50 hover:bg-stone-100 text-sm font-bold transition-colors">
            Complete
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <p className="text-stone-500 font-medium">You have no active bookings.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, idx) => {
            const bookingDate = new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            const scheduledDate = new Date(order.bookingDate || order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedOrder(order)}
                className="border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="bg-stone-50 px-5 py-3 border-b border-stone-200 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                    <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {bookingDate}
                  </div>
                  <div className="text-xs font-bold text-stone-500">
                    Booking: <span className="text-[#3b82f6]">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-16 bg-orange-50 rounded-lg overflow-hidden shrink-0 border border-orange-100 flex items-center justify-center relative">
                      {order.image ? (
                        <img src={order.image} alt={order.itemName || order.pooja} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-[#5c1b1c]/10 mix-blend-multiply"></div>
                          <svg className="w-6 h-6 text-[#f15a29] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#00b050] text-lg mb-1 group-hover:text-[#009644] transition-colors">{order.itemName || order.pooja}</h3>
                      {order.temple && (
                        <p className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {order.temple}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4 relative before:absolute before:top-1/2 before:left-0 before:w-full before:h-0.5 before:-translate-y-1/2 before:bg-gradient-to-r before:from-[#00b050] before:via-stone-200 before:to-stone-200 before:-z-10">
                    
                    <div className="flex flex-col items-center text-center w-1/3 bg-white">
                      <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center border-2 border-[#00b050] mb-2 shadow-sm">
                        <svg className="w-4 h-4 text-[#00b050]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-[11px] font-extrabold text-stone-800">Booked</p>
                      <p className="text-[10px] font-bold text-[#00b050] mt-0.5 flex items-center gap-1 justify-center">
                        {bookingDate} <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      </p>
                    </div>

                    <div className="flex flex-col items-center text-center w-1/3 bg-white">
                      <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center mb-2 border-2 border-transparent">
                        <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      </div>
                      <p className="text-[11px] font-bold text-stone-500">Puja Scheduled</p>
                      <p className="text-[10px] font-semibold text-stone-400 mt-0.5">on {scheduledDate}</p>
                    </div>

                    <div className="flex flex-col items-center text-center w-1/3 bg-white">
                      <div className="px-3 py-1 bg-stone-100 rounded-full flex items-center justify-center mb-2 border border-stone-200 gap-1.5">
                        <svg className="w-3 h-3 text-stone-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                        <span className="text-[10px] font-bold text-stone-500">Puja Video</span>
                      </div>
                      <p className="text-[10px] font-semibold text-stone-400 max-w-[120px] leading-tight mt-0.5">Available only after puja performed</p>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

          <div className="text-center pt-8">
            <p className="text-xs font-bold text-stone-400">You've reached the end of your bookings</p>
            <p className="text-[10px] font-semibold text-stone-400 mt-1">{orders.length} of {orders.length} bookings shown</p>
          </div>
        </div>
      )}
    </div>
  );
}
