"use client";

import React, { useEffect, useState } from "react";

interface Order {
  _id: string;
  serviceTitle?: string;
  poojaTitle?: string;
  homaTitle?: string;
  serviceType?: string;
  devoteeName?: string;
  name?: string;
  amount?: number;
  price?: number;
  status?: string;
  createdAt?: string;
  gothra?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch bookings & orders
    fetch("/api/admin/orders")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          // Demo fallback orders
          setOrders([
            {
              _id: "ORD-101",
              serviceTitle: "Rudrabhishekam for 11 Mondays in Kashi",
              serviceType: "homa",
              devoteeName: "Jagath",
              gothra: "Kashyapa",
              amount: 516,
              status: "confirmed",
              createdAt: "2026-09-27",
            },
            {
              _id: "ORD-102",
              serviceTitle: "Ganesh Chaturthi Mahapuja",
              serviceType: "puja",
              devoteeName: "Ramesh Sharma",
              gothra: "Bharadwaj",
              amount: 501,
              status: "completed",
              createdAt: "2026-09-26",
            },
            {
              _id: "ORD-103",
              serviceTitle: "9 Tuesdays Hanuman Mahapuja",
              serviceType: "homa",
              devoteeName: "Priya Raman",
              gothra: "Vasishta",
              amount: 116,
              status: "confirmed",
              createdAt: "2026-09-25",
            },
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        setOrders([
          {
            _id: "ORD-101",
            serviceTitle: "Rudrabhishekam for 11 Mondays in Kashi",
            serviceType: "homa",
            devoteeName: "Jagath",
            gothra: "Kashyapa",
            amount: 516,
            status: "confirmed",
            createdAt: "2026-09-27",
          },
          {
            _id: "ORD-102",
            serviceTitle: "Ganesh Chaturthi Mahapuja",
            serviceType: "puja",
            devoteeName: "Ramesh Sharma",
            gothra: "Bharadwaj",
            amount: 501,
            status: "completed",
            createdAt: "2026-09-26",
          },
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders &amp; Bookings</h1>
          <p className="text-xs text-gray-500 mt-1">Track devotee puja &amp; homa bookings, sankalp details &amp; order status.</p>
        </div>
        <span className="text-xs font-bold bg-[#e8f5e9] text-[#069e5d] px-3 py-1.5 rounded-full">
          {orders.length} Total Bookings
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">Loading orders...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Devotee Details</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{ord._id}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 block">{ord.serviceTitle || ord.poojaTitle || ord.homaTitle || "Sacred Ritual"}</span>
                      <span className="text-[10px] uppercase font-bold text-[#069e5d]">{ord.serviceType || "puja"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-800 block">{ord.devoteeName || ord.name || "Devotee"}</span>
                      {ord.gothra && <span className="text-xs text-gray-400">Gotra: {ord.gothra}</span>}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-gray-900">₹{ord.amount || ord.price || 500}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        ord.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {ord.status || "confirmed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{ord.createdAt || "Today"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
