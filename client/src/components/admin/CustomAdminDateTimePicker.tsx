"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface CustomAdminDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  mode?: "date" | "datetime"; // "date" for YYYY-MM-DD or DD-MM-YYYY, "datetime" for YYYY-MM-DDTHH:mm
  placeholder?: string;
  name?: string;
  id?: string;
  className?: string;
  required?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CustomAdminDateTimePicker({
  value,
  onChange,
  mode = "date",
  placeholder,
  name,
  id,
  className = "",
  required = false,
}: CustomAdminDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse incoming value into date & time parts
  const parseValue = (val: string) => {
    if (!val) {
      return { year: null, month: null, day: null, hour: 9, minute: 0, ampm: "AM" as "AM" | "PM" };
    }

    // Handles YYYY-MM-DDTHH:mm or YYYY-MM-DD or DD-MM-YYYY
    let dPart = val;
    let tPart = "";

    if (val.includes("T")) {
      [dPart, tPart] = val.split("T");
    } else if (val.includes(" ")) {
      [dPart, tPart] = val.split(" ");
    }

    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let day = new Date().getDate();

    if (dPart.includes("-")) {
      const parts = dPart.split("-");
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    }

    let hour = 9;
    let minute = 0;
    let ampm: "AM" | "PM" = "AM";

    if (tPart && tPart.includes(":")) {
      const [hStr, mStr] = tPart.split(":");
      const rawH = parseInt(hStr, 10);
      minute = parseInt(mStr, 10) || 0;
      if (rawH >= 12) {
        ampm = "PM";
        hour = rawH === 12 ? 12 : rawH - 12;
      } else {
        ampm = "AM";
        hour = rawH === 0 ? 12 : rawH;
      }
    }

    return { year, month, day, hour, minute, ampm };
  };

  const parsed = parseValue(value);

  const [viewYear, setViewYear] = useState<number>(parsed.year || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(parsed.month !== null ? parsed.month : new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | null>(
    parsed.year ? { year: parsed.year, month: parsed.month, day: parsed.day } : null
  );
  const [selectedHour, setSelectedHour] = useState<number>(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState<number>(parsed.minute);
  const [selectedAmPm, setSelectedAmPm] = useState<"AM" | "PM">(parsed.ampm);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatEmitValue = (
    dt: { year: number; month: number; day: number } | null,
    h: number,
    m: number,
    period: "AM" | "PM"
  ) => {
    if (!dt) return "";
    const yStr = String(dt.year);
    const mStr = String(dt.month + 1).padStart(2, "0");
    const dStr = String(dt.day).padStart(2, "0");

    if (mode === "date") {
      // Check if original value was DD-MM-YYYY format or YYYY-MM-DD
      if (value && value.includes("-") && value.split("-")[2]?.length === 4) {
        return `${dStr}-${mStr}-${yStr}`;
      }
      return `${yStr}-${mStr}-${dStr}`;
    }

    // datetime-local format: YYYY-MM-DDTHH:mm
    let rawH = h;
    if (period === "PM" && h < 12) rawH = h + 12;
    if (period === "AM" && h === 12) rawH = 0;
    const hourStr = String(rawH).padStart(2, "0");
    const minuteStr = String(m).padStart(2, "0");

    return `${yStr}-${mStr}-${dStr}T${hourStr}:${minuteStr}`;
  };

  const handleSelectDay = (day: number) => {
    const nextDt = { year: viewYear, month: viewMonth, day };
    setSelectedDate(nextDt);
    const nextVal = formatEmitValue(nextDt, selectedHour, selectedMinute, selectedAmPm);
    onChange(nextVal);
    if (mode === "date") {
      setIsOpen(false);
    }
  };

  const handleTimeChange = (h: number, m: number, period: "AM" | "PM") => {
    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedAmPm(period);

    const baseDt = selectedDate || {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
      day: new Date().getDate(),
    };
    if (!selectedDate) setSelectedDate(baseDt);

    const nextVal = formatEmitValue(baseDt, h, m, period);
    onChange(nextVal);
  };

  const handleSetToday = () => {
    const now = new Date();
    const nextDt = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(nextDt);

    let curH = now.getHours();
    const curM = now.getMinutes();
    const period = curH >= 12 ? "PM" : "AM";
    if (curH >= 12) curH = curH === 12 ? 12 : curH - 12;
    if (curH === 0) curH = 12;

    setSelectedHour(curH);
    setSelectedMinute(curM);
    setSelectedAmPm(period);

    const nextVal = formatEmitValue(nextDt, curH, curM, period);
    onChange(nextVal);
    if (mode === "date") setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange("");
    setIsOpen(false);
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

  // Calendar calculations
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset = new Date(viewYear, viewMonth, 1).getDay();

  const now = new Date();
  const todayDt = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };

  // Display text in button input
  const displayText = (() => {
    if (!value) return placeholder || (mode === "datetime" ? "Select Date & Time" : "Select Date");
    if (mode === "datetime" && value.includes("T")) {
      const [dPart, tPart] = value.split("T");
      const [h, m] = tPart.split(":");
      const rawH = parseInt(h, 10);
      const period = rawH >= 12 ? "PM" : "AM";
      const displayH = rawH >= 12 ? (rawH === 12 ? 12 : rawH - 12) : (rawH === 0 ? 12 : rawH);
      return `${dPart} • ${String(displayH).padStart(2, "0")}:${m} ${period}`;
    }
    return value;
  })();

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Display Input */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all border cursor-pointer select-none ${
          isOpen
            ? "bg-white border-[#00B05F] shadow-sm ring-4 ring-[#00B05F]/10 text-gray-900"
            : "bg-slate-50/70 hover:bg-white border-slate-200 text-gray-800 hover:border-slate-300 shadow-2xs"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {mode === "datetime" ? (
            <ClockIcon className="w-4 h-4 text-[#00B05F] shrink-0" />
          ) : (
            <CalendarDaysIcon className="w-4 h-4 text-[#00B05F] shrink-0" />
          )}
          <span className={`truncate ${!value ? "text-gray-400 font-normal" : "font-semibold text-gray-900"}`}>
            {displayText}
          </span>
        </div>
        {value ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
            title="Clear date"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span className="text-xs text-gray-400 font-medium">Pick</span>
        )}
      </div>

      {/* Hidden input for HTML form requirement validation if needed */}
      <input
        type="hidden"
        name={name}
        id={id}
        value={value || ""}
        required={required}
      />

      {/* Custom Picker Modal Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-2 p-4 bg-white border border-gray-150 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] z-50 animate-in fade-in zoom-in-95 duration-150 ${
            mode === "datetime" ? "w-[340px] sm:w-[500px]" : "w-[320px]"
          }`}
        >
          <div className={`flex ${mode === "datetime" ? "flex-col sm:flex-row gap-4" : "flex-col"}`}>
            {/* Left Column: Calendar Grid */}
            <div className="flex-1">
              {/* Header Navigation */}
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
                <span className="text-sm font-black text-gray-900 tracking-tight">
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition"
                  >
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition"
                  >
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                {DAYS_OF_WEEK.map((d) => (
                  <span key={d} className="text-[11px] font-bold text-gray-400">
                    {d}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Empty Offset Slots */}
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`offset-${i}`} className="w-8 h-8" />
                ))}

                {/* Day Buttons */}
                {Array.from({ length: totalDays }).map((_, i) => {
                  const dayNum = i + 1;
                  const isToday =
                    todayDt.year === viewYear && todayDt.month === viewMonth && todayDt.day === dayNum;
                  const isSelected =
                    selectedDate?.year === viewYear &&
                    selectedDate?.month === viewMonth &&
                    selectedDate?.day === dayNum;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => handleSelectDay(dayNum)}
                      className={`relative w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer select-none ${
                        isSelected
                          ? "bg-[#00B05F] text-white font-black shadow-md scale-105"
                          : isToday
                          ? "bg-emerald-50 text-emerald-900 font-black ring-2 ring-[#00B05F] hover:bg-emerald-100"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span>{dayNum}</span>
                      {isToday && !isSelected && (
                        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#00B05F]"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Time Selector (for datetime mode) */}
            {mode === "datetime" && (
              <div className="sm:border-l sm:border-gray-150 sm:pl-4 flex flex-col justify-between pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500 block">
                    Select Time
                  </span>

                  {/* AM / PM Toggle */}
                  <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => handleTimeChange(selectedHour, selectedMinute, "AM")}
                      className={`flex-1 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                        selectedAmPm === "AM"
                          ? "bg-[#00B05F] text-white shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTimeChange(selectedHour, selectedMinute, "PM")}
                      className={`flex-1 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                        selectedAmPm === "PM"
                          ? "bg-[#00B05F] text-white shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      PM
                    </button>
                  </div>

                  {/* Hours Grid */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 mb-1 block">Hour</span>
                    <div className="grid grid-cols-4 gap-1">
                      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => handleTimeChange(h, selectedMinute, selectedAmPm)}
                          className={`py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            selectedHour === h
                              ? "bg-emerald-100 text-[#00B05F] border border-[#00B05F]"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {String(h).padStart(2, "0")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Minutes Selector */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 mb-1 block">Minute</span>
                    <div className="grid grid-cols-4 gap-1">
                      {[0, 15, 30, 45].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleTimeChange(selectedHour, m, selectedAmPm)}
                          className={`py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            selectedMinute === m
                              ? "bg-emerald-100 text-[#00B05F] border border-[#00B05F]"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          :{String(m).padStart(2, "0")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Time Display Pill */}
                <div className="mt-3 p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <span className="text-xs font-extrabold text-[#00B05F]">
                    {String(selectedHour).padStart(2, "0")}:{String(selectedMinute).padStart(2, "0")}{" "}
                    {selectedAmPm}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-gray-500 hover:text-red-500 transition cursor-pointer"
            >
              Clear
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSetToday}
                className="text-xs font-bold text-[#00B05F] hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition border border-[#00B05F]/30 cursor-pointer"
              >
                {mode === "datetime" ? "Now" : "Today"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-extrabold bg-[#00B05F] hover:bg-[#009644] text-white px-3.5 py-1 rounded-lg transition shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
