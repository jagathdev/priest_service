"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { GOTRAS, DEFAULT_GOTRA } from "@/lib/gotras";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Address {
  pinCode: string;
  city: string;
  state: string;
  house: string;
  road: string;
  landmark: string;
}

// ─── Stepper breadcrumb ──────────────────────────────────────────────────────
function StepBreadcrumb({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: "Add Details" },
    { num: 2, label: "Review Booking" },
    { num: 3, label: "Fill Name, Gotra & Address" },
    { num: 4, label: "Make Payment" },
  ];
  return (
    <div className="bg-white border-b border-gray-100 py-3.5 px-4 sticky top-0 z-30 shadow-sm">
      <div className="mx-auto max-w-5xl flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        {steps.map((step, idx) => {
          const done = step.num < currentStep;
          const active = step.num === currentStep;
          return (
            <React.Fragment key={step.num}>
              <div className="flex items-center gap-1.5 shrink-0">
                {done ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6869F9] shrink-0">
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                      <path d="M2 6.5 4.8 9 10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : (
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black shrink-0 ${active ? "bg-[#6869F9] text-white" : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {step.num}
                  </span>
                )}
                <span
                  className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${done ? "text-[#6869F9]" : active ? "text-gray-800" : "text-gray-400"
                    }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 shrink-0 text-gray-300">
                  <path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─── Floating Label Input ─────────────────────────────────────────────────────
function FloatingInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder = " ",
  required = false,
  maxLength,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const lifted = focused || hasValue;

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`peer w-full rounded border px-3 pt-5 pb-2 text-sm font-medium text-gray-900 outline-none transition-all bg-white
          ${focused ? "border-[#6869F9] ring-1 ring-[#6869F9]/30" : "border-gray-300"}
          placeholder-transparent`}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-3 text-[11px] font-semibold transition-all
          ${lifted ? "top-1.5 text-[10px] text-gray-400" : "top-3.5 text-sm text-gray-400"}`}
      >
        {label}
      </label>
    </div>
  );
}

// ─── Gotra Dropdown with Search ───────────────────────────────────────────────
function GotraDropdown({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = GOTRAS.filter((g) =>
    g.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between rounded border px-3 py-3 text-sm font-medium text-left transition-all
          ${disabled ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-900 hover:border-[#6869F9]"}
          ${open ? "border-[#6869F9] ring-1 ring-[#6869F9]/30" : ""}
        `}
      >
        <div>
          <p className="text-[10px] text-gray-400 font-semibold mb-0.5">Enter your Gotra</p>
          <p className={`text-sm font-semibold ${disabled ? "text-gray-400" : "text-gray-900"}`}>
            {value || "Select Gotra"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Info icon */}
          <span className="h-5 w-5 rounded-full border border-[#6869F9] text-[#6869F9] flex items-center justify-center text-[10px] font-bold shrink-0">
            i
          </span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <svg viewBox="0 0 20 20" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.5 12.5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gotra..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#6869F9]"
              />
            </div>
          </div>
          {/* List */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">No gotra found</p>
            ) : (
              filtered.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => { onChange(g); setOpen(false); setSearch(""); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-[#f5f3ff] transition-colors
                    ${value === g ? "bg-[#f5f3ff] text-[#6869F9] font-bold" : "text-gray-800"}`}
                >
                  {g}
                  {value === g && (
                    <span className="ml-2 text-[#6869F9]">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Price Summary Sidebar ────────────────────────────────────────────────────
function PriceSidebar({ title, amount }: { title: string; amount: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{title || "Puja Booking"}</p>
          <p className="text-lg font-black text-gray-900 mt-0.5">₹ {amount}</p>
        </div>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ml-3 ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Package amount</span>
            <span className="font-semibold text-gray-900">₹ {amount}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-900">
            <span>Total</span>
            <span>₹ {amount}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
function SankalpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract params
  const amount = searchParams?.get("amount") || "0";
  const type = searchParams?.get("type") || "puja";
  const pkg = searchParams?.get("pkg") || "";
  const nameParam = searchParams?.get("name") || "";
  const waParam = searchParams?.get("wa") || "";
  const extras = searchParams?.get("extras") || "";
  const title = searchParams?.get("title") || "";
  const returnSlug = searchParams?.get("slug") || "";
  const shoppingCartId = searchParams?.get("shoppingCartId") || "";

  // ── GeoIP: detect if user is from India ──────────────────────────────────
  const [isIndian, setIsIndian] = useState(true); // default to Indian to avoid flash
  useEffect(() => {
    fetch("/api/auth/geoip")
      .then(r => r.json())
      .then(data => { if (data?.country) setIsIndian(data.country === "IN"); })
      .catch(() => { /* keep default (Indian) on error */ });
  }, []);

  // ── Form State ────────────────────────────────────────────────────────────
  const [whatsapp, setWhatsapp] = useState(waParam);
  const [differentCalling, setDifferentCalling] = useState(false);
  const [callingNumber, setCallingNumber] = useState("");

  const [members, setMembers] = useState<string[]>([nameParam]);
  const [gotra, setGotra] = useState(DEFAULT_GOTRA);
  const [dontKnowGotra, setDontKnowGotra] = useState(false);

  const [wantsAashirwad, setWantsAashirwad] = useState<boolean | null>(null);
  const [address, setAddress] = useState<Address>({
    pinCode: "",
    city: "",
    state: "",
    house: "",
    road: "",
    landmark: "",
  });

  // ── Validation ────────────────────────────────────────────────────────────
  const whatsappValid = whatsapp.replace(/\D/g, "").length === 10;
  const callingValid = !differentCalling || callingNumber.replace(/\D/g, "").length >= 10;
  const membersValid = members.some((m) => m.trim().length > 0);
  const gotraValid = dontKnowGotra || gotra.length > 0;
  const addressValid =
    wantsAashirwad !== true ||
    (address.pinCode && address.city && address.state && address.house && address.road && address.landmark);

  const canProceed = whatsappValid && callingValid && membersValid && gotraValid && addressValid;

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const addMember = () => {
    if (members.length < 6) setMembers((prev) => [...prev, ""]);
  };

  const updateMember = (idx: number, val: string) => {
    setMembers((prev) => prev.map((m, i) => (i === idx ? val : m)));
  };

  const removeMember = (idx: number) => {
    if (members.length === 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateAddress = (key: keyof Address, val: string) => {
    setAddress((prev) => ({ ...prev, [key]: val }));
  };

  // Open confirm modal
  const handleProceed = () => {
    setShowConfirmModal(true);
  };

  // Actually navigate to payment
  const handleSubmitAndPay = () => {
    const finalGotra = dontKnowGotra ? DEFAULT_GOTRA : gotra;
    const memberStr = members.filter((m) => m.trim()).join(",");

    const params = new URLSearchParams({
      amount,
      type,
      pkg,
      name: nameParam,
      wa: whatsapp,
      extras,
      title,
      gotra: finalGotra,
      members: memberStr,
      shoppingCartId,
      aashirwad: wantsAashirwad ? "yes" : "no",
      ...(wantsAashirwad && {
        pinCode: address.pinCode,
        city: address.city,
        state: address.state,
        house: address.house,
        road: address.road,
        landmark: address.landmark,
      }),
    });

    // Route to USD payment page for international users, Razorpay for Indians
    if (isIndian) {
      router.push(`/payment?${params.toString()}`);
    } else {
      router.push(`/payment/international?${params.toString()}`);
    }
  };

  return (
    <>
      <StepBreadcrumb currentStep={3} />

      <main className="min-h-screen bg-white pb-32">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
          {/* Back arrow */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Enter details for your puja
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
            <div className="space-y-0">

              {/* ── Section 1: WhatsApp Number ─────────────────────── */}
              <section className="border-b border-gray-200 pb-8 mb-8">
                <h2 className="text-[17px] font-bold text-gray-900 mb-1">Your WhatsApp Number</h2>
                <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
                  Your Puja booking updates like{" "}
                  <span className="text-[#6869F9] font-semibold">Puja Photos</span>, Videos and other
                  details will be sent on WhatsApp on below number.
                </p>

                {/* WhatsApp input */}
                <div className="relative mb-4">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.549 4.122 1.511 5.861L.057 23.7a.5.5 0 00.609.61l5.909-1.455A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.945 9.945 0 01-5.088-1.395l-.365-.212-3.786.933.952-3.732-.234-.38A9.938 9.938 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                    </svg>
                    <span className="text-sm font-bold text-gray-700">+91</span>
                    <span className="h-4 w-px bg-gray-300" />
                  </div>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => {
                      let digits = e.target.value.replace(/\D/g, "");
                      if ((digits.startsWith("91") && digits.length > 10) || digits.length === 12) {
                        digits = digits.slice(2);
                      }
                      setWhatsapp(digits.slice(0, 10));
                    }}
                    inputMode="numeric"
                    maxLength={16}
                    placeholder="Enter WhatsApp number"
                    className={`w-full rounded border py-3 pl-24 pr-4 text-sm font-semibold text-gray-900 outline-none transition-all
                      ${whatsapp && !whatsappValid ? "border-red-400 bg-red-50" : whatsappValid ? "border-[#6869F9] bg-white" : "border-gray-300 bg-white"}
                      focus:border-[#6869F9] focus:ring-1 focus:ring-[#6869F9]/20`}
                  />
                </div>

                {/* Calling number checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={differentCalling}
                    onChange={(e) => setDifferentCalling(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#6869F9] cursor-pointer"
                  />
                  <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900">
                    I have a different number for calling
                  </span>
                </label>

                {/* Conditional calling number */}
                {differentCalling && (
                  <div className="mt-4">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-3">Enter your Calling Number</h3>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-700">+91</span>
                        <span className="h-4 w-px bg-gray-300" />
                      </div>
                      <input
                        type="tel"
                        value={callingNumber}
                        onChange={(e) => {
                          let digits = e.target.value.replace(/\D/g, "");
                          if ((digits.startsWith("91") && digits.length > 10) || digits.length === 12) {
                            digits = digits.slice(2);
                          }
                          setCallingNumber(digits.slice(0, 10));
                        }}
                        inputMode="numeric"
                        maxLength={16}
                        placeholder="Enter calling number"
                        className="w-full rounded border border-gray-300 py-3 pl-16 pr-4 text-sm font-semibold text-gray-900 outline-none focus:border-[#6869F9] focus:ring-1 focus:ring-[#6869F9]/20 transition-all"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* ── Section 2: Member Names ─────────────────────────── */}
              <section className="border-b border-gray-200 pb-8 mb-8">
                <h2 className="text-[17px] font-bold text-gray-900 mb-1">
                  Name of members participating in Puja
                </h2>
                <p className="text-[13px] text-gray-500 mb-5">
                  Panditji will take these names along with gotra during the{" "}
                  <span className="text-[#6869F9] font-semibold">puja</span>.
                </p>

                <div className="space-y-3">
                  {members.map((member, idx) => (
                    <div key={idx} className="relative">
                      <FloatingInput
                        id={`member-${idx}`}
                        label={idx === 0 ? "First Member Name" : `Member ${idx + 1} Name`}
                        value={member}
                        onChange={(v) => updateMember(idx, v)}
                        required={idx === 0}
                      />
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMember(idx)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400 transition-colors"
                          aria-label="Remove member"
                        >
                          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M7 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {members.length < 6 && (
                  <button
                    type="button"
                    onClick={addMember}
                    className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#6869F9] hover:text-[#5657e8] transition-colors"
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Add more members
                  </button>
                )}
              </section>

              {/* ── Section 3: Gotra ────────────────────────────────── */}
              <section className="border-b border-gray-200 pb-8 mb-8">
                <h2 className="text-[17px] font-bold text-gray-900 mb-1">Fill participant&apos;s gotra</h2>
                <p className="text-[13px] text-gray-500 mb-5">
                  Gotra will be recited during the{" "}
                  <span className="text-[#6869F9] font-semibold">puja</span>.
                </p>

                <GotraDropdown
                  value={dontKnowGotra ? DEFAULT_GOTRA : gotra}
                  onChange={setGotra}
                  disabled={dontKnowGotra}
                />

                <label className="mt-4 flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={dontKnowGotra}
                    onChange={(e) => {
                      setDontKnowGotra(e.target.checked);
                      if (e.target.checked) setGotra(DEFAULT_GOTRA);
                    }}
                    className="h-4 w-4 rounded border-gray-300 accent-[#6869F9] cursor-pointer"
                  />
                  <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900">
                    I do not know gotra
                  </span>
                </label>
              </section>

              {/* ── Section 4: Aashirwad Box ─────────────────────────── */}
              <section className="pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-[17px] font-bold text-gray-900 mb-1">
                      Would you like to receive the Aashirwad box?
                    </h2>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      The Aashirwad Box will contain{" "}
                      <span className="text-[#6869F9] font-semibold">divine</span> blessing elements
                      such as Ganga Jal, and more, sourced from sacred{" "}
                      <span className="text-[#6869F9] font-semibold">Tirth</span> locations.
                    </p>
                  </div>

                  {/* Yes / No toggle */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setWantsAashirwad(true)}
                      className={`px-5 py-2 rounded text-sm font-bold border transition-all
                        ${wantsAashirwad === true
                          ? "bg-[#6869F9] text-white border-[#6869F9]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#6869F9]"
                        }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => { setWantsAashirwad(false); }}
                      className={`px-5 py-2 rounded text-sm font-bold border transition-all
                        ${wantsAashirwad === false
                          ? "bg-gray-800 text-white border-gray-800"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                        }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Address fields — appear when Yes */}
                {wantsAashirwad === true && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                    <FloatingInput
                      id="pinCode"
                      label="Pin Code (Compulsory)"
                      value={address.pinCode}
                      onChange={(v) => updateAddress("pinCode", v.replace(/\D/g, "").slice(0, 6))}
                      inputMode="numeric"
                      required
                    />
                    <FloatingInput
                      id="city"
                      label="City Name (Compulsory)"
                      value={address.city}
                      onChange={(v) => updateAddress("city", v)}
                      required
                    />
                    <FloatingInput
                      id="state"
                      label="State Name (Compulsory)"
                      value={address.state}
                      onChange={(v) => updateAddress("state", v)}
                      required
                    />
                    <FloatingInput
                      id="house"
                      label="House no. / Building name (Compulsory)"
                      value={address.house}
                      onChange={(v) => updateAddress("house", v)}
                      required
                    />
                    <FloatingInput
                      id="road"
                      label="Road no. / Area / Colony (Compulsory)"
                      value={address.road}
                      onChange={(v) => updateAddress("road", v)}
                      required
                    />
                    <FloatingInput
                      id="landmark"
                      label="Landmark (Compulsory)"
                      value={address.landmark}
                      onChange={(v) => updateAddress("landmark", v)}
                      required
                    />
                  </div>
                )}
              </section>
            </div>

            {/* ── RIGHT SIDEBAR ────────────────────────────────────────── */}
            <div className="hidden lg:block sticky top-20">
              <PriceSidebar title={title} amount={amount} />

              <div className="mt-4 rounded-xl bg-[#f5f3ff] border border-[#e3d9f8] p-4 text-[12px] text-[#6869F9] font-medium leading-relaxed">
                <p className="font-bold mb-1">🙏 Sankalp Details</p>
                These details help our Panditji perform the puja with your correct sankalp — name, gotra, and intention — as per Vedic tradition.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Sticky Bottom CTA ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-xl">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            disabled={!canProceed}
            onClick={handleProceed}
            className={`w-full rounded py-4 text-[15px] font-bold text-white tracking-wide transition-all
              ${canProceed
                ? "bg-[#6869F9] hover:bg-[#5657e8] active:scale-[0.99] shadow-lg shadow-[#6869F9]/20"
                : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            Proceed to book
          </button>
          {!canProceed && (
            <p className="mt-1.5 text-center text-[11px] text-gray-400 font-medium">
              {!whatsappValid
                ? "Please enter a valid 10-digit WhatsApp number"
                : !membersValid
                  ? "Please enter at least one member name"
                  : !gotraValid
                    ? "Please select a gotra or check 'I do not know gotra'"
                    : wantsAashirwad === null
                      ? "Please select Yes or No for Aashirwad box"
                      : "Please fill all required address fields"}
            </p>
          )}
        </div>
      </div>

      {/* ── Confirm Details Modal ─────────────────────────────────────────── */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowConfirmModal(false); }}
        >
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-[17px] font-bold text-gray-900">Please confirm your details</h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="h-7 w-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors text-lg"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-0 max-h-[70vh] overflow-y-auto">

              {/* Members section */}
              <div className="pb-5 border-b border-gray-100">
                <h3 className="text-[15px] font-bold text-gray-900 mb-1">Members participating in the puja</h3>
                <p className="text-[12px] text-[#6869F9] mb-3">Panditji will take these names along with gotra during the puja.</p>
                <ol className="space-y-1">
                  {members.filter(m => m.trim()).map((m, i) => (
                    <li key={i} className="text-[14px] font-semibold text-gray-800">
                      {i + 1}.&nbsp; {m}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Gotra / Phone / WhatsApp */}
              <div className="py-5 border-b border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-gray-500">Gotra</span>
                  <span className="text-[13px] font-bold text-gray-900">{dontKnowGotra ? DEFAULT_GOTRA : gotra}</span>
                </div>
                {differentCalling && callingNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-gray-500">Phone Number</span>
                    <span className="text-[13px] font-bold text-gray-900">{callingNumber}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-gray-500">WhatsApp number.</span>
                  <span className="text-[13px] font-bold text-gray-900">{whatsapp}</span>
                </div>
              </div>

              {/* Aashirwad */}
              <div className="pt-5">
                <h3 className="text-[15px] font-bold text-gray-900 mb-2">Would you like to receive the Aashirwad box?</h3>
                <p className="text-[14px] text-gray-500">{wantsAashirwad ? "Yes" : "No"}</p>
                {wantsAashirwad && (
                  <div className="mt-3 text-[12px] text-gray-600 space-y-1 bg-gray-50 rounded-lg px-4 py-3">
                    <p>{address.house}, {address.road}</p>
                    {address.landmark && <p>Near: {address.landmark}</p>}
                    <p>{address.city}, {address.state} — {address.pinCode}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-[#6869F9] text-[#6869F9] py-3.5 text-[14px] font-bold hover:bg-[#f5f3ff] transition-colors"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <path d="M4 6h12M4 10h8M4 14h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Edit Info
              </button>
              <button
                onClick={handleSubmitAndPay}
                className="flex-1 rounded-xl bg-[#6869F9] text-white py-3.5 text-[14px] font-bold hover:bg-[#5657e8] active:scale-[0.98] transition-all shadow-md shadow-[#6869F9]/20"
              >
                Submit &amp; pay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Page Export (with Suspense for useSearchParams) ─────────────────────────
export default function SankalpPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#6869F9]" />
          </div>
        }
      >
        <SankalpContent />
      </Suspense>
    </>
  );
}
