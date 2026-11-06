"use client";

import React, { useState, useEffect, useMemo, useSyncExternalStore } from "react";

const emptySubscribe = () => () => { };
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
import { MapPin, Calendar } from "lucide-react";

interface PujaCountdownCardProps {
  templeVenue?: string;
  location?: string;
  dateText?: string;
  timeText?: string;
  occasionText?: string;
  eventDateTime?: string; // e.g. "2026-10-10T18:30" or ISO string or timestamp
  showTimer?: boolean;
  title?: string;
  badgeLabel?: string;
  devoteesCount?: number | string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
  hasTarget: boolean;
}

const padZero = (n: number) => String(Math.max(0, n)).padStart(2, "0");

const parseTargetTime = (targetStr?: string): number => {
  if (!targetStr || typeof targetStr !== "string") return NaN;
  let trimmed = targetStr.trim();
  if (!trimmed) return NaN;

  // Normalize en-dash (\u2013), em-dash (\u2014), minus sign (\u2212) to standard hyphen (-)
  trimmed = trimmed.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");

  // 1. Direct JS Date parse
  let t = new Date(trimmed).getTime();
  if (!isNaN(t)) return t;

  // 2. Format DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = trimmed.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, "0");
    const month = ddmmyyyy[2].padStart(2, "0");
    const year = ddmmyyyy[3];
    const hour = ddmmyyyy[4] ? ddmmyyyy[4].padStart(2, "0") : "23";
    const min = ddmmyyyy[5] || "59";
    const sec = ddmmyyyy[6] || "59";
    t = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}`).getTime();
    if (!isNaN(t)) return t;
  }

  // 3. Format YYYY-MM-DD
  const yyyymmdd = trimmed.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (yyyymmdd) {
    const year = yyyymmdd[1];
    const month = yyyymmdd[2].padStart(2, "0");
    const day = yyyymmdd[3].padStart(2, "0");
    const hour = yyyymmdd[4] ? yyyymmdd[4].padStart(2, "0") : "23";
    const min = yyyymmdd[5] || "59";
    const sec = yyyymmdd[6] || "59";
    t = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}`).getTime();
    if (!isNaN(t)) return t;
  }

  return NaN;
};

const calculateTimeLeft = (eventDateTime?: string, dateText?: string): TimeLeft => {
  let targetTime = parseTargetTime(eventDateTime);

  if (isNaN(targetTime) && dateText) {
    targetTime = parseTargetTime(dateText);
  }

  if (isNaN(targetTime)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true, hasTarget: false };
  }

  const now = new Date().getTime();
  const diff = targetTime - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true, hasTarget: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isEnded: false, hasTarget: true };
};

/**
 * Formats date into: "Day, Date FullMonth" (without time)
 * Example: "Saturday, 7 November"
 */
function formatDayDateMonth(rawDate?: string): string {
  if (!rawDate || typeof rawDate !== "string") return "";
  let trimmed = rawDate.trim();
  if (!trimmed) return "";

  // Normalize Unicode dashes (en-dash \u2013, em-dash \u2014, minus \u2212) to standard hyphen (-)
  trimmed = trimmed.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");

  // Extract date portion only (strips any "at ..." suffix)
  const dateOnly = trimmed.replace(/\s+at\s+[0-9:]+(?:\s*[APMapm]+)?(?:\s*to\s*[0-9:]+)?(?:\s*[APMapm]+)?/i, "").trim();

  let d: Date | null = null;

  // 1. Match DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = dateOnly.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    d = new Date(parseInt(ddmmyyyy[3], 10), parseInt(ddmmyyyy[2], 10) - 1, parseInt(ddmmyyyy[1], 10));
  } else {
    // 2. Match YYYY-MM-DD
    const yyyymmdd = dateOnly.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (yyyymmdd) {
      d = new Date(parseInt(yyyymmdd[1], 10), parseInt(yyyymmdd[2], 10) - 1, parseInt(yyyymmdd[3], 10));
    } else {
      const parsed = new Date(dateOnly);
      if (!isNaN(parsed.getTime())) {
        d = parsed;
      }
    }
  }

  if (d && !isNaN(d.getTime())) {
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "long" });
    return `${weekday}, ${day} ${month}`;
  }

  return dateOnly || trimmed;
}

