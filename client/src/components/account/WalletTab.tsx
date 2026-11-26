"use client";

import React from "react";
import { Wallet, ShieldCheck, Plus, RefreshCw, Gift, Check } from "lucide-react";

export default function WalletTab() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
          <Wallet className="w-5 h-5" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
          My Wallet
        </h1>
      </div>

      {/* Main Wallet Card */}
      <div className="bg-[#fcfaf9] border border-gray-150 rounded-2xl p-6 relative overflow-hidden mb-8 shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[10px] bg-[#F1F5F9] flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-primary" strokeWidth={2.5} />
              </div>
              <h2 className="text-[17px] font-medium font-serif text-gray-800 tracking-wide">astroved Wallet</h2>
            </div>
            <div className="bg-[#ce9d52] text-white text-[9.5px] font-extrabold px-3.5 py-1.5 rounded-full tracking-wider shadow-sm uppercase">
              Coming Soon
            </div>
          </div>

          <div className="mb-6 space-y-1.5 max-w-lg">
            <p className="text-[13px] font-bold text-gray-600">One balance for every puja</p>
            <p className="text-[13px] font-medium text-gray-500 leading-relaxed">
              Add money once, book in a tap, and get refunds &amp; festival cashback straight to your wallet.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-primary text-[12px] font-bold">
            <ShieldCheck className="w-4 h-4" />
            Bank-grade security
          </div>
        </div>
      </div>

      {/* What's coming section */}
      <h3 className="text-xl font-bold font-serif text-[#4a4a4a] mb-5 tracking-tight">What&apos;s coming</h3>

      <div className="space-y-4 mb-8">
        {/* Item 1 */}
        <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#fdf2f0] flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 text-[#8b2332]" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[14px] font-extrabold text-gray-900 mb-0.5">Add money &amp; pay in one tap</h4>
              <p className="text-[13px] font-medium text-gray-500">Top up via UPI or card and check out faster on every booking.</p>
            </div>
          </div>
          <div className="bg-[#fdf2f0] text-[#8b2332] text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider ml-4 shrink-0 uppercase">
            Soon
          </div>
        </div>

        {/* Item 2 */}
        <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#fdf2f0] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-[#8b2332]" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[14px] font-extrabold text-gray-900 mb-0.5">Instant refunds to wallet</h4>
              <p className="text-[13px] font-medium text-gray-500">Cancellations and adjustments credited back immediately — no waiting.</p>
            </div>
          </div>
          <div className="bg-[#fdf2f0] text-[#8b2332] text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider ml-4 shrink-0 uppercase">
            Soon
          </div>
        </div>

        {/* Item 3 */}
        <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#fdf2f0] flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-[#8b2332]" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-[14px] font-extrabold text-gray-900 mb-0.5">Festival cashback &amp; rewards</h4>
              <p className="text-[13px] font-medium text-gray-500">Earn cashback on special pujas and redeem it against future bookings.</p>
            </div>
          </div>
          <div className="bg-[#fdf2f0] text-[#8b2332] text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider ml-4 shrink-0 uppercase">
            Soon
          </div>
        </div>
      </div>

      {/* Bottom Security Banner */}
      <div className="bg-[#F1F5F9] border border-[#CBD5E1] text-primary text-[13px] font-bold py-4 px-5 rounded-2xl flex items-center gap-3">
        <Check className="w-5 h-5 shrink-0 text-primary" strokeWidth={3} />
        <span>When your wallet goes live, your balance and transactions will be encrypted and securely stored.</span>
      </div>
    </div>
  );
}
