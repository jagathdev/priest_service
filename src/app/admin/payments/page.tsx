"use client";

import React, { useEffect, useState } from "react";

export default function AdminPaymentsPage() {
  const [stats, setStats] = useState({
    totalRevenue: 24580,
    monthlyRevenue: 12400,
    successfulPayments: 48,
    pendingPayments: 2,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments &amp; Revenue Analytics</h1>
        <p className="text-xs text-gray-500 mt-1">Real-time revenue metrics, payment gateway transaction status &amp; earnings.</p>
      </div>

      {/* Revenue Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</dt>
          <dd className="text-2xl font-black text-[#069e5d] mt-2">₹{stats.totalRevenue.toLocaleString()}</dd>
          <span className="text-[11px] text-green-600 font-bold mt-1 inline-block">↑ 14% this month</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">This Month Revenue</dt>
          <dd className="text-2xl font-black text-gray-900 mt-2">₹{stats.monthlyRevenue.toLocaleString()}</dd>
          <span className="text-[11px] text-gray-400 font-medium mt-1 inline-block">Updated live</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Successful Transactions</dt>
          <dd className="text-2xl font-black text-gray-900 mt-2">{stats.successfulPayments}</dd>
          <span className="text-[11px] text-green-600 font-bold mt-1 inline-block">98.2% Success rate</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Settlement</dt>
          <dd className="text-2xl font-black text-amber-600 mt-2">{stats.pendingPayments}</dd>
          <span className="text-[11px] text-gray-400 font-medium mt-1 inline-block">In processing</span>
        </div>
      </div>

      {/* Recent Payment Transactions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Recent Payment Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Devotee</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-gray-900">TXN-8849102</td>
                <td className="px-4 py-3 text-gray-800">Jagath</td>
                <td className="px-4 py-3 text-gray-500">Razorpay / UPI</td>
                <td className="px-4 py-3 font-extrabold text-gray-900">₹516</td>
                <td className="px-4 py-3"><span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Success</span></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-gray-900">TXN-8849101</td>
                <td className="px-4 py-3 text-gray-800">Ramesh Sharma</td>
                <td className="px-4 py-3 text-gray-500">Credit Card</td>
                <td className="px-4 py-3 font-extrabold text-gray-900">₹501</td>
                <td className="px-4 py-3"><span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Success</span></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-gray-900">TXN-8849100</td>
                <td className="px-4 py-3 text-gray-800">Priya Raman</td>
                <td className="px-4 py-3 text-gray-500">Net Banking</td>
                <td className="px-4 py-3 font-extrabold text-gray-900">₹116</td>
                <td className="px-4 py-3"><span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Success</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
