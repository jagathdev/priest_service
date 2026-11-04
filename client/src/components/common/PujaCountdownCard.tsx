"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  const trimmed = targetStr.trim();
  if (!trimmed) return NaN;

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
 * Formats date into: "Day, Date FullMonth [at Time]"
 * Example: "Sunday, 8 November at 07:15 PM to 9:15 PM"
 */
function formatDayDateMonth(rawDate?: string): string {
  if (!rawDate || typeof rawDate !== "string") return "";
  const trimmed = rawDate.trim();
  if (!trimmed) return "";

  // Extract any time portion like "at 07:15 PM to 9:15 PM"
  const timeMatch = trimmed.match(/\s+at\s+([0-9:]+\s*[APMapm]+(?:\s*to\s*[0-9:]+\s*[APMapm]+)?)/i);
  const timeSuffix = timeMatch ? ` at ${timeMatch[1]}` : "";
  const dateOnly = trimmed.replace(/\s+at\s+[0-9:]+\s*[APMapm]+(?:\s*to\s*[0-9:]+\s*[APMapm]+)?/i, "").trim();

  // Try parsing DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = dateOnly.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  let d: Date | null = null;

  if (ddmmyyyy) {
    d = new Date(parseInt(ddmmyyyy[3], 10), parseInt(ddmmyyyy[2], 10) - 1, parseInt(ddmmyyyy[1], 10));
  } else {
    const parsed = new Date(dateOnly);
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    }
  }

  if (d && !isNaN(d.getTime())) {
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "long" });
    return `${weekday}, ${day} ${month}${timeSuffix}`;
  }

  // Fallback to raw input if already formatted
  return trimmed;
}

export default function PujaCountdownCard({
  templeVenue = "Kamrup Teerth Kshetra",
  location = "Guwahati, Assam",
  dateText = "Sunday, 8 November",
  occasionText = "Sacred Ancestral Offering",
  eventDateTime,
  showTimer = true,
  // title = "Reserve your sankalp",
  // badgeLabel = "Muhurat ends in",
  devoteesCount = 150,
  className = "",
}: PujaCountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(eventDateTime, dateText)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(eventDateTime, dateText));
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDateTime, dateText]);

  const canShowTimer = showTimer !== false && timeLeft.hasTarget;

  const formattedDate = useMemo(() => formatDayDateMonth(dateText), [dateText]);

  return (
    <div className={`w-full font-sans ${className}`}>
      {/* ── 1. Top Card Box (Temple & Date Details) ── */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-2.5 sm:p-3.5 shadow-2xs w-full space-y-2 lg:space-y-2.5">
        {/* Row 1: Temple & Location */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="text-stone-700 shrink-0">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" strokeWidth={1.8} />
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 truncate">
            <span className="font-bold text-stone-900 text-xs sm:text-sm lg:text-[14px] leading-tight">
              {templeVenue}
            </span>
            {location && (
              <span className="text-stone-400 font-normal text-[11px] sm:text-xs truncate">
                {location}
              </span>
            )}
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="w-full h-[1px] bg-stone-150" />

        {/* Row 2: Date & Occasion with Day Date Month Full format */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="text-stone-700 shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" strokeWidth={1.8} />
          </div>
          <div className="flex flex-wrap items-baseline gap-x-1.5 truncate">
            <span className="font-bold text-stone-900 text-xs sm:text-sm lg:text-[14px] leading-tight">
              {formattedDate || dateText}
            </span>
            {occasionText && (
              <span className="text-stone-400 font-normal text-[11px] sm:text-xs truncate">
                <span className="text-stone-300 font-light mx-1">|</span>
                {occasionText}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Countdown & Devotee Booking Strip (Matching Reference Image) ── */}
      {canShowTimer && (
        <div className="mt-2.5 lg:mt-3 flex items-center justify-between gap-3 w-full">
          {/* Left: Timer Box with days / hrs / mins / secs */}
          <div className="flex flex-col items-center">
            <div className="bg-[#FAF5F2] border border-[#F0E4D8] rounded-xl px-3 sm:px-3.5 py-1.5 shadow-2xs">
              {/* Digits with colons */}
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[#8B2516] font-mono font-bold text-base sm:text-lg lg:text-xl leading-none">
                <span>{padZero(timeLeft.days)}</span>
                <span className="text-[#8B2516]/60 text-xs sm:text-sm">:</span>
                <span>{padZero(timeLeft.hours)}</span>
                <span className="text-[#8B2516]/60 text-xs sm:text-sm">:</span>
                <span>{padZero(timeLeft.minutes)}</span>
                <span className="text-[#8B2516]/60 text-xs sm:text-sm">:</span>
                <span>{padZero(timeLeft.seconds)}</span>
              </div>
              {/* Labels */}
              <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-medium text-[#8B2516]/75 uppercase tracking-wider mt-1 px-0.5">
                <span>days</span>
                <span>hrs</span>
                <span>mins</span>
                <span>secs</span>
              </div>
            </div>
            {/* Muhurat ends in label below box */}
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#8B2516] mt-1 text-center">
              Muhurat ends in
            </span>
          </div>

          {/* Right: Devotees Booking Count */}
          <div className="flex-1 pl-2 text-left">
            <div className="font-extrabold text-[#8B2516] text-xs sm:text-sm lg:text-[15px] leading-tight">
              {devoteesCount}+ Devotees
            </div>
            <div className="text-[11px] sm:text-xs text-stone-500 font-medium leading-tight mt-0.5">
              bookings done till now
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
