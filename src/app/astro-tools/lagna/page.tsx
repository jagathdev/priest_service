"use client";

import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { ClockIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface LagnaResult {
  lagnaSign: string;
  lagnaSignSanskrit: string; 
  lagnaLord: string;
  element: string;
  qualities: string[];
  lagnaLongitude: number;
}

const ELEMENT_BG: Record<string, { bg: string; border: string; text: string }> = {
  Fire:  { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c" },
  Earth: { bg: "#f0fdf4", border: "#bbf7d0", text: "#5b21b6" },
  Air:   { bg: "#eff6ff", border: "#bfdbfe", text: "#000000" },
  Water: { bg: "#ecfeff", border: "#a5f3fc", text: "#155e75" },
};

export default function LagnaPage() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [time, setTime] = useState("");
  const [data, setData] = useState<LagnaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!dob) { setError("Please select your date of birth."); return; }
    if (!time) { setError("Please enter your birth time for an accurate Lagna."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/lagna", {
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

  const elStyle = data ? (ELEMENT_BG[data.element] ?? ELEMENT_BG["Fire"]) : null;

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
              <span className="text-[#1f1f1f] font-medium">Kundali Lagna Calculator</span>
            </nav>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
              <div className="bg-gradient-to-r from-violet-600 to-violet-800 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <SparklesIcon className="h-9 w-9" />
                  <h1 className="text-xl font-bold">Kundali Lagna Calculator</h1>
                </div>
                <p className="text-amber-50 text-sm">Find your Lagna (Ascendant Sign) — the most important point in your birth chart.</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                      <input type="date" value={dob} onChange={e => setDob(e.target.value)} required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Birth Time <span className="text-red-400">*</span></label>
                      <input type="time" value={time} onChange={e => setTime(e.target.value)} required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
                    </div>
                  </div>
                  {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-white transition text-sm"
                    style={{ backgroundColor: loading ? "#fcd34d" : "#d97706" }}>
                    {loading ? "Calculating..." : "Get My Lagna"}
                  </button>
                </form>
                <p className="mt-4 text-xs text-gray-400 text-center">
                  Birth time is crucial for accurate Lagna calculation
                </p>
              </div>
            </div>

            {/* Results */}
            <div>
              {!data || !elStyle ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                  <ClockIcon className="mx-auto mb-4 h-12 w-12 text-violet-300" />
                  <h2 className="text-lg font-bold text-gray-700 mb-2">Your Lagna Awaits</h2>
                  <p className="text-sm text-gray-400">Enter your exact birth time for an accurate Lagna (Ascendant) calculation.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden border border-amber-100" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                  <div className="p-6 text-center border-b border-amber-100" style={{ backgroundColor: "#fffbeb" }}>
                    <p className="text-gray-500 text-sm mb-1">Namaste, {name.trim()}!</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Your Lagna (Ascendant)</p>
                    <p className="text-4xl font-extrabold text-amber-700 mb-1">{data.lagnaSign}</p>
                    <p className="text-base text-gray-400">{data.lagnaSignSanskrit} Lagna</p>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Lagna Lord", value: data.lagnaLord },
                        { label: "Element", value: data.element },
                      ].map(item => (
                        <div key={item.label} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">{item.label}</p>
                          <p className="text-sm font-bold text-gray-800">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl p-4 border" style={{ backgroundColor: elStyle.bg, borderColor: elStyle.border }}>
                      <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: elStyle.text }}>Lagna Qualities</p>
                      <div className="flex flex-wrap gap-2">
                        {data.qualities.map((q) => (
                          <span key={q} className="text-xs px-3 py-1 rounded-full font-semibold border"
                            style={{ backgroundColor: elStyle.bg, color: elStyle.text, borderColor: elStyle.border }}>
                            {q}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Lagna Degree</p>
                      <p className="text-sm font-bold text-gray-800">{data.lagnaLongitude.toFixed(2)}°</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 className="text-base font-bold text-[#2d1a0e] mb-2">What is Lagna (Ascendant)?</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Lagna, also known as the Ascendant, is the zodiac sign that was rising on the eastern horizon at the
              exact moment of your birth. It changes every 2 hours, which is why accurate birth time is essential.
              Your Lagna sign shapes your physical appearance, personality, and overall approach to life. In Vedic
              astrology, the Lagna is considered the most important house in the entire birth chart (Kundali).
            </p>
          </div>
        </div>
      </main>
    </>
  );
}


