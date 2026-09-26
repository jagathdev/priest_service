"use client";

import { FormEvent, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import AstroPageLayout from "@/components/astro-tools/AstroPageLayout";
import PlaceAutocomplete from "@/components/astro-tools/PlaceAutocomplete";

// --- Types --------------------------------------------------------------------
interface NakshatraResponse {
  nakshatra: string;
  pada: number;
  rasi: string;
  tithi: string;
  gana: string;
  nadi: string;
  yoni: string;
  lord: string;
  alphabet: string;
}

const FIELD_ORDER = [
  { label: "Nakshatra Pada", key: "pada" as const },
  { label: "Rasi (Moon Sign)", key: "rasi" as const },
  { label: "Tithi", key: "tithi" as const },
  { label: "Gana", key: "gana" as const },
  { label: "Nadi", key: "nadi" as const },
  { label: "Yoni", key: "yoni" as const },
  { label: "Nakshatra Lord", key: "lord" as const },
  { label: "Name Alphabet", key: "alphabet" as const },
];

// --- Input field --------------------------------------------------------------
function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[14px] md:text-base font-semibold text-gray-700 mb-1.5 md:mb-2">{label}</label>
      <div className="relative flex items-center w-full">
        <span className="absolute left-3 md:left-4 text-violet-400 flex-shrink-0 z-10">{icon}</span>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}

// ----------------------------------------- Icons --------------------------------------------------------------------
const IconPerson = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconEmail = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconCalendar = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconClock = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconPin = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconShare = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const inputCls =
  "w-full h-12 md:h-14 rounded-xl border border-gray-200 pl-9 pr-2 md:pl-12 md:pr-4 text-[14px] md:text-base text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all placeholder-gray-400 bg-white";

// --- SEO data -----------------------------------------------------------------
const SEO_SECTIONS = [
  {
    heading: "Nakshatra Finder",
    body: "In Vedic astrology, your Nakshatra or birth star plays a vital role in shaping your personality, behavior, and even your life journey. With the help of a Nakshatra Finder Calculator, you can easily discover your Nakshatra by date of birth, including your Rashi (moon sign). Whether you're new to astrology or someone who follows it closely, this guide will walk you through how to use a Janma Nakshatra calculator, what your results mean, and why it's important.",
  },
  {
    heading: "What is a Nakshatra?",
    body: "In Vedic astrology, the sky is divided into 27 segments called Nakshatras. These are lunar constellations that represent different qualities. The moon, which changes signs every 2.3 days, plays a major role in determining your emotional and mental nature. The Nakshatra the moon was in at your time of birth is your Janma Nakshatra. Each Nakshatra spans 13°20' in the sky and has its own ruling deity, symbol, and qualities. Knowing your Nakshatra can reveal insights about your character, health, compatibility, career, and spiritual path.",
  },
  {
    heading: "Find Nakshatra by Date of Birth / Birth Star Finder",
    body: "One of the most common and reliable ways to determine your Nakshatra (birth star) is by using your date of birth. This method is simple, quick, and widely accessible due to the availability of online birth star finder tools. These tools use precise astronomical calculations to identify the position of the Moon at the exact moment of your birth. You'll need: your Date of Birth (in dd/mm/yyyy format), your Exact Time of Birth (as accurate as possible), and your Place of Birth.",
  },
  {
    heading: "How to Know Nakshatra and Rashi by Birth?",
    body: "Both Nakshatra and Rashi are calculated based on the Moon's exact position at the time of your birth. Your Rashi (Moon Sign) refers to the zodiac sign the Moon was located in when you were born, while your Nakshatra indicates the specific lunar mansion or constellation that the Moon was passing through at that moment. Together, they form a crucial part of your Vedic birth chart and deeply influence your personality and life path.",
  },
  {
    heading: "Benefits of Using a Nakshatra Calculator",
    body: "Using a Nakshatra calculator provides both practical and spiritual benefits by offering accurate information about your birth star. This knowledge plays a vital role in various aspects of life. It helps in Kundli matching for marriage compatibility, supports personal growth by enhancing self-awareness, and is commonly used for choosing auspicious dates (Muhurats) for important events like weddings, pujas, or new ventures.",
  },
];

