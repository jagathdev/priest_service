"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface CustomDateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CustomDateRangePicker({
  startDate,
  endDate,
  onChange,
}: CustomDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calendar month view navigation state
  const initialDate = startDate ? new Date(startDate) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Temp selected range while clicking
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateDisplay = (dStr: string) => {
    if (!dStr) return "";
    const [y, m, d] = dStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateClick = (dateStr: string) => {
    if (!startDate || (startDate && endDate)) {
      // Start a new range
      onChange(dateStr, "");
    } else if (startDate && !endDate) {
      if (dateStr < startDate) {
        onChange(dateStr, startDate);
      } else {
        onChange(startDate, dateStr);
      }
      setIsOpen(false);
    }
  };

  // Quick Preset Handlers
  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    const toStr = (d: Date) => d.toISOString().split("T")[0];
    onChange(toStr(start), toStr(end));
    setIsOpen(false);
  };

  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const toStr = (d: Date) => d.toISOString().split("T")[0];
    onChange(toStr(start), toStr(end));
    setIsOpen(false);
  };

  const clearRange = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange("", "");
    setIsOpen(false);
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Blank days before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ dateStr: "", dayNum: 0, isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    days.push({
      dateStr: `${viewYear}-${mm}-${dd}`,
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  const isBetween = (curr: string) => {
    if (!curr) return false;
    const targetEnd = endDate || hoverDate;
    if (startDate && targetEnd) {
      const s = startDate < targetEnd ? startDate : targetEnd;
      const e = startDate < targetEnd ? targetEnd : startDate;
      return curr > s && curr < e;
    }
    return false;
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${isOpen || startDate || endDate
          ? "bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20 text-gray-900"
          : "bg-gray-50/80 hover:bg-white border-gray-200 text-gray-700 hover:border-gray-300 shadow-2xs"
          }`}
      >
        <CalendarDaysIcon className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          {startDate && endDate
            ? `${formatDateDisplay(startDate)} → ${formatDateDisplay(endDate)}`
            : startDate
              ? `${formatDateDisplay(startDate)} → End Date...`
              : "Select Date Range"}
        </span>

        {(startDate || endDate) && (
          <span
            onClick={clearRange}
            className="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 ml-1 transition-colors"
            title="Clear dates"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 rounded-2xl bg-white border border-gray-100 shadow-[0_16px_48px_rgba(0,0,0,0.15)] p-4 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col sm:flex-row gap-4 w-[310px] sm:w-[480px] max-w-[calc(100vw-2rem)]">
          {/* Quick Preset Buttons */}
          <div className="flex flex-row sm:flex-col gap-1.5 border-b sm:border-b-0 sm:border-r border-gray-100 pb-3 sm:pb-0 sm:pr-3 shrink-0 overflow-x-auto sm:overflow-visible">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1 hidden sm:block">
              Quick Presets
            </span>
            <button
              type="button"
              onClick={() => setPreset(1)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors whitespace-nowrap cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPreset(7)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors whitespace-nowrap cursor-pointer"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setPreset(30)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors whitespace-nowrap cursor-pointer"
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={setThisMonth}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors whitespace-nowrap cursor-pointer"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => clearRange()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 text-left transition-colors whitespace-nowrap cursor-pointer mt-auto"
            >
              Clear Filter
            </button>
          </div>

          {/* Calendar Grid View */}
          <div className="flex-1">
            {/* Header: Month & Year + Arrows */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-gray-900">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <span key={day} className="text-[10px] font-bold text-gray-400">
                  {day}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((item, idx) => {
                if (!item.isCurrentMonth) {
                  return <div key={`empty-${idx}`} className="w-7 h-7 sm:w-8 sm:h-8" />;
                }

                const isStart = item.dateStr === startDate;
                const isEnd = item.dateStr === endDate;
                const inRange = isBetween(item.dateStr);
                const todayStr = (() => {
                  const now = new Date();
                  const y = now.getFullYear();
                  const m = String(now.getMonth() + 1).padStart(2, "0");
                  const d = String(now.getDate()).padStart(2, "0");
                  return `${y}-${m}-${d}`;
                })();
                const isToday = item.dateStr === todayStr;

                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => handleDateClick(item.dateStr)}
                    onMouseEnter={() => setHoverDate(item.dateStr)}
                    onMouseLeave={() => setHoverDate(null)}
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${isStart || isEnd
                      ? "bg-emerald-600 text-white font-black shadow-sm"
                      : inRange
                        ? "bg-emerald-50 text-emerald-800 rounded-none first:rounded-l-lg last:rounded-r-lg font-bold"
                        : isToday
                          ? "bg-emerald-50 text-emerald-800 font-extrabold ring-2 ring-emerald-500 hover:bg-emerald-100"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <span>{item.dayNum}</span>
                    {isToday && !isStart && !isEnd && (
                      <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
