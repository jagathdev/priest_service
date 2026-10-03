import React from "react";
import Link from "next/link";
import { SparklesIcon, FireIcon, ShoppingBagIcon, BanknotesIcon } from "@heroicons/react/24/outline";

export default async function AdminDashboard() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";
  let stats = { pujas: 0, homas: 0, orders: 0, revenue: 0 };
  let recentBookings: any[] = [];
  let loading = false;

  try {
    const res = await fetch(`${baseUrl}/api/admin/stats`, { cache: "no-store" });
    if (res.ok) {
      const resData = await res.json();
      if (resData.success && resData.data) {
        stats = {
          pujas: resData.data.pujas ?? 0,
          homas: resData.data.homas ?? 0,
          orders: resData.data.orders ?? 0,
          revenue: resData.data.revenue ?? 0,
        };
        if (Array.isArray(resData.data.recentBookings)) {
          recentBookings = resData.data.recentBookings;
        }
      }
    }
  } catch (err) {
    console.error("Failed to load dashboard stats:", err);
  }

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
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500 text-xs">
                    No recent devotee bookings found.
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking: any, idx: number) => (
                  <tr key={booking._id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-900">
                      {booking.participants?.[0]?.name || booking.name || "Devotee"}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {booking.pooja?.title || booking.pooja?.name || booking.serviceName || "Puja Ritual"}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#069e5d] uppercase text-[10px]">
                      {booking.type || "Puja"}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-gray-900">
                      ₹{booking.pricing?.total || booking.amount || 0}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${(booking.paymentStatus || booking.orderStatus) === "paid" || (booking.paymentStatus || booking.orderStatus) === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                        }`}>
                        {booking.orderStatus || booking.paymentStatus || "Confirmed"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