/** Extracts time range string from explicit timeText prop or "at ..." in dateText */
function extractTimeRange(dateText?: string, timeText?: string): string {
  if (timeText && timeText.trim()) {
    const clean = timeText.trim().replace(/\s+to\s+/i, " \u2013 ");
    return clean;
  }
  if (!dateText) return "";
  const match = dateText.match(/\s+at\s+([0-9:]+(?:\s*[APMapm]+)?(?:\s*to\s*[0-9:]+)?(?:\s*[APMapm]+)?)/i);
  if (match) {
    const clean = match[1].trim().replace(/\s+to\s+/i, " \u2013 ");
    return clean;
  }
  return "";
}

export default function PujaCountdownCard({
  templeVenue = "Kamrup Teerth Kshetra",
  location = "Guwahati, Assam",
  dateText = "Sunday, 8 November",
  timeText,
  occasionText = "Sacred Ancestral Offering",
  eventDateTime,
  showTimer = true,
  // title = "Reserve your sankalp",
  // badgeLabel = "Muhurat ends in",
  devoteesCount = 150,
  className = "",
}: PujaCountdownCardProps) {
  const isClient = useIsClient();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(eventDateTime, dateText));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(eventDateTime, dateText));
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDateTime, dateText]);

  const canShowTimer = isClient && showTimer !== false && timeLeft.hasTarget;

  const formattedDate = useMemo(() => formatDayDateMonth(dateText), [dateText]);
  const formattedTime = useMemo(() => extractTimeRange(dateText, timeText), [dateText, timeText]);

  return (
    <div className={`w-full font-sans ${className}`}>
      {/* ── 1. Top Card: Date, Time & Temple Venue (Stacked Cards with Centered Top Icons) ── */}
      <div className="bg-white border border-[#F3E7D7] rounded-2xl p-2 sm:p-2.5 shadow-2xs w-full space-y-1.5">
        {/* Row 1: Date & Time Side-by-Side */}
        <div className={`grid ${formattedTime ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-1.5 sm:gap-2`}>
          {/* Card 1: Puja Date */}
          <div className="relative overflow-visible bg-[#FFFDF9] border border-[#F5D8B3] rounded-xl px-2.5 sm:px-3 py-1.5 text-center shadow-2xs flex flex-col items-center justify-center min-h-[50px] sm:min-h-[52px]">
            {/* Calendar Icon Badge Centered on Top Border */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#FFFDF9] px-1 rounded-full flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-[#E65100]" strokeWidth={2.2} />
            </div>
            <span className="text-[9.5px] sm:text-[10px] font-serif font-bold text-[#D96B27] tracking-wide leading-none mt-0.5">
              Puja Date
            </span>
            <span className="text-xs sm:text-[12.5px] font-extrabold text-[#0B1E36] tracking-tight leading-tight mt-0.5 line-clamp-1">
              {formattedDate || dateText}
            </span>
            {occasionText && (
              <span className="text-[9.5px] sm:text-[10px] text-stone-500 font-medium leading-none mt-0.5 line-clamp-1">
                {occasionText}
              </span>
            )}
          </div>

          {/* Card 2: Puja Time */}
          {formattedTime && (
            <div className="relative overflow-visible bg-[#FFFDF9] border border-[#F5D8B3] rounded-xl px-2.5 sm:px-3 py-1.5 text-center shadow-2xs flex flex-col items-center justify-center min-h-[50px] sm:min-h-[52px]">
              {/* Sun/Muhurat Icon Badge Centered on Top Border */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#FFFDF9] px-1 rounded-full flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-[#E65100]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="m19.07 4.93-1.41 1.41" />
                  <path d="M22 12h-2" />
                  <path d="M4 18h16" />
                  <path d="M7 21h10" />
                  <path d="M12 8a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z" fill="#F97316" stroke="none" />
                </svg>
              </div>
              <span className="text-[9.5px] sm:text-[10px] font-serif font-bold text-[#D96B27] tracking-wide leading-none mt-0.5">
                Puja Time
              </span>
              <span className="text-xs sm:text-[12.5px] font-extrabold text-[#0B1E36] tracking-tight leading-tight mt-0.5 line-clamp-1">
                {formattedTime}
              </span>
            </div>
          )}
        </div>

        {/* Row 2: Temple Venue & Location Full Width */}
        <div className="pt-0.5">
          <div className="relative overflow-visible bg-[#FFFDF9] border border-[#F5D8B3] rounded-xl px-2.5 sm:px-3 py-1.5 text-center shadow-2xs flex flex-col items-center justify-center min-h-[48px] sm:min-h-[50px]">
            {/* Location Pin Icon Badge Centered on Top Border */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#FFFDF9] px-1 rounded-full flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-[#E65100]" strokeWidth={2.2} />
            </div>
            <span className="text-[9.5px] sm:text-[10px] font-serif font-bold text-[#D96B27] tracking-wide leading-none mt-0.5">
              Temple Venue & Location
            </span>
            <div className="flex flex-wrap items-baseline justify-center gap-x-1.5 mt-0.5 leading-tight">
              <span className="text-xs sm:text-[12.5px] font-extrabold text-[#0B1E36] tracking-tight">
                {templeVenue}
              </span>
              {location && location !== templeVenue && (
                <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium">
                  • {location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Full-Width Countdown & Devotee Booking Banner ── */}
      {canShowTimer && (
        <div className="mt-2 w-full rounded-2xl bg-[#FFFDF9] border border-[#F3E7D7] p-2 sm:p-2.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          {/* Top on Mobile / Left on Desktop: Flame Icon + Countdown Timer */}
          <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-2.5 w-full sm:w-auto">
            {/* Sacred Flame / Diya Icon Box */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#E65100] to-[#C2410C] text-white flex items-center justify-center shadow-xs shrink-0">
              <svg
                className="w-4 h-4 text-amber-200 fill-amber-300/30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>

            {/* Countdown Digits */}
            <div className="flex flex-col">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-[#8B2516] uppercase tracking-wider leading-none">
                MUHURAT ENDS IN
              </span>
              <div className="flex items-center gap-1 sm:gap-1.5 text-[#8B2516] font-mono font-extrabold text-sm sm:text-base leading-tight mt-1">
                <span className="bg-white border border-[#EADBCC] rounded-md px-1.5 py-0.5 shadow-2xs">
                  {padZero(timeLeft.days)}
                  <span className="text-[8px] font-sans font-medium text-stone-500 ml-0.5">d</span>
                </span>
                <span className="text-[#8B2516]/60 font-bold">:</span>
                <span className="bg-white border border-[#EADBCC] rounded-md px-1.5 py-0.5 shadow-2xs">
                  {padZero(timeLeft.hours)}
                  <span className="text-[8px] font-sans font-medium text-stone-500 ml-0.5">h</span>
                </span>
                <span className="text-[#8B2516]/60 font-bold">:</span>
                <span className="bg-white border border-[#EADBCC] rounded-md px-1.5 py-0.5 shadow-2xs">
                  {padZero(timeLeft.minutes)}
                  <span className="text-[8px] font-sans font-medium text-stone-500 ml-0.5">m</span>
                </span>
                <span className="text-[#8B2516]/60 font-bold">:</span>
                <span className="bg-white border border-[#EADBCC] rounded-md px-1.5 py-0.5 shadow-2xs">
                  {padZero(timeLeft.seconds)}
                  <span className="text-[8px] font-sans font-medium text-stone-500 ml-0.5">s</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom on Mobile (centered with subtle top divider) / Right on Desktop (border-l) */}
          <div className="w-full sm:w-auto text-center sm:text-right border-t sm:border-t-0 sm:border-l border-[#F0DDC8] pt-1.5 sm:pt-0 sm:pl-3 shrink-0">
            <div className="font-black text-[#8B2516] text-xs sm:text-sm lg:text-[14px] leading-tight flex items-center justify-center sm:justify-end gap-1">
              <span>{devoteesCount}+</span>
              <span className="text-stone-800 font-extrabold">Devotees</span>
            </div>
            <div className="text-[9.5px] sm:text-[10px] text-stone-500 font-medium leading-none mt-0.5">
              bookings done till now
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
