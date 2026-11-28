"use client";

import React from "react";

interface CommonStatusBadgeProps {
  status: "Active" | "Offline" | "Completed" | "Pending" | "Cancelled" | "Inactive" | string;
  customLabel?: string;
}

export default function CommonStatusBadge({ status, customLabel }: CommonStatusBadgeProps) {
  const norm = (status || "").toLowerCase().trim();

  if (norm === "active") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {customLabel || "Active"}
      </span>
    );
  }

  if (norm === "offline" || norm === "inactive") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        {customLabel || "Offline"}
      </span>
    );
  }

  if (norm === "completed") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {customLabel || "Completed"}
      </span>
    );
  }

  if (norm === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {customLabel || "Pending"}
      </span>
    );
  }

  if (norm === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        {customLabel || "Cancelled"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
      {customLabel || status}
    </span>
  );
}
