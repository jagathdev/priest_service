import React from "react";

export default function PujaDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col animate-[fadeIn_0.15s_ease-in]">
      {/* Breadcrumb Skeleton */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 w-full">
        <div className="w-48 h-4 bg-stone-200 rounded-full animate-pulse" />
      </div>

      {/* Main Detail Two-Column Layout */}
      <main className="flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Hero + Info Tabs) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Main Image Banner Skeleton */}
            <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-stone-100 rounded-2xl sm:rounded-3xl animate-pulse border border-stone-200/70" />

            {/* Title & Badge */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs flex flex-col gap-3">
              <div className="w-24 h-4 bg-emerald-100 rounded-full animate-pulse" />
              <div className="w-3/4 h-8 bg-stone-200 rounded-xl animate-pulse" />
              <div className="w-full h-4 bg-stone-100 rounded-full animate-pulse mt-2" />
              <div className="w-5/6 h-4 bg-stone-100 rounded-full animate-pulse" />
            </div>

            {/* Tabs / Sections Skeleton */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs flex flex-col gap-4">
              <div className="flex gap-4 border-b border-stone-100 pb-3">
                <div className="w-24 h-8 bg-stone-200 rounded-lg animate-pulse" />
                <div className="w-24 h-8 bg-stone-100 rounded-lg animate-pulse" />
                <div className="w-24 h-8 bg-stone-100 rounded-lg animate-pulse hidden sm:block" />
              </div>
              <div className="w-full h-24 bg-stone-50 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Right Column (Booking Card Sticky Skeleton) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-sm flex flex-col gap-5">
              <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                <div className="flex flex-col gap-1">
                  <div className="w-16 h-3 bg-stone-100 rounded-md animate-pulse" />
                  <div className="w-24 h-6 bg-stone-200 rounded-md animate-pulse" />
                </div>
                <div className="w-20 h-6 bg-emerald-100 rounded-full animate-pulse" />
              </div>

              {/* Package selector placeholders */}
              <div className="flex flex-col gap-2.5">
                <div className="w-full h-14 bg-stone-50 rounded-xl border border-stone-200 animate-pulse" />
                <div className="w-full h-14 bg-stone-50 rounded-xl border border-stone-200 animate-pulse" />
              </div>

              {/* Action Button */}
              <div className="w-full h-12 bg-emerald-600/30 rounded-full animate-pulse mt-2" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
