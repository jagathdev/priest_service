"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SparklesIcon, FireIcon, ShoppingBagIcon, BanknotesIcon } from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pujas: 12,
    homas: 10,
    orders: 48,
    revenue: 24580,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStats((prev) => ({
            ...prev,
            pujas: data.puja || prev.pujas,
            homas: data.homa || prev.homas,
            orders: data.orders || prev.orders,
          }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-xs text-gray-500 mt-1">Manage Pujas, Homas, Bookings, Devotee Orders &amp; Revenue Metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pujas"
            className="px-4 py-2.5 rounded-xl bg-[#069e5d] text-white text-xs font-bold hover:bg-[#058a51] transition flex items-center gap-1.5 shadow-xs"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>+ Add Puja</span>
          </Link>
          <Link
            href="/admin/homas"
            className="px-4 py-2.5 rounded-xl bg-[#5b1422] text-white text-xs font-bold hover:bg-[#47101a] transition flex items-center gap-1.5 shadow-xs"
          >
            <FireIcon className="w-4 h-4" />
            <span>+ Add Homa</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Total Pujas Card */}
        <Link href="/admin/pujas" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Pujas</dt>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
          <dd className="text-3xl font-black text-gray-900 mt-3">{loading ? "..." : stats.pujas}</dd>
          <span className="text-xs font-bold text-[#069e5d] mt-2 inline-block group-hover:underline">Manage Pujas →</span>
        </Link>

        {/* Total Homas Card */}
        <Link href="/admin/homas" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Homas</dt>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#5b1422] flex items-center justify-center">
              <FireIcon className="w-5 h-5" />
            </div>
          </div>
          <dd className="text-3xl font-black text-gray-900 mt-3">{loading ? "..." : stats.homas}</dd>
          <span className="text-xs font-bold text-[#069e5d] mt-2 inline-block group-hover:underline">Manage Homas →</span>
        </Link>

        {/* Total Orders Card */}
        <Link href="/admin/orders" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Bookings</dt>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBagIcon className="w-5 h-5" />
            </div>
          </div>
          <dd className="text-3xl font-black text-gray-900 mt-3">{loading ? "..." : stats.orders}</dd>
          <span className="text-xs font-bold text-[#069e5d] mt-2 inline-block group-hover:underline">View Bookings →</span>
        </Link>

        {/* Total Revenue Card */}
        <Link href="/admin/payments" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</dt>
            <div className="w-9 h-9 rounded-xl bg-green-50 text-[#069e5d] flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5" />
            </div>
          </div>
          <dd className="text-3xl font-black text-[#069e5d] mt-3">₹{stats.revenue.toLocaleString()}</dd>
          <span className="text-xs font-bold text-[#069e5d] mt-2 inline-block group-hover:underline">Revenue Details →</span>
        </Link>
      </div>

      {/* Quick Recent Bookings Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Devotee Bookings</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-[#069e5d] hover:underline">View All →</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Devotee Name</th>
                <th className="px-4 py-3">Service Ritual</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-bold text-gray-900">Jagath</td>
                <td className="px-4 py-3 text-gray-800">Rudrabhishekam for 11 Mondays in Kashi</td>
                <td className="px-4 py-3 font-bold text-[#069e5d] uppercase text-[10px]">Homa</td>
                <td className="px-4 py-3 font-extrabold text-gray-900">₹516</td>
                <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Confirmed</span></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-bold text-gray-900">Ramesh Sharma</td>
                <td className="px-4 py-3 text-gray-800">Ganesh Chaturthi Mahapuja</td>
                <td className="px-4 py-3 font-bold text-[#069e5d] uppercase text-[10px]">Puja</td>
                <td className="px-4 py-3 font-extrabold text-gray-900">₹501</td>
                <td className="px-4 py-3"><span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
