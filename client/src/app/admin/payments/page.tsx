import React from "react";

export default async function AdminPaymentsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
  let data = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    recentTransactions: [] as any[],
  };

  try {
    const res = await fetch(`${baseUrl}/api/admin/payments`, { cache: "no-store" });
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        data = result.data;
      }
    }
  } catch (err) {
    console.error("Error fetching admin payments:", err);
  }

  const stats = {
    totalRevenue: data.totalRevenue || 0,
    monthlyRevenue: data.monthlyRevenue || 0,
    successfulPayments: data.successfulPayments || 0,
    pendingPayments: data.pendingPayments || 0,
  };

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
          <span className="text-[11px] text-green-600 font-bold mt-1 inline-block">Lifetime earnings</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">This Month Revenue</dt>
          <dd className="text-2xl font-black text-gray-900 mt-2">₹{stats.monthlyRevenue.toLocaleString()}</dd>
          <span className="text-[11px] text-gray-400 font-medium mt-1 inline-block">Updated live</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Successful Transactions</dt>
          <dd className="text-2xl font-black text-gray-900 mt-2">{stats.successfulPayments}</dd>
          <span className="text-[11px] text-green-600 font-bold mt-1 inline-block">Completed payments</span>
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
              {data.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                data.recentTransactions.map((txn, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">{txn.transactionId}</td>
                    <td className="px-4 py-3 text-gray-800">{txn.devoteeName}</td>
                    <td className="px-4 py-3 text-gray-500">{txn.method}</td>
                    <td className="px-4 py-3 font-extrabold text-gray-900">₹{txn.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${txn.status === 'paid' ? 'bg-green-100 text-green-700' : txn.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {txn.status}
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
