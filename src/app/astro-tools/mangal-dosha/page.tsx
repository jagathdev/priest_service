"use client";

import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FireIcon,
  ShieldExclamationIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface MangalDoshaResult {
  hasMangalDosha: boolean;
  marsHouse: number;
  marsSign: string;
  severity: "High" | "Medium" | "Low" | "None";
  description: string;
  remedies: string[];
}

const SEVERITY_STYLES = {
  High:   { bg: "#fff1f2", border: "#fecdd3", badge: "bg-red-100 text-red-700",    icon: ExclamationTriangleIcon },
  Medium: { bg: "#fff7ed", border: "#fed7aa", badge: "bg-violet-100 text-violet-700", icon: ShieldExclamationIcon },
  Low:    { bg: "#fefce8", border: "#fde68a", badge: "bg-yellow-100 text-yellow-700", icon: SparklesIcon },
  None:   { bg: "#f0fdf4", border: "#bbf7d0", badge: "bg-violet-100 text-violet-700",  icon: CheckCircleIcon },
};

export default function MangalDoshaPage() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [time, setTime] = useState("");
  const [data, setData] = useState<MangalDoshaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!dob) { setError("Please select your date of birth."); return; }
    if (!time) { setError("Please select your birth time."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/mangal-dosha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: `${dob}T${time}` }),
      });
      const result = await res.json();
      if (!res.ok) { setError(result.error || "Unable to calculate."); return; }
      setData(result);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const styles = data ? SEVERITY_STYLES[data.severity] : null;
  const SeverityIcon = styles?.icon;

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
              <span className="text-[#1f1f1f] font-medium">Mangal Dosha Calculator</span>
            </nav>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <FireIcon className="h-9 w-9" />
                  <h1 className="text-xl font-bold">Mangal Dosha Calculator</h1>
                </div>
                <p className="text-red-100 text-sm">Check the presence and severity of Mangal Dosha (Kuja Dosha) in your Kundali.</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                      <input type="date" value={dob} onChange={e => setDob(e.target.value)} required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Birth Time</label>
                      <input type="time" value={time} onChange={e => setTime(e.target.value)} required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition" />
                    </div>
                  </div>
                  {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-white transition text-sm"
                    style={{ backgroundColor: loading ? "#fca5a5" : "#dc2626" }}>
                    {loading ? "Calculating..." : "Check Mangal Dosha"}
                  </button>
                </form>
                <p className="mt-4 text-xs text-gray-400 text-center">Based on Mars position in Kundali · Vedic Astrology</p>
              </div>
            </div>

            {/* Results */}
            <div>
              {!data || !styles ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                  <FireIcon className="mx-auto mb-4 h-12 w-12 text-red-300" />
                  <h2 className="text-lg font-bold text-gray-700 mb-2">Mangal Dosha Report</h2>
                  <p className="text-sm text-gray-400">Enter your birth details to check if Mangal Dosha is present in your Kundali.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: styles.border, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                  {/* Result Header */}
                  <div className="p-6 text-center border-b" style={{ backgroundColor: styles.bg, borderColor: styles.border }}>
                    <p className="text-gray-500 text-sm mb-2">Namaste, {name.trim()}!</p>
                    {SeverityIcon && <SeverityIcon className="mx-auto mb-3 h-11 w-11 text-red-500" />}
                    <p className="text-2xl font-extrabold text-gray-800 mb-1">
                      {data.hasMangalDosha ? "Mangal Dosha Present" : "No Mangal Dosha"}
                    </p>
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${styles.badge}`}>
                      Severity: {data.severity}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Mars Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Mars Sign</p>
                        <p className="text-sm font-bold text-gray-800">{data.marsSign}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Mars House</p>
                        <p className="text-sm font-bold text-gray-800">House {data.marsHouse}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="rounded-xl p-4 border text-sm text-gray-600 leading-relaxed" style={{ backgroundColor: styles.bg, borderColor: styles.border }}>
                      {data.description}
                    </div>

                    {/* Remedies */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">
                        {data.hasMangalDosha ? "Recommended Remedies" : "Your Status"}
                      </p>
                      <ul className="space-y-2">
                        {data.remedies.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-[#1f1f1f] mt-0.5 flex-shrink-0">•</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 className="text-base font-bold text-[#2d1a0e] mb-2">What is Mangal Dosha?</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Mangal Dosha (also called Kuja Dosha or Manglik Dosha) occurs when Mars is placed in the 1st, 2nd,
              4th, 7th, 8th, or 12th house of a person's birth chart. This planetary position is believed to bring
              challenges in marriage and relationships. The 7th and 8th house positions are considered most severe.
              However, Mangal Dosha can be cancelled (Mangal Dosha Nivaran) through specific conditions and remedies.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}


