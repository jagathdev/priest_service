"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { useSearchParams } from "next/navigation";
import LocationSearch, { CITIES } from "./LocationSearch";
import { getMoonPhaseFromTithi } from "@/utils/moonPhase";

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function getTodayStr() { return fmtDate(new Date()); }
function getTomorrowStr() { const d = new Date(); d.setDate(d.getDate() + 1); return fmtDate(d); }
function addDays(s: string, n: number) { const d = new Date(s); d.setDate(d.getDate() + n); return fmtDate(d); }

// ─── Moon Phase Icon ────────────────────────────────────────────────────────
function MoonPhaseIcon({ tithiName }: { tithiName?: string }) {
  const moonInfo = getMoonPhaseFromTithi(tithiName);
  return (
    <img
      src={moonInfo.imagePath}
      alt={moonInfo.phaseLabel}
      className="w-full h-full object-cover scale-[1.4]"
    />
  );
}

// ─── Skeleton components ─────────────────────────────────────────────────────
function SkeletonLine({ w = "w-full", h = "h-4" }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} bg-gray-200 rounded animate-pulse`} />;
}

function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} w={i === 0 ? "w-3/4" : "w-full"} />
      ))}
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────────
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h3 className="text-[15px] font-bold text-gray-700 mb-1">Unable to Load Panchang</h3>
      <p className="text-[13px] text-gray-400 max-w-xs">{message}</p>
    </div>
  );
}

function HelpIcon() {
  return (
    <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#1f1f1f" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="0.5" fill="#1f1f1f" />
    </svg>
  );
}

function SectionHeading({ title, helpIcon = false }: { title: string; helpIcon?: boolean }) {
  return (
    <div className="flex items-center gap-2 pl-3 border-l-[3px] border-[#6869F9] h-6">
      <h2 className="text-[16px] font-bold text-[#1f1f1f]">{title}</h2>
      {helpIcon && <HelpIcon />}
    </div>
  );
}

// ─── MOBILE SKELETON ─────────────────────────────────────────────────────────
function MobileLoadingSkeleton() {
  return (
    <div className="px-4 py-4 flex flex-col gap-5">
      {/* Date heading skeleton */}
      <SkeletonLine w="w-32" h="h-5" />
      {/* Summary card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 items-center">
        <div className="w-[88px] h-[88px] rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonLine w="w-3/4" h="h-5" />
          <SkeletonLine w="w-1/2" h="h-4" />
          <SkeletonLine w="w-2/3" h="h-4" />
        </div>
      </div>
      {/* Timings */}
      <div className="grid grid-cols-2 gap-2.5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl px-4 py-3.5 bg-gray-100 animate-pulse h-20" />
        ))}
      </div>
      {/* Sunrise row */}
      <SkeletonCard rows={2} />
      {/* Panchang fields */}
      <SkeletonCard rows={5} />
    </div>
  );
}

// ─── DESKTOP SKELETON ─────────────────────────────────────────────────────────
function DesktopLoadingSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(400px,460px)_340px] justify-center gap-8 items-start">
        {/* Col 1 */}
        <div className="flex flex-col gap-6">
          <SkeletonLine w="w-40" h="h-5" />
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex gap-4 items-center">
            <div className="w-[100px] h-[100px] rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <SkeletonLine w="w-3/4" h="h-5" />
              <SkeletonLine w="w-1/2" h="h-4" />
              <SkeletonLine w="w-2/3" h="h-4" />
            </div>
          </div>
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
        </div>
        {/* Col 2 */}
        <div className="flex flex-col gap-6">
          <SkeletonLine w="w-24" h="h-5" />
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="px-6 py-5 border-b border-gray-50">
                <SkeletonLine w="w-24" h="h-3" />
                <div className="mt-2"><SkeletonLine w="w-36" h="h-5" /></div>
              </div>
            ))}
          </div>
        </div>
        {/* Col 3 */}
        <div className="flex flex-col gap-6">
          <SkeletonLine w="w-36" h="h-5" />
          <SkeletonCard rows={8} />
        </div>
      </div>
    </div>
  );
}

// ─── MOBILE PANCHANG VIEW ─────────────────────────────────────────────────────
function MobilePanchangView({
  data,
  loading,
  apiError,
  selectedDate,
  setSelectedDate,
  selectedLocation,
  setSelectedLocation,
  isToday,
  isTomorrow,
  displayDateLabel,
  weekday,
  formattedDisplayDate,
  monthlyFestivals,
  festivalsLoading,
}: any) {
  const { t, language } = useTranslation();
  const auspicious = data?.auspiciousTimings || {};
  const inauspicious = data?.inauspiciousTimings || {};
  const sun = data?.sun || {};
  const moon = data?.moon || {};

  const mobileDateInputRef = React.useRef<HTMLInputElement>(null);
  function openMobileDatePicker() {
    try { mobileDateInputRef.current?.showPicker(); } catch { mobileDateInputRef.current?.click(); }
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "#f5f3ff" }}>

      {/* ── Controls Bar (Mobile) ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[56px] z-40">
        {/* Location row */}
        <div className="px-3 pt-3 pb-2 border-b border-gray-100">
          <div className="relative flex items-center border border-gray-200 rounded-xl px-3 py-2.5 bg-white shadow-sm">
            <LocationSearch onSelectLocation={setSelectedLocation} />
          </div>
        </div>

        {/* Date tabs row */}
        <div className="px-3 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedDate(getTodayStr())}
            className="px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all flex-shrink-0"
            style={isToday ? { backgroundColor: "#f97316", color: "#fff" } : { backgroundColor: "#fff", color: "#555", border: "1px solid #e5e7eb" }}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(getTomorrowStr())}
            className="px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all flex-shrink-0"
            style={isTomorrow ? { backgroundColor: "#f97316", color: "#fff" } : { backgroundColor: "#fff", color: "#555", border: "1px solid #e5e7eb" }}
          >
            Tomorrow
          </button>

          {/* Date picker */}
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div
              className="relative flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={openMobileDatePicker}
            >
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[12px] font-semibold text-gray-700 whitespace-nowrap pointer-events-none">{formattedDisplayDate}</span>
              <svg className="w-3 h-3 text-gray-400 flex-shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <input
                ref={mobileDateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="sr-only"
                tabIndex={-1}
                aria-hidden
              />
            </div>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <MobileLoadingSkeleton />
      ) : apiError ? (
        <ErrorState message={apiError} />
      ) : (
        <div className="px-4 py-4 flex flex-col gap-5">

          {/* 1 ── Date heading */}
          <div className="flex items-center pl-3 border-l-[3px] border-[#6869F9] h-6">
            <h2 className="text-[16px] font-bold text-[#1f1f1f]">{displayDateLabel}</h2>
          </div>

          {/* 2 ── Panchang Summary Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-4 flex gap-4 items-center">
              <div className="w-[88px] h-[88px] rounded-full overflow-hidden flex-shrink-0 relative">
                <MoonPhaseIcon tithiName={data?.tithi?.name} />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h3 className="text-[16px] font-bold text-[#1f1f1f] leading-snug mb-0.5">
                  {data?.tithi?.name},&nbsp;{weekday}
                </h3>
                <p className="text-[13px] font-medium text-gray-500">{data?.month?.purnimanta} Month</p>
                <p className="text-[13px] font-medium text-gray-500">{data?.season}, {data?.samvat?.vikram}</p>
              </div>
            </div>
            {data?.festival && (
              <div className="border-t border-gray-100 px-4 py-3">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Festival</p>
                <p className="text-[14px] font-semibold text-[#1f1f1f] cursor-pointer hover:underline leading-snug">{data.festival}</p>
              </div>
            )}
          </div>

          {/* 3 ── Auspicious-Inauspicious Timings */}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Auspicious-Inauspicious Timings" helpIcon />
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl px-4 py-3.5" style={{ backgroundColor: "#d2ebcf" }}>
                <p className="text-[13px] font-bold leading-snug" style={{ color: "#007a3d" }}>Auspicious<br />Timings</p>
                <p className="text-[13px] font-bold text-gray-800 mt-1.5 leading-snug">
                  {auspicious.abhijit?.start} to<br />{auspicious.abhijit?.end}
                </p>
              </div>
              <div className="rounded-xl px-4 py-3.5" style={{ backgroundColor: "#f5f1ce" }}>
                <p className="text-[13px] font-bold" style={{ color: "#c17d0a" }}>Gulik Kaal</p>
                <p className="text-[13px] font-bold text-gray-800 mt-1.5 leading-snug">
                  {inauspicious.gulik?.start} to<br />{inauspicious.gulik?.end}
                </p>
              </div>
              <div className="rounded-xl px-4 py-3.5" style={{ backgroundColor: "#ffe5e6" }}>
                <p className="text-[13px] font-bold" style={{ color: "#e53935" }}>Rahu Kaal</p>
                <p className="text-[13px] font-bold text-gray-800 mt-1.5 leading-snug">
                  {inauspicious.rahu?.start} to<br />{inauspicious.rahu?.end}
                </p>
              </div>
              <div className="rounded-xl px-4 py-3.5" style={{ backgroundColor: "#fdedf2" }}>
                <p className="text-[13px] font-bold" style={{ color: "#ad1457" }}>Yamghant Kaal</p>
                <p className="text-[13px] font-bold text-gray-800 mt-1.5 leading-snug">
                  {inauspicious.yamghant?.start} to<br />{inauspicious.yamghant?.end}
                </p>
              </div>
            </div>
          </div>

          {/* 4 ── Sunrise / Sunset / Moonrise / Moonset */}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Sunrise-Sunset" />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-2 py-4">
              <div className="grid grid-cols-4 divide-x divide-gray-100">
                {[
                  { emoji: "🌅", label: "Sunrise", value: sun.rise },
                  { emoji: "🌇", label: "Sunset", value: sun.set },
                  { emoji: "🌕", label: "Moonrise", value: moon.rise },
                  { emoji: "🌑", label: "Moonset", value: moon.set },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col items-center gap-1 px-1">
                    <span className="text-[22px]">{row.emoji}</span>
                    <span className="text-[11px] text-gray-400 font-semibold">{row.label}</span>
                    <span className="text-[13px] font-bold text-[#1f1f1f] text-center">{row.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5 ── Detailed Panchang Fields */}
          <div className="flex flex-col gap-3">
            <SectionHeading title="Today's Panchang" helpIcon />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Tithi — full width */}
              <div className="px-4 py-4 border-b border-gray-100">
                <p className="text-[12px] font-semibold text-gray-400 mb-0.5">Date (Tithi)</p>
                <p className="text-[16px] font-bold text-[#1f1f1f] leading-snug">{data?.tithi?.name || "—"}</p>
                {data?.tithi?.endTime && (
                  <p className="text-[12px] font-medium text-gray-400 mt-0.5">{data.tithi.endTime}</p>
                )}
              </div>

              {/* Nakshatra | Yoga | Karana */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                {[
                  { label: "Nakshatra", value: data?.nakshatra?.name, sub: data?.nakshatra?.endTime },
                  { label: "Yoga", value: data?.yoga?.name, sub: data?.yoga?.endTime },
                  { label: "Karana", value: data?.karana?.name, sub: data?.karana?.endTime },
                ].map((f) => (
                  <div key={f.label} className="px-3 py-3.5 flex flex-col">
                    <p className="text-[11px] font-semibold text-gray-400 mb-0.5">{f.label}</p>
                    <p className="text-[13px] font-bold text-[#1f1f1f] leading-snug">{f.value || "—"}</p>
                    {f.sub && <p className="text-[11px] font-medium text-gray-400 mt-0.5">{f.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Month & Samvat */}
              <div className="px-4 py-2" style={{ backgroundColor: "#f5f3ff" }}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Month &amp; Samvat</p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
                {[
                  { label: "Month Amanta", value: data?.month?.amanta },
                  { label: "Month Purnimanta", value: data?.month?.purnimanta },
                ].map((f) => (
                  <div key={f.label} className="px-4 py-3.5">
                    <p className="text-[11px] font-semibold text-gray-400 mb-0.5">{f.label}</p>
                    <p className="text-[14px] font-bold text-[#1f1f1f]">{f.value || "—"}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
                {[
                  { label: "Vikram Samvat", value: data?.samvat?.vikram },
                  { label: "Shaka Samvat", value: data?.samvat?.shaka },
                ].map((f) => (
                  <div key={f.label} className="px-4 py-3.5">
                    <p className="text-[11px] font-semibold text-gray-400 mb-0.5">{f.label}</p>
                    <p className="text-[14px] font-bold text-[#1f1f1f]">{f.value || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Celestial Details */}
              <div className="px-4 py-2" style={{ backgroundColor: "#f5f3ff" }}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Celestial Details</p>
              </div>
              {[
                [{ label: "Sun Sign", value: sun.sign }, { label: "Moon Sign", value: moon.sign }],
                [{ label: "Dishashool", value: data?.dishashool }, { label: "Moon Placement", value: moon.placement }],
                [{ label: "Season", value: data?.season }, { label: "Ayana", value: data?.ayana }],
              ].map((pair, rowIdx, arr) => (
                <div
                  key={rowIdx}
                  className="grid grid-cols-2 divide-x divide-gray-100"
                  style={{ borderBottom: rowIdx < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}
                >
                  {pair.map((f) => (
                    <div key={f.label} className="px-4 py-3.5">
                      <p className="text-[11px] font-semibold text-gray-400 mb-0.5">{f.label}</p>
                      <p className="text-[14px] font-bold text-[#1f1f1f]">{f.value || "—"}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 6 ── Monthly Festivals */}
          <div className="flex flex-col gap-3">
            <SectionHeading title={`Festivals in ${new Date(selectedDate + "T12:00:00").toLocaleDateString('en-US', { month: 'long' })}`} />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {(monthlyFestivals || []).length > 0 ? (
                (monthlyFestivals || []).map((f: any, i: number, arr: any[]) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3.5"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #f8f9fa" : "none" }}
                  >
                    <span className="text-[12px] font-semibold text-gray-400 flex-shrink-0 mr-3">{f.date}</span>
                    <span className="text-[13px] font-bold text-[#1f1f1f] text-right leading-snug">{f.name}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500 font-medium">
                  No festivals found for this month.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ── Fixed Bottom Navigation ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100"
        style={{ boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}
      >
        <div className="grid grid-cols-3 h-[60px]">
          {[
            {
              label: "Explore",
              href: "/dashboard",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.7}>
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              ),
            },
            {
              label: "Puja",
              href: "/puja",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.7}>
                  <path d="M12 2C12 2 7 7 7 12a5 5 0 0010 0c0-5-5-10-5-10z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 17v4M9 21h6" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              label: "Chadhava",
              href: "/chadhava",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.7}>
                  <path d="M12 3L2 9l10 6 10-6-10-6z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17l10 6 10-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
            },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 text-gray-500 hover:text-[#FC8C2C] transition-colors"
            >
              {item.icon}
              <span className="text-[11px] font-semibold">{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ─── DESKTOP PANCHANG VIEW ────────────────────────────────────────────────────
function DesktopPanchangView({
  data,
  loading,
  apiError,
  selectedDate,
  setSelectedDate,
  selectedLocation,
  setSelectedLocation,
  isToday,
  isTomorrow,
  displayDateLabel,
  weekday,
  formattedDisplayDate,
  monthlyFestivals,
  festivalsLoading,
}: any) {
  const auspicious = data?.auspiciousTimings || {};
  const inauspicious = data?.inauspiciousTimings || {};
  const sun = data?.sun || {};
  const moon = data?.moon || {};

  const panchangFields = [
    { label: "Date",             value: data?.tithi?.name,       sub: data?.tithi?.endTime },
    { label: "Nakshatra",        value: data?.nakshatra?.name,   sub: data?.nakshatra?.endTime },
    { label: "Yoga",             value: data?.yoga?.name,        sub: data?.yoga?.endTime },
    { label: "Karana",           value: data?.karana?.name,      sub: data?.karana?.endTime },
    { label: "Month Amanta",     value: data?.month?.amanta,     sub: null },
    { label: "Month Purnimanta", value: data?.month?.purnimanta, sub: null },
    { label: "Vikram Samvat",    value: data?.samvat?.vikram,    sub: null },
    { label: "Shaka Samvat",     value: data?.samvat?.shaka,     sub: null },
    { label: "Sun Sign",         value: sun.sign,                sub: null },
    { label: "Moon Sign",        value: moon.sign,               sub: null },
    { label: "Dishashool",       value: data?.dishashool,        sub: null },
    { label: "Moon placement",   value: moon.placement,          sub: null },
  ];

  function HelpIconDesktop() {
    return (
      <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#1f1f1f" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <circle cx="12" cy="17" r="0.5" fill="#1f1f1f" />
      </svg>
    );
  }

  const dateInputRef = React.useRef<HTMLInputElement>(null);
  function openDatePicker() {
    try { dateInputRef.current?.showPicker(); } catch { dateInputRef.current?.click(); }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f3ff" }}>
      {/* ── Controls Bar (Desktop) ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[68px] z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between py-3 gap-4">
          {/* Left: Today / Tomorrow / prev-date-next */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDate(getTodayStr())}
              className={`px-5 py-2 rounded-xl text-[14px] font-bold transition-colors ${
                isToday ? "bg-[#f97316] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(getTomorrowStr())}
              className={`px-5 py-2 rounded-xl text-[14px] font-bold transition-colors ${
                isTomorrow ? "bg-[#f97316] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Tomorrow
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div
                className="relative flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={openDatePicker}
              >
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[14px] font-medium text-gray-700 select-none whitespace-nowrap pointer-events-none">{formattedDisplayDate}</span>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                />
              </div>
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right: Location search */}
          <div className="relative flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-white min-w-[280px] hover:bg-gray-50 transition-colors">
            <LocationSearch onSelectLocation={setSelectedLocation} />
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      {loading ? (
        <DesktopLoadingSkeleton />
      ) : apiError ? (
        <ErrorState message={apiError} />
      ) : (
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(400px,460px)_340px] justify-center gap-8 items-start">

            {/* ══════════════ COLUMN 1 ══════════════ */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center pl-3 border-l-[3px] border-[#6869F9] h-6">
                <h2 className="text-[17px] font-semibold text-[#1f1f1f]">{displayDateLabel}</h2>
              </div>

              {/* Date Card — moon phase icon now gets real tithiName */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-6 flex gap-4 items-center">
                  <div className="w-[100px] h-[100px] rounded-full overflow-hidden flex-shrink-0 bg-[#f4f7fb] border border-gray-100 shadow-inner flex items-center justify-center p-2">
                    <MoonPhaseIcon tithiName={data?.tithi?.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[18px] font-bold text-[#1f1f1f] leading-snug mb-1">
                      {data?.tithi?.name},<br />{weekday}
                    </h3>
                    <p className="text-[14px] font-medium text-gray-500">{data?.month?.purnimanta} Month</p>
                    <p className="text-[14px] font-medium text-gray-500">{data?.season}, {data?.samvat?.vikram}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 px-6 py-4">
                  <p className="text-[13px] text-gray-400 font-medium mb-1">Festival</p>
                  <p className="text-[15px] font-semibold text-[#1f1f1f] cursor-pointer hover:underline leading-snug">
                    {data?.festival || "—"}
                  </p>
                </div>
              </div>

              {/* Auspicious–Inauspicious Timings */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 pl-3 border-l-[3px] border-[#6869F9] h-6">
                  <h2 className="text-[17px] font-semibold text-[#1f1f1f]">Auspicious-Inauspicious Timings</h2>
                  <HelpIconDesktop />
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: "#f2f9f2" }}>
                      <p className="text-[15px] font-bold mb-1" style={{ color: "#2e7d32" }}>Auspicious<br />Timings</p>
                      <p className="text-[14px] font-bold text-gray-800 leading-snug mt-2">
                        {auspicious.abhijit?.start} to {auspicious.abhijit?.end}
                      </p>
                    </div>
                    <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: "#fffbf0" }}>
                      <p className="text-[15px] font-bold mb-1" style={{ color: "#b8860b" }}>Gulik Kaal</p>
                      <p className="text-[14px] font-bold text-gray-800 leading-snug mt-2">
                        {inauspicious.gulik?.start} to {inauspicious.gulik?.end}
                      </p>
                    </div>
                    <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: "#fdf2f4" }}>
                      <p className="text-[15px] font-bold mb-1" style={{ color: "#c62828" }}>Rahu Kaal</p>
                      <p className="text-[14px] font-bold text-gray-800 leading-snug mt-2">
                        {inauspicious.rahu?.start} to {inauspicious.rahu?.end}
                      </p>
                    </div>
                    <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: "#fdf0f4" }}>
                      <p className="text-[15px] font-bold mb-1" style={{ color: "#ad1457" }}>Yamghant Kaal</p>
                      <p className="text-[14px] font-bold text-gray-800 leading-snug mt-2">
                        {inauspicious.yamghant?.start} to {inauspicious.yamghant?.end}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sun & Moon Times */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                {[
                  { icon: "☀️", label: "Sunrise",  value: sun.rise },
                  { icon: "🌇", label: "Sunset",   value: sun.set },
                  { icon: "🌕", label: "Moonrise", value: moon.rise },
                  { icon: "🌑", label: "Moonset",  value: moon.set },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #f8f9fa" : "none" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[20px]">{row.icon}</span>
                      <span className="text-[15px] font-medium text-gray-500">{row.label}</span>
                    </div>
                    <span className="text-[15px] font-bold text-[#1f1f1f]">{row.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ══════════════ COLUMN 2 ══════════════ */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 pl-3 border-l-[3px] border-[#6869F9] h-6">
                <h2 className="text-[17px] font-semibold text-[#1f1f1f]">Panchang</h2>
                <HelpIconDesktop />
              </div>
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="grid grid-cols-2">
                  {panchangFields.map((field, i) => {
                    const isLeft = i % 2 === 0;
                    const isLastRow = i >= panchangFields.length - 2;
                    return (
                      <div
                        key={field.label}
                        className="px-6 py-5 flex flex-col justify-center"
                        style={{
                          borderBottom: !isLastRow ? "1px solid #f8f9fa" : "none",
                          borderRight: isLeft ? "1px solid #f8f9fa" : "none",
                        }}
                      >
                        <p className="text-[14px] font-medium text-gray-500 mb-1">{field.label}</p>
                        <p className="text-[16px] font-bold text-[#1f1f1f] leading-snug">{field.value || "—"}</p>
                        {field.sub && (
                          <p className="text-[13px] font-medium text-gray-400 mt-1">{field.sub}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ══════════════ COLUMN 3 ══════════════ */}
            <div className="flex flex-col gap-6" style={{ height: "780px" }}>
              <div className="flex items-center gap-2 pl-3 border-l-[3px] border-[#6869F9] h-6">
                <h2 className="text-[17px] font-semibold text-[#1f1f1f]">
                  {`Festivals in ${new Date(selectedDate + "T12:00:00").toLocaleDateString('en-US', { month: 'long' })}`}
                </h2>
              </div>
              <div className="bg-white rounded-3xl border border-gray-100 flex-1 overflow-hidden flex flex-col shadow-sm">
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                  {festivalsLoading ? (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">Loading festivals...</div>
                  ) : (monthlyFestivals || []).length > 0 ? (
                    (monthlyFestivals || []).map((f: any, i: number, arr: any[]) => {
                      const isSelected = f.name === data?.festival;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer"
                          style={{ borderBottom: i < arr.length - 1 ? "1px solid #f8f9fa" : "none" }}
                        >
                          <span className="text-[14px] font-medium text-gray-500 whitespace-nowrap flex-shrink-0 mr-4">
                            {f.date}
                          </span>
                          <span
                            className="text-[15px] font-semibold text-right leading-snug"
                            style={{ color: isSelected ? "#6869F9" : "#1f1f1f" }}
                          >
                            {f.name}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">
                      No festivals found for this month.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOT EXPORT ──────────────────────────────────────────────────────────────
export default function PanchangClientPage() {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();

  const queryDate = searchParams?.get("date");
  const [selectedDate, setSelectedDate] = useState(queryDate || getTodayStr());
  const defaultCity = CITIES.find((c) => c.name.includes("Varanasi")) || CITIES[0];
  const [selectedLocation, setSelectedLocation] = useState(defaultCity);

  // Start with null — never show fake data, always wait for real API
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [monthlyFestivals, setMonthlyFestivals] = useState<any[]>([]);
  const [festivalsLoading, setFestivalsLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setApiError(null);
    setData(null);

    const url = `/api/panchang?date=${selectedDate}&lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`;
    console.log('[Panchang] Fetching:', url);

    fetch(url)
      .then(async (r) => {
        if (!r.ok) {
          let errMsg = `Server error (HTTP ${r.status})`;
          try {
            const errData = await r.json();
            if (errData?.error) errMsg = errData.error;
          } catch { /* ignore parse errors */ }
          throw new Error(errMsg);
        }
        return r.json();
      })
      .then((json) => {
        if (json && typeof json === "object") {
          setData(json);
          setApiError(null);
        } else {
          throw new Error("Invalid response from API.");
        }
      })
      .catch((err: Error) => {
        console.error("[Panchang] Fetch error:", err.message);
        setApiError(
          err.message.includes("503") || err.message.includes("unavailable")
            ? "The AstroVed Panchang API is temporarily unavailable. Please try again in a few moments."
            : err.message.includes("404")
            ? "Panchang API route not found (404). Please restart the dev server."
            : `Unable to load Panchang data: ${err.message}`
        );
      })
      .finally(() => setLoading(false));
  }, [selectedDate, selectedLocation]);

  useEffect(() => {
    setFestivalsLoading(true);
    const url = `/api/festivals?date=${selectedDate}&lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`;
    fetch(url)
      .then((r) => r.ok ? r.json() : [])
      .then((json) => {
        if (Array.isArray(json)) setMonthlyFestivals(json);
        else setMonthlyFestivals([]);
      })
      .catch((err) => {
        console.error("[Panchang] Festivals fetch error:", err);
        setMonthlyFestivals([]);
      })
      .finally(() => setFestivalsLoading(false));
  }, [selectedDate, selectedLocation]);


  const isToday    = selectedDate === getTodayStr();
  const isTomorrow = selectedDate === getTomorrowStr();

  const displayDateLabel = (() => {
    try {
      const d = new Date(selectedDate + "T12:00:00");
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    } catch { return selectedDate; }
  })();

  const weekday = (() => {
    try { return new Date(selectedDate + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long" }); }
    catch { return ""; }
  })();

  const formattedDisplayDate = (() => {
    const parts = selectedDate.split("-");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  })();

  const sharedProps = {
    data,
    loading,
    apiError,
    selectedDate,
    setSelectedDate,
    selectedLocation,
    setSelectedLocation,
    isToday,
    isTomorrow,
    displayDateLabel,
    weekday,
    formattedDisplayDate,
    monthlyFestivals,
    festivalsLoading,
  };

  return (
    <>
      {/* ── Mobile view ── */}
      <div className="block md:hidden">
        <MobilePanchangView {...sharedProps} />
      </div>

      {/* ── Desktop view ── */}
      <div className="hidden md:block">
        <DesktopPanchangView {...sharedProps} />
      </div>
    </>
  );
}
