"use client";

import React from "react";
import { OrderStatus } from "@/types/order.types";

export interface StatusBadgeProps {
  status: OrderStatus | string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const norm = String(status || "").toLowerCase().trim();

  let styles = "bg-gray-100 text-gray-700 border-gray-200";
  let label = status || "Unknown";

  switch (norm) {
    case "confirmed":
      styles = "bg-sky-50 text-sky-700 border-sky-200";
      label = "Confirmed";
      break;
    case "scheduled":
      styles = "bg-amber-50 text-amber-700 border-amber-200";
      label = "Scheduled";
      break;
    case "performed":
      styles = "bg-indigo-50 text-indigo-700 border-indigo-200";
      label = "Performed";
      break;
    case "completed":
    case "paid":
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
      label = norm === "paid" ? "Paid" : "Completed";
      break;
    case "cancelled":
    case "failed":
      styles = "bg-rose-50 text-rose-700 border-rose-200";
      label = norm === "failed" ? "Failed" : "Cancelled";
      break;
    case "pending":
    case "created":
      styles = "bg-slate-50 text-slate-700 border-slate-200";
      label = norm === "pending" ? "Pending" : "Created";
      break;
  }

  const sizeClass = size === "sm" ? "text-[9.5px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-md border ${styles} ${sizeClass}`}
    >
      {label}
    </span>
  );
}
