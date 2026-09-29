"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CheckoutClient({ homa }: { homa: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");

  const selectedPackage = homa?.packages?.find((p: any) => p.id === packageId) || homa?.packages?.[0];

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({
    whatsapp: "",
    pitrusName: "",
    participantName: "",
    gotra: "",
    dontKnowGotra: false,
    wish: "",
  });

  const baseFee = selectedPackage?.priceINR || selectedPackage?.price || 1251;
  const convenienceFee = 25; // Or Free based on logic
  const panditFee = 150; // Or Free
  const photoFee = 500; // Or Free
  // For the design, they are marked as 'Free' with strikethrough prices.
  const total = baseFee;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm font-semibold">
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
        </div>
        <div className="text-xl sm:text-2xl font-serif text-gray-900 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          Fill your details for Puja
        </div>
        <div className="w-20"></div> {/* Spacer for centering */}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        {/* Progress Stepper */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 -z-10"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 bg-[#fafafa] px-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-[#009e5b] text-white' : 'bg-white border-2 border-gray-300 text-gray-400'}`}>
                1
              </div>
              <span className={`text-xs font-semibold ${step >= 1 ? 'text-[#009e5b]' : 'text-gray-400'}`}>Devotee Details</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 bg-[#fafafa] px-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-[#009e5b] text-white' : 'bg-white border-2 border-gray-300 text-gray-400'}`}>
                2
              </div>
              <span className={`text-xs font-semibold ${step >= 2 ? 'text-[#009e5b]' : 'text-gray-400'}`}>Review</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 bg-[#fafafa] px-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-[#009e5b] text-white' : 'bg-white border-2 border-gray-300 text-gray-400'}`}>
                3
              </div>
              <span className={`text-xs font-semibold ${step >= 3 ? 'text-[#009e5b]' : 'text-gray-400'}`}>Payment</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Form */}
          <div className="flex-1 w-full space-y-8">
            {step === 1 && (
              <>
                {/* Whatsapp Number */}
                <div>
                  <label className="block text-gray-900 font-bold text-[15px] mb-3 flex items-center gap-2">
                    Your WhatsApp Number <i className="fa-solid fa-pen text-xs text-green-600"></i>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#1f1f1f] font-bold border-r pr-3 border-gray-200">
                      <span className="text-[18px]">🇮🇳</span>
                      <span className="text-[15px]">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={details.whatsapp}
                      onChange={(e) => setDetails({ ...details, whatsapp: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full bg-[#f9fafb] border border-gray-200 rounded-xl py-3.5 pl-28 pr-12 font-bold text-gray-900 outline-none focus:border-green-500 transition-all focus:bg-white focus:ring-4 focus:ring-green-500/10"
                      placeholder="9360270984"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500">
                      <i className="fa-solid fa-circle-check text-xl"></i>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">The puja video and blessing details will be sent to this number.</p>
                </div>

                {/* Pitrus Name */}
                <div>
                  <label className="block text-gray-900 font-bold text-[15px] mb-3">Provide your Pitrus name for Puja</label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={details.pitrusName}
                      onChange={(e) => setDetails({ ...details, pitrusName: e.target.value })}
                      className="w-1/2 bg-white border border-gray-200 rounded-xl py-3 px-4 font-semibold text-gray-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:font-normal placeholder:text-gray-400"
                      placeholder="Pitru Name 1"
                    />
                    <input
                      type="text"
                      className="w-1/2 bg-white border border-gray-200 rounded-xl py-3 px-4 font-semibold text-gray-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:font-normal placeholder:text-gray-400"
                      placeholder="Pitru Name 2"
                    />
                  </div>
                  <button className="mt-3 text-[#009e5b] text-xs font-bold border border-[#009e5b] rounded-full px-3 py-1.5 hover:bg-[#009e5b]/10 transition-colors">
                    + Add 1 more participant <span className="opacity-70">+₹300</span>
                  </button>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">This name will be included in the sacred sankalpam during the puja.</p>
                </div>

                {/* Name & Gotra */}
                <div>
                  <label className="block text-gray-900 font-bold text-[15px] mb-3">Add your Name & Gotra <span className="font-normal text-xs text-gray-400">(required)</span></label>
                  <input
                    type="text"
                    value={details.participantName}
                    onChange={(e) => setDetails({ ...details, participantName: e.target.value })}
                    className="w-full bg-[#f4f3f1] border border-transparent rounded-xl py-3.5 px-4 font-semibold text-gray-900 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 transition-all placeholder:text-gray-400"
                    placeholder="e.g. Kashyapa"
                  />
                  <div className="mt-3 flex items-center gap-2 cursor-pointer" onClick={() => setDetails({ ...details, dontKnowGotra: !details.dontKnowGotra })}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${details.dontKnowGotra ? 'bg-[#009e5b] border-[#009e5b]' : 'border border-gray-300'}`}>
                      {details.dontKnowGotra && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                    </div>
                    <span className="text-[13px] text-gray-600 font-medium select-none">I do not know my gotra</span>
                  </div>
                </div>

                {/* Wish */}
                <div>
                  <label className="block text-gray-900 font-bold text-[15px] mb-3">Add your wish <span className="font-normal text-xs text-gray-400">(optional)</span></label>
                  <textarea
                    value={details.wish}
                    onChange={(e) => setDetails({ ...details, wish: e.target.value })}
                    rows={4}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-semibold text-gray-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all resize-none placeholder:text-gray-400 uppercase"
                    placeholder="FAMILY WELL BEING"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold text-gray-900">Review your details</h3>
                <p className="text-gray-500 mt-2">Proceeding to payment...</p>
                {/* To be expanded based on full flow */}
              </div>
            )}
          </div>

          {/* Right Sidebar - Order Summary */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-[24px] border border-[#f0f0f0] p-6 shadow-sm sticky top-28">
              <h3 className="text-[17px] font-serif font-bold text-gray-900 mb-6">Order Summary</h3>

              <div className="flex gap-4 items-start mb-6 border-b border-gray-100 pb-6">
                <img src={homa?.imageUrl || 'https://images.unsplash.com/photo-1601024445121-e5b82f020549'} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <div>
                  <h4 className="text-[15px] font-bold text-gray-900 leading-snug">{homa?.title || 'Mahapuja at Sacred Kashi Pishach Mochan Kund And Kashi Ganga Aarti'}</h4>
                  <p className="text-[13px] font-bold text-gray-900 mt-2">{selectedPackage?.name} - <span className="text-[#a52a2a]">₹{baseFee}</span></p>
                </div>
              </div>

              <div className="bg-[#f2faee] border border-[#dff0d8] rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
                <i className="fa-regular fa-calendar text-[#009e5b] text-lg"></i>
                <span className="font-bold text-[#004d2c] text-sm">Tuesday, 6 October</span>
              </div>

              <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">{selectedPackage?.name}</span>
                  <span className="font-bold text-[#a52a2a]">₹{baseFee}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">Convenience Fee</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through decoration-red-500 decoration-2 font-bold text-xs">₹{convenienceFee}</span>
                    <span className="font-bold text-gray-900">Free</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">Pandit Fee</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through decoration-red-500 decoration-2 font-bold text-xs">₹{panditFee}</span>
                    <span className="font-bold text-gray-900">Free</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">Photo and video recording Fee</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through decoration-red-500 decoration-2 font-bold text-xs">₹{photoFee}</span>
                    <span className="font-bold text-gray-900">Free</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-[#a52a2a]">₹{total}</span>
                  <span className="text-gray-400 line-through decoration-red-500 decoration-2 font-bold text-sm mb-1">₹{baseFee + convenienceFee + panditFee + photoFee}</span>
                </div>
              </div>

              <button
                onClick={() => setStep(step === 1 ? 2 : 3)}
                className="w-full bg-[#00b268] hover:bg-[#009e5b] text-white py-4 rounded-[16px] font-bold text-[18px] transition-colors flex items-center justify-center gap-2"
              >
                Continue
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#009e5b]">
                <i className="fa-solid fa-lock"></i> 100% Secure
              </div>
            </div>

            {/* Trust markers below summary */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <div className="flex gap-3 items-center text-sm font-semibold text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">✓</div>
                Puja Video Delivered Within 48 Hours
              </div>
              <div className="flex gap-3 items-center text-sm font-semibold text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">✓</div>
                Verified & Experienced Purohits
              </div>
              <div className="flex gap-3 items-center text-sm font-semibold text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">✓</div>
                Pujas Performed in Sacred Temples
              </div>
              <div className="flex gap-3 items-center text-sm font-semibold text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">✓</div>
                100% Authentic Vedic Rituals
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
