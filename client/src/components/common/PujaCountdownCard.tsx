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
 * Extracts and formats date into: "Day, Date FullMonth" (without time)
 * Example: "Wednesday, 11 November"
 */
function extractDateOnlyFormatted(rawDate?: string): string {
  if (!rawDate || typeof rawDate !== "string") return "";
  let trimmed = rawDate.trim();
  if (!trimmed) return "";

  trimmed = trimmed.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");
  const dateOnly = trimmed.replace(/\s+at\s+[0-9:]+(?:\s*[APMapm]+)?(?:\s*to\s*[0-9:]+)?(?:\s*[APMapm]+)?/i, "").trim();

  let d: Date | null = null;
  const ddmmyyyy = dateOnly.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    d = new Date(parseInt(ddmmyyyy[3], 10), parseInt(ddmmyyyy[2], 10) - 1, parseInt(ddmmyyyy[1], 10));
  } else {
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

  return dateOnly;
}

/**
 * Extracts only the time range portion, e.g. "01:22 PM to 10:23 PM" or "08:00 AM to 09:00 AM"
 */
function extractTimeOnly(rawDate?: string, rawTime?: string): string {
  if (rawTime && typeof rawTime === "string" && rawTime.trim()) {
    let clean = rawTime.trim().replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");
    clean = clean.replace(/^at\s+/i, "").trim();
    if (clean) return clean;
  }
  if (!rawDate || typeof rawDate !== "string") return "";
  const match = rawDate.match(/\s+at\s+([0-9:]+(?:\s*[APMapm]+)?(?:\s*(?:to|-)\s*[0-9:]+)?(?:\s*[APMapm]+)?)/i);
  if (match) {
    return match[1].trim();
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

  const formattedDate = useMemo(() => extractDateOnlyFormatted(dateText), [dateText]);
  const formattedTime = useMemo(() => extractTimeOnly(dateText, timeText), [dateText, timeText]);

  return (
    <div className={`w-full font-sans ${className}`}>
      {/* ── 1. Top Card Box: Option A (Vedic Gold & Amber Temple Card) ── */}
      <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FFF9F0] border border-[#ECD9C3] rounded-2xl p-2 sm:p-2.5 shadow-xs w-full space-y-1.5">
        {/* Row 1: Dual Badges (Date Badge on Left, Auspicious Time Badge on Right) */}
        <div className={`grid grid-cols-1 ${formattedTime ? "sm:grid-cols-2" : ""} gap-1.5 sm:gap-2`}>
          {/* Left Badge: Puja Date & Occasion */}
          <div className="flex items-center gap-2.5 bg-white/95 border border-[#E8D5B5] rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-2xs min-w-0 transition-all hover:border-[#D99B52]">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#E65100]/15 via-[#F97316]/10 to-amber-100/60 border border-[#F0CA9E] flex items-center justify-center shrink-0 shadow-2xs text-[#C2410C]">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C2410C]" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[12.5px] sm:text-[13.5px] font-extrabold text-[#0B1E36] tracking-tight leading-tight truncate">
                {formattedDate || dateText}
              </span>
              {occasionText && (
                <span className="block text-[10.5px] sm:text-[11.5px] text-stone-600 font-medium leading-normal truncate pb-0.5">
                  {occasionText}
                </span>
              )}
            </div>
          </div>

          {/* Right Badge: Auspicious Puja Time */}
          {formattedTime && (
            <div className="flex items-center gap-2.5 bg-gradient-to-br from-[#FFF9EE] via-[#FFF3E0] to-[#FFF9EE] border border-[#F0CA9E] rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-2xs min-w-0 transition-all hover:border-[#D99B52]">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#C2410C] to-[#E65100] flex items-center justify-center shrink-0 shadow-xs text-white">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[12.5px] sm:text-[13.5px] font-extrabold text-[#0B1E36] tracking-tight leading-tight truncate">
                  {formattedTime}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Horizontal Divider */}
        <div className="w-full h-[1px] bg-[#ECD9C3]/70" />

        {/* Row 2: Temple Venue & Location Full Width (Framed Bottom Band) */}
        <div className="flex items-center gap-2.5 bg-white/90 border border-[#EADBCC]/80 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-1.5 shadow-2xs">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-gradient-to-br from-[#E65100]/10 to-[#F97316]/15 text-[#C2410C] flex items-center justify-center shrink-0 border border-[#F5D8B3]">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2.2} />
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 truncate">
            <span className="font-extrabold text-[#0B1E36] text-xs sm:text-[13px] leading-tight">
              {templeVenue}
            </span>
            {location && location !== templeVenue && (
              <span className="text-stone-600 font-medium text-[11.5px] sm:text-xs truncate">
                {location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Unified Muhurat Countdown Banner (Enlarged Timer & Left-Aligned Devotees) ── */}
      {canShowTimer && (
        <div className="mt-1.5 sm:mt-2 w-full rounded-2xl bg-gradient-to-r from-[#FFFBF7] via-[#FFF5EA] to-[#FFFBF7] border border-[#F0D8BE] p-1.5 sm:p-2 shadow-2xs flex flex-col sm:flex-row items-center w-full">
          {/* Left Side: Flame Icon + Live Countdown Chips with Enlarged Digits */}
          <div className="w-full sm:w-[58%] flex items-center gap-2.5 sm:gap-3 pr-0 sm:pr-3 min-w-0 justify-center sm:justify-start">
            {/* Glowing Terracotta Icon Badge */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#E65100] to-[#C2410C] text-white flex items-center justify-center shadow-xs shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 fill-amber-300/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>

            {/* Micro-Header & Enlarged Countdown Digit Chips */}
            <div className="flex flex-col min-w-0">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-[#8B2516] uppercase tracking-wider leading-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E65100] animate-pulse" />
                MUHURAT ENDS IN
              </span>
              <div className="flex items-center gap-1 sm:gap-1.5 text-[#8B2516] font-mono font-extrabold leading-tight mt-1">
                {/* Days */}
                <div className="flex flex-col items-center bg-white border border-[#EADBCC] rounded-lg px-2 sm:px-2.5 py-1 shadow-2xs min-w-[32px] sm:min-w-[36px]">
                  <span className="text-sm sm:text-base md:text-[17px] font-black leading-none">{padZero(timeLeft.days)}</span>
                  <span className="text-[7px] sm:text-[7.5px] font-sans font-bold text-stone-500 uppercase mt-0.5 tracking-tighter">Days</span>
                </div>
                <span className="text-[#8B2516]/50 font-bold -mt-2.5 sm:-mt-3">:</span>

                {/* Hours */}
                <div className="flex flex-col items-center bg-white border border-[#EADBCC] rounded-lg px-2 sm:px-2.5 py-1 shadow-2xs min-w-[32px] sm:min-w-[36px]">
                  <span className="text-sm sm:text-base md:text-[17px] font-black leading-none">{padZero(timeLeft.hours)}</span>
                  <span className="text-[7px] sm:text-[7.5px] font-sans font-bold text-stone-500 uppercase mt-0.5 tracking-tighter">Hours</span>
                </div>
                <span className="text-[#8B2516]/50 font-bold -mt-2.5 sm:-mt-3">:</span>

                {/* Mins */}
                <div className="flex flex-col items-center bg-white border border-[#EADBCC] rounded-lg px-2 sm:px-2.5 py-1 shadow-2xs min-w-[32px] sm:min-w-[36px]">
                  <span className="text-sm sm:text-base md:text-[17px] font-black leading-none">{padZero(timeLeft.minutes)}</span>
                  <span className="text-[7px] sm:text-[7.5px] font-sans font-bold text-stone-500 uppercase mt-0.5 tracking-tighter">Mins</span>
                </div>
                <span className="text-[#8B2516]/50 font-bold -mt-2.5 sm:-mt-3">:</span>

                {/* Secs */}
                <div className="flex flex-col items-center bg-white border border-[#EADBCC] rounded-lg px-2 sm:px-2.5 py-1 shadow-2xs min-w-[32px] sm:min-w-[36px] text-[#C2410C]">
                  <span className="text-sm sm:text-base md:text-[17px] font-black leading-none">{padZero(timeLeft.seconds)}</span>
                  <span className="text-[7px] sm:text-[7.5px] font-sans font-bold text-[#C2410C]/80 uppercase mt-0.5 tracking-tighter">Secs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Devotees Booking Count (Left-aligned right beside the vertical divider) */}
          <div className="w-full sm:w-[42%] text-center sm:text-left border-t sm:border-t-0 sm:border-l border-[#EADBCC] pt-1.5 sm:pt-0 pl-0 sm:pl-3.5 md:pl-4 mt-1.5 sm:mt-0 shrink-0">
            <div className="font-black text-[#8B2516] text-sm sm:text-[15px] md:text-base leading-tight flex items-center justify-center sm:justify-start gap-1">
              <span className="text-[#C2410C] font-extrabold">{devoteesCount}+</span>
              <span className="text-stone-800 font-extrabold">Devotees</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium leading-none mt-0.5">
              bookings done till now
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
