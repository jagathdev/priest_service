"use client";

import { FormEvent, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import AstroPageLayout from "@/components/astro-tools/AstroPageLayout";
import PlaceAutocomplete from "@/components/astro-tools/PlaceAutocomplete";

// --- Types --------------------------------------------------------------------
interface RashiResult {
  rashi: string;
  rashiSanskrit: string;
  lord: string;
  element: string;
  quality: string;
  symbol: string;
  luckyColor: string;
  luckyNumber: string;
  traits: string[];
}

// --- Icons (same set) ---------------------------------------------------------
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

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
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

// --- SEO data -----------------------------------------------------------------
const SEO_SECTIONS = [
  {
    heading: "What is Janma Rashi?",
    body: "Janma Rashi is your Moon Sign at the time of your birth. It is determined by the position of the Moon in one of the 12 zodiac signs in the Vedic astrology system. Unlike your Sun sign (popular in Western astrology), which changes monthly, your Moon sign changes every 2.25 days. That's why your exact date, time, and place of birth are needed to find your Janma Rashi accurately.",
  },
  {
    heading: "Why is Janma Rashi Important?",
    body: "In Hindu astrology (Jyotish Shastra), Janma Rashi plays a very important role. It is used for creating your Kundali (birth chart), which is the foundation of Vedic astrology. Based on your Janma Rashi, your Nakshatra is identified, and the first letter of your name is often chosen using the Naam Rashi method. It is also essential for matching Kundalis during marriage (Guna Milan), which helps in checking compatibility between two individuals.",
  },
  {
    heading: "How to use Janma Rashi Calculator",
    body: "To find your Janma Rashi using the calculator, follow these simple steps. First, enter your Date of Birth accurately. Next, enter your Time of Birth, as even a small difference can affect the result. Then, enter your Place of Birth, which helps in calculating the exact planetary positions. After filling in all the details, click the 'Calculate' button. The result will show your Janma Rashi, Nakshatra, and the Lord of your Rashi instantly.",
  },
  {
    heading: "Benefits of Using Janma Rashi Calculator",
    body: "By using the Janma Rashi Calculator, you can know your accurate Moon Sign (Janma Rashi), which is the foundation of Vedic astrology. It also helps you find your Nakshatra (birth star) instantly and identify your Rashi Lord (Rashi Swami), which is important for astrological remedies. This information is especially useful for Kundali matching and checking marriage compatibility. It also plays a key role in Naamkaran Sanskar (naming ceremony) as per Vedic traditions.",
  },
];

const FAQS = [
  { q: "What is Janma Rashi and how is it different from Sun Sign?", a: "Janma Rashi is your Moon Sign, calculated based on the position of the Moon at the time of your birth. It is used in Vedic astrology. In contrast, the Sun Sign (used in Western astrology) is based on the Sun's position. Janma Rashi is considered more accurate for predictions in Indian astrology." },
  { q: "What details do I need to use the Janma Rashi Calculator?", a: "You need your full name, date of birth, exact time of birth, and place of birth for accurate results. The time and place of birth are especially important since the Moon changes signs every 2.25 days." },
  { q: "Can I find my Janma Rashi without knowing the exact time of birth?", a: "While approximate results may be available for some dates, an exact time of birth is highly recommended for accurate results, especially for people born near the Moon's sign change." },
  { q: "Is Janma Rashi used for daily horoscopes?", a: "Yes, in Vedic astrology daily, weekly, and monthly horoscopes are primarily based on your Janma Rashi (Moon Sign), not the Sun Sign. This makes Indian horoscopes more personalized and accurate." },
  { q: "Why is Janma Rashi important in Hindu rituals and astrology?", a: "Janma Rashi is used in many Hindu rituals including Naamkaran (naming ceremony), marriage compatibility (Kundali matching), choosing auspicious dates (Muhurta), and determining astrological remedies for dosha." },
];

// --- Page ---------------------------------------------------------------------
export default function JanmaRashiPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [data, setData] = useState<RashiResult | null>(null);
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
      const res = await fetch("/api/janma-rashi", {
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
      try { await navigator.share({ title: "Janma Rashi Calculator", url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <>
      <Navbar />
      <AstroPageLayout
        breadcrumb="Janma Rashi Calculator"
        heroTitle="Janma Rashi Calculator"
        seoSubtitle="Free Moon Sign Calculator | Rashi Calculator | Janma Rashi Calculator"
        seoSections={SEO_SECTIONS}
        faqs={FAQS}
        currentHref="/astro-tools/janma-rashi"
      >
        {/* -- Form Card -- */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8 shadow-sm">
          {/* Card header */}
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <h2 className="text-[16px] md:text-xl font-bold text-gray-900 leading-snug max-w-[90%] md:max-w-[80%]">
              Enter Your Birth Details to Calculate Your Janma Rashi
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
            <Field label="Your Name" icon={<IconPerson />}>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your Name" className={inputCls}
              />
            </Field>

            <Field label="Email (optional)" icon={<IconEmail />}>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)" className={inputCls}
              />
            </Field>

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

            <Field label="Place of Birth" icon={<IconPin />}>
              <PlaceAutocomplete
                value={place}
                onChange={(val) => setPlace(val)}
                className={inputCls}
              />
            </Field>

            {error && <p className="text-base text-red-500 font-medium">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full h-14 rounded-xl font-semibold text-base text-white tracking-wide transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 shadow-sm mt-2"
              style={{ backgroundColor: loading ? "#34d399" : "#059669" }}
            >
              {loading ? "Calculating..." : "Find Your Janma Rashi"}
            </button>
          </form>
        </div>

        {/* -- Results card -- */}
        {data && (
          <div className="bg-white rounded-2xl border border-violet-200 overflow-hidden shadow-sm">
            <div className="bg-violet-50 border-b border-violet-100 p-6 text-center">
              <p className="text-gray-500 text-base mb-1">Namaste, {name.trim()}!</p>
              <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-2">Your Janma Rashi</p>
              <p className="text-5xl mb-2">{data.symbol}</p>
              <p className="text-3xl font-extrabold text-violet-700">{data.rashi}</p>
              <p className="text-base text-gray-400 mt-1">{data.rashiSanskrit}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Rashi Lord", value: data.lord },
                  { label: "Element", value: data.element },
                  { label: "Quality", value: data.quality },
                  { label: "Lucky Number", value: data.luckyNumber },
                  { label: "Lucky Color", value: data.luckyColor },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{item.label}</p>
                    <p className="text-base font-bold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-400 mb-2">Personality Traits</p>
                <div className="flex flex-wrap gap-2">
                  {data.traits.map((t) => (
                    <span key={t} className="text-xs px-3 py-1 rounded-full bg-violet-100 text-violet-700 font-semibold">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </AstroPageLayout>
    </>
  );
}

