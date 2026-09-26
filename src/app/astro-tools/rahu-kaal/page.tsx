"use client";

import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ClockIcon,
  ExclamationTriangleIcon,
  MoonIcon,
  NoSymbolIcon,
  ShieldExclamationIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

const CITIES = [
  { label: "Varanasi, Uttar Pradesh", lat: 25.3176, lon: 82.9739 },
  { label: "New Delhi, Delhi",        lat: 28.6139, lon: 77.2090 },
  { label: "Mumbai, Maharashtra",     lat: 19.0760, lon: 72.8777 },
  { label: "Chennai, Tamil Nadu",     lat: 13.0827, lon: 80.2707 },
  { label: "Kolkata, West Bengal",    lat: 22.5726, lon: 88.3639 },
  { label: "Bengaluru, Karnataka",    lat: 12.9716, lon: 77.5946 },
  { label: "Hyderabad, Telangana",    lat: 17.3850, lon: 78.4867 },
  { label: "Pune, Maharashtra",       lat: 18.5204, lon: 73.8567 },
  { label: "Ahmedabad, Gujarat",      lat: 23.0225, lon: 72.5714 },
  { label: "Jaipur, Rajasthan",       lat: 26.9124, lon: 75.7873 },
];

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface InauspiciousTimings {
  rahu?: { start: string; end: string };
  gulik?: { start: string; end: string };
  yamghant?: { start: string; end: string };
}

interface PanchangData {
  inauspiciousTimings?: InauspiciousTimings;
  sun?: { rise?: string; set?: string };
}

export default function RahuKaalPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [data, setData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/panchang?date=${selectedDate}`)
      .then(r => r.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedDate]);

  const inauspicious = data?.inauspiciousTimings ?? {};

  const timings = [
    {
      label: "Rahu Kaal",
      sublabel: "Most inauspicious",
      icon: NoSymbolIcon,
      bg: "#fff1f2",
      border: "#fecdd3",
      text: "#be123c",
      value: inauspicious.rahu,
    },
    {
      label: "Gulik Kaal",
      sublabel: "Son of Saturn",
      icon: ShieldExclamationIcon,
      bg: "#fefce8",
      border: "#fde68a",
      text: "#854d0e",
      value: inauspicious.gulik,
    },
    {
      label: "Yamghant Kaal",
      sublabel: "Son of Yama",
      icon: ExclamationTriangleIcon,
      bg: "#fdf4ff",
      border: "#e9d5ff",
      text: "#7e22ce",
      value: inauspicious.yamghant,
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ backgroundColor: "#f5f3ff" }}>
        <div style={{ backgroundColor: "#fff8f0", borderBottom: "1px solid #f0e0c8" }} className="py-4">
          <div className="max-w-5xl mx-auto px-6">
            <nav className="flex items-center gap-2 text-sm text-gray-400">
              <Link href="/" className="hover:text-[#1f1f1f]">Home</Link>
              <span>/</span>
              <Link href="/astro-tools" className="hover:text-[#1f1f1f]">Astrology Calculator</Link>
              <span>/</span>
              <span className="text-[#1f1f1f] font-medium">Rahu Kaal Calculator</span>
            </nav>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-600 to-gray-800 rounded-2xl p-6 text-white mb-8" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
            <div className="flex items-center gap-3 mb-2">
              <ClockIcon className="h-9 w-9" />
              <h1 className="text-2xl font-bold">Rahu Kaal Calculator</h1>
            </div>
            <p className="text-gray-300 text-sm max-w-xl">
              Rahu Kaal is a period of approximately 90 minutes each day considered inauspicious for starting new work.
              Avoid important decisions, travel, or new beginnings during this time.
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex flex-wrap gap-4 items-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Select Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Select City</label>
              <select className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition bg-white">
                {CITIES.map(c => <option key={c.label}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Timing Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[1,2,3].map(i => <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {timings.map((t) => (
                <div key={t.label} className="rounded-2xl border p-5" style={{ backgroundColor: t.bg, borderColor: t.border, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <t.icon className="h-7 w-7" style={{ color: t.text }} />
                    <div>
                      <p className="text-sm font-bold" style={{ color: t.text }}>{t.label}</p>
                      <p className="text-xs text-gray-400">{t.sublabel}</p>
                    </div>
                  </div>
                  {t.value ? (
                    <>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Time Window</p>
                      <p className="text-base font-bold" style={{ color: t.text }}>{t.value.start}</p>
                      <p className="text-[13px] font-semibold text-gray-500">to {t.value.end}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">Data unavailable</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sunrise/Sunset */}
          {data?.sun && (
            <div className="mt-6 bg-white rounded-2xl border border-amber-100 p-5 flex gap-6 justify-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div className="text-center">
                <SunIcon className="mx-auto h-7 w-7 text-amber-500" />
                <p className="text-xs text-gray-400 mt-1">Sunrise</p>
                <p className="text-sm font-bold text-gray-800">{data.sun.rise || "—"}</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div className="text-center">
                <MoonIcon className="mx-auto h-7 w-7 text-slate-500" />
                <p className="text-xs text-gray-400 mt-1">Sunset</p>
                <p className="text-sm font-bold text-gray-800">{data.sun.set || "—"}</p>
              </div>
            </div>
          )}

          <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 className="text-base font-bold text-[#2d1a0e] mb-2">What is Rahu Kaal?</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Rahu Kaal (also spelled Rahu Kalam) is a certain amount of time every day that is considered inauspicious
              or unlucky. It occurs every day, and lasts for approximately 1.5 hours. During Rahu Kaal, it is advised
              not to start any new work, travel to new places, or make important decisions. The timing varies based on
              the day of the week and the location's sunrise and sunset times.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}


