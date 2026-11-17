"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface CustomSingleDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CustomSingleDatePicker({
  value,
  onChange,
  placeholder = "Select Date",
  className = "",
}: CustomSingleDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [prevValue, setPrevValue] = useState(value);
  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(
    isNaN(initialDate.getTime()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    isNaN(initialDate.getTime()) ? new Date().getMonth() : initialDate.getMonth()
  );

  // Synchronize calendar view during render when prop value changes (React recommended pattern)
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }

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
    const parts = dStr.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}/${m}/${y}`;
    }
    return dStr;
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

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderDays = () => {
    const totalDays = daysInMonth(viewYear, viewMonth);
    const startOffset = firstDayOfMonth(viewYear, viewMonth);
    const cells = [];

    // Empty lead slots
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isSelected = value === dateStr;
      const isToday =
        new Date().toISOString().split("T")[0] === dateStr;

      cells.push(
        <button
          key={dateStr}
          type="button"
          onClick={() => {
            onChange(dateStr);
            setIsOpen(false);
          }}
          className={`w-8 h-8 text-xs font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isSelected
              ? "bg-emerald-600 text-white font-extrabold shadow-sm scale-105"
              : isToday
              ? "bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {d}
        </button>
      );
    }

    return cells;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
          isOpen
            ? "bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20 text-gray-900"
            : "bg-gray-50/80 hover:bg-white border-gray-200 text-gray-800 hover:border-gray-300 shadow-2xs"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarDaysIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">
            {value ? formatDateDisplay(value) : placeholder}
          </span>
        </div>
        {value ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 font-normal">Pick</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 p-3.5 bg-white border border-gray-150 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] z-50 w-80 animate-in fade-in zoom-in-95 duration-150">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <span className="text-xs font-black text-gray-900 tracking-tight">
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

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <span key={day} className="text-[11px] font-bold text-gray-400">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {renderDays()}
          </div>

          {/* Footer Shortcuts */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                onChange(today);
                setIsOpen(false);
              }}
              className="font-bold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="font-semibold text-rose-500 hover:text-rose-600 transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
