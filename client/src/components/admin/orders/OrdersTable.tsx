"use client";

import React from "react";
import Link from "next/link";
import { OrderItemRecord } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";

export interface OrdersTableProps {
  orders: OrderItemRecord[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpenVideoModal?: (order: OrderItemRecord) => void;
}

export function OrdersTable({
  orders,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: OrdersTableProps) {
  const allSelected = orders.length > 0 && selectedIds.length === orders.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 min-h-[300px]">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold text-gray-500">Loading orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 text-center min-h-[300px]">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3 text-lg font-bold">
          ∅
        </div>
        <h4 className="text-sm font-bold text-gray-800">No Orders Found</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          Try adjusting your search query, status filters, or date range.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
            <th className="py-3 px-3 text-center w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                aria-label="Select all orders"
              />
            </th>
            <th className="py-3 px-3">Order ID</th>
            <th className="py-3 px-3">Devotee</th>
            <th className="py-3 px-3">Service Ritual</th>
            <th className="py-3 px-3 text-center">Type</th>
            <th className="py-3 px-3 text-center">Source</th>
            <th className="py-3 px-3">Booked At (IST)</th>
            <th className="py-3 px-3 text-right">Amount</th>
            <th className="py-3 px-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
          {orders.map((order) => {
            const isSelected = selectedIds.includes(order._id);
            const serviceTitle =
              order.serviceTitle ||
              order.itemName ||
              (typeof order.pooja === "string" ? order.pooja : order.pooja?.title) ||
              "Sacred Ritual";
            const orderId = order.displayOrderId || order.orderId || order._id.slice(-6).toUpperCase();
            const serviceType = (order.serviceType || order.type || "Puja").toUpperCase();

            // Format Booking Timestamp strictly in Indian Standard Time (IST)
            let datePart = "–";
            let timePart = "";
            const rawDate = order.createdAt || order.bookingDate;
            if (rawDate) {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                datePart = d.toLocaleDateString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                timePart = d.toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).toLowerCase();
              }
            }

            return (
              <tr
                key={order._id}
                className={`hover:bg-emerald-50/40 transition-colors ${
                  isSelected ? "bg-emerald-50/60" : ""
                }`}
              >
                <td className="py-3 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(order._id)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </td>
                <td className="py-3 px-3 font-mono font-bold text-gray-900">
                  <Link href={`/admin/orders/${order._id}`} className="hover:text-emerald-700 transition">
                    #{orderId}
                  </Link>
                </td>
                <td className="py-3 px-3">
                  <Link href={`/admin/orders/${order._id}`} className="block">
                    <div className="font-bold text-gray-900 leading-snug">
                      {order.customerName || order.name || order.participants?.[0]?.name || "Devotee"}
                    </div>
                    {order.customerPhone && (
                      <div className="text-[10px] text-gray-400">{order.customerPhone}</div>
                    )}
                  </Link>
                </td>
                <td className="py-3 px-3 font-bold text-gray-800">
                  <Link href={`/admin/orders/${order._id}`} className="hover:text-emerald-700 transition truncate block max-w-xs">
                    {serviceTitle}
                  </Link>
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase ${
                      serviceType.includes("HOMA")
                        ? "bg-purple-100 text-purple-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {serviceType.includes("HOMA") ? "HOMA" : "PUJA"}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border bg-gray-100 text-gray-700 border-gray-200">
                    {order.utmSource || "Direct"}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="font-bold text-gray-800 text-[11px]">{datePart}</div>
                  {timePart && <div className="text-[10px] font-semibold text-gray-400">{timePart}</div>}
                </td>
                <td className="py-3 px-3 text-right font-extrabold text-gray-900 whitespace-nowrap">
                  ₹{(order.pricing?.total || order.amount || 0).toLocaleString("en-IN")}
                </td>
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <StatusBadge status={order.orderStatus || order.paymentStatus || "confirmed"} size="sm" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
