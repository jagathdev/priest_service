"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import CalculatorCard, {
  type CalculatorCardProps,
} from "@/components/astro-tools/CalculatorCard";

// --- Shared zodiac image (working URL) --------------------------------------
const ZODIAC_IMG =
  "https://imgs.search.brave.com/acCjMCO5vYOt4Fj3wdCMtAipxx5GpIeFIJ-3Grf2FcQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9uYWtz/aGF0cmEtdmVkaWMt/YXN0cm9sb2d5LWls/bHVzdHJhdGlvbi1y/YXNoaS1ncmFoYS1s/YWduYS1kYXNoYS1i/aGF2YS1yYWh1LW5h/a3NoYXRyYS12ZWRp/Yy1hc3Ryb2xvZ3kt/bmFrc2hhdHJhLXZl/ZGljLWFzdHJvbG9n/eS0zNzM5MzI2MDAu/anBn";

// --- Calculator data ----------------------------------------------------------
const ACTIVE: CalculatorCardProps[] = [
  {
    id: "nakshatra",
    title: "Nakshatra Finder",
    description: "Helps you find your janma nakshatra",
    accentHex: "#1f1f1f",
    imageUrl: ZODIAC_IMG,
    href: "/astro-tools/nakshatra",
    live: true,
  },
  {
    id: "janma-rashi",
    title: "Janma Rashi Finder",
    description: "Know your janma rashi and horoscope",
    accentHex: "#92400e",
    imageUrl: ZODIAC_IMG,
    href: "/astro-tools/janma-rashi",
    live: true,
  },
];

const COMING_SOON: CalculatorCardProps[] = [
  {
    id: "mangal-dosha",
    title: "Mangal Dosha Calculator",
    description: "Check the effect of Mars in your life",
    accentHex: "#111827",
    imageUrl: ZODIAC_IMG,
    href: null,
    live: false,
  },
  {
    id: "kalasarpa",
    title: "Kalasarpa Dosha Calculator",
    description: "Check Kaal Sarp dosha in your Kundali",
    accentHex: "#374151",
    imageUrl: ZODIAC_IMG,
    href: null,
    live: false,
  },
];

// --- Inline SVG icons ---------------------------------------------------------
function IconShare() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth={2}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

// --- Page ---------------------------------------------------------------------
export default function AstroToolsPage() {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: "Free Astrology Calculators", url }); }
      catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleWhatsApp = useCallback(() => {
    const t = encodeURIComponent(`Free Astrology Calculators: ${window.location.href}`);
    window.open(`https://wa.me/?text=${t}`, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f5f5f5]">

        {/* -- 1. Breadcrumb strip -------------------------------------------------------------------------- */}
        <nav className="bg-[#f5f3ff] py-3.5 px-6 sticky top-[64px] z-30 border-b border-[#ddd6fe]">
          <div className="max-w-6xl mx-auto text-[14px] font-semibold text-gray-500 flex items-center gap-2.5">
            <Link href="/" className="hover:text-gray-800 transition-colors">Home</Link>
            <i className="fa-solid fa-chevron-right text-[10px] opacity-70"></i>
            <span className="text-[#1f1f1f] font-bold">Free Astrology Calculators</span>
          </div>
        </nav>

        {/* -- 2. Main container ------------------------------------------ */}
        <div className="max-w-6xl mx-auto px-6">

          {/* -- Title row -- */}
          <div className="flex items-start justify-between pt-6 md:pt-10 pb-6 md:pb-8">
            <h1 className="text-[1.75rem] md:text-[2.25rem] font-extrabold text-gray-900 leading-tight tracking-tight">
              Free Astrology<br className="md:hidden" /> Calculators
            </h1>

            {/* Share + WhatsApp — right side */}
            <div className="flex items-center gap-2.5 mt-1 flex-shrink-0 ml-6">
              <button
                onClick={handleShare}
                aria-label={copied ? "Copied!" : "Share"}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 shadow-sm hover:shadow-md hover:border-gray-300 active:scale-95 transition-all duration-200"
              >
                {copied
                  ? <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  : <IconShare />
                }
              </button>
              <button
                onClick={handleWhatsApp}
                aria-label="Share on WhatsApp"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-violet-500 shadow-sm hover:shadow-md hover:border-violet-200 active:scale-95 transition-all duration-200"
              >
                <IconWhatsApp />
              </button>
            </div>
          </div>

          {/* -- Active calculator cards -- */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 mb-10 md:mb-14">
            {ACTIVE.map((c) => <CalculatorCard key={c.id} {...c} />)}
          </div>

          {/* -- Coming Soon heading -- */}
          <h2 className="text-[1.5rem] md:text-[2rem] font-extrabold text-gray-900 mb-4 md:mb-6 tracking-tight">
            Coming Soon
          </h2>

          {/* -- Coming Soon cards -- */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 mb-10 md:mb-14">
            {COMING_SOON.map((c) => <CalculatorCard key={c.id} {...c} />)}
          </div>

          {/* -- About section -- */}
          <div className="pb-16 max-w-3xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Astrology Calculators</h3>
            <p className="text-[15px] text-gray-600 leading-[1.9]">
              At AstroVed, we bring the wisdom of ancient Vedic astrology to your fingertips.
              Our goal is to help you understand your life, personality, relationships, and future
              with the help of easy and accurate astrology tools. Whether you want to check your
              birth chart, find your moon sign, or know today&apos;s{" "}
              <span className="text-violet-600 hover:underline cursor-pointer">Rahu Kaal</span>
              , you&apos;ll find all the important calculators here in one place.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}


