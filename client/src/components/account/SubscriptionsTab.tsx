"use client";

import React, { useState } from "react";
import { Calendar, Check } from "lucide-react";

export default function SubscriptionsTab() {
  const [subscriptionFilter, setSubscriptionFilter] = useState("All");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-3.5 sm:p-6 lg:p-8 min-h-[450px]">
      {/* Header section with Title and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 sm:mb-8 gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold font-serif text-[#333]">
            Subscriptions <span className="text-gray-500 font-medium text-base sm:text-lg ml-1">(0)</span>
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <button
            onClick={() => setSubscriptionFilter("All")}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition cursor-pointer ${
              subscriptionFilter === "All"
                ? "border-primary text-primary bg-white shadow-sm"
                : "border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0]"
            }`}
          >
            All
            {subscriptionFilter === "All" && (
              <div className="w-3.5 h-3.5 rounded-full bg-primary text-white flex items-center justify-center">
                <Check className="w-2 h-2" strokeWidth={3} />
              </div>
            )}
          </button>
          <button
            onClick={() => setSubscriptionFilter("Ongoing")}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition cursor-pointer ${
              subscriptionFilter === "Ongoing"
                ? "border-2 border-black text-[#1d3557] bg-[#e5e7eb] shadow-sm"
                : "border-2 border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0]"
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setSubscriptionFilter("Complete")}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition cursor-pointer ${
              subscriptionFilter === "Complete"
                ? "border-2 border-black text-[#1d3557] bg-[#e5e7eb] shadow-sm"
                : "border-2 border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0]"
            }`}
          >
            Complete
          </button>
        </div>
      </div>

      {/* Empty State Container */}
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mb-4" strokeWidth={2} />
        <h2 className="text-lg font-extrabold text-gray-800 mb-2">No subscriptions</h2>
        <p className="text-[13px] font-medium text-gray-500">
          You don&apos;t have any subscriptions yet.
        </p>
      </div>
    </div>
  );
}
