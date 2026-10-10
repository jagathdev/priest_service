"use client";

import React, { useEffect, useState } from "react";

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
  scheduledDate?: string;
  bookingDate: string;
  createdAt: string;
  serviceName?: string;
  devoteeName?: string;
}

export default function AdminOrdersPage() {
  const [data, setData] = useState({
    orders: [] as Order[],
    totalOrders: 0,
    totalPages: 1,
    limit: 5,
    services: ["All"] as string[],
    statuses: ["All"] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async (page: number, service: string, status: string, search: string = "") => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/admin/orders?page=${page}&service=${encodeURIComponent(service)}&status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`, { cache: "no-store" });
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setData({
            orders: result.data,
            totalOrders: result.totalOrders || result.data.length,
            totalPages: result.totalPages || 1,
            limit: result.limit || 5,
            services: result.services || ["All"],
            statuses: result.statuses || ["All"]
          });
        }
      }
    } catch (err) {
      console.error("Error fetching admin orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchOrders(currentPage, selectedService, selectedStatus, searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [currentPage, selectedService, selectedStatus, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedService, selectedStatus, searchQuery]);

  const handleScheduleChange = async (orderId: string, dateStr: string) => {
    if (!dateStr) return;

    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStatus = "scheduled";
    if (selectedDate < today) {
      newStatus = "completed";
    }

    // Optimistically update UI
    setData(prev => ({
      ...prev,
      orders: prev.orders.map(ord => {
        if (ord._id === orderId) {
          return { ...ord, orderStatus: newStatus, scheduledDate: selectedDate.toISOString() };
        }
        return ord;
      })
    }));

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: newStatus,
          scheduledDate: selectedDate.toISOString()
        })
      });
      if (!res.ok) {
        // Revert on failure
        fetchOrders(currentPage, selectedService, selectedStatus, searchQuery);
      }
    } catch (err) {
      console.error("Failed to update schedule:", err);
      fetchOrders(currentPage, selectedService, selectedStatus, searchQuery);
    }
  };

  const handleBulkSchedule = async (dateStr: string) => {
    if (!dateStr || selectedService === "All") return;

    if (!confirm(`Are you sure you want to schedule ALL orders for "${selectedService}" to ${dateStr}?`)) {
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const res = await fetch(`${baseUrl}/api/admin/orders/bulk-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: selectedService,
          scheduledDate: new Date(dateStr).toISOString()
        })
      });

      if (res.ok) {
        alert("Bulk scheduling successful!");
        fetchOrders(currentPage, selectedService, selectedStatus, searchQuery);
      } else {
        alert("Failed to bulk schedule.");
      }
    } catch (err) {
      console.error("Bulk schedule error:", err);
      alert("Error occurred while bulk scheduling.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders &amp; Bookings</h1>
          <p className="text-xs text-gray-500 mt-1">Track devotee puja &amp; homa bookings, sankalp details &amp; order status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search devotee or order ID..."
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-success focus:border-success block w-full pl-3 pr-10 py-2.5 outline-none transition shadow-sm w-[240px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          {selectedService !== "All" && (
            <div className="flex items-center bg-[#e0f2fe] border border-blue-200 rounded-lg shadow-sm overflow-hidden">
              <span className="px-3 py-2 text-xs font-bold text-blue-700 border-r border-blue-200 bg-blue-50">
                Bulk Schedule:
              </span>
              <input
                type="date"
                title="Select a date to schedule all orders for this service"
                className="bg-transparent text-blue-900 text-sm font-semibold p-2 outline-none cursor-pointer hover:bg-blue-100 transition"
                onChange={(e) => {
                  handleBulkSchedule(e.target.value);
                  e.target.value = ''; // reset after selection
                }}
              />
            </div>
          )}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg focus:ring-success focus:border-success block p-2 outline-none shadow-sm cursor-pointer"
          >
            {data.services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg focus:ring-success focus:border-success block p-2 outline-none shadow-sm cursor-pointer"
          >
            {data.statuses.map(st => (
              <option key={st} value={st}>{st === "All" ? "All Statuses" : st.toUpperCase()}</option>
            ))}
          </select>
          <span className="text-xs font-bold bg-[#e8f5e9] text-success px-3 py-1.5 rounded-full whitespace-nowrap">
            {data.totalOrders} Total Bookings
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">

        {/* Mobile View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {data.orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No orders found.</div>
          ) : (
            data.orders.map((ord) => {
              const serviceName = ord.serviceName || "Sacred Ritual";
              const devoteeName = ord.devoteeName || "Devotee";
              const isPaid = ord.paymentStatus === "paid";
              const statusText = ord.orderStatus || ord.paymentStatus || "pending";

              return (
                <div key={ord._id} className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-gray-900 text-xs">{ord.orderNumber}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${statusText === "completed" || statusText === "paid" || statusText === "scheduled" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {statusText}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block text-sm">{serviceName}</span>
                    <span className="text-[10px] uppercase font-bold text-success">PUJA</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="font-bold text-gray-800 block text-sm">{devoteeName}</span>
                      <span className="text-xs text-gray-400">Gotra: {ord.gotra || "Not Provided"}</span>
                    </div>
                    <span className="font-extrabold text-gray-900 text-base">₹{ord.pricing?.total || 0}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-2 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Schedule Puja</span>
                    <input
                      type="date"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs font-bold rounded-lg focus:ring-success focus:border-success block w-full p-2 outline-none cursor-pointer"
                      value={ord.scheduledDate ? new Date(ord.scheduledDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleScheduleChange(ord._id, e.target.value)}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Devotee Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Schedule Puja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {data.orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                data.orders.map((ord) => {
                  const serviceName = ord.serviceName || "Sacred Ritual";
                  const devoteeName = ord.devoteeName || "Devotee";
                  const isPaid = ord.paymentStatus === "paid";
                  const statusText = ord.orderStatus || ord.paymentStatus || "pending";
                  const isScheduled = statusText === "scheduled" || statusText === "performed" || statusText === "completed";

                  return (
                    <tr key={ord._id} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">{ord.orderNumber}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 block">{serviceName}</span>
                        <span className="text-[10px] uppercase font-bold text-success">PUJA</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800 block">{devoteeName}</span>
                        <span className="text-xs text-gray-400">Gotra: {ord.gotra || "Not Provided"}</span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-gray-900">₹{ord.pricing?.total || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${statusText === "completed" || statusText === "paid" || statusText === "scheduled"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                          }`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="date"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-xs font-bold rounded-lg focus:ring-success focus:border-success block w-full p-2 outline-none cursor-pointer"
                          value={ord.scheduledDate ? new Date(ord.scheduledDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleScheduleChange(ord._id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data.totalOrders > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center sm:text-left">
              Showing <span className="font-bold text-gray-900">{data.totalOrders === 0 ? 0 : (currentPage - 1) * data.limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * data.limit, data.totalOrders)}</span> of <span className="font-bold text-gray-900">{data.totalOrders}</span> Entries
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md text-xs font-bold border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-gray-700 px-2">{currentPage} / {data.totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))}
                disabled={currentPage === data.totalPages}
                className="px-3 py-1.5 rounded-md text-xs font-bold border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
