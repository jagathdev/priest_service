import React from "react";

interface Order {
  _id: string;
  orderNumber: string;
  pooja: any;
  itemName?: string;
  customerName: string;
  whatsappNumber: string;
  mobileNumber: string;
  participants: any[];
  gotra: string;
  doesNotKnowGotra: boolean;
  wish: string;
  pricing: {
    basePrice: number;
    total: number;
    currency: string;
  };
  paymentStatus: string;
  orderStatus: string;
  bookingDate: string;
  createdAt: string;
}

export default async function AdminOrdersPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";
  let orders: Order[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/admin/orders`, { cache: "no-store" });
    if (res.ok) {
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        orders = result.data;
      } else if (Array.isArray(result)) {
        orders = result;
      }
    }
  } catch (err) {
    console.error("Error fetching admin orders:", err);
  }

  // Fallback demo orders removed as requested

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
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No orders found in the database.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => {
                    const isPoojaId = typeof ord.pooja === 'string' && /^[a-fA-F0-9]{24}$/.test(ord.pooja);
                    const poojaObjName = typeof ord.pooja === 'object' && ord.pooja !== null ? ord.pooja.title : null;
                    const poojaStrName = typeof ord.pooja === 'string' && !isPoojaId ? ord.pooja : null;
                    
                    const serviceName = ord.itemName || poojaObjName || poojaStrName || "Sacred Ritual";
                    const devoteeName = ord.customerName || (ord.participants && ord.participants.length > 0 ? ord.participants[0].name : "Devotee");
                    const dateStr = ord.createdAt ? new Date(ord.createdAt).toISOString().split('T')[0] : "Today";
                    const isPaid = ord.paymentStatus === "paid";
                    const statusText = ord.orderStatus || ord.paymentStatus || "pending";

                    return (
                      <tr key={ord._id} className="hover:bg-gray-50/80 transition">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900">{ord.orderNumber}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900 block">{serviceName}</span>
                          <span className="text-[10px] uppercase font-bold text-[#069e5d]">PUJA</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800 block">{devoteeName}</span>
                          <span className="text-xs text-gray-400">Gotra: {ord.gotra || "Not Provided"}</span>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-gray-900">₹{ord.pricing?.total || 0}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${statusText === "completed" || statusText === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                            }`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{dateStr}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