const FAQS = [
  { q: "What is a Nakshatra Finder?", a: "A Nakshatra Finder is an online tool that tells you your birth star based on your birth details using Vedic astrology principles." },
  { q: "How can I use a Nakshatra Calculator?", a: "Enter your name, date of birth, time of birth, and place of birth. Click 'Find Your Nakshatra' and the calculator will determine your birth star instantly." },
  { q: "Can I find my Nakshatra by date of birth only?", a: "While your date of birth is important, the exact time and place of birth are also required for accurate Nakshatra calculation, as the Moon changes signs every 2.3 days." },
  { q: "What is a birth star finder?", a: "A birth star finder is another name for a Nakshatra calculator. It identifies which of the 27 Nakshatras the Moon was positioned in at the time of your birth." },
  { q: "How to know Nakshatra from my horoscope?", a: "Your Nakshatra is mentioned in your Vedic birth chart (Kundali) under the Moon's position. You can also use this online calculator for an instant result." },
  { q: "What is the connection between Rashi and Nakshatra by birth?", a: "Your Janma Rashi (Moon Sign) is the zodiac sign the Moon was in at birth, while your Nakshatra is the specific lunar mansion within that sign. They are closely related and used together in Vedic astrology." },
  { q: "What does Janma Nakshatra mean?", a: "Janma Nakshatra means 'birth star' in Sanskrit. It is the Nakshatra (lunar constellation) the Moon was positioned in at the exact time of your birth." },
];

// --- Page ---------------------------------------------------------------------
export default function NakshatraFinderPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [data, setData] = useState<NakshatraResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resultRows = useMemo(() => {
    if (!data) return [];
    return FIELD_ORDER.map((f) => ({
      label: f.label,
      value: f.key === "pada" ? `Pada ${data[f.key]}` : String(data[f.key]),
    }));
  }, [data]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!dob) { setError("Please select your date of birth."); return; }
    if (!time) { setError("Please select your birth time."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/nakshatra", {
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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: "Nakshatra Finder Calculator", url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <>
      <Navbar />
      <AstroPageLayout
        breadcrumb="Nakshatra Finder Calculator"
        heroTitle="Nakshatra Finder"
        seoSubtitle="Free Nakshatra Calculator | Birthstar Calculator | Janma Nakshatra Calculator"
        seoSections={SEO_SECTIONS}
        faqs={FAQS}
        currentHref="/astro-tools/nakshatra"
      >
        {/* -- Form Card -- */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8 shadow-sm">
          {/* Card header */}
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 leading-snug max-w-[90%] md:max-w-[80%]">
              Enter Your Birth Details to Calculate Your Nakshatra
            </h2>
            <button
              onClick={handleShare}
              aria-label="Share"
              className="hidden md:flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-500 transition-colors flex-shrink-0 ml-3"
            >
              <IconShare />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <Field label="Your Name" icon={<IconPerson />}>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your Name" className={inputCls}
              />
            </Field>

            {/* Email */}
            <Field label="Email (optional)" icon={<IconEmail />}>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)" className={inputCls}
              />
            </Field>

            {/* DOB + TOB */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date of Birth" icon={<IconCalendar />}>
                <input
                  type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                  required className={inputCls}
                />
              </Field>
              <Field label="Time of Birth" icon={<IconClock />}>
                <input
                  type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  required className={inputCls}
                />
              </Field>
            </div>

            {/* Place */}
            <Field label="Place of Birth" icon={<IconPin />}>
              <PlaceAutocomplete
                value={place}
                onChange={(val) => setPlace(val)}
                className={inputCls}
              />
            </Field>

            {error && <p className="text-base text-red-500 font-medium">{error}</p>}

            {/* CTA */}
            <button
              type="submit" disabled={loading}
              className="w-full h-14 rounded-xl font-semibold text-base text-white tracking-wide transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 shadow-sm mt-2"
              style={{ backgroundColor: loading ? "#34d399" : "#059669" }}
            >
              {loading ? "Calculating..." : "Find Your Nakshatra"}
            </button>
          </form>
        </div>

        {/* -- Results card -- */}
        {data && (
          <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-sm">
            <div className="bg-emerald-50 border-b border-emerald-100 p-6 text-center">
              <p className="text-gray-500 text-base mb-1">Namaste, {name.trim()}!</p>
              <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-2">Your Janma Nakshatra</p>
              <p className="text-4xl font-extrabold text-emerald-600 mb-1">{data.nakshatra}</p>
              <p className="text-sm text-gray-400">Pada {data.pada} · {data.rasi} Rasi</p>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {resultRows.map((row) => (
                <div key={row.label} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{row.label}</p>
                  <p className="text-base font-bold text-gray-800">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </AstroPageLayout>
    </>
  );
}

