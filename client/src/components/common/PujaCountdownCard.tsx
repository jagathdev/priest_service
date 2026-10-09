"use client";

import React, { useState, useEffect } from "react";

interface PujaCountdownCardProps {
  templeVenue?: string;
  location?: string;
  dateText?: string;
  occasionText?: string;
  eventDateTime?: string; // e.g. "2026-10-10T18:30" or ISO string or timestamp
  title?: string;
  badgeLabel?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
}

const padZero = (n: number) => String(Math.max(0, n)).padStart(2, "0");

const calculateTimeLeft = (targetStr?: string): TimeLeft => {
  if (!targetStr || typeof targetStr !== "string") {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false };
  }

  const trimmed = targetStr.trim();
  let targetTime = new Date(trimmed).getTime();

  // If invalid ISO string, check fallback formats like DD-MM-YYYY or YYYY-MM-DD
  if (isNaN(targetTime)) {
    const ddmmyyyy = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
    if (ddmmyyyy) {
      targetTime = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`).getTime();
    }
  }

  if (isNaN(targetTime)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false };
  }

  const now = new Date().getTime();
  const diff = targetTime - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isEnded: false };
};

export default function PujaCountdownCard({
  templeVenue = "Kamrup Teerth Kshetra",
  location = "Guwahati, Assam",
  dateText = "Saturday, 10 October",
  occasionText = "Mahalaya Amavasya",
  eventDateTime,
  title = "Reserve your sankalp",
  badgeLabel = "MUHURAT ENDS IN",
  className = "",
}: PujaCountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(eventDateTime)
  );

  useEffect(() => {
    if (!eventDateTime) return;
    // Initial calculate
    setTimeLeft(calculateTimeLeft(eventDateTime));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(eventDateTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDateTime]);

  // Fallback if eventDateTime is not set yet in dashboard: calculate time left for demo (e.g. 2 days 18 hrs)
  const displayTimeLeft =
    eventDateTime && !isNaN(new Date(eventDateTime).getTime())
      ? timeLeft
      : { days: 2, hours: 18, minutes: 17, seconds: 30, isEnded: false };

  return (
    <div className={`w-full font-sans ${className}`}>
      {/* ── 1. Top Card Box (Temple & Date Details) ── */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm w-full space-y-3">
        {/* Row 1: Temple & Location */}
        <div className="flex items-center gap-3">
          <div className="text-stone-700 shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L15 6H9L12 2Z M9 6V21 M15 6V21 M6 21H18 M12 6V11 M8 11H16" />
            </svg>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 truncate">
            <span className="font-bold text-stone-900 text-sm sm:text-base leading-tight">
              {templeVenue}
            </span>
            {location && (
              <span className="text-stone-400 font-normal text-xs sm:text-sm truncate">
                {location}
              </span>
            )}
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="w-full h-[1px] bg-stone-200/80" />

        {/* Row 2: Date & Occasion */}
        <div className="flex items-center gap-3">
          <div className="text-stone-700 shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <circle cx="8" cy="14" r="1" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 truncate">
            <span className="font-bold text-stone-900 text-sm sm:text-base leading-tight">
              {dateText}
            </span>
            {occasionText && (
              <span className="text-stone-400 font-normal text-xs sm:text-sm truncate">
                {occasionText}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Bottom Countdown Strip ── */}
      <div className="mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        {/* Left Column: Muhurat Ends In & Reserve title */}
        <div className="text-center sm:text-left">
          <span className="text-[10px] sm:text-xs font-bold text-stone-500 tracking-[0.15em] uppercase block mb-0.5">
            {badgeLabel}
          </span>
          <h3 className="font-sans font-extrabold text-stone-900 text-lg sm:text-xl leading-tight">
            {title}
          </h3>
        </div>

        {/* Right Column: Live Countdown Boxes */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 shrink-0">
          {/* Days */}
          <div className="bg-[#fff6f4] border border-[#f7d6cd] rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-center min-w-[46px] sm:min-w-[52px] shadow-2xs">
            <span className="font-extrabold text-[#800000] text-sm sm:text-base lg:text-lg leading-none block">
              {padZero(displayTimeLeft.days)}
            </span>
            <span className="text-[7.5px] sm:text-[8.5px] font-bold text-stone-500 tracking-wider uppercase block mt-0.5">
              DAYS
            </span>
          </div>

          <span className="text-stone-800 font-black text-sm sm:text-base self-center pb-0.5">:</span>

          {/* Hours */}
          <div className="bg-[#fff6f4] border border-[#f7d6cd] rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-center min-w-[46px] sm:min-w-[52px] shadow-2xs">
            <span className="font-extrabold text-[#800000] text-sm sm:text-base lg:text-lg leading-none block">
              {padZero(displayTimeLeft.hours)}
            </span>
            <span className="text-[7.5px] sm:text-[8.5px] font-bold text-stone-500 tracking-wider uppercase block mt-0.5">
              HOURS
            </span>
          </div>

          <span className="text-stone-800 font-black text-sm sm:text-base self-center pb-0.5">:</span>

          {/* Minutes */}
          <div className="bg-[#fff6f4] border border-[#f7d6cd] rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-center min-w-[46px] sm:min-w-[52px] shadow-2xs">
            <span className="font-extrabold text-[#800000] text-sm sm:text-base lg:text-lg leading-none block">
              {padZero(displayTimeLeft.minutes)}
            </span>
            <span className="text-[7.5px] sm:text-[8.5px] font-bold text-stone-500 tracking-wider uppercase block mt-0.5">
              MIN
            </span>
          </div>

          <span className="text-stone-800 font-black text-sm sm:text-base self-center pb-0.5">:</span>

          {/* Seconds */}
          <div className="bg-[#fff6f4] border border-[#f7d6cd] rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-center min-w-[46px] sm:min-w-[52px] shadow-2xs">
            <span className="font-extrabold text-[#800000] text-sm sm:text-base lg:text-lg leading-none block">
              {padZero(displayTimeLeft.seconds)}
            </span>
            <span className="text-[7.5px] sm:text-[8.5px] font-bold text-stone-500 tracking-wider uppercase block mt-0.5">
              SEC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
